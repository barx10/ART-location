/* ============================================
   Export - Image Export and Share Functions
   ============================================ */

function saveApiKey(key) {
    GEOAPIFY_API_KEY = key;
    localStorage.setItem('geoapify_api_key', key);
}

function toggleApiKeyVisibility() {
    const input = document.getElementById('apiKeyInput');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function loadApiKey() {
    const savedKey = localStorage.getItem('geoapify_api_key');
    if (savedKey) {
        GEOAPIFY_API_KEY = savedKey;
        const input = document.getElementById('apiKeyInput');
        if (input) input.value = savedKey;
    }
}

async function exportPoster(format) {
    // Check if API key is available
    if (!GEOAPIFY_API_KEY) {
        showNotification('Vennligst legg inn Geoapify API-nokkel for hoykvalitetseksport', 'error');
        document.getElementById('apiKeyInput').focus();
        return;
    }

    const loading = document.getElementById('loadingOverlay');
    loading.classList.add('active');

    const scaleNames = { 2: 'Standard', 4: 'Hoy (4K)', 6: 'Print (6K)' };
    loading.querySelector('.loading-text').textContent = `Forbereder ${scaleNames[state.exportScale]} eksport...`;

    try {
        // Get poster dimensions
        const poster = document.getElementById('posterFrame');
        const posterRect = poster.getBoundingClientRect();
        const scale = state.exportScale;

        // Final poster size
        const posterWidth = Math.round(posterRect.width * scale);
        const posterHeight = Math.round(posterRect.height * scale);

        // Calculate map area dimensions (accounting for margin)
        const marginPercent = state.margin / 100;
        const mapAreaWidth = Math.round(posterWidth * (1 - marginPercent * 2));
        const mapAreaHeight = Math.round(posterHeight * (1 - marginPercent * 2));

        // Get map center and bounds for exact positioning
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bounds = map.getBounds();

        loading.querySelector('.loading-text').textContent = 'Henter hoyopploselig kart fra Geoapify...';

        // Geoapify max is 4096x4096, with scaleFactor=2 we get 8192x8192
        const maxGeoapifySize = 4096;
        const scaleFactor = 2; // Double resolution

        // Calculate request size - Geoapify will multiply by scaleFactor
        // We want the final image to match mapAreaWidth x mapAreaHeight
        const aspectRatio = mapAreaWidth / mapAreaHeight;

        // Request size (before scaleFactor multiplier)
        let requestWidth, requestHeight;

        // Start with target dimensions divided by scaleFactor
        requestWidth = Math.round(mapAreaWidth / scaleFactor);
        requestHeight = Math.round(mapAreaHeight / scaleFactor);

        // Cap to Geoapify limits while maintaining aspect ratio
        if (requestWidth > maxGeoapifySize) {
            requestWidth = maxGeoapifySize;
            requestHeight = Math.round(requestWidth / aspectRatio);
        }
        if (requestHeight > maxGeoapifySize) {
            requestHeight = maxGeoapifySize;
            requestWidth = Math.round(requestHeight * aspectRatio);
        }

        // Get Geoapify style from current map style
        const geoapifyStyle = state.style.geoapifyStyle || 'osm-bright';

        // Use bounds from Leaflet for exact geographic match
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        // Request a slightly taller image to crop out the Geoapify attribution
        const attributionPixels = 20;
        const extraHeight = Math.ceil(attributionPixels / scaleFactor);
        const requestHeightWithExtra = requestHeight + extraHeight;

        console.log('Export bounds:', {
            sw: { lat: sw.lat, lng: sw.lng },
            ne: { lat: ne.lat, lng: ne.lng },
            requestWidth, requestHeight, requestHeightWithExtra
        });

        // Build Geoapify Static Map URL using AREA for exact geographic match
        const geoapifyUrl = `https://maps.geoapify.com/v1/staticmap?` +
            `style=${geoapifyStyle}` +
            `&width=${requestWidth}` +
            `&height=${requestHeightWithExtra}` +
            `&area=rect:${sw.lng},${ne.lat},${ne.lng},${sw.lat}` +
            `&scaleFactor=${scaleFactor}` +
            `&format=png` +
            `&apiKey=${GEOAPIFY_API_KEY}`;

        console.log('Fetching map from:', geoapifyUrl);

        // Fetch the map image
        const response = await fetch(geoapifyUrl);
        if (!response.ok) {
            throw new Error(`Geoapify API feil: ${response.status} ${response.statusText}`);
        }

        const mapBlob = await response.blob();
        const mapImg = await createImageBitmap(mapBlob);

        loading.querySelector('.loading-text').textContent = 'Bygger poster med hoyopploselig kart...';

        // Create final canvas
        const canvas = document.createElement('canvas');
        canvas.width = posterWidth;
        canvas.height = posterHeight;
        const ctx = canvas.getContext('2d');

        // Draw background
        ctx.fillStyle = state.bgColor;
        ctx.fillRect(0, 0, posterWidth, posterHeight);

        // Calculate map position (centered with margin)
        const mapX = Math.round(posterWidth * marginPercent);
        const mapY = Math.round(posterHeight * marginPercent);

        // Draw the map image - crop out the bottom (Geoapify attribution area)
        const srcWidth = mapImg.width;
        const srcHeight = mapImg.height - (attributionPixels * scaleFactor);

        console.log('Drawing map:', {
            imgWidth: mapImg.width,
            imgHeight: mapImg.height,
            srcHeight: srcHeight,
            targetWidth: mapAreaWidth,
            targetHeight: mapAreaHeight
        });

        ctx.drawImage(mapImg, 0, 0, srcWidth, srcHeight, mapX, mapY, mapAreaWidth, mapAreaHeight);

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

        // Draw text overlay
        loading.querySelector('.loading-text').textContent = 'Legger til tekst...';

        // Text styling
        const textScale = state.textSize / 100;
        const titleSize = 38 * scale * textScale;
        const subtitleSize = 13 * scale * textScale;
        const coordsSize = 10 * scale * textScale;
        const dateSize = 12 * scale * textScale;
        const padding = 28 * scale;
        const lineWidth = 36 * scale * textScale;
        const lineHeight = 1.5 * scale;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Calculate text position
        let textX = mapX + (mapAreaWidth * state.textX / 100);
        let textY = mapY + (mapAreaHeight * state.textY / 100);

        // Calculate total text height
        const totalTextHeight = titleSize + subtitleSize * 1.2 + coordsSize * 1.5 + dateSize * 1.5;
        const maxTextY = mapY + mapAreaHeight - totalTextHeight - 10 * scale;

        // Adjust for theme
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
        const themeColor = state.style.bgColor || '#ffffff';
        const themeBorderColor = state.style.textColor || '#2C2C2C';

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
            ctx.beginPath();
            ctx.moveTo(mapX, mapY + mapAreaHeight * (1 - state.themeSize / 100));
            ctx.lineTo(mapX + mapAreaWidth, mapY + mapAreaHeight * (1 - state.themeSize / 100));
            ctx.stroke();
        } else if (state.textTheme === 'double') {
            ctx.fillStyle = themeColor;
            ctx.fillRect(mapX, mapY + mapAreaHeight * (1 - state.themeSize / 100), mapAreaWidth, mapAreaHeight * (state.themeSize / 100));
            ctx.strokeStyle = themeBorderColor;
            ctx.lineWidth = 3 * scale;
            ctx.beginPath();
            ctx.moveTo(mapX, mapY + mapAreaHeight * (1 - state.themeSize / 100));
            ctx.lineTo(mapX + mapAreaWidth, mapY + mapAreaHeight * (1 - state.themeSize / 100));
            ctx.stroke();
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
            if (state.showDate && state.dateValue) {
                boxHeight += dateSize * 1.5;
            }

            const boxWidth = Math.max(titleWidth + boxPaddingX * 2, 150 * scale * textScale);

            ctx.fillStyle = themeColor;
            ctx.fillRect(textX - boxWidth/2, textY - boxPaddingY, boxWidth, boxHeight);
            ctx.strokeStyle = themeBorderColor;
            ctx.lineWidth = 2 * scale;
            ctx.strokeRect(textX - boxWidth/2, textY - boxPaddingY, boxWidth, boxHeight);
        }

        // Text color
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
        ctx.letterSpacing = `${titleSize * 0.08}px`;

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

        ctx.fillStyle = textColorForTheme;
        ctx.globalAlpha = 0.9;
        if (subtitleText) {
            ctx.fillText(subtitleText.toUpperCase(), textX, subtitleY);
        }
        ctx.globalAlpha = 1;

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
        ctx.shadowOffsetY = 0;

        // Draw frame
        if (state.frameStyle !== 'none') {
            ctx.strokeStyle = state.frameColor;

            const marginSize = mapX;
            const frameInset = marginSize * 0.4;

            let frameBorderWidth = 2 * scale;
            if (state.frameStyle === 'thick') {
                frameBorderWidth = 4 * scale;
            } else if (state.frameStyle === 'double') {
                frameBorderWidth = 3 * scale;
            } else if (state.frameStyle === 'vintage' || state.frameStyle === 'ornate') {
                frameBorderWidth = 3 * scale;
            }

            ctx.lineWidth = frameBorderWidth;

            ctx.strokeRect(
                frameInset,
                frameInset,
                posterWidth - frameInset * 2,
                posterHeight - frameInset * 2
            );

            if (state.frameStyle === 'double') {
                ctx.lineWidth = 1 * scale;
                const innerInset = frameInset + 6 * scale;
                ctx.strokeRect(
                    innerInset,
                    innerInset,
                    posterWidth - innerInset * 2,
                    posterHeight - innerInset * 2
                );
            }

            if (state.frameStyle === 'vintage' || state.frameStyle === 'ornate') {
                ctx.lineWidth = 1 * scale;
                const innerInset = frameInset + 8 * scale;
                ctx.strokeRect(
                    innerInset,
                    innerInset,
                    posterWidth - innerInset * 2,
                    posterHeight - innerInset * 2
                );
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

        loading.querySelector('.loading-text').textContent = 'Genererer fil...';

        // Download
        const link = document.createElement('a');
        link.download = `stedskart-${state.location.name.toLowerCase()}-${posterWidth}x${posterHeight}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

        loading.classList.remove('active');
        showNotification(`Eksportert ${posterWidth}x${posterHeight}px i print-kvalitet!`, 'success');

    } catch (error) {
        console.error('Export error:', error);
        loading.classList.remove('active');

        if (error.message.includes('API')) {
            showNotification('API-feil: Sjekk at API-nokkelen er korrekt', 'error');
        } else {
            showNotification('Det oppstod en feil ved eksport. Prov igjen.', 'error');
        }
    }
}

async function exportSimple() {
    const loading = document.getElementById('loadingOverlay');
    loading.classList.add('active');
    loading.querySelector('.loading-text').textContent = 'Forbereder rask eksport...';

    try {
        const poster = document.getElementById('posterFrame');
        const originalTransform = poster.style.transform;
        poster.style.transform = 'none';

        map.invalidateSize();
        await new Promise(resolve => setTimeout(resolve, 2000));

        loading.querySelector('.loading-text').textContent = 'Genererer bilde...';

        loading.classList.remove('active');
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(poster, {
            scale: state.exportScale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: state.bgColor,
            logging: false,
            imageTimeout: 30000
        });

        poster.style.transform = originalTransform;

        const width = canvas.width;
        const height = canvas.height;

        const link = document.createElement('a');
        link.download = `stedskart-${state.location.name.toLowerCase()}-${width}x${height}.png`;
        link.href = canvas.toDataURL('image/png', 1.0);
        link.click();

        showNotification(`Eksportert ${width}x${height}px (bruk API for hoyere kvalitet)`, 'success');

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
        const poster = document.getElementById('posterFrame');
        const originalTransform = poster.style.transform;
        poster.style.transform = 'none';

        map.invalidateSize();
        await new Promise(resolve => setTimeout(resolve, 1500));

        loading.classList.remove('active');
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(poster, {
            scale: state.exportScale,
            useCORS: true,
            allowTaint: true,
            backgroundColor: state.bgColor,
            logging: false,
            imageTimeout: 30000
        });

        poster.style.transform = originalTransform;

        const width = canvas.width;
        const height = canvas.height;

        canvas.toBlob(async (blob) => {
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                showNotification(`Kopiert ${width}x${height}px til utklippstavle!`, 'success');
            } catch (err) {
                console.error('Clipboard error:', err);
                showNotification('Kunne ikke kopiere. Prov a laste ned i stedet.', 'error');
            }
        }, 'image/png', 1.0);

    } catch (error) {
        console.error('Copy error:', error);
        showNotification('Det oppstod en feil. Prov igjen.', 'error');
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
