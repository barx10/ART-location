# 📍 Stedskart — Ditt sted, din kunst

**Stedskart** er en nettbasert applikasjon for å lage vakre, personlige kartplakater av dine favorittplasser. Perfekt som gave, minne fra en spesiell reise, eller som unik veggdekorasjon.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-barx10.github.io-blue)](https://barx10.github.io/ART-location/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#)

---

## 📸 Screenshots

<div align="center">

### 🎨 Design-grensesnitt
![Stedskart Interface](screenshots/screenshot-1.png)
*Intuitiv sidebar med 11 kartstiler, 22 fonter og avanserte tilpasninger*

### 🌍 3D Terreng & Kamera
![3D Terrain View](screenshots/screenshot-2.png)
*3D-bygninger, terrengvisning med hillshading og 360° rotasjon*

### 🖼️ Ferdig Plakat
![Final Poster](screenshots/screenshot-3.png)
*Høyoppløselig eksport med custom tekst, stickers og rammer*

</div>

---

## ✨ Funksjoner

### 🗺️ Kartfunksjoner
- **Global lokasjonssøk** via OpenStreetMap (Nominatim)
- **11 kartstiler** med 38+ fargepaletter:
  - Minimal Line Art • Dark Mode/Noir • Blueprint • Vintage
  - Topographic • Retro • Organic • Midnight Noir
- **3D-kamera**: Pitch (0-60°), Bearing (0-360°), Zoom (8-16)
- **3D-bygninger** med høydedata
- **Terreng & konturlinjer**
- **Tilfeldig lokasjonsgenerator**

### 🎨 Design & Tilpasning
- **22 Google Fonts** (DM Sans, Playfair Display, Bebas Neue, osv.)
- **Tekststørrelse & posisjon** (horisontal/vertikal kontroll)
- **Bokstavmellomrom** (letter spacing slider) - *live preview*
- **5 tekst-temaer**: None, Gradient, Box, Panel, Double
- **6 rammestiler**: Thin, Thick, Double, Vintage, Ornate
- **Fargetilpasning**:
  - Standard: Bakgrunn + tekst
  - **Avansert**: Individuelle farger for vann, parker, veier, bygninger, terreng - *live preview*
- **16 emoji-stickers** med drag-and-drop
- **Kartjusteringer**: Saturasjon, kontrast, lysstyrke, vignette

### ⛰️ Terreng & 3D
- **Terreng eksagering** (0.5x-5x) for dramatiske fjellvyer - *live preview*
- **Hillshading kontroll**: Intensitet + solvinkel - *live preview*
- **3D-bygninger** med dynamisk høyde
- **Høydekurver** (contours)
- **Live forhåndsvisning** av alle innstillinger

### 💾 Eksport & Deling
- **Filformater**: PNG (tapsfri) eller JPEG (mindre filstørrelse)
- **Poster-formater**: Portrett (2:3), Landskap (3:2), Kvadrat (1:1)
- **Oppløsninger**:
  - Standard: ~2400×3600px (portrett)
  - Høy (4K): ~4800×7200px ⚡
  - Print (6K): ~7200×10800px ⚡
- **Rask eksport** (uten API) via html2canvas
- **API-basert eksport** (høyeste kvalitet) via Carto Art
- **Del til utklippstavle** eller native deling

---

## 🛠️ Teknologi

### Frontend
- **Vanilla JavaScript** (ES6+)
- **MapLibre GL JS** v4.7.1 (åpen kildekode kartbibliotek)
- **HTML5 Canvas API** for poster-komposisjon
- **html2canvas** for rask klient-side eksport
- **CSS3** med CSS Custom Properties

### Kartdata & API
- **[Carto Art API](https://cartoart.net)** - Premium kartgenerering med 3D-støtte
  - Høyoppløselig rendering (opptil 7200×10800px)
  - 11 profesjonelle kartstiler
  - Terreng, hillshading og 3D-bygninger
  - Avansert fargetilpasning
- **OpenStreetMap** via OpenFreemap vector tiles
- **Nominatim** for global geokoding

### Arkitektur
Modulær struktur med separerte concerns:
```
js/
├── constants.js    # Kartstiler, fonter, lokasjoner
├── state.js        # Global state management
├── map.js          # MapLibre initialisering og style
├── ui.js           # Event listeners og UI-oppdateringer
├── poster.js       # Poster rendering og temaer
├── stickers.js     # Sticker plassering og drag-and-drop
├── export.js       # API-kommunikasjon og eksport
└── utils.js        # Hjelpefunksjoner
```

---

## 🚀 Kom i gang

### Lokal kjøring
```bash
# Klon repositoryet
git clone https://github.com/barx10/ART-location.git
cd ART-location

# Åpne index.html i nettleser
open index.html
# eller
python -m http.server 8000
# Naviger til http://localhost:8000
```

### Carto Art API-nøkkel (valgfritt)
For høyeste kvalitet (4K/6K) eksport:

1. Besøk [Carto Art Developer](https://cartoart.net/developer)
2. Registrer deg og få en gratis API-nøkkel
3. Lim inn nøkkelen i "Eksport"-seksjonen i appen
4. Velg "Høy (4K)" eller "Print (6K)" kvalitet

**Merk**: Standard og rask eksport fungerer uten API-nøkkel.

---

## 📖 Brukerveiledning

### 1. Velg lokasjon
- Søk etter by/sted i søkefeltet (global søk)
- Eller bruk hurtigknappene (Oslo, Bergen, Trondheim, osv.)
- Eller klikk "🎲 Tilfeldig" for random lokasjon

### 2. Tilpass design
- Velg kartstil fra 11 kategorier
- Juster zoom, tilt og rotasjon
- Velg font, farger og ramme
- Legg til tekst (tittel, undertittel, koordinater, dato)
- Plasser emoji-stickers på kartet

### 3. Avanserte innstillinger
- **Kartlag & 3D**: Aktiver 3D-bygninger, terreng, høydekurver
- **Terreng**: Juster eksagering (0.5x-5x) og hillshading
- **Avanserte farger**: Tilpass vann, parker, veier, bygninger individuelt
- **Kartjusteringer**: Finjuster saturasjon, kontrast, lysstyrke

### 4. Eksporter
- Velg filformat (PNG eller JPEG)
- Velg oppløsning (Standard, Høy, Print)
- Klikk "Last ned PNG (Høy kvalitet)" eller "Rask eksport"

---

## ⌨️ Hurtigtaster

| Tast | Funksjon |
|------|----------|
| `+` / `-` | Zoom inn/ut |
| `R` | Tilbakestill kart |
| `E` | Eksporter plakat |
| `C` | Kopier til utklippstavle |
| `I` | Åpne info-modal |
| `Esc` | Lukk dialog |
| `Cmd/Ctrl+S` | Eksporter |

---

## 🎯 Hva er nytt?

### v2.0 (Januar 2026)
- ✅ **JPEG-eksport** for mindre filstørrelse
- ✅ **Landskapsorientering** (3:2) i tillegg til portrett og kvadrat
- ✅ **Letter spacing kontroll** (bokstavmellomrom) med live preview
- ✅ **Terreng eksagering** (0.5x-5x dramatisering) med live preview
- ✅ **Hillshading** (intensitet + solvinkel) med live preview
- ✅ **Avansert fargetilpasning** (5 separate elementfarger) med live preview
- ✅ **Live forhåndsvisning** av alle nye innstillinger
- ✅ **Standard kvalitet uten API-nøkkel** for enkel testing
- ✅ Forbedret API-integrasjon med Carto Art

### v1.0 (2025)
- 🗺️ Grunnleggende kartfunksjoner med MapLibre
- 🎨 11 kartstiler med 38+ paletter
- 🔤 22 fonter og teksttilpasning
- 📐 3D-kamera med pitch/bearing/zoom
- 🖼️ Ramme- og temasystem
- 💾 PNG-eksport i 3 kvaliteter

---

## 🙏 Takk til

### Carto Art
Denne appen bruker [Carto Art API](https://cartoart.net) for høykvalitets kartgenerering. Carto Art tilbyr:
- Profesjonelle kartstiler med 3D-støtte
- Høyoppløselig rendering (opptil 10800px)
- Terreng, hillshading og kontrol
- Avansert fargetilpasning
- Rask og pålitelig API

**Merk**: Carto Art er en betalt tjeneste. Denne appen fungerer også uten API-nøkkel (via html2canvas), men med lavere kvalitet.

### Åpen kildekode
- **[MapLibre GL JS](https://maplibre.org/)** - Åpen kildekode kartbibliotek
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Kartdata fra bidragsytere verden over
- **[Nominatim](https://nominatim.org/)** - Gratis geokoding
- **[Google Fonts](https://fonts.google.com/)** - Gratis fonter

---

## 📄 Lisens

MIT License © 2026 Kenneth Bareksten / [Lærerliv](https://www.laererliv.no/)

Kartdata © [OpenStreetMap](https://www.openstreetmap.org/copyright) bidragsytere

---

## 👤 Forfatter

**Kenneth Bareksten**
Lærer og hobbyprogrammerer som lager digitale verktøy for å gjøre hverdagen litt enklere og mer kreativ.

- 🌐 Website: [laererliv.no](https://www.laererliv.no/)
- 📧 Email: kenneth@laererliv.no
- 💼 GitHub: [@barx10](https://github.com/barx10)

---

## 🐛 Feilrapportering & Feature Requests

Fant du en bug eller har forslag til forbedringer? Opprett en [issue](https://github.com/barx10/ART-location/issues) på GitHub!

---

<div align="center">

**Laget med ❤️ i Norge**

[⬆ Tilbake til toppen](#-stedskart--ditt-sted-din-kunst)

</div>
