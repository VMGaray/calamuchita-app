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
  address: string | null
  logo_url: string | null
  cover_url: string | null
  is_open: boolean
  offers_delivery: boolean
  offers_takeaway: boolean
  description: string | null
}

interface Props {
  params: { categoria?: string; abierto?: string; delivery?: string; q?: string }
}

const categoryLabel: Record<string, string> = {
  restaurant: "Restaurante",
  cafe: "Café",
  viandas: "Viandas",
  bar: "Bar",
  other: "Gastronomía",
}

export default function NegociosList({ params }: Props) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from("businesses")
        .select("id, name, slug, category, subcategory, address, logo_url, cover_url, is_open, offers_delivery, offers_takeaway, description")
        .eq("status", "active")
        .eq("section", "gastronomy")

      if (params.categoria) query = query.eq("category", params.categoria)
      if (params.abierto === "true") query = query.eq("is_open", true)
      if (params.delivery === "true") query = query.eq("offers_delivery", true)
      if (params.q) query = query.ilike("name", `%${params.q}%`)

      const { data } = await query.order("name")
      setBusinesses(data || [])
      setLoading(false)
    }

    fetchBusinesses()
  }, [params.categoria, params.abierto, params.delivery, params.q])

  if (loading) return <SkeletonBusinessGrid count={6} />

  if (businesses.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-stone-400 text-sm">No encontramos negocios con esos filtros.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {businesses.map(({ id, name, slug, category, subcategory, address, logo_url, cover_url, is_open, offers_delivery, description }, i) => (
        <AnimateIn key={id} direction="up" delay={i * 0.07}>
          <Card3D className="h-full">
            <Link href={`/negocios/${slug}`} className="block h-full">
              <div className="bg-white rounded-2xl overflow-hidden border border-stone-200 h-full">
                <div className="h-36 relative bg-brand-pine/10">
                  {cover_url ? (
                    <Image src={cover_url} alt={name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/60 rounded-full" />
                    </div>
                  )}
                  {is_open && (
                    <span className="absolute top-3 right-3 text-xs font-medium px-2 py-1 rounded-full bg-brand-pine/10 text-brand-pine">
                      Abierto
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-medium text-stone-800 mb-1">{name}</h3>
                  <p className="text-xs text-stone-400 mb-2">
                    {category ? categoryLabel[category] : subcategory || "Gastronomía"}
                    {address && ` · ${address.split(",").pop()?.trim()}`}
                  </p>
                  {description && (
                    <p className="text-sm text-stone-500 mb-3 leading-relaxed line-clamp-2">{description}</p>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!is_open && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-stone-100 text-stone-500">
                        Cerrado
                      </span>
                    )}
                    {offers_delivery && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-slate/10 text-brand-slate">
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
  )
}