"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Map, { Marker, NavigationControl, Popup, Source, Layer, MapRef, ViewStateChangeEvent, MapMouseEvent, LayerProps } from 'react-map-gl/mapbox'
import type { GeoJSONSource } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useGeolocation } from "@/lib/hooks/useGeolocation"
import { createClient } from "@/lib/supabase/client"
import { MapPin, Info, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const BUSINESSES_SOURCE_ID = "businesses"

// Layers del patrón estándar de Mapbox GL para clustering:
// círculos de cluster (con la cantidad) + círculo para puntos individuales.
const clusterLayer: LayerProps = {
  id: "clusters",
  type: "circle",
  source: BUSINESSES_SOURCE_ID,
  filter: ["has", "point_count"],
  paint: {
    "circle-color": ["step", ["get", "point_count"], "#6B8F70", 10, "#4A6741", 30, "#2D4530"],
    "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 30, 30],
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
  },
}

const clusterCountLayer: LayerProps = {
  id: "cluster-count",
  type: "symbol",
  source: BUSINESSES_SOURCE_ID,
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 13,
  },
  paint: {
    "text-color": "#ffffff",
  },
}

const unclusteredPointLayer: LayerProps = {
  id: "unclustered-point",
  type: "circle",
  source: BUSINESSES_SOURCE_ID,
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#2D4530",
    "circle-radius": 8,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
  },
}

export default function GeneralMapPage() {
  const { location, loading: geoLoading } = useGeolocation()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [viewState, setViewState] = useState({
    latitude: -31.9791, // Centro aproximado de Villa General Belgrano
    longitude: -64.5622,
    zoom: 13
  })
  const mapRef = useRef<MapRef>(null)

  // 1. Cargamos los negocios con coordenadas desde Supabase
  useEffect(() => {
    const fetchLocations = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("businesses")
        .select("id, name, slug, latitude, longitude, logo_url, category, section")
        .not("latitude", "is", null) // Solo los que tienen mapa
        .eq("status", "active")
      
      setBusinesses(data || [])
    }
    fetchLocations()
  }, [])

  // 2. Si el usuario nos da su ubicación, centramos el mapa ahí
  useEffect(() => {
    if (location) {
      setViewState(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        zoom: 14
      }))
    }
  }, [location])

  // GeoJSON derivado de los negocios — lo que consume el Source con cluster: true
  const businessesGeoJSON = useMemo(() => ({
    type: "FeatureCollection" as const,
    features: businesses.map(b => ({
      type: "Feature" as const,
      properties: {
        id: b.id,
        name: b.name,
        slug: b.slug,
        logo_url: b.logo_url,
        category: b.category,
        section: b.section,
      },
      geometry: {
        type: "Point" as const,
        coordinates: [b.longitude, b.latitude],
      },
    })),
  }), [businesses])

  // Click en un cluster → expandimos zoom hasta separarlo. Click en un punto → abrimos el popup.
  const handleMapClick = useCallback((event: MapMouseEvent) => {
    const feature = event.features?.[0]
    if (!feature || feature.geometry.type !== "Point") return
    const [longitude, latitude] = feature.geometry.coordinates

    if (feature.layer?.id === "clusters") {
      const clusterId = feature.properties?.cluster_id
      const source = mapRef.current?.getSource(BUSINESSES_SOURCE_ID) as GeoJSONSource | undefined
      source?.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || zoom == null) return
        setViewState(prev => ({ ...prev, latitude, longitude, zoom }))
      })
      return
    }

    if (feature.layer?.id === "unclustered-point") {
      const props = feature.properties as Record<string, any>
      setSelectedBusiness({ ...props, latitude, longitude })
    }
  }, [])

  if (geoLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#E1DBC9]/20">
      <p className="font-serif text-brand-pine animate-pulse text-lg">Ubicando comercios en el Valle...</p>
    </div>
  )

  return (
    <div className="h-[calc(100vh-80px)] w-full relative">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        interactiveLayerIds={["clusters", "unclustered-point"]}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="bottom-right" />

        {/* Marcador de la posición del Usuario */}
        {location && (
          <Marker latitude={location.latitude} longitude={location.longitude} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="absolute bg-blue-500 w-6 h-6 rounded-full opacity-20 animate-ping" />
              <div className="bg-blue-600 w-4 h-4 rounded-full border-2 border-white shadow-lg z-10" />
            </div>
          </Marker>
        )}

        {/* Comercios agrupados en clusters — patrón estándar de Mapbox GL */}
        <Source
          id={BUSINESSES_SOURCE_ID}
          type="geojson"
          data={businessesGeoJSON}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {/* Ventana de información al hacer clic (Popup) */}
        {selectedBusiness && (
          <Popup
            latitude={selectedBusiness.latitude}
            longitude={selectedBusiness.longitude}
            onClose={() => setSelectedBusiness(null)}
            closeButton={false}
            anchor="bottom"
            offset={40}
            className="z-50"
          >
            <Link 
              href={`/negocios/${selectedBusiness.slug}`}
              className="flex items-center gap-3 p-1 min-w-[180px] group"
            >
              {selectedBusiness.logo_url && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-stone-100">
                  <Image src={selectedBusiness.logo_url} alt={selectedBusiness.name} fill className="object-cover" />
                </div>
              )}
              <div className="flex-grow">
                <p className="text-xs font-bold text-stone-800 leading-tight group-hover:text-brand-pine transition-colors">
                  {selectedBusiness.name}
                </p>
                <p className="text-[10px] text-stone-400 capitalize">{selectedBusiness.category || 'Comercio'}</p>
                <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-brand-pine uppercase tracking-tighter">
                  <Info size={10} />
                  Ver detalle
                </div>
              </div>
            </Link>
          </Popup>
        )}
      </Map>

      {/* Botón flotante para centrar en mi ubicación */}
      {location && (
        <button 
          onClick={() => setViewState(prev => ({ ...prev, latitude: location.latitude, longitude: location.longitude, zoom: 15 }))}
          className="absolute top-4 right-4 bg-white p-3 rounded-full shadow-xl text-brand-pine hover:bg-stone-50 z-10 border border-stone-200"
        >
          <MapPin size={20} />
        </button>
      )}

      {/* Botón flotante para volver atrás */}
<div className="absolute top-4 left-4 z-10">
  <Link 
    href="/"
    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-xl transition-all active:scale-95 group"
    style={{ 
      background: "rgba(45,69,48,0.9)", // Tu verde pino con transparencia
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "#E1DBC9" // El color cremita de tu app
    }}
  >
    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
    <span className="text-sm font-bold uppercase tracking-wider">Volver al inicio</span>
  </Link>
</div>
    </div>
  )
}