// Utilidades de ubicación compartidas por el panel del comercio.
// Geocodificación con Mapbox (mismo token y mismos parámetros que usa el admin).

export type LatLng = { lat: number; lng: number }

// Centro aproximado de Villa General Belgrano: punto de partida del mapa
export const VALLE_CENTER: LatLng = { lat: -31.9791, lng: -64.5622 }

export const PUEBLOS = [
  "Villa General Belgrano", "Los Reartes", "Santa Rosa de Calamuchita",
  "La Cumbrecita", "Yacanto", "Amboy", "Villa Ciudad de América",
  "Embalse", "Villa del Dique", "Villa Rumipal", "Villa Alpina",
  "Villa Berna", "Villa Ciudad Parque", "La Cruz", "Intiyaco",
  "Potrero de Garay", "Villa Quillinzo",
]

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!token || !address.trim()) return null
  try {
    const fullQuery = `${address}, Córdoba, Argentina`
    // bbox restringe al Valle de Calamuchita — evita falsos positivos en otras provincias
    const bbox = "-65.5,-33.2,-63.5,-31.4"
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullQuery)}.json?access_token=${token}&country=AR&limit=1&proximity=${VALLE_CENTER.lng},${VALLE_CENTER.lat}&bbox=${bbox}`
    )
    if (!res.ok) return null
    const data = await res.json()
    const feature = data.features?.[0]
    if (!feature) return null
    const [lng, lat] = feature.center
    return { lat, lng }
  } catch {
    return null
  }
}

export function isShortMapsUrl(input: string): boolean {
  return /maps\.app\.goo\.gl|goo\.gl\/maps/i.test(input)
}

/** Acepta coordenadas sueltas o un link largo de Google Maps. */
export function parseManualCoords(input: string): LatLng | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,                    // /maps/@lat,lng o /place/.../@lat,lng
    /[?&]q=(-?\d+\.\d+)[,%2C]+(-?\d+\.\d+)/i,         // ?q=lat,lng o ?q=lat%2Clng
    /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/,               // ll=lat,lng
    /\/search\/(-?\d+\.\d+)[,+\s]+(-?\d+\.\d+)/,      // /search/lat,lng
  ]
  for (const re of patterns) {
    const m = trimmed.match(re)
    if (m) {
      const lat = parseFloat(m[1]), lng = parseFloat(m[2])
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng }
    }
  }

  // Coordenadas sueltas: "-31.9809, -64.5594" o "-31.9809 -64.5594"
  const parts = trimmed.split(/[,\s]+/).filter(Boolean)
  if (parts.length >= 2) {
    const lat = parseFloat(parts[0]), lng = parseFloat(parts[1])
    if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng }
    }
  }

  return null
}
