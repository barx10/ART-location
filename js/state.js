/* ============================================
   State - Application State Management
   ============================================ */

// Carto-Art API key - get your key at https://cartoart.net
let CART_ART_API_KEY = localStorage.getItem('carto_art_api_key') || '';

// Application state
let state = {
    location: { name: 'Oslo', lat: 59.9139, lng: 10.7522 },
    style: ALL_PALETTES[0],
    font: FONTS[0],
    zoom: 12,
    margin: 5,
    bgColor: '#F7F5F0',
    textColor: '#2C2C2C',
    frameColor: '#2C2C2C',
    aspect: 'portrait',
    // Camera settings
    pitch: 0,
    bearing: 0,
    // Layer options (Carto-Art API)
    buildings3d: false,
    terrain: false,
    contours: false,
    water: true,
    parks: true,
    streets: true,
    buildings: true,
    background: true,

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


