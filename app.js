/**
 * V-Editor Web Studio - Complete Client-Side Video Editor Engine
 * Runs 100% in any modern browser & GitHub Pages without any backend server.
 */

(function () {
    'use strict';

    // Application Global State
    const state = {
        videoSrc: null,
        videoFile: null,
        videoName: 'test_sample.mp4',
        videoDuration: 0,
        videoWidth: 0,
        videoHeight: 0,
        
        // Multi-clip timeline model
        clips: [],
        activeClipIndex: 0,
        
        // Playback state
        currentTime: 0,
        isPlaying: false,
        isScrubbing: false,
        isTrimming: false,
        isMuted: false,
        
        // Timeline dimensions & zoom
        pixelsPerSecond: 80,
        
        // History Stack (Undo / Redo)
        history: [],
        historyIndex: -1,
        maxHistory: 30,

        // Export settings
        exportResolution: 'original'
    };

    // DOM Elements
    const mobileFrame = document.getElementById('mobileFrame');
    const mainVideo = document.getElementById('mainVideo');
    const videoPreviewContainer = document.getElementById('videoPreviewContainer');
    const videoFrameBox = document.getElementById('videoFrameBox');
    const videoOverlayIcon = document.getElementById('videoOverlayIcon');
    const emptyState = document.getElementById('emptyState');

    const btnPlayPause = document.getElementById('btnPlayPause');
    const iconPlay = document.getElementById('iconPlay');
    const iconPause = document.getElementById('iconPause');
    const currentTimeEl = document.getElementById('currentTime');
    const totalDurationEl = document.getElementById('totalDuration');

    const timelineViewport = document.getElementById('timelineViewport');
    const clipsStrip = document.getElementById('clipsStrip');
    const padStart = document.getElementById('padStart');
    const padEnd = document.getElementById('padEnd');
    const centerNeedle = document.getElementById('centerNeedle');

    const btnUndo = document.getElementById('btnUndo');
    const btnRedo = document.getElementById('btnRedo');
    const btnMuteToggle = document.getElementById('btnMuteToggle');
    const iconAudioOn = document.getElementById('iconAudioOn');
    const iconAudioMuted = document.getElementById('iconAudioMuted');
    const btnShortcuts = document.getElementById('btnShortcuts');
    const btnTopSave = document.getElementById('btnTopSave');
    const btnAddMedia = document.getElementById('btnAddMedia');

    const btnBackTool = document.getElementById('btnBackTool');
    const btnCut = document.getElementById('btnCut');
    const btnToolSpeed = document.getElementById('btnToolSpeed');
    const btnToolVolume = document.getElementById('btnToolVolume');
    const btnToolReverse = document.getElementById('btnToolReverse');
    const btnToolDelete = document.getElementById('btnToolDelete');

    const toolSubpanel = document.getElementById('toolSubpanel');
    const panelSpeed = document.getElementById('panelSpeed');
    const panelVolume = document.getElementById('panelVolume');
    const speedValBadge = document.getElementById('speedValBadge');
    const speedSlider = document.getElementById('speedSlider');
    const btnSpeedReset = document.getElementById('btnSpeedReset');
    const btnSpeedMinus = document.getElementById('btnSpeedMinus');
    const btnSpeedPlus = document.getElementById('btnSpeedPlus');
    const volumeValBadge = document.getElementById('volumeValBadge');
    const volumeSlider = document.getElementById('volumeSlider');
    const btnVolReset = document.getElementById('btnVolReset');

    const saveModal = document.getElementById('saveModal');
    const btnCloseSaveModal = document.getElementById('btnCloseSaveModal');
    const btnCancelSave = document.getElementById('btnCancelSave');
    const saveFileNameInput = document.getElementById('saveFileNameInput');
    const btnConfirmExport = document.getElementById('btnConfirmExport');
    const modalExportForm = document.getElementById('modalExportForm');
    const modalExportProgress = document.getElementById('modalExportProgress');
    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercent = document.getElementById('progressPercent');
    const progressStatusTitle = document.getElementById('progressStatusTitle');
    const progressStatusDesc = document.getElementById('progressStatusDesc');
    const exportCompleteActions = document.getElementById('exportCompleteActions');
    const btnDownloadExported = document.getElementById('btnDownloadExported');
    const btnPlayExportedVideo = document.getElementById('btnPlayExportedVideo');
    const btnDoneExport = document.getElementById('btnDoneExport');
    const summaryDuration = document.getElementById('summaryDuration');
    const summaryClipsCount = document.getElementById('summaryClipsCount');

    const previewModal = document.getElementById('previewModal');
    const btnClosePreviewModal = document.getElementById('btnClosePreviewModal');
    const previewExportedVideo = document.getElementById('previewExportedVideo');

    const shortcutsModal = document.getElementById('shortcutsModal');
    const btnCloseShortcutsModal = document.getElementById('btnCloseShortcutsModal');

    const btnOpenVideoPrompt = document.getElementById('btnOpenVideoPrompt');
    const btnLoadSamplePrompt = document.getElementById('btnLoadSamplePrompt');
    const hiddenFileInput = document.getElementById('hiddenFileInput');

    const statusText = document.getElementById('statusText');
    const statusRes = document.getElementById('statusRes');

    let exportedBlobUrl = null;
    let animFrameId = null;

    // --- CLIENT-SIDE THUMBNAIL CACHE & EXTRACTOR ---
    const thumbCache = new Map();
    let thumbExtractorVideo = null;

    function getThumbExtractorVideo() {
        if (!thumbExtractorVideo) {
            thumbExtractorVideo = document.createElement('video');
            thumbExtractorVideo.muted = true;
            thumbExtractorVideo.playsInline = true;
            thumbExtractorVideo.preload = 'auto';
        }
        if (state.videoSrc && !state.videoSrc.startsWith('blob:') && !state.videoSrc.startsWith('data:')) {
            try { thumbExtractorVideo.crossOrigin = 'anonymous'; } catch (e) {}
        } else {
            try { thumbExtractorVideo.removeAttribute('crossOrigin'); } catch (e) {}
        }
        if (thumbExtractorVideo.src !== state.videoSrc) {
            thumbExtractorVideo.src = state.videoSrc;
            thumbCache.clear();
        }
        return thumbExtractorVideo;
    }

    async function extractFrameThumbnail(sourceTime) {
        const key = sourceTime.toFixed(1);
        if (thumbCache.has(key)) return thumbCache.get(key);

        return new Promise(resolve => {
            const vid = getThumbExtractorVideo();
            const canvas = document.createElement('canvas');
            canvas.width = 90;
            canvas.height = 140;
            const ctx = canvas.getContext('2d');

            let timeoutId = null;
            const cleanup = () => {
                vid.removeEventListener('seeked', onSeeked);
                if (timeoutId) clearTimeout(timeoutId);
            };

            const onSeeked = () => {
                cleanup();
                try {
                    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                    thumbCache.set(key, dataUrl);
                    resolve(dataUrl);
                } catch (err) {
                    resolve('');
                }
            };

            timeoutId = setTimeout(() => {
                cleanup();
                resolve('');
            }, 1200);

            vid.addEventListener('seeked', onSeeked);
            vid.currentTime = Math.max(0, Math.min(state.videoDuration || 0, sourceTime));
        });
    }

    // --- INITIALIZATION ---
    function init() {
        bindEvents();
        updateTimelinePadding();
        window.addEventListener('resize', () => {
            updateVideoFrameSize();
            updateTimelinePadding();
            seekToProjectTime(state.currentTime, true);
        });
        checkInitialVideo();
    }

    // Adapt video frame box to video's aspect ratio
    function updateVideoFrameSize() {
        if (!state.videoWidth || !state.videoHeight) {
            videoFrameBox.style.width = '280px';
            videoFrameBox.style.height = '460px';
            return;
        }

        const containerW = videoPreviewContainer.clientWidth - 32;
        const containerH = videoPreviewContainer.clientHeight - 32;
        const videoAspect = state.videoWidth / state.videoHeight;
        const containerAspect = containerW / containerH;

        let targetW, targetH;
        if (videoAspect > containerAspect) {
            targetW = containerW;
            targetH = containerW / videoAspect;
        } else {
            targetH = containerH;
            targetW = containerH * videoAspect;
        }

        videoFrameBox.style.width = `${Math.round(targetW)}px`;
        videoFrameBox.style.height = `${Math.round(targetH)}px`;
    }

    function checkInitialVideo() {
        // Start in clean empty state with no demo video preloaded
        videoFrameBox.style.display = 'none';
        emptyState.style.display = 'flex';
        statusText.textContent = 'No Video Loaded';
        statusRes.textContent = 'Resolution: --';
        currentTimeEl.textContent = '0:00';
        totalDurationEl.textContent = '0:00';
    }

    // --- TIMELINE PADDING & NEEDLE MATH ---
    function updateTimelinePadding() {
        const halfWidth = (timelineViewport.clientWidth || 300) / 2;
        padStart.style.width = halfWidth + 'px';
        padEnd.style.width = halfWidth + 'px';
    }

    function timeToPixels(t) {
        return t * state.pixelsPerSecond;
    }

    function pixelsToTime(px) {
        return px / state.pixelsPerSecond;
    }

    function getTotalDuration() {
        if (!state.clips.length) return 0;
        return state.clips.reduce((sum, c) => sum + getClipEffectiveDuration(c), 0);
    }

    function getClipEffectiveDuration(clip) {
        const rawDur = Math.max(0.1, clip.sourceEnd - clip.sourceStart);
        return rawDur / (clip.speed || 1.0);
    }

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) seconds = 0;
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // --- VIDEO LOADING ---
    function loadWebVideoFile(file) {
        if (!file) return;
        state.videoFile = file;
        state.videoName = file.name;
        const objectUrl = URL.createObjectURL(file);
        loadVideoUrl(objectUrl, file.name);
    }

    function loadVideoUrl(url, label) {
        pause();
        state.videoSrc = url;
        state.videoName = label || 'video.mp4';
        thumbCache.clear();

        mainVideo.src = url;
        mainVideo.load();

        mainVideo.onloadedmetadata = () => {
            state.videoDuration = mainVideo.duration;
            state.videoWidth = mainVideo.videoWidth;
            state.videoHeight = mainVideo.videoHeight;
            
            if (state.videoDuration > 60) {
                state.pixelsPerSecond = Math.max(20, Math.min(80, 600 / state.videoDuration));
            } else if (state.videoDuration < 5) {
                state.pixelsPerSecond = 100;
            } else {
                state.pixelsPerSecond = 70;
            }

            state.clips = [{
                id: 'clip_' + Date.now(),
                sourceStart: 0,
                sourceEnd: state.videoDuration,
                speed: 1.0,
                volume: 1.0,
                reverse: false
            }];
            state.activeClipIndex = 0;
            state.currentTime = 0;

            state.history = [];
            state.historyIndex = -1;
            pushHistory('Load Video');

            emptyState.style.display = 'none';
            videoFrameBox.style.display = 'flex';
            statusText.textContent = label || 'Video Loaded';
            statusRes.textContent = `${state.videoWidth}x${state.videoHeight}`;

            updateVideoFrameSize();
            updateTimelinePadding();
            renderTimeline();
            seekToProjectTime(0, true);
            updateUI();
        };

        mainVideo.onerror = () => {
            console.error('Failed to load video:', url);
            videoFrameBox.style.display = 'none';
            emptyState.style.display = 'flex';
        };
    }

    // --- HISTORY SYSTEM (UNDO / REDO) ---
    function pushHistory(desc = '') {
        if (state.historyIndex < state.history.length - 1) {
            state.history = state.history.slice(0, state.historyIndex + 1);
        }

        const snapshot = {
            desc,
            clips: JSON.parse(JSON.stringify(state.clips)),
            activeClipIndex: state.activeClipIndex,
            currentTime: state.currentTime
        };

        state.history.push(snapshot);
        if (state.history.length > state.maxHistory) {
            state.history.shift();
        } else {
            state.historyIndex++;
        }

        updateUndoRedoButtons();
    }

    function undo() {
        if (state.historyIndex > 0) {
            pause();
            state.historyIndex--;
            const snap = state.history[state.historyIndex];
            state.clips = JSON.parse(JSON.stringify(snap.clips));
            state.activeClipIndex = Math.min(snap.activeClipIndex, state.clips.length - 1);
            state.currentTime = Math.min(snap.currentTime, getTotalDuration());
            
            renderTimeline();
            seekToProjectTime(state.currentTime, true);
            updateUI();
            updateUndoRedoButtons();
        }
    }

    function redo() {
        if (state.historyIndex < state.history.length - 1) {
            pause();
            state.historyIndex++;
            const snap = state.history[state.historyIndex];
            state.clips = JSON.parse(JSON.stringify(snap.clips));
            state.activeClipIndex = Math.min(snap.activeClipIndex, state.clips.length - 1);
            state.currentTime = Math.min(snap.currentTime, getTotalDuration());

            renderTimeline();
            seekToProjectTime(state.currentTime, true);
            updateUI();
            updateUndoRedoButtons();
        }
    }

    function updateUndoRedoButtons() {
        btnUndo.disabled = state.historyIndex <= 0;
        btnRedo.disabled = state.historyIndex >= state.history.length - 1;
    }

    // --- TIMELINE RENDERING ---
    function renderTimeline() {
        clipsStrip.innerHTML = '';
        const totalDur = getTotalDuration();
        totalDurationEl.textContent = formatTime(totalDur);

        state.clips.forEach((clip, index) => {
            const effDur = getClipEffectiveDuration(clip);
            const clipWidth = timeToPixels(effDur);

            const clipBox = document.createElement('div');
            clipBox.className = 'clip-box' + (index === state.activeClipIndex ? ' active' : '');
            clipBox.style.width = `${clipWidth}px`;
            clipBox.dataset.index = index;

            const thumbsContainer = document.createElement('div');
            thumbsContainer.className = 'clip-thumbs';
            clipBox.appendChild(thumbsContainer);

            generateClipThumbnails(clip, thumbsContainer, clipWidth);

            const badge = document.createElement('div');
            badge.className = 'clip-duration-badge';
            badge.textContent = `${effDur.toFixed(1)}s`;
            clipBox.appendChild(badge);

            if (clip.reverse) {
                const revBadge = document.createElement('div');
                revBadge.className = 'clip-reverse-badge';
                revBadge.textContent = 'REV';
                clipBox.appendChild(revBadge);
            }

            if (clip.speed && Math.abs(clip.speed - 1.0) > 0.01) {
                const spdBadge = document.createElement('div');
                spdBadge.className = 'clip-speed-badge';
                spdBadge.textContent = `${Math.round(clip.speed * 100)}%`;
                clipBox.appendChild(spdBadge);
            }

            if (index === state.activeClipIndex) {
                const leftHandle = document.createElement('div');
                leftHandle.className = 'trim-handle trim-handle-left';
                leftHandle.title = 'Drag to trim start';
                attachTrimHandler(leftHandle, index, 'left');
                clipBox.appendChild(leftHandle);

                const rightHandle = document.createElement('div');
                rightHandle.className = 'trim-handle trim-handle-right';
                rightHandle.title = 'Drag to trim end';
                attachTrimHandler(rightHandle, index, 'right');
                clipBox.appendChild(rightHandle);
            }

            clipBox.addEventListener('click', (e) => {
                if (e.target.classList.contains('trim-handle')) return;
                setActiveClip(index);
            });

            clipsStrip.appendChild(clipBox);
        });

        updateTimelinePadding();
    }

    function setActiveClip(index) {
        if (index < 0 || index >= state.clips.length) return;
        const prevIndex = state.activeClipIndex;
        state.activeClipIndex = index;
        renderTimeline();
        updateDrawerValues();

        if (prevIndex !== index) {
            let clipStart = 0;
            for (let i = 0; i < index; i++) {
                clipStart += getClipEffectiveDuration(state.clips[i]);
            }
            const clipEnd = clipStart + getClipEffectiveDuration(state.clips[index]);

            if (state.currentTime < clipStart || state.currentTime >= clipEnd) {
                seekToProjectTime(clipStart, true);
            }
        }
    }

    function generateClipThumbnails(clip, container, width) {
        container.innerHTML = '';
        const thumbWidth = 50;
        const frameCount = Math.max(1, Math.round(width / thumbWidth));

        for (let i = 0; i < frameCount; i++) {
            const frameRatio = (i + 0.5) / frameCount;
            const sourceTime = clip.reverse 
                ? clip.sourceEnd - frameRatio * (clip.sourceEnd - clip.sourceStart)
                : clip.sourceStart + frameRatio * (clip.sourceEnd - clip.sourceStart);

            const img = document.createElement('img');
            img.className = 'thumb-frame';
            img.alt = '';
            img.draggable = false;
            img.loading = 'lazy';

            const key = sourceTime.toFixed(1);
            if (thumbCache.has(key)) {
                img.src = thumbCache.get(key);
            } else {
                extractFrameThumbnail(sourceTime).then(dataUrl => {
                    if (dataUrl) img.src = dataUrl;
                }).catch(() => {});
            }

            container.appendChild(img);
        }
    }

    // --- DRAGGING TRIM HANDLES `[` and `]` ---
    function attachTrimHandler(handle, clipIndex, side) {
        handle.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            state.isTrimming = true;
            pause();

            const clip = state.clips[clipIndex];
            const startX = e.clientX;
            const initialStart = clip.sourceStart;
            const initialEnd = clip.sourceEnd;
            const speed = clip.speed || 1.0;

            function onPointerMove(moveEvent) {
                const deltaX = moveEvent.clientX - startX;
                const deltaTime = pixelsToTime(deltaX) * speed;

                if (side === 'left') {
                    const newStart = Math.max(0, Math.min(clip.sourceEnd - 0.2, initialStart + deltaTime));
                    clip.sourceStart = newStart;
                    mainVideo.currentTime = newStart;
                } else {
                    const newEnd = Math.min(state.videoDuration, Math.max(clip.sourceStart + 0.2, initialEnd + deltaTime));
                    clip.sourceEnd = newEnd;
                    mainVideo.currentTime = newEnd;
                }

                renderTimeline();
            }

            function onPointerUp() {
                state.isTrimming = false;
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
                pushHistory(`Trim ${side} handle`);
                renderTimeline();
                seekToProjectTime(state.currentTime, true);
            }

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        });
    }

    // --- PLAYHEAD SEEK & CENTER NEEDLE ALIGNMENT ---
    function seekToProjectTime(t, syncScroll = true) {
        if (!state.clips.length) return;
        const totalDur = getTotalDuration();
        t = Math.max(0, Math.min(totalDur, t));
        state.currentTime = t;
        currentTimeEl.textContent = formatTime(t);

        let accumulated = 0;
        let matchedIndex = 0;
        let timeInClip = 0;

        for (let i = 0; i < state.clips.length; i++) {
            const clipDur = getClipEffectiveDuration(state.clips[i]);
            if (t < accumulated + clipDur || i === state.clips.length - 1) {
                matchedIndex = i;
                timeInClip = (t - accumulated) * (state.clips[i].speed || 1.0);
                break;
            }
            accumulated += clipDur;
        }

        const activeClip = state.clips[matchedIndex];
        if (activeClip) {
            let targetSourceTime;
            if (activeClip.reverse) {
                targetSourceTime = activeClip.sourceEnd - timeInClip;
            } else {
                targetSourceTime = activeClip.sourceStart + timeInClip;
            }
            targetSourceTime = Math.max(0, Math.min(state.videoDuration, targetSourceTime));
            
            if (!state.isPlaying || Math.abs(mainVideo.currentTime - targetSourceTime) > 0.15) {
                mainVideo.currentTime = targetSourceTime;
            }
            mainVideo.playbackRate = activeClip.speed || 1.0;
            mainVideo.volume = state.isMuted ? 0 : (activeClip.volume !== undefined ? activeClip.volume : 1.0);
        }

        if (state.activeClipIndex !== matchedIndex) {
            state.activeClipIndex = matchedIndex;
            Array.from(clipsStrip.children).forEach((box, idx) => {
                box.classList.toggle('active', idx === matchedIndex);
            });
        }

        if (syncScroll && !state.isScrubbing) {
            const scrollPos = timeToPixels(t);
            timelineViewport.scrollLeft = scrollPos;
        }
    }

    // --- TIMELINE USER SCRUBBING ---
    timelineViewport.addEventListener('scroll', () => {
        if (!state.isPlaying && !state.isTrimming) {
            const scrollLeft = timelineViewport.scrollLeft;
            const t = pixelsToTime(scrollLeft);
            seekToProjectTime(t, false);
        }
    });

    let isPointerDownOnTrack = false;
    let trackStartX = 0;
    let initialScrollLeft = 0;

    timelineViewport.addEventListener('pointerdown', (e) => {
        if (e.target.classList.contains('trim-handle')) return;
        isPointerDownOnTrack = true;
        state.isScrubbing = true;
        trackStartX = e.clientX;
        initialScrollLeft = timelineViewport.scrollLeft;
        pause();

        function onPointerMove(moveEvent) {
            if (!isPointerDownOnTrack) return;
            const deltaX = moveEvent.clientX - trackStartX;
            timelineViewport.scrollLeft = initialScrollLeft - deltaX;
            const t = pixelsToTime(timelineViewport.scrollLeft);
            seekToProjectTime(t, false);
        }

        function onPointerUp() {
            isPointerDownOnTrack = false;
            state.isScrubbing = false;
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
        }

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    });

    // --- PLAYBACK CONTROL LOOP ---
    function togglePlay() {
        if (state.isPlaying) {
            pause();
        } else {
            play();
        }
    }

    function play() {
        if (!state.clips.length) return;
        const totalDur = getTotalDuration();
        if (state.currentTime >= totalDur - 0.05) {
            seekToProjectTime(0, true);
        }

        mainVideo.play().then(() => {
            state.isPlaying = true;
            iconPlay.style.display = 'none';
            iconPause.style.display = 'block';
            showPlayIndicator('play');
            startPlaybackLoop();
        }).catch(err => {
            console.warn('Playback error:', err);
        });
    }

    function pause() {
        state.isPlaying = false;
        mainVideo.pause();
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
    }

    function startPlaybackLoop() {
        let lastTimestamp = performance.now();

        function loop(timestamp) {
            if (!state.isPlaying) return;
            const deltaSec = (timestamp - lastTimestamp) / 1000;
            lastTimestamp = timestamp;

            const totalDur = getTotalDuration();
            const newTime = state.currentTime + deltaSec;

            if (newTime >= totalDur) {
                seekToProjectTime(totalDur, true);
                pause();
                return;
            }

            seekToProjectTime(newTime, true);
            animFrameId = requestAnimationFrame(loop);
        }

        animFrameId = requestAnimationFrame(loop);
    }

    function showPlayIndicator(type) {
        videoOverlayIcon.classList.add('visible');
        setTimeout(() => videoOverlayIcon.classList.remove('visible'), 300);
    }

    // --- CUT / SPLIT AT CENTER NEEDLE ---
    function cutAtNeedle() {
        splitClipAtCenterNeedle();
    }

    function splitClipAtCenterNeedle() {
        if (!state.clips.length) return;
        pause();

        const needleTime = state.currentTime;
        let accumulated = 0;
        let targetIndex = -1;
        let splitOffset = 0;

        for (let i = 0; i < state.clips.length; i++) {
            const effDur = getClipEffectiveDuration(state.clips[i]);
            if (needleTime > accumulated && needleTime < accumulated + effDur) {
                targetIndex = i;
                splitOffset = (needleTime - accumulated) * (state.clips[i].speed || 1.0);
                break;
            }
            accumulated += effDur;
        }

        if (targetIndex === -1) {
            alert('Move the center needle inside a clip to cut/split it.');
            return;
        }

        const originalClip = state.clips[targetIndex];
        const splitSourceTime = originalClip.reverse 
            ? originalClip.sourceEnd - splitOffset
            : originalClip.sourceStart + splitOffset;

        if (splitSourceTime - originalClip.sourceStart < 0.1 || originalClip.sourceEnd - splitSourceTime < 0.1) {
            alert('Cannot cut too close to clip boundary.');
            return;
        }

        const clipA = {
            ...originalClip,
            id: 'clip_' + Date.now() + '_a',
            sourceStart: originalClip.sourceStart,
            sourceEnd: splitSourceTime
        };

        const clipB = {
            ...originalClip,
            id: 'clip_' + Date.now() + '_b',
            sourceStart: splitSourceTime,
            sourceEnd: originalClip.sourceEnd
        };

        state.clips.splice(targetIndex, 1, clipA, clipB);
        state.activeClipIndex = targetIndex + 1;

        pushHistory('Cut / Split Clip');
        renderTimeline();
        seekToProjectTime(needleTime, true);
        updateUI();

        btnCut.classList.add('active');
        setTimeout(() => btnCut.classList.remove('active'), 250);
    }

    // --- SPEED ADJUSTMENT ---
    function setClipSpeed(speed, recordHistory = false) {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        speed = Math.max(0.1, Math.min(2.0, parseFloat(speed)));
        clip.speed = speed;

        const percent = Math.round(speed * 100);
        speedValBadge.textContent = percent === 100 ? '100% (Normal)' : `${percent}% (${speed.toFixed(2)}x)`;
        if (speedSlider) speedSlider.value = percent;
        
        document.querySelectorAll('.speed-btn').forEach(btn => {
            const btnSpeed = parseFloat(btn.dataset.speed);
            btn.classList.toggle('active', Math.abs(btnSpeed - speed) < 0.01);
        });

        if (mainVideo) {
            mainVideo.playbackRate = speed;
        }

        renderTimeline();
        seekToProjectTime(state.currentTime, true);
        updateUI();

        if (recordHistory) {
            pushHistory(`Speed ${percent}%`);
        }
    }

    // --- VOLUME ADJUSTMENT ---
    function setClipVolume(volPercent) {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        clip.volume = volPercent / 100;
        volumeValBadge.textContent = `${volPercent}%`;
        volumeSlider.value = volPercent;

        if (!state.isMuted) {
            mainVideo.volume = clip.volume;
        }
    }

    // --- REVERSE CLIP ---
    function toggleClipReverse() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        clip.reverse = !clip.reverse;
        pushHistory('Toggle Reverse');
        renderTimeline();
        seekToProjectTime(state.currentTime, true);
    }

    // --- DELETE CLIP (Land at 1st frame of next part) ---
    function deleteActiveClip() {
        if (!state.clips.length) return;
        if (state.clips.length === 1) {
            if (confirm('Delete the entire video clip?')) {
                state.clips = [];
                state.activeClipIndex = -1;
                pushHistory('Delete all clips');
                renderTimeline();
                emptyState.style.display = 'flex';
                updateUI();
            }
            return;
        }

        pause();
        const deleteIndex = state.activeClipIndex;
        if (deleteIndex < 0 || deleteIndex >= state.clips.length) return;

        let clipStartTime = 0;
        for (let i = 0; i < deleteIndex; i++) {
            clipStartTime += getClipEffectiveDuration(state.clips[i]);
        }

        state.clips.splice(deleteIndex, 1);

        let newActiveIndex;
        let targetTime;

        if (deleteIndex < state.clips.length) {
            newActiveIndex = deleteIndex;
            targetTime = clipStartTime;
        } else {
            newActiveIndex = state.clips.length - 1;
            targetTime = getTotalDuration();
        }

        state.activeClipIndex = newActiveIndex;
        state.currentTime = targetTime;

        pushHistory('Delete Clip');
        renderTimeline();
        seekToProjectTime(targetTime, true);
        updateUI();
    }

    // --- SUB-PANEL DRAWER (Speed, Volume) ---
    function toggleToolDrawer(panelName) {
        const isOpen = toolSubpanel.classList.contains('open');
        const isSpeed = panelName === 'speed';
        const isVol = panelName === 'volume';

        if (isOpen && ((isSpeed && panelSpeed.style.display === 'block') || (isVol && panelVolume.style.display === 'block'))) {
            closeToolDrawer();
            return;
        }

        toolSubpanel.classList.add('open');
        panelSpeed.style.display = isSpeed ? 'block' : 'none';
        panelVolume.style.display = isVol ? 'block' : 'none';

        btnToolSpeed.classList.toggle('active', isSpeed);
        btnToolVolume.classList.toggle('active', isVol);

        updateDrawerValues();
    }

    function closeToolDrawer() {
        toolSubpanel.classList.remove('open');
        btnToolSpeed.classList.remove('active');
        btnToolVolume.classList.remove('active');
    }

    function updateDrawerValues() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;

        const speed = clip.speed || 1.0;
        const percent = Math.round(speed * 100);
        speedValBadge.textContent = percent === 100 ? '100% (Normal)' : `${percent}% (${speed.toFixed(2)}x)`;
        if (speedSlider) speedSlider.value = percent;
        document.querySelectorAll('.speed-btn').forEach(btn => {
            const btnSpeed = parseFloat(btn.dataset.speed);
            btn.classList.toggle('active', Math.abs(btnSpeed - speed) < 0.01);
        });

        const volPercent = Math.round((clip.volume !== undefined ? clip.volume : 1.0) * 100);
        volumeValBadge.textContent = `${volPercent}%`;
        volumeSlider.value = volPercent;
    }

    // --- HELPER UTILITIES ---
    function formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function safeSeek(vid, targetTime) {
        return new Promise(resolve => {
            const maxDur = vid.duration || (targetTime + 1);
            const target = Math.max(0, Math.min(maxDur, targetTime));
            if (Math.abs(vid.currentTime - target) < 0.04) {
                resolve();
                return;
            }
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                vid.removeEventListener('seeked', finish);
                vid.removeEventListener('error', finish);
                if (tid) clearTimeout(tid);
                resolve();
            };
            const tid = setTimeout(finish, 350);
            vid.addEventListener('seeked', finish, { once: true });
            vid.addEventListener('error', finish, { once: true });
            try {
                vid.currentTime = target;
            } catch (e) {
                finish();
            }
        });
    }

    async function safePlay(vid) {
        if (!vid.paused) return;
        try {
            await vid.play();
        } catch (err) {
            console.warn('Direct play rejected, falling back to muted play:', err);
            vid.muted = true;
            try {
                await vid.play();
            } catch (err2) {
                console.warn('Muted play also rejected:', err2);
            }
        }
    }

    // --- SAVE & EXPORT MODAL ---
    function openSaveModal() {
        pause();
        summaryDuration.textContent = formatTime(getTotalDuration());
        summaryClipsCount.textContent = state.clips.length;

        const baseName = (state.videoName || 'Light_Video_Export').replace(/\.[^/.]+$/, '');
        saveFileNameInput.value = `${baseName}_edited.mp4`;

        modalExportForm.style.display = 'block';
        modalExportProgress.style.display = 'none';
        exportCompleteActions.style.display = 'none';
        document.querySelector('.progress-spinner-box').style.display = 'flex';
        progressBarFill.style.width = '0%';
        progressPercent.textContent = '0%';
        progressStatusTitle.textContent = 'Exporting Video...';
        progressStatusDesc.textContent = 'Applying cuts, speed adjustments and rendering frames';

        saveModal.style.display = 'flex';
    }

    function closeSaveModal() {
        saveModal.style.display = 'none';
    }

    // --- IN-BROWSER VIDEO COMPOSITOR & EXPORT ENGINE ---
    async function startExport() {
        modalExportForm.style.display = 'none';
        modalExportProgress.style.display = 'block';
        exportCompleteActions.style.display = 'none';
        document.querySelector('.progress-spinner-box').style.display = 'flex';

        updateExportProgress(0, 'Initializing web media compositor...');

        try {
            const exportPayload = {
                clips: state.clips,
                resolution: state.exportResolution,
                fileName: saveFileNameInput.value || 'Light_Video_Export.mp4'
            };

            const result = await renderAndExportVideo(exportPayload, (pct, status) => {
                updateExportProgress(pct, status);
            });

            onExportFinished(result);
        } catch (err) {
            console.error('Export failed:', err);
            progressStatusTitle.textContent = 'Export Error';
            progressStatusDesc.textContent = err.message || 'Could not export video in this browser.';
            document.querySelector('.progress-spinner-box').style.display = 'none';
        }
    }

    async function renderAndExportVideo(payload, onProgress) {
        const { clips, resolution } = payload;
        if (!clips || !clips.length) throw new Error('No clips to export.');

        let width = mainVideo.videoWidth || 1280;
        let height = mainVideo.videoHeight || 720;
        if (resolution === '1080p') {
            const aspect = width / height;
            if (aspect >= 1) { width = 1920; height = Math.round(1920 / aspect); }
            else { height = 1920; width = Math.round(1920 * aspect); }
        } else if (resolution === '720p') {
            const aspect = width / height;
            if (aspect >= 1) { width = 1280; height = Math.round(1280 / aspect); }
            else { height = 1280; width = Math.round(1280 * aspect); }
        }
        width = width % 2 === 0 ? width : width + 1;
        height = height % 2 === 0 ? height : height + 1;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        let totalDur = 0;
        clips.forEach(c => {
            const rawDur = Math.max(0.05, c.sourceEnd - c.sourceStart);
            totalDur += rawDur / (c.speed || 1.0);
        });

        const exportVid = document.createElement('video');
        exportVid.playsInline = true;
        exportVid.preload = 'auto';
        if (state.videoSrc && !state.videoSrc.startsWith('blob:') && !state.videoSrc.startsWith('data:')) {
            try { exportVid.crossOrigin = 'anonymous'; } catch (e) {}
        }
        exportVid.src = state.videoSrc;
        exportVid.muted = false;
        try { exportVid.load(); } catch (e) {}

        if (exportVid.readyState < 1) {
            await new Promise(resolve => {
                let resolved = false;
                const finish = () => {
                    if (resolved) return;
                    resolved = true;
                    exportVid.removeEventListener('loadedmetadata', finish);
                    exportVid.removeEventListener('error', finish);
                    if (tid) clearTimeout(tid);
                    resolve();
                };
                const tid = setTimeout(finish, 2000);
                exportVid.addEventListener('loadedmetadata', finish, { once: true });
                exportVid.addEventListener('error', finish, { once: true });
            });
        }

        const stream = canvas.captureStream(30);

        let audioCtx = null;
        let audioDest = null;
        let gainNode = null;
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
                if (audioCtx.state === 'suspended') {
                    await Promise.race([
                        audioCtx.resume(),
                        new Promise(r => setTimeout(r, 200))
                    ]).catch(() => {});
                }
                audioDest = audioCtx.createMediaStreamDestination();
                gainNode = audioCtx.createGain();
                const sourceNode = audioCtx.createMediaElementSource(exportVid);
                sourceNode.connect(gainNode);
                gainNode.connect(audioDest);
                if (audioDest.stream.getAudioTracks().length > 0) {
                    stream.addTrack(audioDest.stream.getAudioTracks()[0]);
                }
            }
        } catch (e) {
            console.warn('AudioContext routing fallback:', e);
        }

        let mimeType = 'video/webm';
        const candidates = [
            'video/mp4;codecs=avc1,mp4a.40.2',
            'video/mp4;codecs=avc1',
            'video/mp4',
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264',
            'video/webm'
        ];
        for (const c of candidates) {
            if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(c)) {
                mimeType = c;
                break;
            }
        }

        const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 4000000
        });

        const chunks = [];
        recorder.ondataavailable = e => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
        };

        recorder.start(100);

        let accumulatedTime = 0;

        for (let i = 0; i < clips.length; i++) {
            const clip = clips[i];
            const effDur = Math.max(0.05, (clip.sourceEnd - clip.sourceStart) / (clip.speed || 1.0));

            if (gainNode) {
                gainNode.gain.value = clip.volume !== undefined ? clip.volume : 1.0;
            }

            if (clip.reverse) {
                // Reverse rendering: step backward frame by frame
                if (!exportVid.paused) {
                    try { exportVid.pause(); } catch (e) {}
                }
                const fps = 30;
                const totalFrames = Math.max(1, Math.round(effDur * fps));
                for (let f = 0; f < totalFrames; f++) {
                    const ratio = f / totalFrames;
                    const frameTime = clip.sourceEnd - ratio * (clip.sourceEnd - clip.sourceStart);
                    await safeSeek(exportVid, frameTime);
                    try {
                        ctx.drawImage(exportVid, 0, 0, width, height);
                    } catch (e) {}

                    const currentTotal = accumulatedTime + (f / totalFrames) * effDur;
                    const progress = Math.min(99, Math.round((currentTotal / totalDur) * 100));
                    if (onProgress) {
                        onProgress(progress, `Rendering reverse clip ${i + 1} of ${clips.length}... (${progress}%)`);
                    }
                    await new Promise(r => setTimeout(r, 20));
                }
            } else {
                // Forward rendering:
                const targetRate = Math.max(0.1, Math.min(4.0, clip.speed || 1.0));
                exportVid.playbackRate = targetRate;

                await safeSeek(exportVid, clip.sourceStart);
                await safePlay(exportVid);

                await new Promise(resolve => {
                    let resolved = false;
                    const clipStartWall = performance.now();
                    const maxClipWaitMs = (effDur * 1000) + 3000;

                    function step() {
                        if (resolved) return;

                        const isPastEnd = exportVid.currentTime >= clip.sourceEnd - 0.04;
                        const isEnded = exportVid.ended;
                        const isTimeout = (performance.now() - clipStartWall) > maxClipWaitMs;

                        if (isPastEnd || isEnded || isTimeout) {
                            resolved = true;
                            resolve();
                            return;
                        }

                        try {
                            ctx.drawImage(exportVid, 0, 0, width, height);
                        } catch (e) {}

                        const clipTimePassed = Math.max(0, exportVid.currentTime - clip.sourceStart) / (clip.speed || 1.0);
                        const currentTotal = accumulatedTime + Math.min(effDur, clipTimePassed);
                        const progress = Math.min(99, Math.round((currentTotal / totalDur) * 100));

                        if (onProgress) {
                            onProgress(progress, `Rendering clip ${i + 1} of ${clips.length}... (${progress}%)`);
                        }

                        if (document.hidden) {
                            setTimeout(step, 30);
                        } else {
                            requestAnimationFrame(step);
                        }
                    }

                    step();
                });
            }

            accumulatedTime += effDur;
        }

        try { exportVid.pause(); } catch (e) {}

        const recordedBlob = await new Promise((resolve, reject) => {
            const finishTimer = setTimeout(() => {
                const finalType = mimeType.toLowerCase().includes('mp4') ? 'video/mp4' : 'video/webm';
                resolve(new Blob(chunks, { type: finalType }));
            }, 3000);

            recorder.onstop = () => {
                clearTimeout(finishTimer);
                const finalType = mimeType.toLowerCase().includes('mp4') ? 'video/mp4' : 'video/webm';
                resolve(new Blob(chunks, { type: finalType }));
            };

            recorder.onerror = (err) => {
                clearTimeout(finishTimer);
                reject(err);
            };

            try {
                if (recorder.state !== 'inactive') {
                    recorder.stop();
                } else {
                    recorder.onstop();
                }
            } catch (e) {
                recorder.onstop();
            }
        });

        // Cleanup
        try { stream.getTracks().forEach(t => t.stop()); } catch (e) {}
        if (audioCtx) {
            try { audioCtx.close(); } catch (e) {}
        }
        exportVid.src = '';

        if (onProgress) onProgress(100, 'Render complete!');
        return { blob: recordedBlob, mimeType };
    }

    function updateExportProgress(percent, desc) {
        progressBarFill.style.width = `${percent}%`;
        progressPercent.textContent = `${Math.round(percent)}%`;
        if (desc) progressStatusDesc.textContent = desc;
    }

    function onExportFinished(result) {
        const blob = result.blob || result;
        const mimeType = result.mimeType || blob.type || '';

        if (exportedBlobUrl) {
            URL.revokeObjectURL(exportedBlobUrl);
        }
        exportedBlobUrl = URL.createObjectURL(blob);

        const isMp4 = mimeType.toLowerCase().includes('mp4');
        let currentName = (saveFileNameInput.value || 'Light_Video_Export').trim();
        if (isMp4) {
            if (!currentName.toLowerCase().endsWith('.mp4')) {
                currentName = currentName.replace(/\.[^/.]+$/, '') + '.mp4';
            }
        } else {
            if (!currentName.toLowerCase().endsWith('.webm')) {
                currentName = currentName.replace(/\.[^/.]+$/, '') + '.webm';
            }
        }
        saveFileNameInput.value = currentName;

        progressBarFill.style.width = '100%';
        progressPercent.textContent = '100%';
        progressStatusTitle.textContent = 'Export Complete!';
        progressStatusDesc.textContent = `Video rendered successfully (${isMp4 ? 'MP4' : 'WebM'}, ${formatBytes(blob.size)}). Ready to download.`;
        exportCompleteActions.style.display = 'flex';
        document.querySelector('.progress-spinner-box').style.display = 'none';

        // Trigger automatic browser download
        triggerBrowserDownload();
    }

    function triggerBrowserDownload() {
        if (!exportedBlobUrl) return;
        const a = document.createElement('a');
        a.href = exportedBlobUrl;
        a.download = saveFileNameInput.value || 'Light_Video_Export.mp4';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            try { document.body.removeChild(a); } catch (e) {}
        }, 200);
    }

    // --- EVENT BINDINGS ---
    function bindEvents() {
        btnPlayPause.addEventListener('click', togglePlay);
        videoFrameBox.addEventListener('click', togglePlay);

        btnUndo.addEventListener('click', undo);
        btnRedo.addEventListener('click', redo);

        btnMuteToggle.addEventListener('click', () => {
            state.isMuted = !state.isMuted;
            mainVideo.muted = state.isMuted;
            iconAudioOn.style.display = state.isMuted ? 'none' : 'block';
            iconAudioMuted.style.display = state.isMuted ? 'block' : 'none';
        });

        btnAddMedia.addEventListener('click', () => hiddenFileInput.click());
        btnOpenVideoPrompt.addEventListener('click', () => hiddenFileInput.click());
        if (btnLoadSamplePrompt) {
            btnLoadSamplePrompt.addEventListener('click', () => hiddenFileInput.click());
        }

        hiddenFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                loadWebVideoFile(file);
            }
        });

        // Drag & Drop
        window.addEventListener('dragover', (e) => {
            e.preventDefault();
            mobileFrame.classList.add('drag-over');
        });
        window.addEventListener('dragleave', (e) => {
            if (e.relatedTarget === null) {
                mobileFrame.classList.remove('drag-over');
            }
        });
        window.addEventListener('drop', (e) => {
            e.preventDefault();
            mobileFrame.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                loadWebVideoFile(e.dataTransfer.files[0]);
            }
        });

        btnBackTool.addEventListener('click', closeToolDrawer);
        btnCut.addEventListener('click', cutAtNeedle);
        btnToolSpeed.addEventListener('click', () => toggleToolDrawer('speed'));
        btnToolVolume.addEventListener('click', () => toggleToolDrawer('volume'));
        btnToolReverse.addEventListener('click', toggleClipReverse);
        btnToolDelete.addEventListener('click', deleteActiveClip);

        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => setClipSpeed(btn.dataset.speed, true));
        });

        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                setClipSpeed(parseFloat(e.target.value) / 100, false);
            });
            speedSlider.addEventListener('change', (e) => {
                pushHistory(`Speed ${e.target.value}%`);
            });
        }

        if (btnSpeedReset) {
            btnSpeedReset.addEventListener('click', () => setClipSpeed(1.0, true));
        }

        if (btnSpeedMinus) {
            btnSpeedMinus.addEventListener('click', () => {
                const clip = state.clips[state.activeClipIndex];
                if (!clip) return;
                const cur = Math.round((clip.speed || 1.0) * 100);
                const next = Math.max(10, cur - (cur > 100 ? 10 : 5));
                setClipSpeed(next / 100, true);
            });
        }

        if (btnSpeedPlus) {
            btnSpeedPlus.addEventListener('click', () => {
                const clip = state.clips[state.activeClipIndex];
                if (!clip) return;
                const cur = Math.round((clip.speed || 1.0) * 100);
                const next = Math.min(200, cur + (cur >= 100 ? 10 : 5));
                setClipSpeed(next / 100, true);
            });
        }

        volumeSlider.addEventListener('input', (e) => setClipVolume(e.target.value));
        volumeSlider.addEventListener('change', () => pushHistory('Adjust Volume'));
        btnVolReset.addEventListener('click', () => {
            setClipVolume(100);
            pushHistory('Reset Volume 100%');
        });

        btnTopSave.addEventListener('click', openSaveModal);
        btnCloseSaveModal.addEventListener('click', closeSaveModal);
        btnCancelSave.addEventListener('click', closeSaveModal);
        btnConfirmExport.addEventListener('click', startExport);
        btnDoneExport.addEventListener('click', closeSaveModal);
        btnDownloadExported.addEventListener('click', triggerBrowserDownload);

        btnPlayExportedVideo.addEventListener('click', () => {
            if (exportedBlobUrl) {
                previewExportedVideo.src = exportedBlobUrl;
                previewModal.style.display = 'flex';
                previewExportedVideo.play();
            }
        });

        btnClosePreviewModal.addEventListener('click', () => {
            previewExportedVideo.pause();
            previewModal.style.display = 'none';
        });

        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.exportResolution = btn.dataset.res;
            });
        });

        btnShortcuts.addEventListener('click', () => {
            shortcutsModal.style.display = 'flex';
        });
        btnCloseShortcutsModal.addEventListener('click', () => {
            shortcutsModal.style.display = 'none';
        });

        window.addEventListener('keydown', handleKeyboardShortcuts);
    }

    function handleKeyboardShortcuts(e) {
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        } else if (e.code === 'KeyC' || e.code === 'KeyS') {
            if (!e.ctrlKey) {
                e.preventDefault();
                cutAtNeedle();
            }
        } else if (e.ctrlKey && e.code === 'KeyZ') {
            e.preventDefault();
            undo();
        } else if (e.ctrlKey && e.code === 'KeyY') {
            e.preventDefault();
            redo();
        } else if (e.code === 'Delete' || e.code === 'Backspace') {
            e.preventDefault();
            deleteActiveClip();
        } else if (e.ctrlKey && e.code === 'KeyS') {
            e.preventDefault();
            openSaveModal();
        } else if (e.ctrlKey && e.code === 'KeyO') {
            e.preventDefault();
            hiddenFileInput.click();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            pause();
            seekToProjectTime(state.currentTime - 0.1, true);
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            pause();
            seekToProjectTime(state.currentTime + 0.1, true);
        }
    }

    function updateUI() {
        currentTimeEl.textContent = formatTime(state.currentTime);
        totalDurationEl.textContent = formatTime(getTotalDuration());
        updateUndoRedoButtons();
    }

    window.addEventListener('DOMContentLoaded', init);
})();
