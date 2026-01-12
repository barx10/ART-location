/* ============================================
   Map - Leaflet Map Functions
   ============================================ */

function initMap() {
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true
    }).setView([state.location.lat, state.location.lng], state.zoom);

    // Get initial tile URL
    let tileUrl;
    if (GEOAPIFY_API_KEY && state.style.geoapifyStyle) {
        tileUrl = `https://maps.geoapify.com/v1/tile/${state.style.geoapifyStyle}/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;
    } else {
        tileUrl = state.style.fallbackUrl || state.style.url;
    }

    tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    map.on('moveend', updateCoords);
    map.on('zoomend', () => {
        state.zoom = map.getZoom();
        document.getElementById('zoomSlider').value = state.zoom;
        document.getElementById('zoomValue').textContent = state.zoom;
    });

    // Initialize label styling after map loads
    setTimeout(() => {
        updateLabelShadow(state.labelShadow);
    }, 500);
}

function selectLocation(lat, lng, name) {
    state.location = { lat, lng, name };
    map.setView([lat, lng], state.zoom);

    document.getElementById('searchInput').value = name;
    document.getElementById('titleInput').value = name;
    document.getElementById('posterTitle').textContent = name;
    document.getElementById('searchResults').classList.remove('active');

    updateCoords();
}

function randomLocation() {
    // Velg fra hele verden hvis API er satt, ellers kun Norge
    const locations = GEOAPIFY_API_KEY ? WORLD_LOCATIONS : NORWEGIAN_LOCATIONS;
    const loc = locations[Math.floor(Math.random() * locations.length)];
    selectLocation(loc.lat, loc.lng, loc.name);
}

function updateCoords() {
    const center = map.getCenter();
    const latDir = center.lat >= 0 ? 'N' : 'S';
    const lngDir = center.lng >= 0 ? 'E' : 'W';
    const coords = `${Math.abs(center.lat).toFixed(2)}° ${latDir}, ${Math.abs(center.lng).toFixed(2)}° ${lngDir}`;
    document.getElementById('posterCoords').textContent = coords;
}

function updateMapTiles() {
    let tileUrl;

    // Use Geoapify tiles when API key is available
    if (GEOAPIFY_API_KEY && state.style.geoapifyStyle) {
        tileUrl = `https://maps.geoapify.com/v1/tile/${state.style.geoapifyStyle}/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;
    } else {
        // Fallback to free tiles
        tileUrl = state.showLabels
            ? (state.style.fallbackUrl || state.style.url)
            : (state.style.fallbackUrlNoLabels || state.style.urlNoLabels || state.style.fallbackUrl || state.style.url);
    }

    map.removeLayer(tileLayer);
    tileLayer = L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: GEOAPIFY_API_KEY ? '© Geoapify © OpenStreetMap' : '© OpenStreetMap'
    }).addTo(map);
}

function updateMapFilters() {
    const mapEl = document.getElementById('map');

    // Bruk state-verdier (oppdateres fra event listeners)
    const saturation = state.mapSaturation;
    const contrast = state.mapContrast;
    const brightness = state.mapBrightness;

    // Build filter string
    let filters = [];

    // Add label shadow if active
    if (state.labelShadow > 0) {
        for (let i = 0; i < 3; i++) {
            filters.push(`drop-shadow(0 0 ${state.labelShadow}px white)`);
        }
    }

    // Add color adjustments
    filters.push(`saturate(${saturation}%)`);
    filters.push(`contrast(${contrast}%)`);
    filters.push(`brightness(${brightness}%)`);

    const filterString = filters.join(' ');
    mapEl.style.setProperty('filter', filterString, 'important');

    // Update display values
    document.getElementById('mapSaturationValue').textContent = `${saturation}%`;
    document.getElementById('mapContrastValue').textContent = `${contrast}%`;
    document.getElementById('mapBrightnessValue').textContent = `${brightness}%`;
}

function updateLabelShadow(size) {
    state.labelShadow = size;
    document.getElementById('labelShadowValue').textContent = `${size}px`;

    // Oppdater hvit glod-overlay
    const glowOverlay = document.getElementById('mapGlowOverlay');
    if (glowOverlay) {
        // Konverter 0-8 til opacity 0-0.8
        const opacity = size / 10;
        glowOverlay.style.opacity = opacity;
    }
}

function updateMapWrapper() {
    setTimeout(() => map.invalidateSize(), 100);
}

function zoomCanvas(delta) {
    state.canvasScale = Math.max(0.5, Math.min(2, state.canvasScale + delta));
    const posterFrame = document.getElementById('posterFrame');
    posterFrame.style.transform = `scale(${state.canvasScale})`;
    posterFrame.style.transformOrigin = 'center center';
}

function zoomMap(delta) {
    state.zoom = Math.max(8, Math.min(16, state.zoom + delta * 0.5));
    map.setZoom(state.zoom);
    document.getElementById('zoomSlider').value = state.zoom;
    document.getElementById('zoomValue').textContent = state.zoom;
}

function resetMap() {
    // Reset location and map
    state.location = { name: 'Oslo', lat: 59.9139, lng: 10.7522 };
    map.setView([state.location.lat, state.location.lng], 12);
    state.zoom = 12;
    document.getElementById('zoomSlider').value = 12;
    document.getElementById('zoomValue').textContent = 12;

    // Reset canvas scale
    state.canvasScale = 1;
    const posterFrame = document.getElementById('posterFrame');
    posterFrame.style.transform = 'scale(1)';

    // Reset text
    document.getElementById('titleInput').value = 'Oslo';
    document.getElementById('subtitleInput').value = 'Norge';
    document.getElementById('posterTitle').textContent = 'Oslo';
    document.getElementById('posterSubtitle').textContent = 'Norge';

    // Reset style to first (Klassisk)
    selectStyle('positron');

    // Reset font to first
    selectFont('playfair');

    // Reset text size
    state.textSize = 100;
    document.getElementById('textSizeSlider').value = 100;
    document.getElementById('textSizeValue').textContent = '100%';
    document.getElementById('posterTitle').style.fontSize = '38px';
    document.getElementById('posterSubtitle').style.fontSize = '13px';
    document.getElementById('posterCoords').style.fontSize = '10px';

    // Reset text position
    state.textX = 50;
    state.textY = 85;
    document.getElementById('textXSlider').value = 50;
    document.getElementById('textYSlider').value = 85;
    document.getElementById('textXValue').textContent = '50%';
    document.getElementById('textYValue').textContent = '85%';

    // Reset text theme
    setTextTheme('none');

    // Reset frame
    setFrame('none');

    // Reset map adjustments
    state.mapSaturation = 100;
    state.mapContrast = 100;
    state.mapBrightness = 100;
    state.labelShadow = 2;
    document.getElementById('mapSaturationSlider').value = 100;
    document.getElementById('mapContrastSlider').value = 100;
    document.getElementById('mapBrightnessSlider').value = 100;
    document.getElementById('labelShadowSlider').value = 2;
    document.getElementById('mapSaturationValue').textContent = '100%';
    document.getElementById('mapContrastValue').textContent = '100%';
    document.getElementById('mapBrightnessValue').textContent = '100%';
    document.getElementById('labelShadowValue').textContent = '2px';
    updateMapFilters();
    updateLabelShadow(2);

    // Reset aspect ratio
    setAspect('portrait');

    // Reset stickers
    state.stickers = [];
    state.selectedSticker = null;
    state.stickerSize = 40;
    document.getElementById('stickerSizeSlider').value = 40;
    document.getElementById('stickerSizeValue').textContent = '40px';
    document.querySelectorAll('.sticker-btn').forEach(btn => btn.classList.remove('active'));
    renderStickers();

    // Update poster
    updatePoster();

    showNotification('Alt er tilbakestilt!', 'success');
}
