"use client"

import { useState } from "react"
import Map, { Marker, NavigationControl, MapMouseEvent, MarkerDragEvent } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import { MapPin, Search, LocateFixed, Loader2 } from "lucide-react"
import { LatLng, VALLE_CENTER, geocodeAddress, isShortMapsUrl, parseManualCoords } from "@/lib/geocoding"

interface Props {
  value: LatLng | null
  onChange: (coords: LatLng | null) => void
  /** Dirección completa (calle y pueblo) para "Ubicar desde la dirección" */
  address: string
}

export default function UbicacionPicker({ value, onChange, address }: Props) {
  const [viewState, setViewState] = useState({
    latitude: value?.lat ?? VALLE_CENTER.lat,
    longitude: value?.lng ?? VALLE_CENTER.lng,
    zoom: value ? 16 : 12,
  })
  const [busy, setBusy] = useState<"geocode" | "gps" | null>(null)
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [manualInput, setManualInput] = useState("")

  const place = (coords: LatLng, zoom = 16) => {
    onChange(coords)
    setViewState({ latitude: coords.lat, longitude: coords.lng, zoom })
  }

  const handleGeocode = async () => {
    if (!address.trim()) {
      setMessage({ type: "error", text: "Primero completá la dirección y el pueblo." })
      return
    }
    setBusy("geocode")
    setMessage(null)
    const coords = await geocodeAddress(address)
    setBusy(null)
    if (coords) {
      place(coords)
      setMessage({ type: "ok", text: "Encontramos la dirección. Revisá que el pin esté sobre tu local y movelo si hace falta." })
    } else {
      setMessage({ type: "error", text: "No encontramos esa dirección. Marcá el punto tocando el mapa." })
    }
  }

  const handleGps = () => {
    if (!navigator.geolocation) {
      setMessage({ type: "error", text: "Tu navegador no permite obtener la ubicación." })
      return
    }
    setBusy("gps")
    setMessage(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setBusy(null)
        place({ lat: pos.coords.latitude, lng: pos.coords.longitude }, 17)
        setMessage({ type: "ok", text: "Usamos tu ubicación actual. Sirve si estás dentro del local." })
      },
      () => {
        setBusy(null)
        setMessage({ type: "error", text: "No pudimos obtener tu ubicación. Revisá los permisos del navegador." })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const manualCoords = parseManualCoords(manualInput)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGeocode}
          disabled={busy !== null}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium disabled:opacity-50"
          style={{ background: "#2D4530", color: "white" }}
        >
          {busy === "geocode" ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          Ubicar desde la dirección
        </button>
        <button
          type="button"
          onClick={handleGps}
          disabled={busy !== null}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-stone-200 text-stone-600 hover:border-stone-300 disabled:opacity-50"
        >
          {busy === "gps" ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
          Estoy en el local
        </button>
      </div>

      <div className="relative h-64 rounded-xl overflow-hidden border border-stone-200">
        <Map
          {...viewState}
          onMove={e => setViewState(e.viewState)}
          onClick={(e: MapMouseEvent) => onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          cooperativeGestures
        >
          <NavigationControl position="bottom-right" showCompass={false} />
          {value && (
            <Marker
              latitude={value.lat}
              longitude={value.lng}
              anchor="bottom"
              draggable
              onDragEnd={(e: MarkerDragEvent) => onChange({ lat: e.lngLat.lat, lng: e.lngLat.lng })}
            >
              <MapPin size={34} fill="#2D4530" color="white" strokeWidth={1.5} />
            </Marker>
          )}
        </Map>
        {!value && (
          <div className="absolute top-2 left-2 right-2 pointer-events-none">
            <p className="text-xs bg-white/90 text-stone-600 px-3 py-2 rounded-lg shadow-sm">
              Tocá el mapa en el lugar de tu local para marcarlo.
            </p>
          </div>
        )}
      </div>

      {message && (
        <p className={`text-xs ${message.type === "ok" ? "text-green-600" : "text-red-500"}`}>{message.text}</p>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-stone-400">
          {value
            ? `Ubicación marcada · podés arrastrar el pin para ajustarla`
            : "Sin ubicación: tu local no aparece en el mapa del Valle"}
        </p>
        {value && (
          <button
            type="button"
            onClick={() => { onChange(null); setMessage(null) }}
            className="text-xs text-stone-400 hover:text-red-500 flex-shrink-0"
          >
            Quitar ubicación
          </button>
        )}
      </div>

      {/* Opción avanzada: pegar coordenadas o link largo de Google Maps */}
      <div>
        <button
          type="button"
          onClick={() => setShowManual(s => !s)}
          className="text-xs text-stone-500 underline underline-offset-2"
        >
          {showManual ? "Ocultar" : "Prefiero pegar coordenadas o un link de Google Maps"}
        </button>
        {showManual && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={e => setManualInput(e.target.value)}
              placeholder="-31.9809, -64.5594 o link de Google Maps"
              className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
            />
            <button
              type="button"
              disabled={!manualCoords}
              onClick={() => {
                if (!manualCoords) return
                place(manualCoords)
                setManualInput("")
                setShowManual(false)
                setMessage({ type: "ok", text: "Ubicación cargada. Revisá el pin en el mapa." })
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium disabled:opacity-40"
              style={{ background: "#2D4530", color: "white" }}
            >
              Usar
            </button>
          </div>
        )}
        {showManual && manualInput && !manualCoords && (
          <p className="text-xs text-amber-600 mt-1">
            {isShortMapsUrl(manualInput)
              ? "Es un link corto. Abrilo en el navegador, copiá el link de la barra de dirección y pegalo acá."
              : "Formato no reconocido. Pegá las coordenadas (-31.9809, -64.5594) o el link completo de Google Maps."}
          </p>
        )}
      </div>
    </div>
  )
}
