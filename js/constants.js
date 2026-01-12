/* ============================================
   Constants - Map Styles, Fonts, Locations
   ============================================ */

const MAP_STYLES = [
    {
        id: 'positron',
        name: 'Positron',
        desc: 'Lys og minimalistisk',
        colors: ['#F7F5F0', '#2C2C2C', '#E0E7ED', '#EDEEE8'],
        fallbackUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        fallbackUrlNoLabels: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
        textColor: '#2C2C2C',
        bgColor: '#F7F5F0',
        geoapifyStyle: 'positron'
    },
    {
        id: 'dark-matter',
        name: 'Dark Matter',
        desc: 'Mork og elegant',
        colors: ['#0A0A0F', '#F5F5F0', '#1A1A24', '#151520'],
        fallbackUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        fallbackUrlNoLabels: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        textColor: '#F5F5F0',
        bgColor: '#0A0A0F',
        geoapifyStyle: 'dark-matter'
    },
    {
        id: 'dark-matter-yellow',
        name: 'Gule Veier',
        desc: 'Mork med gule veier',
        colors: ['#0A0A0F', '#C9A432', '#1A1A24', '#151520'],
        fallbackUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        fallbackUrlNoLabels: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        textColor: '#C9A432',
        bgColor: '#0A0A0F',
        geoapifyStyle: 'dark-matter-yellow-roads'
    },
    {
        id: 'dark-matter-brown',
        name: 'Brun Atmosfære',
        desc: 'Mork med varme toner',
        colors: ['#2A1B2D', '#F4D4B0', '#1A1020', '#201520'],
        fallbackUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        fallbackUrlNoLabels: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        textColor: '#F4D4B0',
        bgColor: '#2A1B2D',
        geoapifyStyle: 'dark-matter-brown'
    },
    {
        id: 'dark-matter-purple',
        name: 'Lilla Natt',
        desc: 'Mork lilla stemning',
        colors: ['#1A1020', '#B090D0', '#251830', '#1F1228'],
        fallbackUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        fallbackUrlNoLabels: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
        textColor: '#D0B0E0',
        bgColor: '#1A1020',
        geoapifyStyle: 'dark-matter-purple-roads'
    },
    {
        id: 'osm-bright',
        name: 'OSM Bright',
        desc: 'Lys og detaljert',
        colors: ['#F5F5F0', '#3A3A3A', '#5090C0', '#70A870'],
        fallbackUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        fallbackUrlNoLabels: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
        textColor: '#2C2C2C',
        bgColor: '#F5F5F0',
        geoapifyStyle: 'osm-bright'
    },
    {
        id: 'osm-carto',
        name: 'Klassisk OSM',
        desc: 'Standard kartutseende',
        colors: ['#F5F5F0', '#3A3A3A', '#AAD3DF', '#CDEBB0'],
        fallbackUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        fallbackUrlNoLabels: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
        textColor: '#2C2C2C',
        bgColor: '#F5F5F0',
        geoapifyStyle: 'osm-carto'
    },
    {
        id: 'toner',
        name: 'Toner',
        desc: 'Hoykontrast svart/hvit',
        colors: ['#FFFFFF', '#000000', '#CCCCCC', '#EEEEEE'],
        fallbackUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
        fallbackUrlNoLabels: 'https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}{r}.png',
        textColor: '#000000',
        bgColor: '#FFFFFF',
        geoapifyStyle: 'toner'
    },
    {
        id: 'toner-grey',
        name: 'Toner Gra',
        desc: 'Myk svart/hvit',
        colors: ['#F0F0F0', '#505050', '#D0D0D0', '#E8E8E8'],
        fallbackUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png',
        fallbackUrlNoLabels: 'https://tiles.stadiamaps.com/tiles/stamen_toner_background/{z}/{x}/{y}{r}.png',
        textColor: '#3A3A3A',
        bgColor: '#F0F0F0',
        geoapifyStyle: 'toner-grey'
    },
    {
        id: 'watercolor',
        name: 'Akvarell',
        desc: 'Myk, malt estetikk',
        colors: ['#FAF8F5', '#787880', '#7BA3B8', '#A8B89C'],
        fallbackUrl: 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg',
        fallbackUrlNoLabels: 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg',
        textColor: '#4A4A4A',
        bgColor: '#FAF8F5',
        geoapifyStyle: 'osm-bright-smooth'
    },
    {
        id: 'terrain',
        name: 'Terreng',
        desc: 'Med hoydekurver',
        colors: ['#F5E6D3', '#4A2E15', '#A8967C', '#E8F0E8'],
        fallbackUrl: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
        fallbackUrlNoLabels: 'https://tiles.stadiamaps.com/tiles/stamen_terrain_background/{z}/{x}/{y}{r}.png',
        textColor: '#4A2E15',
        bgColor: '#F5E6D3',
        geoapifyStyle: 'klokantech-basic'
    }
];

const FONTS = [
    { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif", style: 'Elegant serif' },
    { id: 'bebas', name: 'Bebas Neue', family: "'Bebas Neue', sans-serif", style: 'Kondensert' },
    { id: 'oswald', name: 'Oswald', family: "'Oswald', sans-serif", style: 'Moderne' },
    { id: 'cormorant', name: 'Cormorant', family: "'Cormorant Garamond', serif", style: 'Klassisk' },
    { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", style: 'Geometrisk' },
    { id: 'baskerville', name: 'Libre Baskerville', family: "'Libre Baskerville', serif", style: 'Tradisjonell' },
    { id: 'raleway', name: 'Raleway', family: "'Raleway', sans-serif", style: 'Elegant sans' },
    { id: 'abril', name: 'Abril Fatface', family: "'Abril Fatface', serif", style: 'Display' },
    { id: 'cinzel', name: 'Cinzel', family: "'Cinzel', serif", style: 'Romersk' },
    { id: 'bodoni', name: 'Bodoni Moda', family: "'Bodoni Moda', serif", style: 'Luksus' },
    { id: 'lora', name: 'Lora', family: "'Lora', serif", style: 'Boklig' },
    { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", style: 'Rund moderne' },
    { id: 'roboto-slab', name: 'Roboto Slab', family: "'Roboto Slab', serif", style: 'Slab serif' },
    { id: 'source-serif', name: 'Source Serif', family: "'Source Serif 4', serif", style: 'Lesbar' },
    { id: 'archivo', name: 'Archivo Black', family: "'Archivo Black', sans-serif", style: 'Tung' },
    { id: 'anton', name: 'Anton', family: "'Anton', sans-serif", style: 'Impact' },
    { id: 'righteous', name: 'Righteous', family: "'Righteous', sans-serif", style: 'Retro' },
    { id: 'staatliches', name: 'Staatliches', family: "'Staatliches', sans-serif", style: 'Poster' },
    { id: 'marker', name: 'Permanent Marker', family: "'Permanent Marker', cursive", style: 'Handskrift' },
    { id: 'satisfy', name: 'Satisfy', family: "'Satisfy', cursive", style: 'Kalligrafi' }
];

const NORWEGIAN_LOCATIONS = [
    { name: 'Oslo', region: 'Oslo', lat: 59.9139, lng: 10.7522 },
    { name: 'Bergen', region: 'Vestland', lat: 60.3913, lng: 5.3221 },
    { name: 'Trondheim', region: 'Trondelag', lat: 63.4305, lng: 10.3951 },
    { name: 'Stavanger', region: 'Rogaland', lat: 58.9700, lng: 5.7331 },
    { name: 'Tromso', region: 'Troms og Finnmark', lat: 69.6496, lng: 18.9560 },
    { name: 'Kristiansand', region: 'Agder', lat: 58.1467, lng: 7.9956 },
    { name: 'Drammen', region: 'Viken', lat: 59.7439, lng: 10.2045 },
    { name: 'Fredrikstad', region: 'Viken', lat: 59.2181, lng: 10.9298 },
    { name: 'Sandnes', region: 'Rogaland', lat: 58.8524, lng: 5.7352 },
    { name: 'Alesund', region: 'More og Romsdal', lat: 62.4722, lng: 6.1549 },
    { name: 'Bodo', region: 'Nordland', lat: 67.2804, lng: 14.4049 },
    { name: 'Sandefjord', region: 'Vestfold og Telemark', lat: 59.1318, lng: 10.2167 },
    { name: 'Tonsberg', region: 'Vestfold og Telemark', lat: 59.2676, lng: 10.4076 },
    { name: 'Moss', region: 'Viken', lat: 59.4350, lng: 10.6590 },
    { name: 'Haugesund', region: 'Rogaland', lat: 59.4138, lng: 5.2680 },
    { name: 'Lofoten', region: 'Nordland', lat: 68.2000, lng: 14.0000 },
    { name: 'Geiranger', region: 'More og Romsdal', lat: 62.1008, lng: 7.2060 },
    { name: 'Flam', region: 'Vestland', lat: 60.8628, lng: 7.1130 },
    { name: 'Nordkapp', region: 'Troms og Finnmark', lat: 71.1690, lng: 25.7836 },
    { name: 'Lillehammer', region: 'Innlandet', lat: 61.1153, lng: 10.4662 },
    { name: 'Svalbard', region: 'Svalbard', lat: 78.2232, lng: 15.6267 },
    { name: 'Preikestolen', region: 'Rogaland', lat: 58.9863, lng: 6.1863 },
    { name: 'Roros', region: 'Trondelag', lat: 62.5745, lng: 11.3850 },
    { name: 'Sognefjord', region: 'Vestland', lat: 61.2000, lng: 6.8000 },
    { name: 'Hardangerfjord', region: 'Vestland', lat: 60.4000, lng: 6.5000 }
];

const WORLD_LOCATIONS = [
    // Europa
    { name: 'Paris', region: 'France', lat: 48.8566, lng: 2.3522 },
    { name: 'London', region: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
    { name: 'Rome', region: 'Italy', lat: 41.9028, lng: 12.4964 },
    { name: 'Barcelona', region: 'Spain', lat: 41.3851, lng: 2.1734 },
    { name: 'Amsterdam', region: 'Netherlands', lat: 52.3676, lng: 4.9041 },
    { name: 'Berlin', region: 'Germany', lat: 52.5200, lng: 13.4050 },
    { name: 'Prague', region: 'Czech Republic', lat: 50.0755, lng: 14.4378 },
    { name: 'Vienna', region: 'Austria', lat: 48.2082, lng: 16.3738 },
    { name: 'Reykjavik', region: 'Iceland', lat: 64.1466, lng: -21.9426 },
    { name: 'Stockholm', region: 'Sweden', lat: 59.3293, lng: 18.0686 },
    { name: 'Copenhagen', region: 'Denmark', lat: 55.6761, lng: 12.5683 },
    { name: 'Helsinki', region: 'Finland', lat: 60.1699, lng: 24.9384 },
    // Asia
    { name: 'Tokyo', region: 'Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Kyoto', region: 'Japan', lat: 35.0116, lng: 135.7681 },
    { name: 'Seoul', region: 'South Korea', lat: 37.5665, lng: 126.9780 },
    { name: 'Beijing', region: 'China', lat: 39.9042, lng: 116.4074 },
    { name: 'Shanghai', region: 'China', lat: 31.2304, lng: 121.4737 },
    { name: 'Hong Kong', region: 'China', lat: 22.3193, lng: 114.1694 },
    { name: 'Bangkok', region: 'Thailand', lat: 13.7563, lng: 100.5018 },
    { name: 'Singapore', region: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: 'Dubai', region: 'United Arab Emirates', lat: 25.2048, lng: 55.2708 },
    { name: 'Istanbul', region: 'Turkey', lat: 41.0082, lng: 28.9784 },
    { name: 'Mumbai', region: 'India', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', region: 'India', lat: 28.7041, lng: 77.1025 },
    // Nord-Amerika
    { name: 'New York', region: 'USA', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', region: 'USA', lat: 34.0522, lng: -118.2437 },
    { name: 'San Francisco', region: 'USA', lat: 37.7749, lng: -122.4194 },
    { name: 'Chicago', region: 'USA', lat: 41.8781, lng: -87.6298 },
    { name: 'Miami', region: 'USA', lat: 25.7617, lng: -80.1918 },
    { name: 'Las Vegas', region: 'USA', lat: 36.1699, lng: -115.1398 },
    { name: 'Toronto', region: 'Canada', lat: 43.6532, lng: -79.3832 },
    { name: 'Vancouver', region: 'Canada', lat: 49.2827, lng: -123.1207 },
    { name: 'Mexico City', region: 'Mexico', lat: 19.4326, lng: -99.1332 },
    // Sor-Amerika
    { name: 'Rio de Janeiro', region: 'Brazil', lat: -22.9068, lng: -43.1729 },
    { name: 'Sao Paulo', region: 'Brazil', lat: -23.5505, lng: -46.6333 },
    { name: 'Buenos Aires', region: 'Argentina', lat: -34.6037, lng: -58.3816 },
    { name: 'Lima', region: 'Peru', lat: -12.0464, lng: -77.0428 },
    { name: 'Bogota', region: 'Colombia', lat: 4.7110, lng: -74.0721 },
    // Afrika
    { name: 'Cairo', region: 'Egypt', lat: 30.0444, lng: 31.2357 },
    { name: 'Cape Town', region: 'South Africa', lat: -33.9249, lng: 18.4241 },
    { name: 'Marrakech', region: 'Morocco', lat: 31.6295, lng: -7.9811 },
    { name: 'Nairobi', region: 'Kenya', lat: -1.2864, lng: 36.8172 },
    // Oseania
    { name: 'Sydney', region: 'Australia', lat: -33.8688, lng: 151.2093 },
    { name: 'Melbourne', region: 'Australia', lat: -37.8136, lng: 144.9631 },
    { name: 'Auckland', region: 'New Zealand', lat: -36.8485, lng: 174.7633 },
    { name: 'Wellington', region: 'New Zealand', lat: -41.2865, lng: 174.7762 },
    // Spesielle steder
    { name: 'Machu Picchu', region: 'Peru', lat: -13.1631, lng: -72.5450 },
    { name: 'Petra', region: 'Jordan', lat: 30.3285, lng: 35.4444 },
    { name: 'Taj Mahal', region: 'India', lat: 27.1751, lng: 78.0421 },
    { name: 'Great Wall', region: 'China', lat: 40.4319, lng: 116.5704 },
    { name: 'Grand Canyon', region: 'USA', lat: 36.1069, lng: -112.1129 },
    { name: 'Mount Fuji', region: 'Japan', lat: 35.3606, lng: 138.7274 },
    { name: 'Santorini', region: 'Greece', lat: 36.3932, lng: 25.4615 },
    { name: 'Bali', region: 'Indonesia', lat: -8.3405, lng: 115.0920 }
];
