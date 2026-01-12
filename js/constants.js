/* ============================================
   Constants - Configuration and Data
   ============================================ */

/* 
   Carto-Art Styles & Palettes 
   Derived from /api/v1/styles
*/
const MAP_STYLES = [
    // MINIMAL
    {
        id: 'minimal',
        name: 'Minimal Line Art',
        desc: 'Clean, monochromatic street maps',
        palettes: [
            { id: 'minimal-ink', name: 'Ink & Paper', colors: { background: '#F7F5F0', text: '#2C2C2C' } },
            { id: 'minimal-charcoal', name: 'Charcoal', colors: { background: '#F5F5F0', text: '#2D2D2D' } },
            { id: 'minimal-navy', name: 'Navy & Cream', colors: { background: '#FDF6E3', text: '#1E3A5F' } },
            { id: 'minimal-midnight-sun', name: 'Midnight Sun', colors: { background: '#0D1520', text: '#E8DDD0' } },
            { id: 'minimal-void', name: 'Void', colors: { background: '#000000', text: '#FFFFFF' } }
        ]
    },
    // DARK MODE
    {
        id: 'dark-mode',
        name: 'Dark Mode / Noir',
        desc: 'Dramatic dark maps with luminous streets',
        palettes: [
            { id: 'dark-gold', name: 'Gold Standard', colors: { background: '#0A0A0F', text: '#D4AF37' } },
            { id: 'dark-silver', name: 'Silver City', colors: { background: '#0C0C10', text: '#C0C0C8' } },
            { id: 'dark-neon', name: 'Neon Noir', colors: { background: '#0B0B1A', text: '#FFFFFF' } },
            { id: 'dark-navy', name: 'Deep Navy', colors: { background: '#0B1929', text: '#F5F5F5' } },
            { id: 'dark-aurora', name: 'Aurora', colors: { background: '#080C10', text: '#40E8B0' } }
        ]
    },
    // MIDNIGHT
    {
        id: 'midnight',
        name: 'Midnight Noir',
        desc: 'Deep navy and ivory technical maps',
        palettes: [
            { id: 'midnight-classic', name: 'Midnight', colors: { background: '#0D1B2A', text: '#E0E1DD' } }
        ]
    },
    // BLUEPRINT
    {
        id: 'blueprint',
        name: 'Blueprint / Technical',
        desc: 'Architectural style with high-contrast lines',
        palettes: [
            { id: 'blueprint-classic', name: 'Classic Blueprint', colors: { background: '#0A2647', text: '#E8F1F5' } },
            { id: 'blueprint-architect', name: 'Architect', colors: { background: '#1C2833', text: '#D4E6F1' } },
            { id: 'blueprint-cyan', name: 'Cyan Line', colors: { background: '#001F3F', text: '#5DD4E8' } },
            { id: 'blueprint-white', name: 'Whiteprint', colors: { background: '#F5F8FA', text: '#0A2647' } }
        ]
    },
    // VINTAGE
    {
        id: 'vintage',
        name: 'Vintage / Antique',
        desc: 'Warm, nostalgic maps with aged tones',
        palettes: [
            { id: 'vintage-parchment', name: 'Parchment', colors: { background: '#F4E4C8', text: '#3C2F1F' } },
            { id: 'vintage-sepia', name: 'Sepia Deep', colors: { background: '#E8D8B8', text: '#2A1810' } },
            { id: 'vintage-maritime', name: 'Maritime', colors: { background: '#F0E8D8', text: '#1E3040' } },
            { id: 'vintage-colonial', name: 'Colonial', colors: { background: '#F2E8D4', text: '#1A2A20' } }
        ]
    },
    // TOPOGRAPHIC
    {
        id: 'topographic',
        name: 'Topographic',
        desc: 'Terrain-focused maps with contours',
        palettes: [
            { id: 'topo-survey', name: 'Survey', colors: { background: '#F5F2E8', text: '#3C3020' } },
            { id: 'topo-night', name: 'Terrain Night', colors: { background: '#1A1A2E', text: '#B8C5D0' } },
            { id: 'topo-earth', name: 'Earth Tone', colors: { background: '#F0E8D8', text: '#3A3028' } }
        ]
    },
    // RETRO
    {
        id: 'retro',
        name: 'Retro / Nostalgic',
        desc: 'Bold 70s, 80s and 90s vibes',
        palettes: [
            { id: 'retro-70s-earth', name: '70s Earth', colors: { background: '#F5E6D3', text: '#6B4423' } },
            { id: 'retro-80s-synthwave', name: '80s Synthwave', colors: { background: '#1A0A30', text: '#FF6EC7' } },
            { id: 'retro-90s-teal', name: '90s Teal', colors: { background: '#E0F0F0', text: '#006666' } }
        ]
    },
    // ORGANIC
    {
        id: 'organic',
        name: 'Organic / Nature',
        desc: 'Forest greens, earths and ocean depths',
        palettes: [
            { id: 'organic-abyss', name: 'Abyss', colors: { background: '#030810', text: '#4AC8E8' } },
            { id: 'organic-rainforest', name: 'Rainforest', colors: { background: '#0F1A14', text: '#8BD4A0' } },
            { id: 'organic-red-earth', name: 'Red Earth', colors: { background: '#F2E6DC', text: '#7B3F00' } }
        ]
    }
];

// Helper to flatten listeners for search/lookup, e.g. "dark-gold" -> { styleId: 'dark-mode', paletteId: 'dark-gold', colors... }
const ALL_PALETTES = MAP_STYLES.flatMap(style =>
    style.palettes.map(palette => ({
        ...palette,
        styleId: style.id, // Parent style ID (e.g. 'minimal')
        categoryName: style.name
    }))
);

// We keep these for the local Leaflet preview (fallback)
const PREVIEW_TILES = {
    'minimal': 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    'dark-mode': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    'midnight': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    'blueprint': 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', // Approx
    'vintage': 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // Approx
    'topographic': 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    'retro': 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    'organic': 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    'default': 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
};

/* Fonts */
const FONTS = [
    { id: 'dm-sans', name: 'DM Sans', family: "'DM Sans', sans-serif" },
    { id: 'playfair', name: 'Playfair', family: "'Playfair Display', serif" },
    { id: 'jetbrains', name: 'Mono', family: "'JetBrains Mono', monospace" },
    { id: 'bebas', name: 'Bebas', family: "'Bebas Neue', display" },
    { id: 'oswald', name: 'Oswald', family: "'Oswald', sans-serif" },
    { id: 'cormorant', name: 'Garamond', family: "'Cormorant Garamond', serif" },
    { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif" },
    { id: 'libre', name: 'Baskerville', family: "'Libre Baskerville', serif" },
    { id: 'raleway', name: 'Raleway', family: "'Raleway', sans-serif" },
    { id: 'abril', name: 'Fatface', family: "'Abril Fatface', display" },
    { id: 'cinzel', name: 'Cinzel', family: "'Cinzel', serif" },
    { id: 'bodoni', name: 'Bodoni', family: "'Bodoni Moda', serif" },
    { id: 'lora', name: 'Lora', family: "'Lora', serif" },
    { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif" },
    { id: 'roboto-slab', name: 'Slab', family: "'Roboto Slab', serif" },
    { id: 'source-serif', name: 'Source', family: "'Source Serif 4', serif" },
    { id: 'archivo', name: 'Archivo', family: "'Archivo Black', sans-serif" },
    { id: 'anton', name: 'Anton', family: "'Anton', sans-serif" },
    { id: 'righteous', name: 'Righteous', family: "'Righteous', display" },
    { id: 'staatliches', name: 'Stuat', family: "'Staatliches', display" },
    { id: 'permanent', name: 'Marker', family: "'Permanent Marker', handwriting" },
    { id: 'satisfy', name: 'Satisfy', family: "'Satisfy', handwriting" }
];

/* Norwegian Cities for Local Search Fallback */
const NORWEGIAN_LOCATIONS = [
    { name: 'Oslo', region: 'Viken', lat: 59.9139, lng: 10.7522 },
    { name: 'Bergen', region: 'Vestland', lat: 60.3913, lng: 5.3221 },
    { name: 'Trondheim', region: 'Trøndelag', lat: 63.4305, lng: 10.3951 },
    { name: 'Stavanger', region: 'Rogaland', lat: 58.9690, lng: 5.7331 },
    { name: 'Tromsø', region: 'Troms og Finnmark', lat: 69.6496, lng: 18.9560 },
    { name: 'Kristiansand', region: 'Agder', lat: 58.1599, lng: 8.0182 },
    { name: 'Ålesund', region: 'Møre og Romsdal', lat: 62.4722, lng: 6.1495 },
    { name: 'Bodø', region: 'Nordland', lat: 67.2804, lng: 14.4049 },
    { name: 'Lillehammer', region: 'Innlandet', lat: 61.1153, lng: 10.4662 },
    { name: 'Svolvær', region: 'Nordland', lat: 68.2343, lng: 14.5682 }
];

const WORLD_LOCATIONS = [
    { name: 'New York', region: 'USA', lat: 40.7128, lng: -74.0060 },
    { name: 'Tokyo', region: 'Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'London', region: 'UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Paris', region: 'France', lat: 48.8566, lng: 2.3522 },
    { name: 'Sydney', region: 'Australia', lat: -33.8688, lng: 151.2093 }
];
