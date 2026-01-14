/* ============================================
   Map - MapLibre GL JS Functions (Vector Tiles)
   ============================================ */

// Helper to generate style based on current palette
function getMapStyle() {
    const colors = state.style.colors;

    // Use palette colors if available, otherwise fall back to text color
    const waterColor = state.advancedColors ? state.customWaterColor : (colors.water || colors.text);
    const parksColor = state.advancedColors ? state.customParksColor : (colors.parks || colors.text);
    const roadsColor = state.advancedColors ? state.customRoadsColor : (colors.roads || colors.text);
    const buildingsColor = state.advancedColors ? state.customBuildingsColor : (colors.buildings || colors.text);

    const style = {
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
                    'fill-color': waterColor,
                    'fill-opacity': 0.25
                }
            },
            // Landuse/Parks (Green areas)
            {
                id: 'parks',
                type: 'fill',
                source: 'openmaptiles',
                'source-layer': 'park',
                layout: { visibility: state.parks ? 'visible' : 'none' },
                paint: {
                    'fill-color': parksColor,
                    'fill-opacity': 0.15
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
                    'line-color': roadsColor,
                    'line-width': ['interpolate', ['linear'], ['zoom'], 12, 0.5, 16, 2],
                    'line-opacity': 0.4
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
                    'line-color': roadsColor,
                    'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 4],
                    'line-opacity': 0.6
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
                    'fill-extrusion-color': buildingsColor,
                    'fill-extrusion-height': state.buildings3d ? ['get', 'render_height'] : 0,
                    'fill-extrusion-base': state.buildings3d ? ['get', 'render_min_height'] : 0,
                    'fill-extrusion-opacity': 0.4
                }
            }
        ]
    };

    return style;
}

function initMap() {
    map = new maplibregl.Map({
        container: 'map',
        style: getMapStyle(),
        center: [state.location.lng, state.location.lat],
        zoom: state.zoom,
        pitch: state.pitch,
        bearing: state.bearing,
        attributionControl: false,
        preserveDrawingBuffer: true  // Required for canvas export
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

    // Update glow overlay opacity
    const glowOverlay = document.getElementById('mapGlowOverlay');
    if (glowOverlay) {
        glowOverlay.style.opacity = size / 10;
    }

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
// Add a specific listener for layer updates (called from ui.js)
window.updateLayerVisibility = function () {
    updateMapTiles();
}

// --- High-Resolution Export Helpers ---

let originalMapStyle = { width: '', height: '', position: '', zIndex: '' };

window.resizeMapForExport = function (width, height) {
    const mapContainer = document.getElementById('map');

    // Save original computed dimensions for scale calculation
    const rect = mapContainer.getBoundingClientRect();
    const originalComputedWidth = rect.width;

    // Save original styles to restore later
    originalMapStyle.width = mapContainer.style.width;
    originalMapStyle.height = mapContainer.style.height;
    originalMapStyle.position = mapContainer.style.position;
    originalMapStyle.zIndex = mapContainer.style.zIndex;

    // Force strict dimensions
    // We use fixed positioning to allow the map to grow beyond the viewport without affecting layout flow
    mapContainer.style.position = 'fixed';
    mapContainer.style.top = '0';
    mapContainer.style.left = '0';
    mapContainer.style.width = width + 'px';
    mapContainer.style.height = height + 'px';
    mapContainer.style.zIndex = '-9999'; // Hide behind everything

    // Store state before resize
    const originalCenter = map.getCenter();
    originalMapStyle.zoom = map.getZoom();
    originalMapStyle.center = originalCenter;

    // Resize map engine to new container size
    map.resize();

    // Calculate scale factor and adjust zoom to keep the same geographic bounds
    if (originalComputedWidth > 0) {
        const scaleFactor = width / originalComputedWidth;
        const zoomOffset = Math.log2(scaleFactor);
        const newZoom = originalMapStyle.zoom + zoomOffset;

        console.log(`Export Resize: ${originalComputedWidth}px -> ${width}px (Scale: ${scaleFactor.toFixed(2)})`);
        console.log(`Zoom Adjust: ${originalMapStyle.zoom.toFixed(2)} -> ${newZoom.toFixed(2)} (+${zoomOffset.toFixed(2)})`);

        // Apply new zoom and ensure center stays exactly the same
        map.jumpTo({
            center: originalCenter,
            zoom: newZoom,
            animate: false
        });
    }
}

window.restoreMapAfterExport = function () {
    const mapContainer = document.getElementById('map');

    // Restore styles
    mapContainer.style.width = originalMapStyle.width;
    mapContainer.style.height = originalMapStyle.height;
    mapContainer.style.position = originalMapStyle.position;
    mapContainer.style.zIndex = originalMapStyle.zIndex;
    mapContainer.style.top = '';
    mapContainer.style.left = '';

    // Restore zoom and center
    if (originalMapStyle.zoom !== undefined) {
        map.jumpTo({
            center: originalMapStyle.center || map.getCenter(),
            zoom: originalMapStyle.zoom,
            animate: false
        });
    }

    map.resize();
    console.log('Map restored to original size');
}

window.waitForMapIdle = function () {
    return new Promise((resolve) => {
        // If map is already loaded and idle, resolve immediately (with small delay to be safe)
        if (map.loaded()) {
            setTimeout(resolve, 500);
            return;
        }

        // Otherwise wait for idle event
        const onIdle = () => {
            map.off('idle', onIdle);
            resolve();
        };
        map.on('idle', onIdle);

        // Safety timeout (5 seconds)
        setTimeout(() => {
            map.off('idle', onIdle);
            resolve();
        }, 5000);
    });
}
