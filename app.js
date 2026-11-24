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

        // Aspect ratio & framing
        aspectRatio: 'original',
        fitMode: 'contain',

        // Export settings
        exportResolution: 'original',
        exportFormat: 'video', // 'video' | 'gif'
        gifScope: 'active',    // 'active' | 'all'
        gifFps: 15
    };

    // DOM Elements
    const mobileFrame = document.getElementById('mobileFrame');
    const mainVideo = document.getElementById('mainVideo');
    const videoPreviewContainer = document.getElementById('videoPreviewContainer');
    const videoFrameBox = document.getElementById('videoFrameBox');
    const snapshotFlash = document.getElementById('snapshotFlash');
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
    const btnSnapshot = document.getElementById('btnSnapshot');
    const btnMuteToggle = document.getElementById('btnMuteToggle');
    const iconAudioOn = document.getElementById('iconAudioOn');
    const iconAudioMuted = document.getElementById('iconAudioMuted');
    const btnShortcuts = document.getElementById('btnShortcuts');
    const btnTopSave = document.getElementById('btnTopSave');
    const btnAddMedia = document.getElementById('btnAddMedia');
    const btnAddClip = document.getElementById('btnAddClip');

    const btnToolAddClip = document.getElementById('btnToolAddClip');
    const btnCut = document.getElementById('btnCut');
    const btnToolDuplicate = document.getElementById('btnToolDuplicate');
    const btnToolSpeed = document.getElementById('btnToolSpeed');
    const btnToolVolume = document.getElementById('btnToolVolume');
    const btnToolTransform = document.getElementById('btnToolTransform');
    const btnToolCrop = document.getElementById('btnToolCrop');
    const btnToolReverse = document.getElementById('btnToolReverse');
    const btnToolSnapshot = document.getElementById('btnToolSnapshot');
    const btnToolGif = document.getElementById('btnToolGif');
    const btnToolDelete = document.getElementById('btnToolDelete');

    const bottomToolbar = document.getElementById('bottomToolbar');
    const btnSlideToolbarLeft = document.getElementById('btnSlideToolbarLeft');
    const btnSlideToolbarRight = document.getElementById('btnSlideToolbarRight');

    const toolSubpanel = document.getElementById('toolSubpanel');
    const panelSpeed = document.getElementById('panelSpeed');
    const panelVolume = document.getElementById('panelVolume');
    const panelTransform = document.getElementById('panelTransform');
    const panelCrop = document.getElementById('panelCrop');

    const transformValBadge = document.getElementById('transformValBadge');
    const btnRotateRight = document.getElementById('btnRotateRight');
    const btnFlipH = document.getElementById('btnFlipH');
    const btnFlipV = document.getElementById('btnFlipV');
    const btnResetTransform = document.getElementById('btnResetTransform');

    const cropValBadge = document.getElementById('cropValBadge');
    const zoomSlider = document.getElementById('zoomSlider');
    const btnZoomMinus = document.getElementById('btnZoomMinus');
    const btnZoomPlus = document.getElementById('btnZoomPlus');
    const btnZoomReset = document.getElementById('btnZoomReset');

    // 4-Side Crop Overlay & Interactive Trimming
    const cropOverlayContainer = document.getElementById('cropOverlayContainer');
    const cropMaskTop = document.getElementById('cropMaskTop');
    const cropMaskBottom = document.getElementById('cropMaskBottom');
    const cropMaskLeft = document.getElementById('cropMaskLeft');
    const cropMaskRight = document.getElementById('cropMaskRight');
    const cropBox = document.getElementById('cropBox');
    const cropInfoTag = document.getElementById('cropInfoTag');
    const cropStatusText = document.getElementById('cropStatusText');

    const btnCropSquare = document.getElementById('btnCropSquare');
    const btnCropCenter = document.getElementById('btnCropCenter');
    const btnCropReset = document.getElementById('btnCropReset');

    const cropSliderTop = document.getElementById('cropSliderTop');
    const cropSliderBottom = document.getElementById('cropSliderBottom');
    const cropSliderLeft = document.getElementById('cropSliderLeft');
    const cropSliderRight = document.getElementById('cropSliderRight');

    const cropValTop = document.getElementById('cropValTop');
    const cropValBottom = document.getElementById('cropValBottom');
    const cropValLeft = document.getElementById('cropValLeft');
    const cropValRight = document.getElementById('cropValRight');

    const btnCropTopMinus = document.getElementById('btnCropTopMinus');
    const btnCropTopPlus = document.getElementById('btnCropTopPlus');
    const btnCropBottomMinus = document.getElementById('btnCropBottomMinus');
    const btnCropBottomPlus = document.getElementById('btnCropBottomPlus');
    const btnCropLeftMinus = document.getElementById('btnCropLeftMinus');
    const btnCropLeftPlus = document.getElementById('btnCropLeftPlus');
    const btnCropRightMinus = document.getElementById('btnCropRightMinus');
    const btnCropRightPlus = document.getElementById('btnCropRightPlus');
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
    const previewExportedGif = document.getElementById('previewExportedGif');

    const snapshotModal = document.getElementById('snapshotModal');
    const btnCloseSnapshotModal = document.getElementById('btnCloseSnapshotModal');
    const snapshotImgPreview = document.getElementById('snapshotImgPreview');
    const snapshotMetaInfo = document.getElementById('snapshotMetaInfo');
    const btnCopySnapshot = document.getElementById('btnCopySnapshot');
    const btnDownloadSnapshot = document.getElementById('btnDownloadSnapshot');

    const appToast = document.getElementById('appToast');
    const toastMsg = document.getElementById('toastMsg');
    const gifOptionsGroup = document.getElementById('gifOptionsGroup');
    const exportHintText = document.getElementById('exportHintText');

    const shortcutsModal = document.getElementById('shortcutsModal');
    const btnCloseShortcutsModal = document.getElementById('btnCloseShortcutsModal');

    const btnOpenVideoPrompt = document.getElementById('btnOpenVideoPrompt');
    const btnLoadSamplePrompt = document.getElementById('btnLoadSamplePrompt');
    const hiddenFileInput = document.getElementById('hiddenFileInput');
    const hiddenAddClipInput = document.getElementById('hiddenAddClipInput');

    const statusText = document.getElementById('statusText');
    const statusRes = document.getElementById('statusRes');

    let exportedBlobUrl = null;
    let animFrameId = null;

    // --- CLIENT-SIDE THUMBNAIL CACHE & EXTRACTOR ---
    const thumbCache = new Map();
    const thumbExtractors = new Map();

    function getThumbExtractorVideo(src) {
        src = src || state.videoSrc;
        if (!thumbExtractors.has(src)) {
            const vid = document.createElement('video');
            vid.muted = true;
            vid.playsInline = true;
            vid.preload = 'auto';
            if (src && !src.startsWith('blob:') && !src.startsWith('data:')) {
                try { vid.crossOrigin = 'anonymous'; } catch (e) {}
            }
            vid.src = src;
            thumbExtractors.set(src, vid);
        }
        return thumbExtractors.get(src);
    }

    async function extractFrameThumbnail(sourceTime, src, clipDuration) {
        src = src || state.videoSrc;
        const dur = clipDuration || state.videoDuration || 0;
        const key = `${src}_${sourceTime.toFixed(1)}`;
        if (thumbCache.has(key)) return thumbCache.get(key);

        return new Promise(resolve => {
            const vid = getThumbExtractorVideo(src);
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
            vid.currentTime = Math.max(0, Math.min(dur, sourceTime));
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

    // Apply real-time CSS transforms (Rotation, Flip, Zoom, Fit, 4-Side Crop) to main video preview
    function applyVideoTransforms() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) {
            mainVideo.style.transform = '';
            mainVideo.style.objectFit = 'contain';
            return;
        }

        const rot = (clip.rotation || 0) % 360;
        const flipH = clip.flipH ? -1 : 1;
        const flipV = clip.flipV ? -1 : 1;
        const zoom = clip.zoom || 1.0;
        const fitMode = clip.fitMode || state.fitMode || 'contain';

        const crop = clip.crop || { top: 0, bottom: 0, left: 0, right: 0 };
        const hasCrop = ((crop.top || 0) > 0 || (crop.bottom || 0) > 0 || (crop.left || 0) > 0 || (crop.right || 0) > 0);
        const isCropPanelOpen = (panelCrop && panelCrop.style.display === 'block');

        if (isCropPanelOpen || !hasCrop) {
            // Full video display (guides/handles active or no crop)
            mainVideo.style.transform = `rotate(${rot}deg) scaleX(${flipH}) scaleY(${flipV}) scale(${zoom})`;
            mainVideo.style.objectFit = fitMode === 'cover' ? 'cover' : 'contain';
        } else {
            // Framed view: video zoomed & shifted to show only the cropped selection
            const keepW = Math.max(5, 100 - ((crop.left || 0) + (crop.right || 0)));
            const keepH = Math.max(5, 100 - ((crop.top || 0) + (crop.bottom || 0)));
            const scaleX = 100 / keepW;
            const scaleY = 100 / keepH;
            const shiftX = ((crop.left || 0) - (crop.right || 0)) / 2;
            const shiftY = ((crop.top || 0) - (crop.bottom || 0)) / 2;

            mainVideo.style.transform = `rotate(${rot}deg) scaleX(${flipH}) scaleY(${flipV}) scale(${zoom}) translate(${-shiftX}%, ${-shiftY}%) scale(${scaleX}, ${scaleY})`;
            mainVideo.style.objectFit = 'cover';
        }
    }

    // Adapt video frame box to active aspect ratio
    function updateVideoFrameSize() {
        if (!state.videoWidth || !state.videoHeight) {
            videoFrameBox.style.width = '280px';
            videoFrameBox.style.height = '460px';
            return;
        }

        const containerW = videoPreviewContainer.clientWidth - 32;
        const containerH = videoPreviewContainer.clientHeight - 32;
        
        const clip = state.clips[state.activeClipIndex];
        const crop = (clip && clip.crop) || { top: 0, bottom: 0, left: 0, right: 0 };
        const hasCrop = ((crop.top || 0) > 0 || (crop.bottom || 0) > 0 || (crop.left || 0) > 0 || (crop.right || 0) > 0);
        const isCropPanelOpen = (panelCrop && panelCrop.style.display === 'block');

        let targetAspect = state.videoWidth / state.videoHeight;
        if (state.aspectRatio === '16:9') targetAspect = 16 / 9;
        else if (state.aspectRatio === '9:16') targetAspect = 9 / 16;
        else if (state.aspectRatio === '1:1') targetAspect = 1.0;
        else if (state.aspectRatio === '4:5') targetAspect = 4 / 5;
        else if (state.aspectRatio === '21:9') targetAspect = 21 / 9;
        else if (state.aspectRatio === 'original' && hasCrop && !isCropPanelOpen) {
            // Natural aspect ratio of the 4-side cropped video
            const rot = ((clip && clip.rotation) || 0) % 360;
            const isSideways = (rot === 90 || rot === 270);
            const vw = isSideways ? (clip.videoHeight || state.videoHeight) : (clip.videoWidth || state.videoWidth);
            const vh = isSideways ? (clip.videoWidth || state.videoWidth) : (clip.videoHeight || state.videoHeight);
            const kw = vw * (1 - ((crop.left || 0) + (crop.right || 0)) / 100);
            const kh = vh * (1 - ((crop.top || 0) + (crop.bottom || 0)) / 100);
            if (kw > 0 && kh > 0) targetAspect = kw / kh;
        }

        const containerAspect = containerW / containerH;

        let targetW, targetH;
        if (targetAspect > containerAspect) {
            targetW = containerW;
            targetH = containerW / targetAspect;
        } else {
            targetH = containerH;
            targetW = containerH * targetAspect;
        }

        videoFrameBox.style.width = `${Math.round(targetW)}px`;
        videoFrameBox.style.height = `${Math.round(targetH)}px`;

        if (isCropPanelOpen) {
            updateCropOverlayUI();
        }
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

            mainVideo.dataset.currentSrc = url;
            state.clips = [{
                id: 'clip_' + Date.now(),
                videoSrc: url,
                videoName: label || 'video.mp4',
                videoDuration: state.videoDuration,
                videoWidth: state.videoWidth,
                videoHeight: state.videoHeight,
                sourceStart: 0,
                sourceEnd: state.videoDuration,
                speed: 1.0,
                volume: 1.0,
                reverse: false,
                rotation: 0,
                flipH: false,
                flipV: false,
                zoom: 1.0,
                fitMode: 'contain',
                crop: { top: 0, bottom: 0, left: 0, right: 0 }
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
            applyVideoTransforms();
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

    // --- ADD / APPEND VIDEO CLIPS FOR MERGING ---
    async function addVideoFiles(files) {
        if (!files || !files.length) return;
        const fileList = Array.from(files);

        // If no video loaded yet, load the first one normally
        if (!state.clips.length || !state.videoSrc) {
            loadWebVideoFile(fileList[0]);
            fileList.shift();
            if (!fileList.length) return;
        }

        pause();
        showToast(`Adding ${fileList.length} clip(s)...`, 2000);

        for (const file of fileList) {
            await loadAndAppendClipFile(file);
        }

        pushHistory('Add Clip(s)');
        state.activeClipIndex = state.clips.length - 1;
        renderTimeline();
        updateTimelinePadding();
        updateUI();
        seekToProjectTime(state.currentTime, true);
        showToast(`Added! Total ${state.clips.length} clips on timeline (Ready to merge/export)`, 2800);
    }

    function loadAndAppendClipFile(file) {
        return new Promise((resolve) => {
            const tempVid = document.createElement('video');
            tempVid.preload = 'metadata';
            const blobUrl = URL.createObjectURL(file);
            tempVid.src = blobUrl;

            const finish = (success) => {
                tempVid.removeEventListener('loadedmetadata', onLoaded);
                tempVid.removeEventListener('error', onError);
                if (tid) clearTimeout(tid);
                if (success) {
                    const duration = Math.max(0.1, tempVid.duration || 1);
                    const newClip = {
                        id: 'clip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                        videoSrc: blobUrl,
                        videoFile: file,
                        videoName: file.name,
                        videoDuration: duration,
                        videoWidth: tempVid.videoWidth || state.videoWidth || 1280,
                        videoHeight: tempVid.videoHeight || state.videoHeight || 720,
                        sourceStart: 0,
                        sourceEnd: duration,
                        speed: 1.0,
                        volume: 1.0,
                        reverse: false,
                        rotation: 0,
                        flipH: false,
                        flipV: false,
                        zoom: 1.0,
                        fitMode: 'contain',
                        crop: { top: 0, bottom: 0, left: 0, right: 0 }
                    };
                    state.clips.push(newClip);
                }
                resolve();
            };

            const onLoaded = () => finish(true);
            const onError = () => {
                showToast(`Could not load ${file.name}`);
                finish(false);
            };
            const tid = setTimeout(() => finish(true), 4000);

            tempVid.addEventListener('loadedmetadata', onLoaded, { once: true });
            tempVid.addEventListener('error', onError, { once: true });
        });
    }

    // --- MERGE CLIPS ---
    function mergeAdjacentClips() {
        if (!state.clips || state.clips.length < 2) {
            showToast('Add at least 2 clips first to merge them! (+ Add Clip)', 2600);
            return;
        }

        const idx = state.activeClipIndex >= 0 ? state.activeClipIndex : 0;
        const nextIdx = idx < state.clips.length - 1 ? idx + 1 : idx - 1;
        const minIdx = Math.min(idx, nextIdx);
        const maxIdx = Math.max(idx, nextIdx);

        const clipA = state.clips[minIdx];
        const clipB = state.clips[maxIdx];

        const srcA = clipA.videoSrc || state.videoSrc;
        const srcB = clipB.videoSrc || state.videoSrc;

        // If from the same source file and contiguous
        if (srcA === srcB && Math.abs(clipA.sourceEnd - clipB.sourceStart) < 0.25) {
            clipA.sourceEnd = clipB.sourceEnd;
            state.clips.splice(maxIdx, 1);
            state.activeClipIndex = minIdx;
            pushHistory('Merge Adjacent Clips');
            renderTimeline();
            seekToProjectTime(state.currentTime, true);
            updateUI();
            showToast('Adjacent clips merged into 1 timeline clip!', 2500);
            return;
        }

        // Multiple clips on timeline ready for full merge & export
        openSaveModal('video');
        showToast(`All ${state.clips.length} clips on timeline will be merged into 1 video!`, 3200);
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
            currentTime: state.currentTime,
            aspectRatio: state.aspectRatio,
            fitMode: state.fitMode
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
            state.aspectRatio = snap.aspectRatio || 'original';
            state.fitMode = snap.fitMode || 'contain';
            
            updateVideoFrameSize();
            applyVideoTransforms();
            renderTimeline();
            seekToProjectTime(state.currentTime, true);
            updateDrawerValues();
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
            state.aspectRatio = snap.aspectRatio || 'original';
            state.fitMode = snap.fitMode || 'contain';

            updateVideoFrameSize();
            applyVideoTransforms();
            renderTimeline();
            seekToProjectTime(state.currentTime, true);
            updateDrawerValues();
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

            const titleBadge = document.createElement('div');
            titleBadge.className = 'clip-title-badge';
            const shortName = clip.videoName ? clip.videoName.replace(/\.[^/.]+$/, '') : `Clip ${index + 1}`;
            titleBadge.textContent = state.clips.length > 1 ? `#${index + 1} ${shortName}` : shortName;
            titleBadge.title = clip.videoName || `Clip ${index + 1}`;
            clipBox.appendChild(titleBadge);

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

            if (clip.rotation && clip.rotation % 360 !== 0) {
                const rotBadge = document.createElement('div');
                rotBadge.className = 'clip-rotation-badge';
                rotBadge.textContent = `${clip.rotation % 360}°`;
                clipBox.appendChild(rotBadge);
            }

            if (clip.flipH || clip.flipV) {
                const flipBadge = document.createElement('div');
                flipBadge.className = 'clip-flip-badge';
                flipBadge.textContent = (clip.flipH ? '⇄' : '') + (clip.flipV ? '⇅' : '');
                clipBox.appendChild(flipBadge);
            }

            if (clip.zoom && clip.zoom > 1.01) {
                const zoomBadge = document.createElement('div');
                zoomBadge.className = 'clip-zoom-badge';
                zoomBadge.textContent = `${Math.round(clip.zoom * 100)}%`;
                clipBox.appendChild(zoomBadge);
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

            // Drag handle for reordering (when multiple clips exist)
            if (state.clips.length > 1) {
                const dragHandle = document.createElement('div');
                dragHandle.className = 'clip-drag-handle';
                dragHandle.title = 'Drag to reorder clip in timeline';
                dragHandle.innerHTML = `
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                        <circle cx="8" cy="6" r="1.5"></circle>
                        <circle cx="16" cy="6" r="1.5"></circle>
                        <circle cx="8" cy="12" r="1.5"></circle>
                        <circle cx="16" cy="12" r="1.5"></circle>
                        <circle cx="8" cy="18" r="1.5"></circle>
                        <circle cx="16" cy="18" r="1.5"></circle>
                    </svg>
                    <span>Move</span>
                `;
                attachPointerReorderHandler(dragHandle, clipBox, index);
                clipBox.appendChild(dragHandle);

                // HTML5 Drag & Drop on desktop
                clipBox.draggable = true;

                clipBox.addEventListener('dragstart', (e) => {
                    state.draggedClipIndex = index;
                    try {
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', String(index));
                    } catch (err) {}
                    setTimeout(() => clipBox.classList.add('is-dragging'), 0);
                });

                clipBox.addEventListener('dragend', () => {
                    clipBox.classList.remove('is-dragging');
                    document.querySelectorAll('.clip-box').forEach(b => {
                        b.classList.remove('drop-target-before', 'drop-target-after');
                    });
                    state.draggedClipIndex = null;
                });

                clipBox.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    if (state.draggedClipIndex === null || state.draggedClipIndex === index) return;
                    try { e.dataTransfer.dropEffect = 'move'; } catch (err) {}

                    const rect = clipBox.getBoundingClientRect();
                    const isAfter = (e.clientX - rect.left) > (rect.width / 2);
                    clipBox.classList.toggle('drop-target-after', isAfter);
                    clipBox.classList.toggle('drop-target-before', !isAfter);
                });

                clipBox.addEventListener('dragleave', () => {
                    clipBox.classList.remove('drop-target-before', 'drop-target-after');
                });

                clipBox.addEventListener('drop', (e) => {
                    e.preventDefault();
                    clipBox.classList.remove('drop-target-before', 'drop-target-after');
                    const fromIndex = (state.draggedClipIndex !== null && state.draggedClipIndex !== undefined)
                        ? state.draggedClipIndex
                        : parseInt(e.dataTransfer.getData('text/plain'), 10);

                    if (isNaN(fromIndex) || fromIndex === index) return;

                    const rect = clipBox.getBoundingClientRect();
                    const isAfter = (e.clientX - rect.left) > (rect.width / 2);
                    let targetIndex = isAfter ? index + 1 : index;
                    if (fromIndex < targetIndex) {
                        targetIndex -= 1;
                    }

                    reorderClips(fromIndex, targetIndex);
                });
            }

            clipBox.addEventListener('click', (e) => {
                if (e.target.classList.contains('trim-handle') || e.target.closest('.clip-drag-handle')) return;
                setActiveClip(index);
            });

            clipsStrip.appendChild(clipBox);
        });

        updateTimelinePadding();
    }

    // --- POINTER-BASED CLIP REORDERING (Mobile, Touch & Mouse) ---
    function attachPointerReorderHandler(handle, clipBox, index) {
        handle.addEventListener('pointerdown', (e) => {
            e.stopPropagation();
            pause();

            const fromIndex = index;
            let lastTargetIndex = null;
            let lastInsertSide = null;

            clipBox.classList.add('is-dragging');

            function onPointerMove(moveEvent) {
                const boxes = Array.from(clipsStrip.querySelectorAll('.clip-box'));
                boxes.forEach(b => b.classList.remove('drop-target-before', 'drop-target-after'));

                for (let i = 0; i < boxes.length; i++) {
                    const b = boxes[i];
                    const rect = b.getBoundingClientRect();
                    if (moveEvent.clientX >= rect.left && moveEvent.clientX <= rect.right) {
                        const isAfter = (moveEvent.clientX - rect.left) > (rect.width / 2);
                        b.classList.toggle('drop-target-after', isAfter);
                        b.classList.toggle('drop-target-before', !isAfter);
                        lastTargetIndex = i;
                        lastInsertSide = isAfter ? 'after' : 'before';
                        break;
                    }
                }
            }

            function onPointerUp() {
                clipBox.classList.remove('is-dragging');
                document.querySelectorAll('.clip-box').forEach(b => {
                    b.classList.remove('drop-target-before', 'drop-target-after');
                });
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);

                if (lastTargetIndex !== null && lastTargetIndex !== fromIndex) {
                    let toIndex = lastInsertSide === 'after' ? lastTargetIndex + 1 : lastTargetIndex;
                    if (fromIndex < toIndex) toIndex -= 1;
                    reorderClips(fromIndex, toIndex);
                }
            }

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        });
    }

    // --- REORDER CLIPS ---
    function reorderClips(fromIndex, toIndex) {
        if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= state.clips.length) return;
        toIndex = Math.max(0, Math.min(state.clips.length - 1, toIndex));

        const [movedClip] = state.clips.splice(fromIndex, 1);
        state.clips.splice(toIndex, 0, movedClip);
        state.activeClipIndex = toIndex;

        pushHistory(`Reorder Clip: #${fromIndex + 1} to #${toIndex + 1}`);
        renderTimeline();
        updateTimelinePadding();
        updateUI();

        let accumulated = 0;
        for (let i = 0; i < toIndex; i++) {
            accumulated += getClipEffectiveDuration(state.clips[i]);
        }
        seekToProjectTime(accumulated, true);

        showToast(`✨ Reordered to position #${toIndex + 1}!`, 2000);
    }

    // --- DUPLICATE ACTIVE CLIP ---
    function duplicateActiveClip() {
        if (!state.clips || !state.clips.length || state.activeClipIndex < 0) {
            showToast('Select a clip first to duplicate.', 2000);
            return;
        }

        const currentClip = state.clips[state.activeClipIndex];
        if (!currentClip) return;

        pause();

        const clonedClip = {
            ...JSON.parse(JSON.stringify(currentClip)),
            id: 'clip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6)
        };

        const insertIndex = state.activeClipIndex + 1;
        state.clips.splice(insertIndex, 0, clonedClip);
        state.activeClipIndex = insertIndex;

        pushHistory('Duplicate Clip');
        renderTimeline();
        updateTimelinePadding();
        updateUI();

        let accumulated = 0;
        for (let i = 0; i < insertIndex; i++) {
            accumulated += getClipEffectiveDuration(state.clips[i]);
        }
        seekToProjectTime(accumulated, true);

        showToast('📋 Clip duplicated!', 2200);
    }

    function setActiveClip(index) {
        if (index < 0 || index >= state.clips.length) return;
        const prevIndex = state.activeClipIndex;
        state.activeClipIndex = index;
        applyVideoTransforms();
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
        const clipSrc = clip.videoSrc || state.videoSrc;
        const clipDur = clip.videoDuration || state.videoDuration;

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

            const key = `${clipSrc}_${sourceTime.toFixed(1)}`;
            if (thumbCache.has(key)) {
                img.src = thumbCache.get(key);
            } else {
                extractFrameThumbnail(sourceTime, clipSrc, clipDur).then(dataUrl => {
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
                    const maxDur = clip.videoDuration || state.videoDuration;
                    const newEnd = Math.min(maxDur, Math.max(clip.sourceStart + 0.2, initialEnd + deltaTime));
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
            const clipSrc = activeClip.videoSrc || state.videoSrc;
            const clipDur = activeClip.videoDuration || state.videoDuration;

            let targetSourceTime;
            if (activeClip.reverse) {
                targetSourceTime = activeClip.sourceEnd - timeInClip;
            } else {
                targetSourceTime = activeClip.sourceStart + timeInClip;
            }
            targetSourceTime = Math.max(0, Math.min(clipDur, targetSourceTime));

            if (mainVideo.dataset.currentSrc !== clipSrc) {
                mainVideo.dataset.currentSrc = clipSrc;
                const wasPlaying = state.isPlaying;
                mainVideo.src = clipSrc;
                mainVideo.onloadedmetadata = () => {
                    mainVideo.currentTime = targetSourceTime;
                    if (wasPlaying || state.isPlaying) {
                        mainVideo.play().catch(() => {});
                    }
                };
            } else {
                if (!state.isPlaying || Math.abs(mainVideo.currentTime - targetSourceTime) > 0.15) {
                    mainVideo.currentTime = targetSourceTime;
                }
            }

            mainVideo.playbackRate = activeClip.speed || 1.0;
            mainVideo.volume = state.isMuted ? 0 : (activeClip.volume !== undefined ? activeClip.volume : 1.0);
        }

        if (state.activeClipIndex !== matchedIndex) {
            state.activeClipIndex = matchedIndex;
            Array.from(clipsStrip.children).forEach((box, idx) => {
                box.classList.toggle('active', idx === matchedIndex);
            });
            applyVideoTransforms();
            updateDrawerValues();
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

        applyVideoTransforms();
        updateDrawerValues();
        pushHistory('Delete Clip');
        renderTimeline();
        seekToProjectTime(targetTime, true);
        updateUI();
    }

    // --- ROTATE & FLIP ACTIONS ---
    function rotateActiveClip() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        clip.rotation = ((clip.rotation || 0) + 90) % 360;
        applyVideoTransforms();
        updateDrawerValues();
        renderTimeline();
        pushHistory(`Rotate Clip ${clip.rotation}°`);
    }

    function toggleFlipHorizontal() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        clip.flipH = !clip.flipH;
        applyVideoTransforms();
        updateDrawerValues();
        renderTimeline();
        pushHistory(`Flip Horizontal ${clip.flipH ? 'On' : 'Off'}`);
    }

    function toggleFlipVertical() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        clip.flipV = !clip.flipV;
        applyVideoTransforms();
        updateDrawerValues();
        renderTimeline();
        pushHistory(`Flip Vertical ${clip.flipV ? 'On' : 'Off'}`);
    }

    function resetActiveClipTransform() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        clip.rotation = 0;
        clip.flipH = false;
        clip.flipV = false;
        applyVideoTransforms();
        updateDrawerValues();
        renderTimeline();
        pushHistory('Reset Transform');
    }

    // --- CROP & FIT ACTIONS ---
    function setAspectRatio(ratio) {
        state.aspectRatio = ratio;
        updateVideoFrameSize();
        updateDrawerValues();
        applyVideoTransforms();
        pushHistory(`Aspect Ratio: ${ratio}`);
    }

    function setFitMode(mode) {
        state.fitMode = mode;
        const clip = state.clips[state.activeClipIndex];
        if (clip) {
            clip.fitMode = mode;
        }
        applyVideoTransforms();
        updateDrawerValues();
        pushHistory(`Fit Mode: ${mode}`);
    }

    function setClipZoom(zoomPercent, recordHistory = false) {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        const zoom = Math.max(1.0, Math.min(3.0, zoomPercent / 100));
        clip.zoom = zoom;
        applyVideoTransforms();
        updateDrawerValues();
        renderTimeline();
        if (recordHistory) {
            pushHistory(`Zoom ${Math.round(zoom * 100)}%`);
        }
    }

    // 4-Side Custom Crop Controls
    function setClipCropSide(side, value, recordHistory = false) {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        if (!clip.crop) clip.crop = { top: 0, bottom: 0, left: 0, right: 0 };

        const val = Math.max(0, Math.min(45, parseFloat(value) || 0));
        clip.crop[side] = Math.round(val * 10) / 10;

        // Ensure opposite side doesn't push total removal beyond 90%
        if (side === 'top' && (clip.crop.top + (clip.crop.bottom || 0) > 90)) {
            clip.crop.bottom = 90 - clip.crop.top;
        } else if (side === 'bottom' && (clip.crop.bottom + (clip.crop.top || 0) > 90)) {
            clip.crop.top = 90 - clip.crop.bottom;
        } else if (side === 'left' && (clip.crop.left + (clip.crop.right || 0) > 90)) {
            clip.crop.right = 90 - clip.crop.left;
        } else if (side === 'right' && (clip.crop.right + (clip.crop.left || 0) > 90)) {
            clip.crop.left = 90 - clip.crop.right;
        }

        updateDrawerValues();
        updateCropOverlayUI();
        applyVideoTransforms();
        updateVideoFrameSize();

        if (recordHistory) {
            pushHistory(`Crop ${side.toUpperCase()} ${clip.crop[side]}%`);
        }
    }

    function stepClipCropSide(side, delta) {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        if (!clip.crop) clip.crop = { top: 0, bottom: 0, left: 0, right: 0 };
        const current = clip.crop[side] || 0;
        setClipCropSide(side, current + delta, true);
    }

    // Auto crop 4 sides into an exact 1:1 Square
    function makeCropSquare() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip || !state.videoWidth || !state.videoHeight) return;

        const rot = (clip.rotation || 0) % 360;
        const isSideways = (rot === 90 || rot === 270);
        const vw = isSideways ? (clip.videoHeight || state.videoHeight) : (clip.videoWidth || state.videoWidth);
        const vh = isSideways ? (clip.videoWidth || state.videoWidth) : (clip.videoHeight || state.videoHeight);

        const ar = vw / vh;
        let top = 0, bottom = 0, left = 0, right = 0;

        if (ar > 1.0) {
            // Landscape video: trim Left & Right equally so remaining width == height
            const totalRemoveFraction = 1.0 - (1.0 / ar);
            const sidePercent = (totalRemoveFraction / 2) * 100;
            left = parseFloat(sidePercent.toFixed(1));
            right = parseFloat(sidePercent.toFixed(1));
            top = 0;
            bottom = 0;
        } else if (ar < 1.0) {
            // Portrait video: trim Top & Bottom equally so remaining height == width
            const totalRemoveFraction = 1.0 - ar;
            const sidePercent = (totalRemoveFraction / 2) * 100;
            top = parseFloat(sidePercent.toFixed(1));
            bottom = parseFloat(sidePercent.toFixed(1));
            left = 0;
            right = 0;
        } else {
            top = 0;
            bottom = 0;
            left = 0;
            right = 0;
        }

        clip.crop = { top, bottom, left, right };
        updateDrawerValues();
        updateCropOverlayUI();
        applyVideoTransforms();
        updateVideoFrameSize();
        pushHistory('Crop 4-Sides to Square (1:1)');
        showToast('🔲 4 Sides cropped into perfect 1:1 Square!', 2200);
    }

    function centerCropBox() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip || !clip.crop) return;
        const c = clip.crop;
        const totalH = (c.left || 0) + (c.right || 0);
        const totalV = (c.top || 0) + (c.bottom || 0);

        clip.crop = {
            left: Math.round((totalH / 2) * 10) / 10,
            right: Math.round((totalH / 2) * 10) / 10,
            top: Math.round((totalV / 2) * 10) / 10,
            bottom: Math.round((totalV / 2) * 10) / 10
        };

        updateDrawerValues();
        updateCropOverlayUI();
        applyVideoTransforms();
        updateVideoFrameSize();
        pushHistory('Center Crop Box');
        showToast('🎯 Crop box centered!', 1800);
    }

    function resetClipCrop() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        clip.crop = { top: 0, bottom: 0, left: 0, right: 0 };
        updateDrawerValues();
        updateCropOverlayUI();
        applyVideoTransforms();
        updateVideoFrameSize();
        pushHistory('Reset 4-Side Crop');
        showToast('Reset crop to full screen', 1800);
    }

    function updateCropOverlayUI() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;
        const crop = clip.crop || { top: 0, bottom: 0, left: 0, right: 0 };
        const top = Math.max(0, Math.min(45, crop.top || 0));
        const bottom = Math.max(0, Math.min(45, crop.bottom || 0));
        const left = Math.max(0, Math.min(45, crop.left || 0));
        const right = Math.max(0, Math.min(45, crop.right || 0));

        if (cropMaskTop) cropMaskTop.style.height = `${top}%`;
        if (cropMaskBottom) cropMaskBottom.style.height = `${bottom}%`;
        if (cropMaskLeft) {
            cropMaskLeft.style.top = `${top}%`;
            cropMaskLeft.style.bottom = `${bottom}%`;
            cropMaskLeft.style.width = `${left}%`;
        }
        if (cropMaskRight) {
            cropMaskRight.style.top = `${top}%`;
            cropMaskRight.style.bottom = `${bottom}%`;
            cropMaskRight.style.width = `${right}%`;
        }
        if (cropBox) {
            cropBox.style.top = `${top}%`;
            cropBox.style.bottom = `${bottom}%`;
            cropBox.style.left = `${left}%`;
            cropBox.style.right = `${right}%`;
        }

        // Sliders & Value Badges
        if (cropSliderTop) cropSliderTop.value = top;
        if (cropSliderBottom) cropSliderBottom.value = bottom;
        if (cropSliderLeft) cropSliderLeft.value = left;
        if (cropSliderRight) cropSliderRight.value = right;

        if (cropValTop) cropValTop.textContent = `${top.toFixed(1)}%`;
        if (cropValBottom) cropValBottom.textContent = `${bottom.toFixed(1)}%`;
        if (cropValLeft) cropValLeft.textContent = `${left.toFixed(1)}%`;
        if (cropValRight) cropValRight.textContent = `${right.toFixed(1)}%`;

        // Kept aspect ratio and dimensions
        const rot = (clip.rotation || 0) % 360;
        const isSideways = (rot === 90 || rot === 270);
        const vw = isSideways ? (state.videoHeight || 720) : (state.videoWidth || 1280);
        const vh = isSideways ? (state.videoWidth || 1280) : (state.videoHeight || 720);

        const keptW = Math.round(vw * (1 - (left + right) / 100));
        const keptH = Math.round(vh * (1 - (top + bottom) / 100));
        const keptRatio = keptH > 0 ? (keptW / keptH) : 1.0;
        const isSquare = Math.abs(keptRatio - 1.0) < 0.02;

        if (cropInfoTag) {
            if (isSquare) {
                cropInfoTag.textContent = `Square 1:1 (${keptW}×${keptH})`;
            } else {
                cropInfoTag.textContent = `${keptW}×${keptH} (${keptRatio.toFixed(2)}:1)`;
            }
        }

        if (btnCropSquare) {
            btnCropSquare.classList.toggle('active', isSquare);
        }

        if (cropStatusText) {
            cropStatusText.textContent = `Removed: Left ${left.toFixed(1)}% • Right ${right.toFixed(1)}% • Up ${top.toFixed(1)}% • Down ${bottom.toFixed(1)}% | Kept: ${keptW}×${keptH}px ${isSquare ? '• Perfect 1:1 Square' : ''}`;
        }
    }

    function setupHandleDrag(element, handleType) {
        if (!element) return;
        element.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const clip = state.clips[state.activeClipIndex];
            if (!clip) return;
            if (!clip.crop) clip.crop = { top: 0, bottom: 0, left: 0, right: 0 };

            const startX = e.clientX;
            const startY = e.clientY;
            const startCrop = {
                top: clip.crop.top || 0,
                bottom: clip.crop.bottom || 0,
                left: clip.crop.left || 0,
                right: clip.crop.right || 0
            };

            const rect = videoFrameBox.getBoundingClientRect();
            const frameW = rect.width || 1;
            const frameH = rect.height || 1;

            let hasMoved = false;

            function onPointerMove(me) {
                hasMoved = true;
                const dx = me.clientX - startX;
                const dy = me.clientY - startY;
                const dpX = (dx / frameW) * 100;
                const dpY = (dy / frameH) * 100;

                let newTop = startCrop.top;
                let newBottom = startCrop.bottom;
                let newLeft = startCrop.left;
                let newRight = startCrop.right;

                if (handleType === 'top' || handleType === 'tl' || handleType === 'tr') {
                    newTop = Math.max(0, Math.min(45, Math.min(90 - newBottom, startCrop.top + dpY)));
                }
                if (handleType === 'bottom' || handleType === 'bl' || handleType === 'br') {
                    newBottom = Math.max(0, Math.min(45, Math.min(90 - newTop, startCrop.bottom - dpY)));
                }
                if (handleType === 'left' || handleType === 'tl' || handleType === 'bl') {
                    newLeft = Math.max(0, Math.min(45, Math.min(90 - newRight, startCrop.left + dpX)));
                }
                if (handleType === 'right' || handleType === 'tr' || handleType === 'br') {
                    newRight = Math.max(0, Math.min(45, Math.min(90 - newLeft, startCrop.right - dpX)));
                }
                if (handleType === 'move') {
                    const maxShiftLeft = startCrop.left;
                    const maxShiftRight = startCrop.right;
                    const shiftX = Math.max(-maxShiftLeft, Math.min(maxShiftRight, dpX));

                    const maxShiftTop = startCrop.top;
                    const maxShiftBottom = startCrop.bottom;
                    const shiftY = Math.max(-maxShiftTop, Math.min(maxShiftBottom, dpY));

                    newLeft = startCrop.left + shiftX;
                    newRight = startCrop.right - shiftX;
                    newTop = startCrop.top + shiftY;
                    newBottom = startCrop.bottom - shiftY;
                }

                clip.crop = {
                    top: Math.round(newTop * 10) / 10,
                    bottom: Math.round(newBottom * 10) / 10,
                    left: Math.round(newLeft * 10) / 10,
                    right: Math.round(newRight * 10) / 10
                };

                updateDrawerValues();
                updateCropOverlayUI();
                applyVideoTransforms();
                updateVideoFrameSize();
            }

            function onPointerUp() {
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
                if (hasMoved) {
                    pushHistory('Adjust 4-Side Crop');
                }
            }

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        });
    }

    // --- SUB-PANEL DRAWER (Speed, Volume, Transform, Crop) ---
    function toggleToolDrawer(panelName) {
        const isOpen = toolSubpanel.classList.contains('open');
        const isSpeed = panelName === 'speed';
        const isVol = panelName === 'volume';
        const isTransform = panelName === 'transform';
        const isCrop = panelName === 'crop';

        if (isOpen && (
            (isSpeed && panelSpeed.style.display === 'block') ||
            (isVol && panelVolume.style.display === 'block') ||
            (isTransform && panelTransform.style.display === 'block') ||
            (isCrop && panelCrop.style.display === 'block')
        )) {
            closeToolDrawer();
            return;
        }

        toolSubpanel.classList.add('open');
        panelSpeed.style.display = isSpeed ? 'block' : 'none';
        panelVolume.style.display = isVol ? 'block' : 'none';
        panelTransform.style.display = isTransform ? 'block' : 'none';
        panelCrop.style.display = isCrop ? 'block' : 'none';

        btnToolSpeed.classList.toggle('active', isSpeed);
        btnToolVolume.classList.toggle('active', isVol);
        btnToolTransform.classList.toggle('active', isTransform);
        btnToolCrop.classList.toggle('active', isCrop);

        if (isCrop) {
            pause();
            if (cropOverlayContainer) cropOverlayContainer.style.display = 'block';
            updateCropOverlayUI();
            updateVideoFrameSize();
            applyVideoTransforms();
        } else {
            if (cropOverlayContainer) cropOverlayContainer.style.display = 'none';
            updateVideoFrameSize();
            applyVideoTransforms();
        }

        updateDrawerValues();
    }

    function closeToolDrawer() {
        toolSubpanel.classList.remove('open');
        btnToolSpeed.classList.remove('active');
        btnToolVolume.classList.remove('active');
        btnToolTransform.classList.remove('active');
        btnToolCrop.classList.remove('active');
        if (cropOverlayContainer) cropOverlayContainer.style.display = 'none';
        updateVideoFrameSize();
        applyVideoTransforms();
    }

    function updateDrawerValues() {
        const clip = state.clips[state.activeClipIndex];
        if (!clip) return;

        // Speed
        const speed = clip.speed || 1.0;
        const percent = Math.round(speed * 100);
        if (speedValBadge) speedValBadge.textContent = percent === 100 ? '100% (Normal)' : `${percent}% (${speed.toFixed(2)}x)`;
        if (speedSlider) speedSlider.value = percent;
        document.querySelectorAll('.speed-btn').forEach(btn => {
            const btnSpeed = parseFloat(btn.dataset.speed);
            btn.classList.toggle('active', Math.abs(btnSpeed - speed) < 0.01);
        });

        // Volume
        const volPercent = Math.round((clip.volume !== undefined ? clip.volume : 1.0) * 100);
        if (volumeValBadge) volumeValBadge.textContent = `${volPercent}%`;
        if (volumeSlider) volumeSlider.value = volPercent;

        // Transform (Rotate & Flip)
        const rot = (clip.rotation || 0) % 360;
        const flipH = !!clip.flipH;
        const flipV = !!clip.flipV;
        let transDesc = `${rot}°`;
        if (flipH && flipV) transDesc += ' (Flip HV)';
        else if (flipH) transDesc += ' (Flip H)';
        else if (flipV) transDesc += ' (Flip V)';
        else if (rot === 0) transDesc = '0° (Normal)';
        if (transformValBadge) transformValBadge.textContent = transDesc;

        if (btnFlipH) btnFlipH.classList.toggle('active', flipH);
        if (btnFlipV) btnFlipV.classList.toggle('active', flipV);

        // Crop & Fit
        const curRatio = state.aspectRatio || 'original';
        const curFit = clip.fitMode || state.fitMode || 'contain';
        const curZoom = Math.round((clip.zoom || 1.0) * 100);

        const crop = clip.crop || { top: 0, bottom: 0, left: 0, right: 0 };
        const hasCrop = ((crop.top || 0) > 0 || (crop.bottom || 0) > 0 || (crop.left || 0) > 0 || (crop.right || 0) > 0);
        let cropDesc = `${curRatio.toUpperCase()} • ${curFit === 'cover' ? 'Fill' : 'Fit'}`;
        if (hasCrop) {
            cropDesc += ` • Crop (T:${Math.round(crop.top || 0)}% B:${Math.round(crop.bottom || 0)}% L:${Math.round(crop.left || 0)}% R:${Math.round(crop.right || 0)}%)`;
        } else if (curZoom !== 100) {
            cropDesc += ` • ${curZoom}%`;
        }

        if (cropValBadge) cropValBadge.textContent = cropDesc;
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.ratio === curRatio);
        });
        document.querySelectorAll('.fit-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.fit === curFit);
        });
        if (zoomSlider) zoomSlider.value = curZoom;

        updateCropOverlayUI();
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

    // --- SNAPSHOT / SCREENSHOT ENGINE ---
    let currentSnapshotBlob = null;
    let currentSnapshotDataUrl = null;

    function showToast(message, duration = 2400) {
        if (!appToast) return;
        toastMsg.textContent = message;
        appToast.classList.add('visible');
        clearTimeout(appToast._tid);
        appToast._tid = setTimeout(() => {
            appToast.classList.remove('visible');
        }, duration);
    }

    function triggerShutterFlash() {
        if (!snapshotFlash) return;
        snapshotFlash.classList.add('flash-active');
        requestAnimationFrame(() => {
            setTimeout(() => {
                snapshotFlash.classList.remove('flash-active');
            }, 80);
        });
    }

    function takeSnapshot() {
        if (!state.clips.length || !mainVideo.videoWidth) {
            alert('Please load a video first to take a snapshot.');
            return;
        }

        pause();
        triggerShutterFlash();

        const clip = state.clips[state.activeClipIndex];
        let targetAspect = (mainVideo.videoWidth && mainVideo.videoHeight)
            ? (mainVideo.videoWidth / mainVideo.videoHeight)
            : (16 / 9);

        if (clip && clip.crop && state.aspectRatio === 'original') {
            const c = clip.crop;
            const rot = ((clip.rotation) || 0) % 360;
            const isSideways = (rot === 90 || rot === 270);
            const vw = isSideways ? (mainVideo.videoHeight || 720) : (mainVideo.videoWidth || 1280);
            const vh = isSideways ? (mainVideo.videoWidth || 1280) : (mainVideo.videoHeight || 720);
            const kw = vw * (1 - ((c.left || 0) + (c.right || 0)) / 100);
            const kh = vh * (1 - ((c.top || 0) + (c.bottom || 0)) / 100);
            if (kw > 0 && kh > 0) targetAspect = kw / kh;
        }

        if (state.aspectRatio === '16:9') targetAspect = 16 / 9;
        else if (state.aspectRatio === '9:16') targetAspect = 9 / 16;
        else if (state.aspectRatio === '1:1') targetAspect = 1.0;
        else if (state.aspectRatio === '4:5') targetAspect = 4 / 5;
        else if (state.aspectRatio === '21:9') targetAspect = 21 / 9;

        const baseLong = Math.max(1280, Math.max(mainVideo.videoWidth || 1280, mainVideo.videoHeight || 720));
        let canvasW, canvasH;
        if (targetAspect >= 1) {
            canvasW = baseLong;
            canvasH = Math.round(baseLong / targetAspect);
        } else {
            canvasH = baseLong;
            canvasW = Math.round(baseLong * targetAspect);
        }
        canvasW = canvasW % 2 === 0 ? canvasW : canvasW + 1;
        canvasH = canvasH % 2 === 0 ? canvasH : canvasH + 1;

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');

        drawTransformedFrame(ctx, mainVideo, canvasW, canvasH, clip);

        canvas.toBlob(blob => {
            if (!blob) return;
            currentSnapshotBlob = blob;
            if (currentSnapshotDataUrl) {
                URL.revokeObjectURL(currentSnapshotDataUrl);
            }
            currentSnapshotDataUrl = URL.createObjectURL(blob);

            if (snapshotImgPreview) snapshotImgPreview.src = currentSnapshotDataUrl;
            if (snapshotMetaInfo) {
                snapshotMetaInfo.textContent = `Time: ${formatTime(state.currentTime)} (${state.currentTime.toFixed(2)}s) • ${canvasW}x${canvasH} • PNG`;
            }
            if (snapshotModal) snapshotModal.style.display = 'flex';
            showToast('📸 Snapshot captured!');
        }, 'image/png');
    }

    function closeSnapshotModal() {
        if (snapshotModal) snapshotModal.style.display = 'none';
    }

    function downloadSnapshot() {
        if (!currentSnapshotBlob) return;
        const a = document.createElement('a');
        a.href = currentSnapshotDataUrl;
        const baseName = (state.videoName || 'Light_Video').replace(/\.[^/.]+$/, '');
        const timeStr = formatTime(state.currentTime).replace(':', 'm') + 's';
        a.download = `${baseName}_snapshot_${timeStr}.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            try { document.body.removeChild(a); } catch (e) {}
        }, 150);
        showToast('💾 Snapshot downloaded!');
    }

    async function copySnapshotToClipboard() {
        if (!currentSnapshotBlob) return;
        try {
            if (navigator.clipboard && window.ClipboardItem) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': currentSnapshotBlob })
                ]);
                showToast('📋 Image copied to clipboard!');
            } else {
                showToast('Clipboard copy not supported in this browser');
            }
        } catch (err) {
            console.warn('Clipboard write error:', err);
            showToast('Could not copy to clipboard');
        }
    }

    // --- SAVE & EXPORT MODAL ---
    function openSaveModal(defaultFormat = 'video') {
        pause();
        summaryDuration.textContent = formatTime(getTotalDuration());
        if (summaryClipsCount) {
            summaryClipsCount.textContent = state.clips.length <= 1 
                ? '1 clip' 
                : `${state.clips.length} clips (Merged into 1 video)`;
        }

        setExportFormat(defaultFormat === 'gif' ? 'gif' : 'video');

        modalExportForm.style.display = 'block';
        modalExportProgress.style.display = 'none';
        exportCompleteActions.style.display = 'none';
        document.querySelector('.progress-spinner-box').style.display = 'flex';
        progressBarFill.style.width = '0%';
        progressPercent.textContent = '0%';

        saveModal.style.display = 'flex';
    }

    function setExportFormat(format) {
        state.exportFormat = format;
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });

        const isGif = format === 'gif';
        if (gifOptionsGroup) {
            gifOptionsGroup.style.display = isGif ? 'block' : 'none';
        }

        const baseName = (state.videoName || 'Light_Video_Export').replace(/\.[^/.]+$/, '');
        if (isGif) {
            saveFileNameInput.value = `${baseName}_animation.gif`;
            if (exportHintText) exportHintText.textContent = 'The animated GIF will be rendered frame-by-frame and downloaded directly.';
            const btnSpan = btnConfirmExport.querySelector('span');
            if (btnSpan) btnSpan.textContent = 'Render & Export GIF';
            const btn480 = document.querySelector('.quality-btn[data-res="480p"]');
            if (btn480) btn480.style.display = 'inline-block';
        } else {
            saveFileNameInput.value = `${baseName}_merged.mp4`;
            if (exportHintText) {
                exportHintText.textContent = state.clips.length > 1
                    ? `All ${state.clips.length} clips on your timeline will be merged and downloaded as a single video.`
                    : 'The edited video will be rendered and downloaded directly to your computer.';
            }
            const btnSpan = btnConfirmExport.querySelector('span');
            if (btnSpan) btnSpan.textContent = state.clips.length > 1 ? 'Merge & Export Video' : 'Render & Export';
            const btn480 = document.querySelector('.quality-btn[data-res="480p"]');
            if (btn480) btn480.style.display = 'none';
        }
    }

    function closeSaveModal() {
        saveModal.style.display = 'none';
    }

    // --- IN-BROWSER VIDEO COMPOSITOR & EXPORT ENGINE ---
    function drawTransformedFrame(ctx, vid, canvasW, canvasH, clip) {
        ctx.save();
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvasW, canvasH);

        const vw = vid.videoWidth || canvasW;
        const vh = vid.videoHeight || canvasH;
        const rot = ((clip && clip.rotation) || 0) % 360;
        const isSideways = (rot === 90 || rot === 270);

        const crop = (clip && clip.crop) || { top: 0, bottom: 0, left: 0, right: 0 };
        const cropTop = Math.max(0, Math.min(45, crop.top || 0));
        const cropBottom = Math.max(0, Math.min(45, crop.bottom || 0));
        const cropLeft = Math.max(0, Math.min(45, crop.left || 0));
        const cropRight = Math.max(0, Math.min(45, crop.right || 0));

        const sx = vw * (cropLeft / 100);
        const sy = vh * (cropTop / 100);
        const sw = Math.max(2, vw * (1 - (cropLeft + cropRight) / 100));
        const sh = Math.max(2, vh * (1 - (cropTop + cropBottom) / 100));

        const srcEffW = isSideways ? sh : sw;
        const srcEffH = isSideways ? sw : sh;
        const srcEffAspect = srcEffW / srcEffH;
        const canvasAspect = canvasW / canvasH;

        const fitMode = (clip && clip.fitMode) || state.fitMode || 'contain';

        let drawEffW, drawEffH;
        if (fitMode === 'cover') {
            if (srcEffAspect > canvasAspect) {
                drawEffH = canvasH;
                drawEffW = srcEffW * (canvasH / srcEffH);
            } else {
                drawEffW = canvasW;
                drawEffH = srcEffH * (canvasW / srcEffW);
            }
        } else { // 'contain'
            if (srcEffAspect > canvasAspect) {
                drawEffW = canvasW;
                drawEffH = srcEffH * (canvasW / srcEffW);
            } else {
                drawEffH = canvasH;
                drawEffW = srcEffW * (canvasH / srcEffH);
            }
        }

        const drawVidW = isSideways ? drawEffH : drawEffW;
        const drawVidH = isSideways ? drawEffW : drawEffH;

        const zoom = (clip && clip.zoom) || 1.0;
        const flipH = (clip && clip.flipH) ? -1 : 1;
        const flipV = (clip && clip.flipV) ? -1 : 1;

        ctx.translate(canvasW / 2, canvasH / 2);
        if (rot !== 0) {
            ctx.rotate((rot * Math.PI) / 180);
        }
        ctx.scale(flipH * zoom, flipV * zoom);
        ctx.drawImage(vid, sx, sy, sw, sh, -drawVidW / 2, -drawVidH / 2, drawVidW, drawVidH);

        ctx.restore();
    }

    async function startExport() {
        modalExportForm.style.display = 'none';
        modalExportProgress.style.display = 'block';
        exportCompleteActions.style.display = 'none';
        document.querySelector('.progress-spinner-box').style.display = 'flex';

        const isGif = state.exportFormat === 'gif';
        progressStatusTitle.textContent = isGif ? 'Exporting Animated GIF...' : 'Exporting Video...';
        progressStatusDesc.textContent = isGif ? 'Capturing frames and compressing GIF...' : 'Applying cuts, speed adjustments and rendering frames';
        updateExportProgress(0, isGif ? 'Initializing GIF encoder...' : 'Initializing web media compositor...');

        try {
            const exportPayload = {
                clips: state.clips,
                resolution: state.exportResolution,
                fileName: saveFileNameInput.value || (isGif ? 'Light_Animation.gif' : 'Light_Video_Export.mp4'),
                gifScope: state.gifScope,
                gifFps: state.gifFps
            };

            const result = isGif
                ? await renderAndExportGif(exportPayload, (pct, status) => updateExportProgress(pct, status))
                : await renderAndExportVideo(exportPayload, (pct, status) => updateExportProgress(pct, status));

            onExportFinished(result);
        } catch (err) {
            console.error('Export failed:', err);
            progressStatusTitle.textContent = 'Export Error';
            progressStatusDesc.textContent = err.message || 'Could not export in this browser.';
            document.querySelector('.progress-spinner-box').style.display = 'none';
        }
    }

    async function renderAndExportVideo(payload, onProgress) {
        const { clips, resolution } = payload;
        if (!clips || !clips.length) throw new Error('No clips to export.');

        let targetAspect = (mainVideo.videoWidth && mainVideo.videoHeight) 
            ? (mainVideo.videoWidth / mainVideo.videoHeight) 
            : (16 / 9);

        const firstClip = clips[0];
        if (firstClip && firstClip.crop && state.aspectRatio === 'original') {
            const c = firstClip.crop;
            const rot = ((firstClip.rotation) || 0) % 360;
            const isSideways = (rot === 90 || rot === 270);
            const vw = isSideways ? (firstClip.videoHeight || state.videoHeight || 720) : (firstClip.videoWidth || state.videoWidth || 1280);
            const vh = isSideways ? (firstClip.videoWidth || state.videoWidth || 1280) : (firstClip.videoHeight || state.videoHeight || 720);
            const kw = vw * (1 - ((c.left || 0) + (c.right || 0)) / 100);
            const kh = vh * (1 - ((c.top || 0) + (c.bottom || 0)) / 100);
            if (kw > 0 && kh > 0) targetAspect = kw / kh;
        }

        if (state.aspectRatio === '16:9') targetAspect = 16 / 9;
        else if (state.aspectRatio === '9:16') targetAspect = 9 / 16;
        else if (state.aspectRatio === '1:1') targetAspect = 1.0;
        else if (state.aspectRatio === '4:5') targetAspect = 4 / 5;
        else if (state.aspectRatio === '21:9') targetAspect = 21 / 9;

        let baseLong = 1280;
        if (resolution === '1080p') baseLong = 1920;
        else if (resolution === '720p') baseLong = 1280;
        else {
            baseLong = Math.max(mainVideo.videoWidth || 1280, mainVideo.videoHeight || 720);
        }

        let width, height;
        if (targetAspect >= 1) {
            width = baseLong;
            height = Math.round(baseLong / targetAspect);
        } else {
            height = baseLong;
            width = Math.round(baseLong * targetAspect);
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

        const firstSrc = (clips[0] && clips[0].videoSrc) || state.videoSrc;
        const exportVid = document.createElement('video');
        exportVid.playsInline = true;
        exportVid.preload = 'auto';
        if (firstSrc && !firstSrc.startsWith('blob:') && !firstSrc.startsWith('data:')) {
            try { exportVid.crossOrigin = 'anonymous'; } catch (e) {}
        }
        exportVid.src = firstSrc;
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
        let currentLoadedSrc = firstSrc;

        for (let i = 0; i < clips.length; i++) {
            const clip = clips[i];
            const effDur = Math.max(0.05, (clip.sourceEnd - clip.sourceStart) / (clip.speed || 1.0));
            const clipSrc = clip.videoSrc || state.videoSrc;

            if (currentLoadedSrc !== clipSrc) {
                currentLoadedSrc = clipSrc;
                exportVid.src = clipSrc;
                try { exportVid.load(); } catch (e) {}
                await new Promise(resolve => {
                    let resolved = false;
                    const finish = () => {
                        if (resolved) return;
                        resolved = true;
                        exportVid.removeEventListener('loadedmetadata', finish);
                        exportVid.removeEventListener('canplay', finish);
                        exportVid.removeEventListener('error', finish);
                        if (tid) clearTimeout(tid);
                        resolve();
                    };
                    const tid = setTimeout(finish, 2500);
                    exportVid.addEventListener('loadedmetadata', finish, { once: true });
                    exportVid.addEventListener('canplay', finish, { once: true });
                    exportVid.addEventListener('error', finish, { once: true });
                });
            }

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
                        drawTransformedFrame(ctx, exportVid, width, height, clip);
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
                            drawTransformedFrame(ctx, exportVid, width, height, clip);
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

    async function renderAndExportGif(payload, onProgress) {
        const { clips, resolution, gifScope, gifFps } = payload;
        if (!clips || !clips.length) throw new Error('No clips to export.');

        const targetClips = (gifScope === 'active' && clips[state.activeClipIndex])
            ? [clips[state.activeClipIndex]]
            : clips;

        let totalDur = 0;
        targetClips.forEach(c => {
            const rawDur = Math.max(0.05, c.sourceEnd - c.sourceStart);
            totalDur += rawDur / (c.speed || 1.0);
        });

        const fps = Math.max(5, Math.min(30, gifFps || 15));
        const frameInterval = 1 / fps;
        const delayMs = Math.round(1000 / fps);

        let targetAspect = (mainVideo.videoWidth && mainVideo.videoHeight)
            ? (mainVideo.videoWidth / mainVideo.videoHeight)
            : (16 / 9);

        const targetFirstClip = targetClips[0];
        if (targetFirstClip && targetFirstClip.crop && state.aspectRatio === 'original') {
            const c = targetFirstClip.crop;
            const rot = ((targetFirstClip.rotation) || 0) % 360;
            const isSideways = (rot === 90 || rot === 270);
            const vw = isSideways ? (targetFirstClip.videoHeight || state.videoHeight || 720) : (targetFirstClip.videoWidth || state.videoWidth || 1280);
            const vh = isSideways ? (targetFirstClip.videoWidth || state.videoWidth || 1280) : (targetFirstClip.videoHeight || state.videoHeight || 720);
            const kw = vw * (1 - ((c.left || 0) + (c.right || 0)) / 100);
            const kh = vh * (1 - ((c.top || 0) + (c.bottom || 0)) / 100);
            if (kw > 0 && kh > 0) targetAspect = kw / kh;
        }

        if (state.aspectRatio === '16:9') targetAspect = 16 / 9;
        else if (state.aspectRatio === '9:16') targetAspect = 9 / 16;
        else if (state.aspectRatio === '1:1') targetAspect = 1.0;
        else if (state.aspectRatio === '4:5') targetAspect = 4 / 5;
        else if (state.aspectRatio === '21:9') targetAspect = 21 / 9;

        // Size optimized for GIF
        let baseLong = 480;
        if (resolution === '720p') baseLong = 720;
        else if (resolution === '360p') baseLong = 360;

        let width, height;
        if (targetAspect >= 1) {
            width = baseLong;
            height = Math.round(baseLong / targetAspect);
        } else {
            height = baseLong;
            width = Math.round(baseLong * targetAspect);
        }
        width = width % 2 === 0 ? width : width + 1;
        height = height % 2 === 0 ? height : height + 1;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        const firstSrc = (targetClips[0] && targetClips[0].videoSrc) || state.videoSrc;
        const exportVid = document.createElement('video');
        exportVid.playsInline = true;
        exportVid.preload = 'auto';
        exportVid.muted = true;
        if (firstSrc && !firstSrc.startsWith('blob:') && !firstSrc.startsWith('data:')) {
            try { exportVid.crossOrigin = 'anonymous'; } catch (e) {}
        }
        exportVid.src = firstSrc;
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

        const encoder = new window.GIFEncoder(width, height);
        const totalFrames = Math.max(1, Math.round(totalDur * fps));
        let frameCount = 0;
        let currentLoadedSrc = firstSrc;

        for (let i = 0; i < targetClips.length; i++) {
            const clip = targetClips[i];
            const effDur = Math.max(0.05, (clip.sourceEnd - clip.sourceStart) / (clip.speed || 1.0));
            const clipFrames = Math.max(1, Math.round(effDur * fps));
            const clipSrc = clip.videoSrc || state.videoSrc;

            if (currentLoadedSrc !== clipSrc) {
                currentLoadedSrc = clipSrc;
                exportVid.src = clipSrc;
                try { exportVid.load(); } catch (e) {}
                await new Promise(resolve => {
                    let resolved = false;
                    const finish = () => {
                        if (resolved) return;
                        resolved = true;
                        exportVid.removeEventListener('loadedmetadata', finish);
                        exportVid.removeEventListener('canplay', finish);
                        exportVid.removeEventListener('error', finish);
                        if (tid) clearTimeout(tid);
                        resolve();
                    };
                    const tid = setTimeout(finish, 2500);
                    exportVid.addEventListener('loadedmetadata', finish, { once: true });
                    exportVid.addEventListener('canplay', finish, { once: true });
                    exportVid.addEventListener('error', finish, { once: true });
                });
            }

            for (let f = 0; f < clipFrames; f++) {
                const ratio = f / clipFrames;
                const sourceTime = clip.reverse
                    ? clip.sourceEnd - ratio * (clip.sourceEnd - clip.sourceStart)
                    : clip.sourceStart + ratio * (clip.sourceEnd - clip.sourceStart);

                await safeSeek(exportVid, sourceTime);
                drawTransformedFrame(ctx, exportVid, width, height, clip);

                const imgData = ctx.getImageData(0, 0, width, height);
                encoder.addFrame(imgData.data, delayMs);

                frameCount++;
                const progress = Math.min(99, Math.round((frameCount / totalFrames) * 100));
                if (onProgress) {
                    onProgress(progress, `Encoding GIF frame ${frameCount} of ${totalFrames} (${progress}%)...`);
                }

                // Yield briefly to event loop so browser stays responsive
                await new Promise(r => setTimeout(r, 4));
            }
        }

        exportVid.src = '';
        if (onProgress) onProgress(99, 'Finalizing GIF compression...');
        await new Promise(r => setTimeout(r, 20));

        const gifBlob = encoder.finish();
        if (onProgress) onProgress(100, 'GIF Export complete!');
        return { blob: gifBlob, mimeType: 'image/gif' };
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

        const isGif = mimeType.toLowerCase().includes('gif');
        const isMp4 = mimeType.toLowerCase().includes('mp4');
        let currentName = (saveFileNameInput.value || (isGif ? 'Light_Animation.gif' : 'Light_Video_Export.mp4')).trim();
        if (isGif) {
            if (!currentName.toLowerCase().endsWith('.gif')) {
                currentName = currentName.replace(/\.[^/.]+$/, '') + '.gif';
            }
        } else if (isMp4) {
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
        progressStatusTitle.textContent = isGif ? 'GIF Export Complete!' : 'Export Complete!';
        const formatLabel = isGif ? 'GIF' : (isMp4 ? 'MP4' : 'WebM');
        progressStatusDesc.textContent = `${isGif ? 'Animated GIF' : 'Video'} rendered successfully (${formatLabel}, ${formatBytes(blob.size)}). Ready to download.`;
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

    // --- DUAL SLIDER NAVIGATION BUTTONS ---
    function updateToolbarNavButtons() {
        if (!bottomToolbar || !btnSlideToolbarLeft || !btnSlideToolbarRight) return;
        const scrollLeft = bottomToolbar.scrollLeft;
        const maxScroll = bottomToolbar.scrollWidth - bottomToolbar.clientWidth;
        const hasOverflow = maxScroll > 8;

        if (!hasOverflow) {
            btnSlideToolbarLeft.style.display = 'none';
            btnSlideToolbarRight.style.display = 'none';
        } else {
            btnSlideToolbarLeft.style.display = 'flex';
            btnSlideToolbarRight.style.display = 'flex';
            btnSlideToolbarLeft.disabled = scrollLeft <= 4;
            btnSlideToolbarLeft.classList.toggle('disabled', scrollLeft <= 4);
            btnSlideToolbarRight.disabled = scrollLeft >= maxScroll - 4;
            btnSlideToolbarRight.classList.toggle('disabled', scrollLeft >= maxScroll - 4);
        }
    }

    // --- EVENT BINDINGS ---
    function bindEvents() {
        btnPlayPause.addEventListener('click', togglePlay);
        videoFrameBox.addEventListener('click', () => {
            if (panelCrop && panelCrop.style.display === 'block') return;
            togglePlay();
        });

        if (btnSlideToolbarLeft && bottomToolbar) {
            btnSlideToolbarLeft.addEventListener('click', () => {
                bottomToolbar.scrollBy({ left: -220, behavior: 'smooth' });
            });
        }
        if (btnSlideToolbarRight && bottomToolbar) {
            btnSlideToolbarRight.addEventListener('click', () => {
                bottomToolbar.scrollBy({ left: 220, behavior: 'smooth' });
            });
        }
        if (bottomToolbar) {
            bottomToolbar.addEventListener('scroll', updateToolbarNavButtons);
            window.addEventListener('resize', updateToolbarNavButtons);
            setTimeout(updateToolbarNavButtons, 250);
        }

        btnUndo.addEventListener('click', undo);
        btnRedo.addEventListener('click', redo);

        btnMuteToggle.addEventListener('click', () => {
            state.isMuted = !state.isMuted;
            mainVideo.muted = state.isMuted;
            iconAudioOn.style.display = state.isMuted ? 'none' : 'block';
            iconAudioMuted.style.display = state.isMuted ? 'block' : 'none';
        });

        btnAddMedia.addEventListener('click', () => hiddenFileInput.click());
        if (btnAddClip) {
            btnAddClip.addEventListener('click', () => hiddenAddClipInput.click());
        }
        if (btnToolAddClip) {
            btnToolAddClip.addEventListener('click', () => hiddenAddClipInput.click());
        }
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

        if (hiddenAddClipInput) {
            hiddenAddClipInput.addEventListener('change', (e) => {
                if (e.target.files && e.target.files.length > 0) {
                    addVideoFiles(e.target.files);
                    e.target.value = '';
                }
            });
        }

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
                if (state.clips.length > 0 && state.videoSrc) {
                    addVideoFiles(e.dataTransfer.files);
                } else {
                    loadWebVideoFile(e.dataTransfer.files[0]);
                    if (e.dataTransfer.files.length > 1) {
                        const rest = Array.from(e.dataTransfer.files).slice(1);
                        setTimeout(() => addVideoFiles(rest), 400);
                    }
                }
            }
        });

        btnCut.addEventListener('click', cutAtNeedle);
        if (btnToolDuplicate) btnToolDuplicate.addEventListener('click', duplicateActiveClip);
        btnToolSpeed.addEventListener('click', () => toggleToolDrawer('speed'));
        btnToolVolume.addEventListener('click', () => toggleToolDrawer('volume'));
        btnToolTransform.addEventListener('click', () => toggleToolDrawer('transform'));
        btnToolCrop.addEventListener('click', () => toggleToolDrawer('crop'));
        btnToolReverse.addEventListener('click', toggleClipReverse);
        btnToolDelete.addEventListener('click', deleteActiveClip);

        if (btnRotateRight) btnRotateRight.addEventListener('click', rotateActiveClip);
        if (btnFlipH) btnFlipH.addEventListener('click', toggleFlipHorizontal);
        if (btnFlipV) btnFlipV.addEventListener('click', toggleFlipVertical);
        if (btnResetTransform) btnResetTransform.addEventListener('click', resetActiveClipTransform);

        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setAspectRatio(btn.dataset.ratio);
            });
        });

        document.querySelectorAll('.fit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setFitMode(btn.dataset.fit);
            });
        });

        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => {
                setClipZoom(parseFloat(e.target.value), false);
            });
            zoomSlider.addEventListener('change', (e) => {
                setClipZoom(parseFloat(e.target.value), true);
            });
        }

        if (btnZoomMinus) {
            btnZoomMinus.addEventListener('click', () => {
                const clip = state.clips[state.activeClipIndex];
                if (!clip) return;
                const cur = Math.round((clip.zoom || 1.0) * 100);
                const next = Math.max(100, cur - 10);
                setClipZoom(next, true);
            });
        }

        if (btnZoomPlus) {
            btnZoomPlus.addEventListener('click', () => {
                const clip = state.clips[state.activeClipIndex];
                if (!clip) return;
                const cur = Math.round((clip.zoom || 1.0) * 100);
                const next = Math.min(300, cur + 10);
                setClipZoom(next, true);
            });
        }

        if (btnZoomReset) {
            btnZoomReset.addEventListener('click', () => {
                setClipZoom(100, true);
            });
        }

        // 4-Side Custom Crop Buttons & Sliders
        if (btnCropSquare) btnCropSquare.addEventListener('click', makeCropSquare);
        if (btnCropCenter) btnCropCenter.addEventListener('click', centerCropBox);
        if (btnCropReset) btnCropReset.addEventListener('click', resetClipCrop);

        // Sliders
        if (cropSliderTop) {
            cropSliderTop.addEventListener('input', (e) => setClipCropSide('top', e.target.value, false));
            cropSliderTop.addEventListener('change', (e) => setClipCropSide('top', e.target.value, true));
        }
        if (cropSliderBottom) {
            cropSliderBottom.addEventListener('input', (e) => setClipCropSide('bottom', e.target.value, false));
            cropSliderBottom.addEventListener('change', (e) => setClipCropSide('bottom', e.target.value, true));
        }
        if (cropSliderLeft) {
            cropSliderLeft.addEventListener('input', (e) => setClipCropSide('left', e.target.value, false));
            cropSliderLeft.addEventListener('change', (e) => setClipCropSide('left', e.target.value, true));
        }
        if (cropSliderRight) {
            cropSliderRight.addEventListener('input', (e) => setClipCropSide('right', e.target.value, false));
            cropSliderRight.addEventListener('change', (e) => setClipCropSide('right', e.target.value, true));
        }

        // +/- Step Buttons
        if (btnCropTopMinus) btnCropTopMinus.addEventListener('click', () => stepClipCropSide('top', -1));
        if (btnCropTopPlus) btnCropTopPlus.addEventListener('click', () => stepClipCropSide('top', 1));
        if (btnCropBottomMinus) btnCropBottomMinus.addEventListener('click', () => stepClipCropSide('bottom', -1));
        if (btnCropBottomPlus) btnCropBottomPlus.addEventListener('click', () => stepClipCropSide('bottom', 1));
        if (btnCropLeftMinus) btnCropLeftMinus.addEventListener('click', () => stepClipCropSide('left', -1));
        if (btnCropLeftPlus) btnCropLeftPlus.addEventListener('click', () => stepClipCropSide('left', 1));
        if (btnCropRightMinus) btnCropRightMinus.addEventListener('click', () => stepClipCropSide('right', -1));
        if (btnCropRightPlus) btnCropRightPlus.addEventListener('click', () => stepClipCropSide('right', 1));

        // On-screen crop box & handles dragging
        if (cropOverlayContainer) {
            cropOverlayContainer.addEventListener('click', (e) => e.stopPropagation());
        }

        const handleTop = document.getElementById('handleTop');
        const handleBottom = document.getElementById('handleBottom');
        const handleLeft = document.getElementById('handleLeft');
        const handleRight = document.getElementById('handleRight');
        const handleTL = document.getElementById('handleTL');
        const handleTR = document.getElementById('handleTR');
        const handleBL = document.getElementById('handleBL');
        const handleBR = document.getElementById('handleBR');

        setupHandleDrag(handleTop, 'top');
        setupHandleDrag(handleBottom, 'bottom');
        setupHandleDrag(handleLeft, 'left');
        setupHandleDrag(handleRight, 'right');
        setupHandleDrag(handleTL, 'tl');
        setupHandleDrag(handleTR, 'tr');
        setupHandleDrag(handleBL, 'bl');
        setupHandleDrag(handleBR, 'br');
        setupHandleDrag(cropBox, 'move');

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

        btnTopSave.addEventListener('click', () => openSaveModal('video'));
        btnCloseSaveModal.addEventListener('click', closeSaveModal);
        btnCancelSave.addEventListener('click', closeSaveModal);
        btnConfirmExport.addEventListener('click', startExport);
        btnDoneExport.addEventListener('click', closeSaveModal);
        btnDownloadExported.addEventListener('click', triggerBrowserDownload);

        if (btnSnapshot) btnSnapshot.addEventListener('click', takeSnapshot);
        if (btnToolSnapshot) btnToolSnapshot.addEventListener('click', takeSnapshot);
        if (btnToolGif) btnToolGif.addEventListener('click', () => openSaveModal('gif'));

        if (btnCloseSnapshotModal) btnCloseSnapshotModal.addEventListener('click', closeSnapshotModal);
        if (btnDownloadSnapshot) btnDownloadSnapshot.addEventListener('click', downloadSnapshot);
        if (btnCopySnapshot) btnCopySnapshot.addEventListener('click', copySnapshotToClipboard);

        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                setExportFormat(btn.dataset.format);
            });
        });

        document.querySelectorAll('.gif-scope-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.gif-scope-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.gifScope = btn.dataset.scope;
            });
        });

        document.querySelectorAll('.gif-fps-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.gif-fps-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                state.gifFps = parseInt(btn.dataset.fps, 10) || 15;
            });
        });

        btnPlayExportedVideo.addEventListener('click', () => {
            if (exportedBlobUrl) {
                const isGif = state.exportFormat === 'gif';
                if (isGif) {
                    previewExportedVideo.style.display = 'none';
                    if (previewExportedGif) {
                        previewExportedGif.src = exportedBlobUrl;
                        previewExportedGif.style.display = 'inline-block';
                    }
                } else {
                    if (previewExportedGif) previewExportedGif.style.display = 'none';
                    previewExportedVideo.src = exportedBlobUrl;
                    previewExportedVideo.style.display = 'inline-block';
                    previewExportedVideo.play();
                }
                previewModal.style.display = 'flex';
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
        } else if (e.code === 'KeyD' && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            duplicateActiveClip();
        } else if (e.code === 'KeyP' && !e.ctrlKey) {
            e.preventDefault();
            takeSnapshot();
        } else if (e.code === 'KeyR' && !e.ctrlKey) {
            e.preventDefault();
            rotateActiveClip();
        } else if (e.code === 'KeyH' && !e.ctrlKey) {
            e.preventDefault();
            toggleFlipHorizontal();
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
        } else if (e.ctrlKey && e.shiftKey && e.code === 'KeyO') {
            e.preventDefault();
            if (hiddenAddClipInput) hiddenAddClipInput.click();
        } else if (e.ctrlKey && e.code === 'KeyO') {
            e.preventDefault();
            hiddenFileInput.click();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            pause();
            if (e.altKey) {
                if (state.activeClipIndex > 0) {
                    reorderClips(state.activeClipIndex, state.activeClipIndex - 1);
                }
            } else {
                seekToProjectTime(state.currentTime - 0.1, true);
            }
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            pause();
            if (e.altKey) {
                if (state.activeClipIndex < state.clips.length - 1) {
                    reorderClips(state.activeClipIndex, state.activeClipIndex + 1);
                }
            } else {
                seekToProjectTime(state.currentTime + 0.1, true);
            }
        }
    }

    function updateUI() {
        currentTimeEl.textContent = formatTime(state.currentTime);
        totalDurationEl.textContent = formatTime(getTotalDuration());
        updateUndoRedoButtons();
    }

    window.addEventListener('DOMContentLoaded', init);
})();
