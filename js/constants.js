/* ============================================
   Constants - Configuration and Data
   ============================================ */

/* 
   Carto-Art Styles & Palettes 
   Derived from /api/v1/styles
*/
const MAP_STYLES = [
    // CLASSIC BLACK & WHITE
    {
        id: 'minimal',
        name: 'Classic',
        desc: 'Tidløs sort-hvit estetikk',
        palettes: [
            {
                id: 'minimal-ink',
                name: 'Ink & Paper',
                colors: {
                    background: '#F7F5F0',
                    text: '#2C2C2C',
                    water: '#2C2C2C',
                    parks: '#2C2C2C',
                    roads: '#2C2C2C',
                    buildings: '#2C2C2C'
                }
            },
            {
                id: 'minimal-void',
                name: 'Void',
                colors: {
                    background: '#000000',
                    text: '#FFFFFF',
                    water: '#FFFFFF',
                    parks: '#FFFFFF',
                    roads: '#FFFFFF',
                    buildings: '#FFFFFF'
                }
            }
        ]
    },
    // DARK & DRAMATIC
    {
        id: 'dark-mode',
        name: 'Dark Mode',
        desc: 'Dramatiske mørke kart',
        palettes: [
            {
                id: 'dark-gold',
                name: 'Gold Standard',
                colors: {
                    background: '#0A0A0F',
                    text: '#D4AF37',
                    water: '#1A4D7A',
                    parks: '#2D5016',
                    roads: '#D4AF37',
                    buildings: '#C9A961'
                }
            },
            {
                id: 'dark-neon',
                name: 'Neon City',
                colors: {
                    background: '#0B0B1A',
                    text: '#FFFFFF',
                    water: '#1E3A8A',
                    parks: '#065F46',
                    roads: '#F0F0F0',
                    buildings: '#E0E0E0'
                }
            }
        ]
    },
    // BLUEPRINT TECHNICAL
    {
        id: 'blueprint',
        name: 'Blueprint',
        desc: 'Teknisk arkitektstil',
        palettes: [
            {
                id: 'blueprint-classic',
                name: 'Classic Blueprint',
                colors: {
                    background: '#0A2647',
                    text: '#E8F1F5',
                    water: '#5DD4E8',
                    parks: '#7BE495',
                    roads: '#E8F1F5',
                    buildings: '#B8D4E8'
                }
            },
            {
                id: 'blueprint-white',
                name: 'Whiteprint',
                colors: {
                    background: '#F5F8FA',
                    text: '#0A2647',
                    water: '#3B82F6',
                    parks: '#10B981',
                    roads: '#0A2647',
                    buildings: '#1E3A5F'
                }
            }
        ]
    },
    // VINTAGE WARM
    {
        id: 'vintage',
        name: 'Vintage',
        desc: 'Varme, nostalgiske toner',
        palettes: [
            {
                id: 'vintage-parch',
                name: 'Parchment',
                colors: {
                    background: '#F4E4C8',
                    text: '#3C2F1F',
                    water: '#6B9AC4',
                    parks: '#8B9556',
                    roads: '#5C4033',
                    buildings: '#8B6F47'
                }
            },
            {
                id: 'vintage-sepia',
                name: 'Sepia',
                colors: {
                    background: '#E8D8B8',
                    text: '#2A1810',
                    water: '#7A9CAD',
                    parks: '#6B7D43',
                    roads: '#4A3728',
                    buildings: '#6B5238'
                }
            }
        ]
    },
    // RETRO VIBRANT
    {
        id: 'retro',
        name: 'Retro',
        desc: '70s, 80s og 90s vibes',
        palettes: [
            {
                id: 'retro-synthwave',
                name: '80s Synthwave',
                colors: {
                    background: '#1A0A30',
                    text: '#FF6EC7',
                    water: '#7B2CBF',
                    parks: '#240046',
                    roads: '#FF6EC7',
                    buildings: '#C77DFF'
                }
            },
            {
                id: 'retro-90s',
                name: '90s Teal',
                colors: {
                    background: '#E0F0F0',
                    text: '#006666',
                    water: '#0891B2',
                    parks: '#059669',
                    roads: '#006666',
                    buildings: '#0D9488'
                }
            }
        ]
    },
    // NATURE ORGANIC
    {
        id: 'organic',
        name: 'Nature',
        desc: 'Organiske natur-toner',
        palettes: [
            {
                id: 'organic-abyss',
                name: 'Ocean Abyss',
                colors: {
                    background: '#030810',
                    text: '#4AC8E8',
                    water: '#0891B2',
                    parks: '#064E3B',
                    roads: '#67E8F9',
                    buildings: '#22D3EE'
                }
            },
            {
                id: 'organic-forest',
                name: 'Rainforest',
                colors: {
                    background: '#0F1A14',
                    text: '#8BD4A0',
                    water: '#3B82F6',
                    parks: '#10B981',
                    roads: '#A7F3D0',
                    buildings: '#6EE7B7'
                }
            }
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
