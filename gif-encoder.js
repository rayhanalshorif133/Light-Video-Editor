/**
 * Light Video Editor - Pure Client-Side GIF89a Encoder
 * Fast, self-contained, 100% in-browser GIF encoder with Median-Cut Quantization and LZW compression.
 * Zero external dependencies.
 */

(function (global) {
    'use strict';

    function quantizeMedianCut(rgbaBytes, maxColors = 256) {
        const totalPixels = rgbaBytes.length >> 2;
        // Sample pixels if image is large to keep quantization ultra-fast
        const step = totalPixels > 80000 ? Math.ceil(totalPixels / 80000) : 1;
        const pixels = [];

        for (let i = 0; i < rgbaBytes.length; i += 4 * step) {
            pixels.push([rgbaBytes[i], rgbaBytes[i + 1], rgbaBytes[i + 2]]);
        }

        function findBox(pxList) {
            let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
            for (let i = 0; i < pxList.length; i++) {
                const p = pxList[i];
                if (p[0] < minR) minR = p[0]; if (p[0] > maxR) maxR = p[0];
                if (p[1] < minG) minG = p[1]; if (p[1] > maxG) maxG = p[1];
                if (p[2] < minB) minB = p[2]; if (p[2] > maxB) maxB = p[2];
            }
            return {
                pixels: pxList,
                rangeR: maxR - minR,
                rangeG: maxG - minG,
                rangeB: maxB - minB,
                maxDim: Math.max(maxR - minR, maxG - minG, maxB - minB)
            };
        }

        const boxes = [findBox(pixels)];

        while (boxes.length < maxColors) {
            boxes.sort((a, b) => b.maxDim - a.maxDim);
            const boxToSplit = boxes.shift();
            if (!boxToSplit || boxToSplit.pixels.length <= 1 || boxToSplit.maxDim === 0) {
                if (boxToSplit) boxes.push(boxToSplit);
                break;
            }

            let channel = 0;
            if (boxToSplit.rangeG >= boxToSplit.rangeR && boxToSplit.rangeG >= boxToSplit.rangeB) {
                channel = 1;
            } else if (boxToSplit.rangeB >= boxToSplit.rangeR && boxToSplit.rangeB >= boxToSplit.rangeG) {
                channel = 2;
            }

            boxToSplit.pixels.sort((a, b) => a[channel] - b[channel]);
            const median = Math.floor(boxToSplit.pixels.length / 2);
            boxes.push(findBox(boxToSplit.pixels.slice(0, median)));
            boxes.push(findBox(boxToSplit.pixels.slice(median)));
        }

        const palette = [];
        for (let i = 0; i < boxes.length; i++) {
            const b = boxes[i];
            let sumR = 0, sumG = 0, sumB = 0;
            const n = b.pixels.length || 1;
            for (let j = 0; j < b.pixels.length; j++) {
                sumR += b.pixels[j][0];
                sumG += b.pixels[j][1];
                sumB += b.pixels[j][2];
            }
            palette.push([Math.round(sumR / n), Math.round(sumG / n), Math.round(sumB / n)]);
        }

        while (palette.length < 256) {
            palette.push([0, 0, 0]);
        }

        // Map every pixel in rgbaBytes to best matching palette index
        const indexedPixels = new Uint8Array(totalPixels);
        const memo = new Map();

        for (let i = 0, pIdx = 0; i < rgbaBytes.length; i += 4, pIdx++) {
            const r = rgbaBytes[i];
            const g = rgbaBytes[i + 1];
            const b = rgbaBytes[i + 2];
            // 15-bit color hash for super-fast lookups
            const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);

            let idx = memo.get(key);
            if (idx === undefined) {
                let bestDist = Infinity;
                idx = 0;
                for (let j = 0; j < boxes.length; j++) {
                    const pal = palette[j];
                    const dr = r - pal[0];
                    const dg = g - pal[1];
                    const db = b - pal[2];
                    const dist = dr * dr + dg * dg + db * db;
                    if (dist < bestDist) {
                        bestDist = dist;
                        idx = j;
                        if (dist === 0) break;
                    }
                }
                memo.set(key, idx);
            }
            indexedPixels[pIdx] = idx;
        }

        return { palette, indexedPixels };
    }

    function lzwEncode(minCodeSize, indexedPixels) {
        const clearCode = 1 << minCodeSize; // 256
        const eoiCode = clearCode + 1;      // 257

        const outBytes = [];
        let curAccum = 0;
        let curBits = 0;

        function emitBit(bit) {
            curAccum |= (bit << curBits);
            curBits++;
            if (curBits === 8) {
                outBytes.push(curAccum);
                curAccum = 0;
                curBits = 0;
            }
        }

        function emitCode(code, codeSize) {
            for (let i = 0; i < codeSize; i++) {
                emitBit((code >> i) & 1);
            }
        }

        let codeSize = minCodeSize + 1; // 9
        let nextCode = eoiCode + 1;     // 258
        let maxCode = (1 << codeSize) - 1;

        const dict = new Map();

        emitCode(clearCode, codeSize);

        let prefix = indexedPixels[0];

        for (let i = 1; i < indexedPixels.length; i++) {
            const k = indexedPixels[i];
            const key = (prefix << 8) | k;

            if (dict.has(key)) {
                prefix = dict.get(key);
            } else {
                emitCode(prefix, codeSize);

                if (nextCode < 4096) {
                    dict.set(key, nextCode++);
                    if (nextCode > maxCode && codeSize < 12) {
                        codeSize++;
                        maxCode = (1 << codeSize) - 1;
                    }
                } else {
                    emitCode(clearCode, codeSize);
                    dict.clear();
                    codeSize = minCodeSize + 1;
                    nextCode = eoiCode + 1;
                    maxCode = (1 << codeSize) - 1;
                }

                prefix = k;
            }
        }

        emitCode(prefix, codeSize);
        emitCode(eoiCode, codeSize);

        if (curBits > 0) {
            outBytes.push(curAccum);
        }

        // Pack into sub-blocks of at most 255 bytes
        const blocks = [minCodeSize];
        let offset = 0;
        while (offset < outBytes.length) {
            const chunkSize = Math.min(255, outBytes.length - offset);
            blocks.push(chunkSize);
            for (let i = 0; i < chunkSize; i++) {
                blocks.push(outBytes[offset + i]);
            }
            offset += chunkSize;
        }
        blocks.push(0); // Terminator

        return blocks;
    }

    class GIFEncoder {
        constructor(width, height) {
            this.width = width;
            this.height = height;
            this.chunks = [];
            this.writeHeader();
        }

        writeHeader() {
            const header = [
                // Signature: GIF89a
                0x47, 0x49, 0x46, 0x38, 0x39, 0x61,
                // Logical Screen Descriptor
                this.width & 0xFF, (this.width >> 8) & 0xFF,
                this.height & 0xFF, (this.height >> 8) & 0xFF,
                0x70, 0x00, 0x00,
                // Netscape Loop Application Extension (Loop 0 = forever)
                0x21, 0xFF, 0x0B,
                0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30,
                0x03, 0x01, 0x00, 0x00, 0x00
            ];
            this.chunks.push(new Uint8Array(header));
        }

        addFrame(rgbaBytes, delayMs = 100) {
            const { palette, indexedPixels } = quantizeMedianCut(rgbaBytes, 256);
            const frameBytes = [];

            // Graphic Control Extension
            frameBytes.push(0x21, 0xF9, 0x04);
            frameBytes.push(0x04); // Disposal: Do not dispose / restore to bg
            const delay10ms = Math.max(2, Math.round(delayMs / 10));
            frameBytes.push(delay10ms & 0xFF, (delay10ms >> 8) & 0xFF);
            frameBytes.push(0x00); // Transparent color index
            frameBytes.push(0x00); // Block terminator

            // Image Descriptor
            frameBytes.push(0x2C);
            frameBytes.push(0, 0, 0, 0); // left, top
            frameBytes.push(this.width & 0xFF, (this.width >> 8) & 0xFF);
            frameBytes.push(this.height & 0xFF, (this.height >> 8) & 0xFF);
            frameBytes.push(0x87); // Local color table (256 colors)

            // Local Color Table (256 * 3 bytes)
            for (let i = 0; i < 256; i++) {
                const c = palette[i] || [0, 0, 0];
                frameBytes.push(c[0], c[1], c[2]);
            }

            // LZW Image Data
            const lzwBlocks = lzwEncode(8, indexedPixels);
            frameBytes.push(...lzwBlocks);

            this.chunks.push(new Uint8Array(frameBytes));
        }

        finish() {
            this.chunks.push(new Uint8Array([0x3B])); // GIF Trailer
            return new Blob(this.chunks, { type: 'image/gif' });
        }
    }

    global.GIFEncoder = GIFEncoder;

})(typeof window !== 'undefined' ? window : globalThis);
