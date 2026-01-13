# Analyse av Carto-Art Funksjoner

## Oppsummering
Denne analysen sammenligner din nåværende Stedskart-app med funksjonene som tilbys av Carto-Art API/plattform.

---

## ✅ Funksjoner som ALLEREDE er implementert

### Kartfunksjoner
- ✅ Interaktivt kart med MapLibre GL JS
- ✅ Lokasjonssøk (lokalt + Nominatim)
- ✅ 11 kartstiler med flere paletter (Minimal, Dark Mode, Blueprint, Vintage, osv.)
- ✅ 3D kamerakontroller (pitch 0-60°, bearing 0-360°, zoom 8-16)
- ✅ 3D bygninger med høydedata
- ✅ Terreng og konturlinjer
- ✅ Lagkontroll (vann, parker, veier, bygninger, bakgrunn)
- ✅ Tilfeldig lokasjonsgenerator

### Design & Tilpasning
- ✅ 22 fontfamilier
- ✅ Tekststørrelse og posisjon
- ✅ Fargetilpasning (tekst, bakgrunn, ramme)
- ✅ 5 tekst-temaer (None, Gradient, Box, Panel, Double)
- ✅ 6 rammestiler
- ✅ 16 emoji-stickers med drag-and-drop
- ✅ Koordinater og dato
- ✅ Kartfiltre (saturasjon, kontrast, lysstyrke, vignette)

### Eksport
- ✅ PNG eksport i 3 kvaliteter (Standard ~2400×3600, Høy ~4800×7200, Print ~7200×10800)
- ✅ API-integrasjon med `/api/v1/posters/generate`
- ✅ Rask eksport med html2canvas (uten API)
- ✅ Del til utklippstavle
- ✅ Native deling (Web Share API)

---

## ❌ Funksjoner som MANGLER (Carto-Art tilbyr disse)

### 1. **Animert GIF Eksport** 🎬
**Status:** Ikke implementert
**Beskrivelse:** Carto-Art støtter eksport av animerte GIF-filer, f.eks. roterende kameravinkel eller zoom-animasjoner.
**Bruksområde:**
- Sosialt-deling med bevegelse
- Dynamiske presentasjoner
- Animerte orbit-effekter rundt et sted

**Implementering:** Krever ny API-parameter `format: "gif"` og eventuelt `animation` konfigurasjon.

---

### 2. **MP4 Video Eksport** 🎥
**Status:** Ikke implementert
**Beskrivelse:** Eksporter kartanimasjoner som MP4-video i høy oppløsning (opptil 4K).
**Bruksområde:**
- Profesjonelle presentasjoner
- Cinematic reveals av steder
- Markedsføringsmateriell

**Implementering:** API-parameter `format: "mp4"`, med videolengde og FPS-konfigurasjon.

---

### 3. **Orbit Animasjoner** 🌍
**Status:** Ikke implementert
**Beskrivelse:** Automatisk rotasjon rundt et sted (360° orbit), med konfigurerbar hastighet og retning.
**Bruksområde:**
- "Snurrende globus"-effekt
- Showcase av bygninger/landskap fra alle vinkler

**Implementering:** API-parameter `animation: { type: "orbit", duration: 10, bearing_start: 0, bearing_end: 360 }`

---

### 4. **Kinematiske Kamera-Automations** 🎬
**Status:** Ikke implementert
**Beskrivelse:** Automatiske kamerabevegelser som:
- Zoom inn/ut over tid
- Pitch-endring (0° til 60° smooth transition)
- Kombinerte bevegelser (zoom + roter + tilt)

**Bruksområde:**
- Dramtiske reveal-effekter
- Storytelling med kart
- Profesjonelle video-intros

**Implementering:** API-parameter `camera_automation: { keyframes: [...], duration: 15 }`

---

### 5. **STL 3D Modell Eksport** 🖨️
**Status:** Ikke implementert
**Beskrivelse:** Eksporter terrenget som en 3D-modell (STL-format) for 3D-printing eller visualisering.
**Bruksområde:**
- 3D-print av fjellområder, byer med bygninger
- Fysiske relieffer av favorittplasser
- Arkitektur-visualisering

**Implementering:** API-parameter `format: "stl"`, med terreng-eksagering og oppløsning.

---

### 6. **JPEG Eksport** 📸
**Status:** Ikke implementert (kun PNG)
**Beskrivelse:** JPEG-format for mindre filstørrelse (bedre for web/deling).
**Implementering:** Canvas API støtter allerede JPEG: `canvas.toDataURL('image/jpeg', 0.95)`

---

### 7. **Letter Spacing Kontroll** ✍️
**Status:** Delvis (hardkodet i export.js)
**Nåværende:**
```javascript
ctx.letterSpacing = `${titleSize * 0.08}px`; // Hardkodet multiplikator
```
**Mangler:** UI-kontroll for brukeren til å justere letter-spacing dynamisk.

**Implementering:** Legg til slider i UI (0.0 - 0.3 multiplikator).

---

### 8. **Individuell Fargetilpasning av Kartelementer** 🎨
**Status:** Ikke implementert
**Nåværende:** Kun forhåndsdefinerte paletter (background + text color).
**Carto-Art tilbyr:** Separat fargekontroll for:
- Vann (water color)
- Parker (parks color)
- Veier (roads color)
- Bygninger (buildings color)
- Terreng (terrain color)

**Implementering:** Utvid `state.style.colors` med flere fargevalg + UI color pickers.

---

### 9. **Terreng Eksagering** ⛰️
**Status:** Ikke implementert
**Beskrivelse:** Multipliser terrengdybden (f.eks. 1.5x, 2x) for mer dramatiske fjellvyer.
**Implementering:** API-parameter `terrain_exaggeration: 2.0`

---

### 10. **Bedre Hillshading** 🌄
**Status:** Grunnleggende støtte via `terrain: true`
**Carto-Art tilbyr:** "Realistic hillshading" med bedre skyggelegging basert på solvinkel.
**Implementering:** API kan ha parameter for `hillshade_intensity` og `sun_angle`.

---

## 📊 Prioritetsforslag

### 🔴 Høy prioritet (Rask verdi for brukerne)
1. **JPEG Eksport** - Enkel å implementere, mindre filstørrelse
2. **Letter Spacing Kontroll** - Allerede i kode, trenger bare UI
3. **Terreng Eksagering** - Én API-parameter, stor visuell effekt

### 🟡 Middels prioritet (Forbedret opplevelse)
4. **Individuell Elementfarge** - Mer fleksibilitet, krever redesign av UI
5. **Bedre Hillshading** - Avhenger av Carto-Art API-støtte

### 🟢 Lav prioritet (Premium-funksjoner)
6. **Animert GIF Eksport** - Krever ny eksportlogikk
7. **MP4 Video Eksport** - Kompleks, krever Carto Plus
8. **Orbit Animasjoner** - Premium feature
9. **Kinematiske Automations** - Avansert, trenger UI for keyframes
10. **STL 3D Modell** - Nisje-feature, krever Carto Plus

---

## 🛠️ Teknisk Implementeringsnotat

### API Endpoint
Din app bruker: `https://cartoart.net/api/v1/posters/generate`

### Nåværende Payload (fra `export.js:56-88`)
```json
{
  "location": { "lat": 59.9139, "lng": 10.7522 },
  "style": "minimal",
  "palette": { "background": "#ffffff", "text": "#2C2C2C" },
  "camera": { "pitch": 45, "bearing": 90, "zoom": 13 },
  "options": {
    "width": 3600,
    "height": 5400,
    "scale": 1,
    "buildings_3d": true,
    "terrain": true,
    "contours": true,
    "streets": true,
    "water": true,
    "parks": true,
    "buildings": true,
    "background": true
  },
  "text": { "show_title": false, "show_subtitle": false }
}
```

### Foreslåtte Utvidelser
```json
{
  // Eksisterende...
  "format": "png",  // Nytt: "jpeg", "gif", "mp4", "stl"
  "terrain_exaggeration": 1.5,  // Nytt: 0.5 - 5.0
  "animation": {  // Nytt: For GIF/MP4
    "type": "orbit",
    "duration": 10,
    "bearing_start": 0,
    "bearing_end": 360
  },
  "palette_advanced": {  // Nytt: Individuell farge
    "background": "#ffffff",
    "text": "#2C2C2C",
    "water": "#a8d5f2",
    "parks": "#c8e6c9",
    "roads": "#757575",
    "buildings": "#eeeeee",
    "terrain": "#d7ccc8"
  },
  "hillshade": {  // Nytt: Hillshading konfig
    "intensity": 0.7,
    "sun_angle": 315
  }
}
```

---

## 🎯 Konklusjon

Din app har allerede **solid grunnfunksjonalitet** med Carto-Art integrasjon. De største manglende funksjonene er:

1. **Eksportformater** (GIF, MP4, STL, JPEG)
2. **Animasjoner** (Orbit, camera automations)
3. **Avansert fargetilpasning** (individuell elementfarge)
4. **Terrengkontroll** (exaggeration, hillshading)

Fokuser først på **enkle gevinster** (JPEG, letter spacing, terrain exaggeration) før du tar tak i komplekse features som video-eksport.

---

## ✅ IMPLEMENTERT (2026-01-13)

### Funksjoner som nå er lagt til:

1. ✅ **JPEG Eksport** - Format-velger i eksportseksjonen (PNG/JPEG)
2. ✅ **Letter Spacing Kontroll** - Slider for å justere bokstavmellomrom (0.0 - 0.3)
3. ✅ **Terreng Eksagering** - Slider for å multiplisere terrengdybde (0.5x - 5x)
4. ✅ **Hillshading Kontroll** - Intensitet (0-1) og solvinkel (0-360°)
5. ✅ **Avansert Fargetilpasning** - Toggle for individuell farge på vann, parker, veier, bygninger og terreng

### Tekniske detaljer:
- Alle nye parametere sendes til Carto-Art API via `/api/v1/posters/generate`
- JPEG-eksport bruker 95% kvalitet for optimal filstørrelse
- Avanserte farger er valgfritt (toggle on/off)
- UI er integrert i eksisterende sidebare-struktur

### Gjenstående premium-funksjoner (ikke implementert):
- ❌ Animert GIF eksport
- ❌ MP4 video eksport
- ❌ Orbit animasjoner
- ❌ Kinematiske kamera-automations
- ❌ STL 3D modell eksport

Disse krever Carto Plus-abonnement og mer kompleks implementering.

---

## 📚 Kilder
- [Carto Art Website](https://cartoart.net)
- [AlternativeTo - Carto Art Info](https://alternativeto.net/software/carto-art/about/)
- Codebase: `/home/user/ART-location/js/export.js`
