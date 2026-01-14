/* ============================================
   Export - Image Export and Share Functions
   ============================================ */
console.log('=== EXPORT.JS VERSION 2 LOADED ===');

// CORS Proxy URL - Set this to your Cloudflare Worker URL
// Example: 'https://cartoart-proxy.your-subdomain.workers.dev'
// Leave empty to call Carto-Art API directly (only works if they allow your domain)
const CARTOART_PROXY_URL = 'https://silent-limit-b175.barx1072.workers.dev/';

// Get the API endpoint (proxy or direct)
function getCartoArtEndpoint() {
    if (CARTOART_PROXY_URL) {
        return CARTOART_PROXY_URL;
    }
    // Try calling API directly (official SDK approach)
    return 'https://cartoart.net/api/v1/posters/generate';
}

function saveApiKey(key) {
    CART_ART_API_KEY = key;
    localStorage.setItem('carto_art_api_key', key);
}

function toggleApiKeyVisibility() {
    const input = document.getElementById('apiKeyInput');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function loadApiKey() {
    const savedKey = localStorage.getItem('carto_art_api_key');
    if (savedKey) {
        CART_ART_API_KEY = savedKey;
        const input = document.getElementById('apiKeyInput');
        if (input) input.value = savedKey;
    }
}

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
    // If no API key and requesting high/print quality, show error
    if (!CART_ART_API_KEY && state.exportScale > 2) {
        showNotification('Høy og Print kvalitet krever Carto-Art API-nøkkel. Bruk Standard kvalitet eller "Rask eksport" uten API.', 'error');
        document.getElementById('apiKeyInput').focus();
        return;
    }

    // If scale is 2 (Standard) and no API key, use html2canvas method
    if (state.exportScale === 2 && !CART_ART_API_KEY) {
        await exportSimple();
        return;
    }

    const loading = document.getElementById('loadingOverlay');
    loading.classList.add('active');

    const scaleNames = { 2: 'Standard', 4: 'Høy (4K)', 6: 'Print (6K)' };
    loading.querySelector('.loading-text').textContent = `Forbereder ${scaleNames[state.exportScale] || 'eksport'}...`;

    try {
        // Get poster dimensions
        const poster = document.getElementById('posterFrame');
        const posterRect = poster.getBoundingClientRect();
        const scale = state.exportScale;

        // Final poster size
        const posterWidth = Math.round(posterRect.width * scale);
        const posterHeight = Math.round(posterRect.height * scale);

        // Map dimensions (accounting for margin)
        const marginPercent = state.margin / 100;
        const mapAreaWidth = Math.round(posterWidth * (1 - marginPercent * 2));
        const mapAreaHeight = Math.round(posterHeight * (1 - marginPercent * 2));

        loading.querySelector('.loading-text').textContent = 'Genererer kart hos Carto-Art (dette kan ta litt tid)...';

        // Construct API Payload (matching official SDK format)
        const payload = {
            location: {
                lat: state.location.lat,
                lng: state.location.lng
            },
            // Use the category ID (e.g. 'blueprint', 'minimal')
            style: state.style.styleId,
            camera: {
                pitch: state.pitch || 0,
                bearing: state.bearing || 0,
                zoom: state.zoom // Pass current zoom
            },
            options: {
                // Use high_res flag instead of manual dimensions
                high_res: state.exportScale >= 4,
                buildings_3d: state.buildings3d,
                terrain: state.terrain,
                contours: state.contours,
                streets: state.streets,
                water: state.water,
                parks: state.parks,
                buildings: state.buildings,
                background: state.background
            },
            text: {
                show_title: false,
                show_subtitle: false
            }
        };

        console.log('Fetching map from Carto-Art:', payload);

        const apiEndpoint = getCartoArtEndpoint();
        console.log('Using endpoint:', apiEndpoint);
        console.log('API Key:', CART_ART_API_KEY ? CART_ART_API_KEY.substring(0, 8) + '...' : 'MISSING');

        // Use Bearer token authentication (official SDK format)
        const response = await fetch(apiEndpoint, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CART_ART_API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || `API Feil: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.download_url) {
            throw new Error('Ingen nedlastingslenke mottatt fra API');
        }

        loading.querySelector('.loading-text').textContent = 'Laster ned høyoppløselig bilde...';

        // Fetch the generated image
        // Note: Using a proxy or CORS-enabled fetch for S3 URL
        const imageResponse = await fetch(data.download_url);
        const imageBlob = await imageResponse.blob();
        const mapImg = await createImageBitmap(imageBlob);

        loading.querySelector('.loading-text').textContent = 'Komponerer plakat...';

        // Create canvas and draw everything (reusing existing logic)
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

        // Draw Map
        ctx.drawImage(mapImg, 0, 0, mapImg.width, mapImg.height, mapX, mapY, mapAreaWidth, mapAreaHeight);

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

        // Calculate total text height
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
            ctx.strokeRect(mapX, mapY + mapAreaHeight * (1 - state.themeSize / 100), mapAreaWidth, mapAreaHeight * (state.themeSize / 100)); // Fixed: use strokeRect
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

        // Download
        const link = document.createElement('a');
        const mimeType = state.exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
        const extension = state.exportFormat === 'jpeg' ? 'jpg' : 'png';
        link.download = `carto-art-poster-${state.location.name}-${posterWidth}x${posterHeight}.${extension}`;
        link.href = canvas.toDataURL(mimeType, 0.95);
        link.click();

        loading.classList.remove('active');
        showNotification('Plakat lastet ned suksessfullt!', 'success');

    } catch (error) {
        console.error('Export error:', error);
        loading.classList.remove('active');

        // Check if it's a CORS/network error
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
            showNotification('Kunne ikke koble til Carto-Art API (CORS-feil). Bruk "Rask eksport" i stedet, eller kontakt Carto-Art for å få domenet ditt hvitelistet.', 'error');
        } else {
            showNotification(`Feil: ${error.message}`, 'error');
        }
    }
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
    const poster = document.getElementById('posterFrame');
    const posterRect = poster.getBoundingClientRect();
    const scale = state.exportScale;

    const posterWidth = Math.round(posterRect.width * scale);
    const posterHeight = Math.round(posterRect.height * scale);

    // Map dimensions (accounting for margin)
    const marginPercent = state.margin / 100;
    const mapAreaWidth = Math.round(posterWidth * (1 - marginPercent * 2));
    const mapAreaHeight = Math.round(posterHeight * (1 - marginPercent * 2));

    // Ensure map is ready
    map.resize();
    await new Promise(resolve => setTimeout(resolve, 500));

    // Capture map canvas directly (requires preserveDrawingBuffer: true)
    const mapCanvas = map.getCanvas();
    const mapDataUrl = mapCanvas.toDataURL('image/png');
    const mapImg = await loadImage(mapDataUrl);

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

    // Draw map
    ctx.drawImage(mapImg, 0, 0, mapImg.width, mapImg.height, mapX, mapY, mapAreaWidth, mapAreaHeight);

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
