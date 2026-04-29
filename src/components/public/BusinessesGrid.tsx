"use client"

import { useState, useEffect } from "react"
import AnimateIn from "@/components/ui/AnimateIn"
import Card3D from "@/components/ui/Card3D"
import { SkeletonBusinessGrid } from "@/components/ui/Skeleton"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"

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
}

export default function BusinessesGrid() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBusinesses = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("businesses")
        .select("id, name, slug, category, subcategory, section, address, logo_url, cover_url, is_open, offers_delivery, offers_takeaway")
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
          <h2 className="font-serif text-2xl text-stone-900">Abiertos ahora</h2>
          <Link href="/negocios" className="text-sm text-primary-500 font-medium hover:text-primary-600">
            Ver todos
          </Link>
        </div>
      </AnimateIn>

      {loading ? (
        <SkeletonBusinessGrid count={4} />
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <p className="text-stone-400 text-sm">No hay comercios abiertos en este momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {businesses.map((business, i) => (
            <AnimateIn key={business.id} direction="up" delay={i * 0.1}>
              <Card3D className="h-full">
                <Link href={`/negocios/${business.slug}`} className="block h-full">
                  <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 h-full">
                    <div className="h-24 relative bg-primary-100">
                      {business.cover_url ? (
                        <Image
                          src={business.cover_url}
                          alt={business.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/60 rounded-full" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-stone-800 mb-0.5 truncate">{business.name}</h3>
                      <p className="text-xs text-stone-400 mb-2">
                        {business.category ? categoryLabel[business.category] : business.subcategory || "Gastronomía"}
                        {business.address && ` · ${business.address.split(",").pop()?.trim()}`}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-100 text-primary-600">
                          Abierto
                        </span>
                        {business.offers_delivery && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                            Delivery
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </Card3D>
            </AnimateIn>
          ))}
        </div>
      )}
    </div>
  )
}