"use client"

import { useState, useEffect } from "react"
import AnimateIn from "@/components/ui/AnimateIn"
import Card3D from "@/components/ui/Card3D"
import { SkeletonBusinessGrid } from "@/components/ui/Skeleton"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"
import { MapPin } from "lucide-react" // Importamos icono para la distancia
//import { useGeolocation } from "@/lib/hooks/useGeolocation"
import { calculateDistance } from "@/lib/utils/distance"
import { useGeolocation } from "../../lib/hooks/useGeolocation"
interface Business {
  id: string
  name: string
  slug: string
  category: string | null
  subcategory: string | null
  section: string
  address: string | null
  logo_url: string | null
  cover_url: string | null
  is_open: boolean
  offers_delivery: boolean
  offers_takeaway: boolean
  // Agregamos coordenadas a la interfaz
  latitude: number | null
  longitude: number | null
}

export default function BusinessesGrid() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  
  // Obtenemos la ubicación del usuario
  const { location } = useGeolocation()

  useEffect(() => {
    const fetchBusinesses = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("businesses")
        // IMPORTANTE: Agregamos latitude y longitude al select
        .select("id, name, slug, category, subcategory, section, address, logo_url, cover_url, is_open, offers_delivery, offers_takeaway, latitude, longitude")
        .eq("status", "active")
        .eq("section", "gastronomy")
        .eq("is_open", true)
        .limit(4)
      setBusinesses(data || [])
      setLoading(false)
    }
    fetchBusinesses()
  }, [])

  const categoryLabel: Record<string, string> = {
    restaurant: "Restaurante",
    cafe: "Café",
    viandas: "Viandas",
    bar: "Bar",
    other: "Gastronomía",
  }

  return (
    <div className="mb-12">
      <AnimateIn direction="left">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-serif text-2xl text-white tracking-tight">Abiertos ahora</h2>
          <Link href="/negocios" className="text-sm text-primary-300 font-medium hover:text-primary-200">
            Ver todos
          </Link>
        </div>
      </AnimateIn>

      {loading ? (
        <SkeletonBusinessGrid count={4} />
      ) : businesses.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-stone-400 text-sm">No hay comercios abiertos en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {businesses.map((business, i) => {
            // CALCULAMOS LA DISTANCIA PARA ESTE NEGOCIO
            const distance = (location && business.latitude && business.longitude)
              ? calculateDistance(location.latitude, location.longitude, business.latitude, business.longitude)
              : null

            return (
              <AnimateIn key={business.id} direction="up" delay={i * 0.1}>
                <Card3D className="h-full">
                  <Link href={`/negocios/${business.slug}`} className="block h-full">
                    <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 h-full flex flex-col">
                      <div className="h-24 relative bg-brand-pine/10">
                        {business.cover_url ? (
                          <Image
                            src={business.cover_url}
                            alt={business.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                            quality={70}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/60 rounded-full" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-3 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-stone-800 mb-0.5 truncate">{business.name}</h3>
                          <p className="text-[10px] text-stone-400 mb-1 uppercase font-bold tracking-wider">
                            {business.category ? categoryLabel[business.category] : business.subcategory || "Gastronomía"}
                          </p>
                          
                          {/* DISTANCIA (Solo si existe ubicación) */}
                          {distance && (
                            <div className="flex items-center gap-1 text-[10px] text-brand-pine font-bold mb-2">
                              <MapPin size={10} className="fill-brand-pine/20" />
                              <span>a {distance} de vos</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-1 flex-wrap mt-auto">
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-green-100 text-green-700 border border-green-200">
                            Abierto
                          </span>
                          {business.offers_delivery && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-500 border border-stone-200">
                              Delivery
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card3D>
              </AnimateIn>
            )
          })}
        </div>
      )}
    </div>
  )
}