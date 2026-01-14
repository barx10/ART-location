/* ============================================
   Export - Image Export and Share Functions
   ============================================ */
console.log('=== EXPORT.JS VERSION 2 LOADED ===');

// No external API dependencies


function setExportScale(scale) {
    state.exportScale = scale;

    // Update button states
    document.querySelectorAll('.quality-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.scale) === scale) {
            btn.classList.add('active');
        }
    });
}

async function exportPoster(format) {
    // Always use client-side rendering (exportSimple)
    // Carto-Art API has rendering issues, so we use MapLibre canvas directly
    await exportSimple();
}

// Helper function to load image from data URL
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Shared function to generate poster canvas (used by exportSimple and copyToClipboard)
async function generatePosterCanvas() {
    // Get poster dimensions
    // Get poster dimensions
    const poster = document.getElementById('posterFrame');
    const posterRect = poster.getBoundingClientRect();
    const aspectRatio = posterRect.width / posterRect.height;

    // Determine Target Resolution (Independent of Screen Size)
    let posterHeight, posterWidth;

    if (state.exportScale >= 6) {
        // Print Quality (Aiming for ~50x70cm @ 200dpi or A3 @ 300dpi)
        // Capped at 5500px to be safe with WebGL texture limits on most devices
        posterHeight = 5500;
        posterWidth = Math.round(posterHeight * aspectRatio);
    } else if (state.exportScale >= 4) {
        // High Quality (Aiming for ~A3 @ 200dpi)
        posterHeight = 3500;
        posterWidth = Math.round(posterHeight * aspectRatio);
    } else {
        // Standard (Screen multiplier)
        posterHeight = Math.round(posterRect.height * state.exportScale);
        posterWidth = Math.round(posterRect.width * state.exportScale);
    }

    // Calculate scale factor for text/UI elements
    // This ensures text remains proportional regardless of export resolution
    const scale = posterHeight / posterRect.height;

    // Map dimensions (accounting for margin)
    const marginPercent = state.margin / 100;
    const mapAreaWidth = Math.round(posterWidth * (1 - marginPercent * 2));
    const mapAreaHeight = Math.round(posterHeight * (1 - marginPercent * 2));

    // --- High-Resolution Render Pipeline ---
    console.log('Starting High-Res Render:', mapAreaWidth, 'x', mapAreaHeight);

    // 1. Resize map container to full target resolution
    window.resizeMapForExport(mapAreaWidth, mapAreaHeight);

    // 2. Wait for MapLibre to render fresh tiles at this new size
    await window.waitForMapIdle();

    // 3. Capture high-res canvas
    const mapCanvas = map.getCanvas();
    const mapDataUrl = mapCanvas.toDataURL('image/png');
    const mapImg = await loadImage(mapDataUrl);

    // 4. Restore map container availability
    window.restoreMapAfterExport();

    // Create final canvas
    const canvas = document.createElement('canvas');
    canvas.width = posterWidth;
    canvas.height = posterHeight;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, posterWidth, posterHeight);

    // Calculate map position
    const mapX = Math.round(posterWidth * marginPercent);
    const mapY = Math.round(posterHeight * marginPercent);

    // Draw map with filters
    // We apply CSS filters manually because toDataURL ignores them
    const saturation = state.mapSaturation || 100;
    const contrast = state.mapContrast || 100;
    const brightness = state.mapBrightness || 100;

    ctx.save();
    ctx.filter = `saturate(${saturation}%) contrast(${contrast}%) brightness(${brightness}%)`;
    ctx.drawImage(mapImg, 0, 0, mapImg.width, mapImg.height, mapX, mapY, mapAreaWidth, mapAreaHeight);
    ctx.restore();

    // Draw vignette effect if enabled
    if (state.labelShadow > 0) {
        const vignetteOpacity = state.labelShadow / 10;
        const vignetteGradient = ctx.createRadialGradient(
            mapX + mapAreaWidth / 2, mapY + mapAreaHeight / 2, 0,
            mapX + mapAreaWidth / 2, mapY + mapAreaHeight / 2, Math.max(mapAreaWidth, mapAreaHeight) * 0.7
        );
        vignetteGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        vignetteGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0)');
        vignetteGradient.addColorStop(0.7, `rgba(255, 255, 255, ${vignetteOpacity * 0.3})`);
        vignetteGradient.addColorStop(0.9, `rgba(255, 255, 255, ${vignetteOpacity * 0.6})`);
        vignetteGradient.addColorStop(1, `rgba(255, 255, 255, ${vignetteOpacity * 0.8})`);
        ctx.fillStyle = vignetteGradient;
        ctx.fillRect(mapX, mapY, mapAreaWidth, mapAreaHeight);
    }

    // Draw Location Marker
    if (state.showMarker) {
        const cx = mapX + mapAreaWidth / 2;
        const cy = mapY + mapAreaHeight / 2;
        // Marker size is typically 30-60px on screen. We scale it by 'scale' (export scale factor).
        const size = (state.markerSize || 40) * scale;
        const color = state.markerColor || '#e63946';
        const style = state.markerStyle || 'pin';

        ctx.save();
        ctx.translate(cx, cy);

        // Scale coordinate system so 24 units = size (SVG viewbox is 24x24)
        const s = size / 24;
        ctx.scale(s, s);
        ctx.translate(-12, -12); // Move 0,0 to top-left of the 24x24 box

        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        if (style === 'pin') {
            // Adjust visual center from middle (y=12) to tip (y=21.5)
            // User requested further adjustment UP to -14.0
            ctx.translate(0, -14.0);
            const p = new Path2D("M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z");
            ctx.fill(p);
        } else if (style === 'target') {
            ctx.lineWidth = 2;
            // Outer circle
            ctx.beginPath(); ctx.arc(12, 12, 10, 0, Math.PI * 2); ctx.stroke();
            // Middle circle
            ctx.beginPath(); ctx.arc(12, 12, 6, 0, Math.PI * 2); ctx.stroke();
            // Inner dot
            ctx.beginPath(); ctx.arc(12, 12, 2, 0, Math.PI * 2); ctx.fill();
        } else if (style === 'dot') {
            ctx.beginPath(); ctx.arc(12, 12, 8, 0, Math.PI * 2); ctx.fill();
        } else if (style === 'ring') {
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.arc(12, 12, 8, 0, Math.PI * 2); ctx.stroke();
        } else if (style === 'heart') {
            const p = new Path2D("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z");
            ctx.fill(p);
        } else if (style === 'home') {
            const p = new Path2D("M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z");
            ctx.fill(p);
        }

        ctx.restore();
    }
    const textScale = state.textSize / 100;
    const titleSize = 38 * scale * textScale;
    const subtitleSize = 13 * scale * textScale;
    const coordsSize = 10 * scale * textScale;
    const dateSize = 12 * scale * textScale;
    const lineHeight = 1.5 * scale;
    const lineWidth = 36 * scale * textScale;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Calculate text position
    let textX = mapX + (mapAreaWidth * state.textX / 100);
    let textY = mapY + (mapAreaHeight * state.textY / 100);

    const totalTextHeight = titleSize + subtitleSize * 1.2 + coordsSize * 1.5 + dateSize * 1.5;
    const maxTextY = mapY + mapAreaHeight - totalTextHeight - 10 * scale;

    // Theme adjustments
    if (state.textTheme === 'panel' || state.textTheme === 'double') {
        const themeTopY = mapY + mapAreaHeight * (1 - state.themeSize / 100);
        const themeHeight = mapAreaHeight * (state.themeSize / 100);
        textY = themeTopY + themeHeight * 0.35;
    } else if (state.textTheme === 'gradient') {
        const themeTopY = mapY + mapAreaHeight * (1 - state.themeSize / 100);
        const themeHeight = mapAreaHeight * (state.themeSize / 100);
        textY = themeTopY + themeHeight * 0.5;
    }
    textY = Math.min(textY, maxTextY);

    // Theme colors
    // Use user selected gradient color (for theme background/gradient)
    const themeColor = state.gradientColor || state.style.colors?.background || '#ffffff';
    // Use user selected text color (for text and borders)
    const themeBorderColor = state.textColor || state.style.colors?.text || '#2C2C2C';

    const hexToRgba = (hex, alpha) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    };

    // Draw theme backgrounds
    if (state.textTheme === 'gradient') {
        const gradientStartY = mapY + mapAreaHeight * (1 - state.themeSize / 100);
        const gradientEndY = mapY + mapAreaHeight;
        const gradient = ctx.createLinearGradient(0, gradientStartY, 0, gradientEndY);
        gradient.addColorStop(0, hexToRgba(themeColor, 0));
        gradient.addColorStop(1, hexToRgba(themeColor, 1));
        ctx.fillStyle = gradient;
        ctx.fillRect(mapX, gradientStartY, mapAreaWidth, gradientEndY - gradientStartY);
    } else if (state.textTheme === 'panel') {
        ctx.fillStyle = themeColor;
        ctx.fillRect(mapX, mapY + mapAreaHeight * (1 - state.themeSize / 100), mapAreaWidth, mapAreaHeight * (state.themeSize / 100));
        ctx.strokeStyle = themeBorderColor;
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(mapX, mapY + mapAreaHeight * (1 - state.themeSize / 100), mapAreaWidth, mapAreaHeight * (state.themeSize / 100));
    } else if (state.textTheme === 'double') {
        ctx.fillStyle = themeColor;
        ctx.fillRect(mapX, mapY + mapAreaHeight * (1 - state.themeSize / 100), mapAreaWidth, mapAreaHeight * (state.themeSize / 100));
        ctx.strokeStyle = themeBorderColor;
        ctx.lineWidth = 3 * scale;
        ctx.strokeRect(mapX, mapY + mapAreaHeight * (1 - state.themeSize / 100), mapAreaWidth, mapAreaHeight * (state.themeSize / 100));
        ctx.lineWidth = 1 * scale;
        ctx.beginPath();
        ctx.moveTo(mapX, mapY + mapAreaHeight * (1 - state.themeSize / 100 + 0.03));
        ctx.lineTo(mapX + mapAreaWidth, mapY + mapAreaHeight * (1 - state.themeSize / 100 + 0.03));
        ctx.stroke();
    } else if (state.textTheme === 'box') {
        const boxPaddingX = 48 * scale * textScale;
        const boxPaddingY = 32 * scale * textScale;

        ctx.font = `700 ${titleSize}px ${state.font.family.replace(/'/g, '')}`;
        const titleText = document.getElementById('titleInput').value || state.location.name;
        const titleWidth = ctx.measureText(titleText.toUpperCase()).width;

        let boxHeight = titleSize + subtitleSize * 1.5 + coordsSize * 1.5 + boxPaddingY * 2;
        if (state.showDate && state.dateValue) boxHeight += dateSize * 1.5;

        const boxWidth = Math.max(titleWidth + boxPaddingX * 2, 150 * scale * textScale);

        ctx.fillStyle = themeColor;
        ctx.fillRect(textX - boxWidth / 2, textY - boxPaddingY, boxWidth, boxHeight);
        ctx.strokeStyle = themeBorderColor;
        ctx.lineWidth = 2 * scale;
        ctx.strokeRect(textX - boxWidth / 2, textY - boxPaddingY, boxWidth, boxHeight);
    }

    const textColorForTheme = (state.textTheme !== 'none') ? themeBorderColor : state.textColor;

    // Text shadow
    if (state.textTheme === 'none') {
        const shadowBlur = state.labelShadow * scale;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetY = shadowBlur / 2;
    } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
    }

    // Draw title
    ctx.fillStyle = textColorForTheme;
    ctx.font = `700 ${titleSize}px ${state.font.family.replace(/'/g, '')}`;
    ctx.letterSpacing = `${titleSize * state.letterSpacing}px`;
    const titleText = document.getElementById('titleInput').value || state.location.name;
    ctx.fillText(titleText.toUpperCase(), textX, textY);

    // Draw subtitle with lines
    const subtitleY = textY + titleSize * 0.8;
    ctx.font = `500 ${subtitleSize}px 'DM Sans', sans-serif`;
    ctx.letterSpacing = `${subtitleSize * 0.2}px`;
    const subtitleText = document.getElementById('subtitleInput').value || 'Norge';

    if (state.showLines && subtitleText) {
        const subtitleWidth = ctx.measureText(subtitleText.toUpperCase()).width;
        ctx.beginPath();
        ctx.strokeStyle = textColorForTheme;
        ctx.lineWidth = lineHeight;
        ctx.globalAlpha = 0.5;
        ctx.moveTo(textX - subtitleWidth / 2 - 14 * scale - lineWidth, subtitleY);
        ctx.lineTo(textX - subtitleWidth / 2 - 14 * scale, subtitleY);
        ctx.moveTo(textX + subtitleWidth / 2 + 14 * scale, subtitleY);
        ctx.lineTo(textX + subtitleWidth / 2 + 14 * scale + lineWidth, subtitleY);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    if (subtitleText) {
        ctx.globalAlpha = 0.9;
        ctx.fillText(subtitleText.toUpperCase(), textX, subtitleY);
        ctx.globalAlpha = 1;
    }

    // Draw coordinates
    if (state.showCoords) {
        const coordsY = subtitleY + subtitleSize + 6 * scale;
        ctx.font = `400 ${coordsSize}px 'JetBrains Mono', monospace`;
        ctx.letterSpacing = `${coordsSize * 0.1}px`;
        ctx.globalAlpha = 0.7;
        const lat = state.location.lat.toFixed(2);
        const lng = state.location.lng.toFixed(2);
        const latDir = state.location.lat >= 0 ? 'N' : 'S';
        const lngDir = state.location.lng >= 0 ? 'E' : 'W';
        ctx.fillText(`${Math.abs(lat)}° ${latDir}, ${Math.abs(lng)}° ${lngDir}`, textX, coordsY);
        ctx.globalAlpha = 1;
    }

    // Draw date
    if (state.showDate && state.dateValue) {
        const dateY = subtitleY + subtitleSize + coordsSize + 16 * scale;
        ctx.font = `500 ${dateSize}px 'DM Sans', sans-serif`;
        ctx.letterSpacing = `${dateSize * 0.15}px`;
        ctx.globalAlpha = 0.85;
        ctx.fillText(state.dateValue.toUpperCase(), textX, dateY);
        ctx.globalAlpha = 1;
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Draw frame
    if (state.frameStyle !== 'none') {
        ctx.strokeStyle = state.frameColor;
        const frameInset = mapX * 0.4;
        let frameBorderWidth = 2 * scale;
        if (state.frameStyle === 'thick') frameBorderWidth = 4 * scale;
        if (state.frameStyle === 'double') frameBorderWidth = 3 * scale;

        ctx.lineWidth = frameBorderWidth;
        ctx.strokeRect(frameInset, frameInset, posterWidth - frameInset * 2, posterHeight - frameInset * 2);

        if (state.frameStyle === 'double') {
            ctx.lineWidth = 1 * scale;
            const innerInset = frameInset + 6 * scale;
            ctx.strokeRect(innerInset, innerInset, posterWidth - innerInset * 2, posterHeight - innerInset * 2);
        }
    }

    // Draw stickers
    if (state.stickers.length > 0) {
        for (const sticker of state.stickers) {
            const stickerX = (sticker.x / 100) * posterWidth;
            const stickerY = (sticker.y / 100) * posterHeight;
            const stickerSize = sticker.size * scale;
            ctx.font = `${stickerSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(sticker.emoji, stickerX, stickerY);
        }
    }

    return canvas;
}

async function exportSimple() {
    const loading = document.getElementById('loadingOverlay');
    loading.classList.add('active');
    loading.querySelector('.loading-text').textContent = 'Forbereder eksport...';

    try {
        loading.querySelector('.loading-text').textContent = 'Genererer plakat...';
        const canvas = await generatePosterCanvas();
        const width = canvas.width;
        const height = canvas.height;

        // Download
        const link = document.createElement('a');
        const mimeType = state.exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
        const extension = state.exportFormat === 'jpeg' ? 'jpg' : 'png';
        link.download = `stedskart-${state.location.name.toLowerCase()}-${width}x${height}.${extension}`;
        link.href = canvas.toDataURL(mimeType, 0.95);
        link.click();

        loading.classList.remove('active');
        showNotification(`Eksportert ${width}x${height}px`, 'success');

    } catch (error) {
        console.error('Simple export error:', error);
        loading.classList.remove('active');
        showNotification('Det oppstod en feil ved eksport.', 'error');
    }
}

async function copyToClipboard() {
    const loading = document.getElementById('loadingOverlay');
    loading.classList.add('active');
    loading.querySelector('.loading-text').textContent = 'Forbereder kopi...';

    try {
        const canvas = await generatePosterCanvas();
        const width = canvas.width;
        const height = canvas.height;

        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                loading.classList.remove('active');
                showNotification(`Kopiert ${width}x${height}px til utklippstavle!`, 'success');
            } catch (err) {
                console.error('Clipboard error:', err);
                loading.classList.remove('active');
                showNotification('Kunne ikke kopiere. Prøv å laste ned i stedet.', 'error');
            }
        }, 'image/png', 1.0);

    } catch (error) {
        console.error('Copy error:', error);
        loading.classList.remove('active');
        showNotification('Det oppstod en feil. Prøv igjen.', 'error');
    }
}

async function shareDesign() {
    if (navigator.share) {
        try {
            const poster = document.getElementById('posterFrame');
            const canvas = await html2canvas(poster, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: state.bgColor,
                logging: false
            });

            canvas.toBlob(async (blob) => {
                const file = new File([blob], `stedskart-${state.location.name}.png`, { type: 'image/png' });
                try {
                    await navigator.share({
                        title: `Stedskart: ${state.location.name}`,
                        text: `Sjekk ut denne vakre kartplakaten av ${state.location.name}! Lag din egen pa Stedskart.`,
                        files: [file]
                    });
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        fallbackShare();
                    }
                }
            }, 'image/png');
        } catch (error) {
            fallbackShare();
        }
    } else {
        fallbackShare();
    }
}

function fallbackShare() {
    copyToClipboard();
    showNotification('Bildet er kopiert - lim inn for a dele!', 'success');
}
