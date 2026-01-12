/* ============================================
   UI - User Interface and Event Handling
   ============================================ */

function renderStyleGrid() {
    const grid = document.getElementById('styleGrid');
    grid.innerHTML = MAP_STYLES.map(category => `
        <div class="style-category" style="width: 100%; margin-top: 12px; margin-bottom: 8px;">
            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">${category.name}</div>
        </div>
        ${category.palettes.map(palette => `
            <div class="style-card ${state.style && state.style.id === palette.id ? 'active' : ''}"
                 onclick="selectStyle('${palette.id}')">
                <div class="style-preview">
                    <div class="style-color" style="background: ${palette.colors.background}"></div>
                    <div class="style-color" style="background: ${palette.colors.text}"></div>
                </div>
                <div class="style-name">${palette.name}</div>
                <div class="style-check">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
            </div>
        `).join('')}
    `).join('');
}

function renderFontGrid() {
    const grid = document.getElementById('fontGrid');
    grid.innerHTML = FONTS.map(font => `
        <button class="font-btn ${state.font.id === font.id ? 'active' : ''}"
                data-font="${font.id}"
                onclick="selectFont('${font.id}')">
            <span class="font-preview" style="font-family: ${font.family}">Aa</span>
            <span class="font-name">${font.name}</span>
        </button>
    `).join('');
}

function initializeSliders() {
    // Zoom
    document.getElementById('zoomSlider').value = state.zoom;
    document.getElementById('zoomValue').textContent = state.zoom;

    // Tekststorrelse - oppdater slider, display og anvend pa poster
    document.getElementById('textSizeSlider').value = state.textSize;
    document.getElementById('textSizeValue').textContent = state.textSize + '%';
    const scale = state.textSize / 100;
    document.getElementById('posterTitle').style.fontSize = (38 * scale) + 'px';
    document.getElementById('posterSubtitle').style.fontSize = (13 * scale) + 'px';
    document.getElementById('posterCoords').style.fontSize = (10 * scale) + 'px';

    // Tekstposisjon - oppdater slider, display og anvend pa poster
    document.getElementById('textXSlider').value = state.textX;
    document.getElementById('textXValue').textContent = state.textX + '%';
    document.getElementById('textYSlider').value = state.textY;
    document.getElementById('textYValue').textContent = state.textY + '%';
    const posterText = document.querySelector('.poster-text');
    if (posterText) {
        posterText.style.left = state.textX + '%';
        posterText.style.top = state.textY + '%';
    }

    // Kartjusteringer
    document.getElementById('mapSaturationSlider').value = state.mapSaturation;
    document.getElementById('mapSaturationValue').textContent = state.mapSaturation + '%';
    document.getElementById('mapContrastSlider').value = state.mapContrast;
    document.getElementById('mapContrastValue').textContent = state.mapContrast + '%';
    document.getElementById('mapBrightnessSlider').value = state.mapBrightness;
    document.getElementById('mapBrightnessValue').textContent = state.mapBrightness + '%';

    // Hvit glod / Lys vignette
    document.getElementById('labelShadowSlider').value = state.labelShadow;
    document.getElementById('labelShadowValue').textContent = state.labelShadow + 'px';
    // Anvend glod-effekten ved oppstart
    const glowOverlay = document.getElementById('mapGlowOverlay');
    if (glowOverlay) {
        glowOverlay.style.opacity = state.labelShadow / 10;
    }

    // Tema-hoyde
    document.getElementById('themeSizeSlider').value = state.themeSize;
    document.getElementById('themeSizeValue').textContent = state.themeSize + '%';

    // Rammefarge
    document.getElementById('frameColorPicker').value = state.frameColor;
    document.getElementById('frameColorHex').value = state.frameColor.toUpperCase();
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    searchInput.addEventListener('input', async (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }

        // First check local Norwegian locations
        const localMatches = NORWEGIAN_LOCATIONS.filter(loc =>
            loc.name.toLowerCase().includes(query) ||
            loc.region.toLowerCase().includes(query)
        ).slice(0, 4);

        // If we have local matches, show them
        if (localMatches.length > 0) {
            searchResults.innerHTML = localMatches.map(loc => `
                <div class="search-result-item" onclick="selectLocation(${loc.lat}, ${loc.lng}, '${loc.name}')">
                    <div class="search-result-name">${loc.name}</div>
                    <div class="search-result-region">${loc.region}</div>
                </div>
            `).join('');
            searchResults.classList.add('active');
        }

        // Search via Nominatim (OpenStreetMap) - Free & Global
        if (query.length >= 3) {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6`
                );
                const data = await response.json();

                if (data && data.length > 0) {
                    const apiResults = data.map(f => ({
                        name: f.name || f.display_name.split(',')[0],
                        region: f.address.state || f.address.country || 'Verden',
                        lat: parseFloat(f.lat),
                        lng: parseFloat(f.lon)
                    }));

                    // Combine local and API results, remove duplicates
                    const allResults = [...localMatches];
                    apiResults.forEach(api => {
                        if (!allResults.some(local =>
                            local.name.toLowerCase() === api.name.toLowerCase() &&
                            Math.abs(local.lat - api.lat) < 0.01
                        )) {
                            allResults.push(api);
                        }
                    });

                    searchResults.innerHTML = allResults.slice(0, 8).map(loc => `
                        <div class="search-result-item" onclick="selectLocation(${loc.lat}, ${loc.lng}, '${loc.name}')">
                            <div class="search-result-name">${loc.name}</div>
                            <div class="search-result-region">${loc.region}</div>
                        </div>
                    `).join('');
                    searchResults.classList.add('active');
                }
            } catch (err) {
                console.log('Geocoding error:', err);
            }
        }

        if (localMatches.length === 0 && query.length < 3) {
            searchResults.classList.remove('active');
        }
    });

    searchInput.addEventListener('blur', () => {
        setTimeout(() => searchResults.classList.remove('active'), 200);
    });

    // Sliders
    document.getElementById('zoomSlider').addEventListener('input', (e) => {
        state.zoom = parseFloat(e.target.value);
        document.getElementById('zoomValue').textContent = state.zoom;
        map.setZoom(state.zoom);
    });

    document.getElementById('textSizeSlider').addEventListener('input', (e) => {
        const size = parseInt(e.target.value);
        state.textSize = size;
        document.getElementById('textSizeValue').textContent = size + '%';
        const scale = size / 100;
        document.getElementById('posterTitle').style.fontSize = (38 * scale) + 'px';
        document.getElementById('posterSubtitle').style.fontSize = (13 * scale) + 'px';
        document.getElementById('posterCoords').style.fontSize = (10 * scale) + 'px';
    });

    // Text inputs
    document.getElementById('titleInput').addEventListener('input', (e) => {
        document.getElementById('posterTitle').textContent = e.target.value || 'Tittel';
    });

    document.getElementById('subtitleInput').addEventListener('input', (e) => {
        document.getElementById('posterSubtitle').textContent = e.target.value || '';
    });

    // Frame color picker
    document.getElementById('frameColorPicker').addEventListener('input', (e) => {
        updateFrameColor(e.target.value);
    });

    document.getElementById('frameColorHex').addEventListener('input', (e) => {
        let value = e.target.value;
        if (!value.startsWith('#')) value = '#' + value;
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            updateFrameColor(value);
        }
    });

    // Text color picker
    document.getElementById('textColorPicker').addEventListener('input', (e) => {
        updateTextColor(e.target.value);
    });

    document.getElementById('textColorHex').addEventListener('input', (e) => {
        let value = e.target.value;
        if (!value.startsWith('#')) value = '#' + value;
        if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            updateTextColor(value);
        }
    });

    // Sticker size control
    document.getElementById('stickerSizeSlider').addEventListener('input', (e) => {
        state.stickerSize = parseInt(e.target.value);
        document.getElementById('stickerSizeValue').textContent = `${state.stickerSize}px`;
        // Update existing stickers
        state.stickers.forEach(s => s.size = state.stickerSize);
        renderStickers();
    });

    // Click on poster to place sticker
    document.querySelector('.poster-inner').addEventListener('click', (e) => {
        if (!state.selectedSticker) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        placeSticker(x, y);
    });

    // White glow control
    document.getElementById('labelShadowSlider').addEventListener('input', (e) => {
        updateLabelShadow(parseInt(e.target.value));
    });

    // Map adjustment controls
    document.getElementById('mapSaturationSlider').addEventListener('input', (e) => {
        state.mapSaturation = parseInt(e.target.value);
        updateMapFilters();
    });

    document.getElementById('mapContrastSlider').addEventListener('input', (e) => {
        state.mapContrast = parseInt(e.target.value);
        updateMapFilters();
    });

    document.getElementById('mapBrightnessSlider').addEventListener('input', (e) => {
        state.mapBrightness = parseInt(e.target.value);
        updateMapFilters();
    });

    // Theme size slider
    document.getElementById('themeSizeSlider').addEventListener('input', (e) => {
        updateThemeSize(parseInt(e.target.value));
    });

    // Text position sliders
    document.getElementById('textXSlider').addEventListener('input', (e) => {
        updateTextX(e.target.value);
    });

    document.getElementById('textYSlider').addEventListener('input', (e) => {
        updateTextY(e.target.value);
    });
}

// Info Modal functions
function openInfoModal() {
    document.getElementById('infoModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeInfoModal(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('infoModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        // Close modal on Escape
        if (e.key === 'Escape') {
            closeInfoModal();
            return;
        }

        switch (e.key) {
            case '+':
            case '=':
                zoomMap(1);
                break;
            case '-':
                zoomMap(-1);
                break;
            case 'r':
            case 'R':
                if (!e.metaKey && !e.ctrlKey) resetMap();
                break;
            case 'e':
            case 'E':
                if (!e.metaKey && !e.ctrlKey) exportPoster('png');
                break;
            case 'c':
            case 'C':
                if (!e.metaKey && !e.ctrlKey) copyToClipboard();
                break;
            case 'i':
            case 'I':
                if (!e.metaKey && !e.ctrlKey) openInfoModal();
                break;
            case 's':
            case 'S':
                if (e.metaKey || e.ctrlKey) {
                    e.preventDefault();
                    exportPoster('png');
                }
                break;
        }
    });
}

// NEW: Layer Toggles (Carto-Art API)
function toggleLayer(layerName) {
    state[layerName] = !state[layerName];
    const btn = document.getElementById(`btn-${layerName}`);
    if (btn) {
        btn.classList.toggle('active', state[layerName]);
    }
    // Update map style to reflect layer visibility changes
    if (typeof updateMapTiles === 'function') {
        updateMapTiles();
    }
}

// NEW: Camera Updates (Pitch/Bearing)
function updateCamera(param, value) {
    const val = parseInt(value);
    state[param] = val;
    document.getElementById(`${param}Value`).textContent = `${val}°`;

    // Update map view directly
    if (map) {
        if (param === 'pitch') map.setPitch(val);
        if (param === 'bearing') map.setBearing(val);
    }
}
