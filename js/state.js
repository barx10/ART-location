/* ============================================
   State - Application State Management
   ============================================ */

// Geoapify API key - get your free key at https://myprojects.geoapify.com/
let GEOAPIFY_API_KEY = localStorage.getItem('geoapify_api_key') || '';

// Application state
let state = {
    location: { name: 'Oslo', lat: 59.9139, lng: 10.7522 },
    style: MAP_STYLES[0],
    font: FONTS[0],
    zoom: 12,
    margin: 5,
    bgColor: '#F7F5F0',
    textColor: '#2C2C2C',
    frameColor: '#2C2C2C',
    aspect: 'portrait',
    showCoords: true,
    showLines: true,
    showDate: false,
    dateValue: '',
    frameStyle: 'none',
    textTheme: 'none',
    themeSize: 30,
    showLabels: true,
    exportScale: 4,
    labelShadow: 2,
    mapSaturation: 100,
    mapContrast: 100,
    mapBrightness: 100,
    textSize: 100,
    textX: 50,
    textY: 85,
    canvasScale: 1,
    stickers: [],
    selectedSticker: null,
    stickerSize: 40
};

// Map references
let map = null;
let tileLayer = null;

// Helper to get Geoapify tile URL
function getGeoapifyTileUrl(style) {
    if (GEOAPIFY_API_KEY) {
        return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`;
    }
    return null;
}
