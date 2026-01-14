# Carto-Art API Fix (2026-01-14)

## Problem
Appen fungerte ikke for eksport høy kvalitet og print. Vi fikk API-feil både på produksjon og lokal kjøring.

## Rot-årsak
Vi implementerte API-kallet feil sammenlignet med offisiell SDK og OpenAPI-spesifikasjon:

### 1. **Feil autentisering**
- ❌ **Tidligere**: Sendte `apiKey` i request body
- ✅ **Nå**: Bruker `Authorization: Bearer <api_key>` header

### 2. **Feil request-format**
- ❌ **Tidligere**: Wrapte payload i `{ apiKey, cartoArtRequest }` objekt
- ✅ **Nå**: Sender poster-parametere direkte i body

### 3. **Feil parametere**
- ❌ **Tidligere**: Sendte `width`, `height`, `scale`, `palette`, `hillshade`, `terrain_exaggeration`
- ✅ **Nå**: Bruker `options.high_res: true` for høy oppløsning

### 4. **Proxy-mismatch**
- ❌ **Tidligere**: Proxy forventet Authorization header, men vi sendte det aldri
- ✅ **Nå**: Proxy mottar og videresender Authorization header korrekt

## Løsning

### Endringer i `js/export.js` (linjer 88-156)

**Før:**
```javascript
const proxyPayload = {
    apiKey: CART_ART_API_KEY,
    cartoArtRequest: payload
};

const response = await fetch(apiEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(proxyPayload)
});
```

**Etter:**
```javascript
const response = await fetch(apiEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CART_ART_API_KEY}`
    },
    body: JSON.stringify(payload)
});
```

### Endringer i `worker/cartoart-proxy.js` (linjer 53-86)

Lagt til:
- Validering av Authorization header
- Bedre feilhåndtering
- Console logging for debugging

### Payload-endringer

**Før:**
```json
{
  "location": { "lat": 59.9139, "lng": 10.7522 },
  "style": "minimal",
  "palette": { "background": "#fff", "text": "#000" },
  "camera": { "pitch": 45, "bearing": 90, "zoom": 13 },
  "options": {
    "width": 4800,
    "height": 7200,
    "scale": 1,
    "terrain_exaggeration": 1.5
  },
  "hillshade": {
    "intensity": 0.7,
    "sun_angle": 315
  }
}
```

**Etter:**
```json
{
  "location": { "lat": 59.9139, "lng": 10.7522 },
  "style": "minimal",
  "camera": { "pitch": 45, "bearing": 90, "zoom": 13 },
  "options": {
    "high_res": true,
    "buildings_3d": true,
    "terrain": true,
    "contours": true,
    "streets": true,
    "water": true,
    "parks": true,
    "buildings": true,
    "background": true
  },
  "text": {
    "show_title": false,
    "show_subtitle": false
  }
}
```

## Referanser

### Offisiell SDK
- NPM: `@kkingsbe/cartoart@0.1.3`
- GitHub: https://github.com/kkingsbe/carto-art
- Dokumentasjon: https://carto-art.vercel.app/developer

### Autentisering (fra SDK `src/client.ts:31`)
```typescript
'Authorization': `Bearer ${this.apiKey}`
```

### Endpoint
```
POST https://cartoart.net/api/v1/posters/generate
```

### OpenAPI Spec
Se `Map Poster Maker API.json` for fullstendig spesifikasjon.

## Testing
1. ✅ Standard kvalitet (2x) uten API-nøkkel - fungerer via html2canvas
2. ✅ Høy kvalitet (4x) med API-nøkkel - fungerer via Carto-Art API
3. ✅ Print kvalitet (6x) med API-nøkkel - fungerer via Carto-Art API

## Notater
- Carto-Art API støtter ikke custom fargepaletter i `/posters/generate` endpoint
- Hillshade og terrain exaggeration er ikke støttet i v1.0 av API
- `high_res: true` gir automatisk høy oppløsning (API bestemmer dimensjoner)
- Vi komponerer fortsatt egen plakat i Canvas med tekst, ramme og stickers

## Fremtidige forbedringer
- [ ] Implementere `/styles` endpoint for å hente tilgjengelige stiler
- [ ] Vurdere å bruke NPM SDK direkte i stedet for raw fetch
- [ ] Legge til retry-logikk for API-kall
- [ ] Cache API-responser for bedre ytelse
