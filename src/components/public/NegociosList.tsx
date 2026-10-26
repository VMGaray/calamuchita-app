"use client"

import { useState, useEffect, useRef } from "react"
import AnimateIn from "@/components/ui/AnimateIn"
import { SkeletonBusinessGrid } from "@/components/ui/Skeleton"
import { createClient } from "@/lib/supabase/client"
import BusinessGridCard from "@/components/public/BusinessGridCard"
import { isDietaryKey } from "@/lib/constants/dietary"
import { isOpenNow, type BusinessHour } from "@/lib/utils/horarios"

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
  business_hours: BusinessHour[]
  is_premium: boolean
  is_featured_rubro: boolean
}

interface Props {
  params: { categoria?: string; abierto?: string; delivery?: string; takeaway?: string; q?: string; dieta?: string }
}

const PAGE_SIZE = 12

const categoryLabel: Record<string, string> = {
  restaurant: "Restaurante",
  cafe: "Café",
  bar: "Bar",
  viandas: "Viandas",
  panaderia: "Panadería",
  pasteleria: "Pastelería",
  sushi: "Sushi",
  comida_para_llevar: "Comida para llevar",
  pizzeria: "Pizzería",
  hamburgueseria: "Hamburguesería",
  other: "Gastronomía",
}


export default function NegociosList({ params }: Props) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const resultsRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from("businesses")
        .select("id, name, slug, category, subcategory, address, logo_url, cover_url, is_open, offers_delivery, offers_takeaway, description, is_premium, is_featured_rubro, business_hours(day_of_week, opens_at, closes_at, is_closed)")
        .eq("status", "active")
        .eq("section", "gastronomy")

      if (params.categoria) query = query.or(`category.eq.${params.categoria},categories.cs.{"${params.categoria}"}`)
      // "abierto" ya NO filtra en DB — lo calculamos cliente con los horarios reales
      if (params.delivery === "true") query = query.eq("offers_delivery", true)
      if (params.takeaway === "true") query = query.eq("offers_takeaway", true)
      if (params.q) query = query.ilike("name", `%${params.q}%`)
      const dieta = (params.dieta || "").split(",").filter(isDietaryKey)
      if (dieta.length > 0) query = query.contains("dietary_options", dieta)

      const { data } = await query
        .order("is_premium", { ascending: false })
        .order("is_featured_rubro", { ascending: false })
        .order("name")
      let result = (data || []) as Business[]

      // Filtro "Abierto ahora" calculado desde los horarios reales;
      // sin horarios cargados, se respeta el tilde manual `is_open`
      if (params.abierto === "true") {
        result = result.filter(b => isOpenNow(b.business_hours) ?? b.is_open)
      }

      setBusinesses(result)
      setVisibleCount(PAGE_SIZE)
      setLoading(false)
    }

    fetchBusinesses()
  }, [params.categoria, params.abierto, params.delivery, params.takeaway, params.q, params.dieta])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!loading && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [loading])

  if (loading) return <SkeletonBusinessGrid count={6} />

  if (businesses.length === 0) {
    return (
      <div
        className="text-center py-16 rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.10)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <p className="text-sm" style={{ color: "rgba(225,219,201,0.65)" }}>No encontramos negocios con esos filtros.</p>
      </div>
    )
  }

  const visibleBusinesses = businesses.slice(0, visibleCount)
  const hasMore = visibleCount < businesses.length

  return (
    <div ref={resultsRef} className="scroll-mt-28">
      <p className="text-xs mb-4 font-medium" style={{ color: "rgba(255,255,255,0.60)" }}>
        Mostrando {visibleBusinesses.length} de {businesses.length} resultado{businesses.length !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {visibleBusinesses.map((biz, i) => {
          const { id, name, slug, category, subcategory, address, cover_url, logo_url, business_hours, is_premium, is_featured_rubro } = biz
          const town = address?.split(",").pop()?.trim()

          return (
            <AnimateIn key={id} direction="up" delay={Math.min(i, 8) * 0.04}>
              <BusinessGridCard
                href={`/negocios/${slug}`}
                name={name}
                imageUrl={cover_url || logo_url}
                eyebrow={[category ? categoryLabel[category] : subcategory || "Gastronomía", town].filter(Boolean).join(" · ")}
                isPremium={is_premium}
                isFeaturedRubro={is_featured_rubro}
                isOpen={isOpenNow(business_hours)}
                priority={i < 4}
              />
            </AnimateIn>
          )
        })}
      </div>

      {/* ── Paginación: cargar más ── */}
      <div className="flex flex-col items-center mt-6">
        {hasMore ? (
          <button
            onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
            className="px-6 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#2D4530", color: "#E1DBC9" }}
          >
            Cargar más resultados
          </button>
        ) : businesses.length > PAGE_SIZE ? (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
            Mostraste todos los resultados
          </p>
        ) : null}
      </div>
    </div>
  )
}
