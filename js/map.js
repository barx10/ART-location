/* ============================================
   Map - MapLibre GL JS Functions (Vector Tiles)
   ============================================ */

// Helper to generate style based on current palette
function getMapStyle() {
    const colors = state.style.colors;

    return {
        version: 8,
        sources: {
            'openmaptiles': {
                type: 'vector',
                url: 'https://www.cartoart.net/api/tiles/openfreemap/planet?v=3d9821099af4b05076fb8a51beb3679fcc248ef8'
            }
        },
        layers: [
            // Background
            {
                id: 'background',
                type: 'background',
                paint: {
                    'background-color': colors.background
                }
            },
            // Water
            {
                id: 'water-layer',
                type: 'fill',
                source: 'openmaptiles',
                'source-layer': 'water',
                paint: {
                    'fill-color': colors.text,
                    'fill-opacity': 0.15
                }
            },
            // Landuse/Parks (Green areas) - Optional, maybe just texture
            {
                id: 'parks',
                type: 'fill',
                source: 'openmaptiles',
                'source-layer': 'park',
                layout: { visibility: state.parks ? 'visible' : 'none' },
                paint: {
                    'fill-color': colors.text,
                    'fill-opacity': 0.05
                }
            },
            // Roads (Lines)
            {
                id: 'roads-minor',
                type: 'line',
                source: 'openmaptiles',
                'source-layer': 'transportation',
                filter: ['all',
                    ['!=', 'class', 'motorway'],
                    ['!=', 'class', 'trunk'],
                    ['!=', 'class', 'primary']
                ],
                layout: { visibility: state.streets ? 'visible' : 'none' },
                paint: {
                    'line-color': colors.text,
                    'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 16, 2],
                    'line-opacity': 0.3
                }
            },
            {
                id: 'roads-major',
                type: 'line',
                source: 'openmaptiles',
                'source-layer': 'transportation',
                filter: ['any',
                    ['==', 'class', 'motorway'],
                    ['==', 'class', 'trunk'],
                    ['==', 'class', 'primary']
                ],
                layout: { visibility: state.streets ? 'visible' : 'none' },
                paint: {
                    'line-color': colors.text,
                    'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 4],
                    'line-opacity': 0.8
                }
            },
            // Buildings (Extrusion / 3D)
            {
                id: 'buildings',
                type: 'fill-extrusion',
                source: 'openmaptiles',
                'source-layer': 'building',
                layout: { visibility: state.buildings ? 'visible' : 'none' },
                paint: {
                    'fill-extrusion-color': colors.text,
                    'fill-extrusion-height': state.buildings3d ? ['get', 'render_height'] : 0,
                    'fill-extrusion-base': state.buildings3d ? ['get', 'render_min_height'] : 0,
                    'fill-extrusion-opacity': 0.6
                }
            }
        ]
    };
}

function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: getMapStyle(),
        center: [state.location.lng, state.location.lat],
        zoom: state.zoom,
        pitch: state.pitch,
        bearing: state.bearing,
        attributionControl: false
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: false }), 'top-right');

    map.on('moveend', () => {
        updateCoords();
        state.zoom = map.getZoom();
        state.pitch = map.getPitch();
        state.bearing = map.getBearing();

        // Update UI controls
        document.getElementById('zoomSlider').value = state.zoom;
        document.getElementById('zoomValue').textContent = state.zoom.toFixed(1);
        document.getElementById('pitchSlider').value = state.pitch;
        document.getElementById('pitchValue').textContent = Math.round(state.pitch) + '°';
        document.getElementById('bearingSlider').value = state.bearing;
        document.getElementById('bearingValue').textContent = Math.round(state.bearing) + '°';
    });
}

function selectLocation(lat, lng, name) {
    state.location = { lat, lng, name };
    map.flyTo({
        center: [lng, lat],
        zoom: state.zoom,
        essential: true
    });

    document.getElementById('searchInput').value = name;
    document.getElementById('titleInput').value = name;
    document.getElementById('posterTitle').textContent = name;
    document.getElementById('searchResults').classList.remove('active');

    updateCoords();
}

function randomLocation() {
    const locations = WORLD_LOCATIONS;
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
    if (!map) return;
    map.setStyle(getMapStyle());
}

function updateMapFilters() {
    // Only CSS filter updates remains here for saturation/contrast/brightness effects
    // on top of the vector style. 
    // Ideally we should update the STYLE PAINT properties, but for simplicity we keep CSS filters
    // for these global adjustments.

    const saturation = state.mapSaturation;
    const contrast = state.mapContrast;
    const brightness = state.mapBrightness;

    const canvas = map.getCanvas();
    let filters = [];
    filters.push(`saturate(${saturation}%)`);
    filters.push(`contrast(${contrast}%)`);
    filters.push(`brightness(${brightness}%)`);

    if (state.labelShadow > 0) {
        filters.push(`drop-shadow(0 0 ${state.labelShadow}px white)`);
    }

    canvas.style.filter = filters.join(' ');

    document.getElementById('mapSaturationValue').textContent = `${saturation}%`;
    document.getElementById('mapContrastValue').textContent = `${contrast}%`;
    document.getElementById('mapBrightnessValue').textContent = `${brightness}%`;
}

function updateLabelShadow(size) {
    state.labelShadow = size;
    document.getElementById('labelShadowValue').textContent = `${size}px`;
    updateMapFilters();
}

function updateMapWrapper() {
    setTimeout(() => map.resize(), 100);
}

function zoomCanvas(delta) {
    state.canvasScale = Math.max(0.5, Math.min(2, state.canvasScale + delta));
    const posterFrame = document.getElementById('posterFrame');
    posterFrame.style.transform = `scale(${state.canvasScale})`;
    posterFrame.style.transformOrigin = 'center center';
}

function zoomMap(delta) {
    const currentZoom = map.getZoom();
    map.flyTo({ zoom: currentZoom + delta });
}

function resetMap() {
    state.location = { name: 'Oslo', lat: 59.9139, lng: 10.7522 };
    state.zoom = 12;
    state.pitch = 0;
    state.bearing = 0;

    map.flyTo({
        center: [state.location.lng, state.location.lat],
        zoom: 12,
        pitch: 0,
        bearing: 0
    });

    document.getElementById('zoomSlider').value = 12;
    document.getElementById('pitchSlider').value = 0;
    document.getElementById('bearingSlider').value = 0;

    selectStyle(ALL_PALETTES[0].id);
    showNotification('Kart tilbakestilt', 'success');
}

// Update 3D buildings and other toggles
function toggleLayer(layerName) {
    // This function is defined in ui.js but needs to trigger map update.
    // We should hook into state changes. 
    // For now, assume ui.js calls this or updates state. we need to refresh style.
    // Better: let ui.js call updateMapTiles() after toggling.
    // I will add a listener here or ensure UI calls updateMapTiles.
}

// Add a specific listener for layer updates (called from ui.js)
window.updateLayerVisibility = function () {
    updateMapTiles();
}
