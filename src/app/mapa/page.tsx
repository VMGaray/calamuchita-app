"use client"

import React, { useState, useEffect } from 'react'
import Map, { Marker, NavigationControl, Popup, ViewStateChangeEvent } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useGeolocation } from "@/lib/hooks/useGeolocation"
import { createClient } from "@/lib/supabase/client"
import { MapPin, Utensils, Info, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

export default function GeneralMapPage() {
  const { location, loading: geoLoading } = useGeolocation()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null)
  const [viewState, setViewState] = useState({
    latitude: -31.9791, // Centro aproximado de Villa General Belgrano
    longitude: -64.5622,
    zoom: 13
  })

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

  if (geoLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#E1DBC9]/20">
      <p className="font-serif text-brand-pine animate-pulse text-lg">Ubicando comercios en el Valle...</p>
    </div>
  )

  return (
    <div className="h-[calc(100vh-80px)] w-full relative">
      <Map
        {...viewState}
        onMove={(evt: ViewStateChangeEvent) => setViewState(evt.viewState)}
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

        {/* Marcadores de los Comercios */}
        {businesses.map(b => (
          <Marker 
            key={b.id} 
            latitude={b.latitude} 
            longitude={b.longitude} 
            anchor="bottom"
            onClick={(e: { originalEvent: MouseEvent }) => {
              e.originalEvent.stopPropagation();
              setSelectedBusiness(b);
            }}
          >
            <div className="cursor-pointer group">
              <div className="bg-brand-pine text-white p-2 rounded-full shadow-lg group-hover:bg-brand-olive transition-colors border-2 border-white">
                {b.section === 'gastronomy' ? <Utensils size={16} /> : <MapPin size={16} />}
              </div>
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white shadow-sm" />
            </div>
          </Marker>
        ))}

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