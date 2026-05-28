"use client"

import { useState, useEffect, useRef } from "react"
import AnimateIn from "@/components/ui/AnimateIn"
import Card3D from "@/components/ui/Card3D"
import { SkeletonBusinessGrid } from "@/components/ui/Skeleton"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

type BusinessHour = {
  day_of_week: number
  opens_at: string
  closes_at: string
  is_closed: boolean
}

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
}

interface Props {
  params: { categoria?: string; abierto?: string; delivery?: string; takeaway?: string; q?: string }
}

const categoryLabel: Record<string, string> = {
  restaurant: "Restaurante",
  cafe: "Café",
  viandas: "Viandas",
  bar: "Bar",
  other: "Gastronomía",
}

/**
 * Calcula si un negocio está abierto en este momento basándose en sus horarios.
 * Usa el campo manual `is_open` como fallback si no hay horarios configurados.
 */
function calcIsOpen(hours: BusinessHour[], fallback: boolean): boolean {
  if (!hours || hours.length === 0) return fallback
  const now = new Date()
  const day = now.getDay() // 0=Domingo … 6=Sábado
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  const today = hours.find(h => h.day_of_week === day)
  if (!today || today.is_closed) return false
  return hhmm >= today.opens_at.slice(0, 5) && hhmm <= today.closes_at.slice(0, 5)
}

export default function NegociosList({ params }: Props) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    return () => el.removeEventListener("scroll", checkScroll)
  }, [businesses])

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.clientWidth * 0.88 + 16
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" })
  }

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true)
      const supabase = createClient()

      let query = supabase
        .from("businesses")
        .select("id, name, slug, category, subcategory, address, logo_url, cover_url, is_open, offers_delivery, offers_takeaway, description, is_premium, business_hours(day_of_week, opens_at, closes_at, is_closed)")
        .eq("status", "active")
        .eq("section", "gastronomy")

      if (params.categoria) query = query.eq("category", params.categoria)
      // "abierto" ya NO filtra en DB — lo calculamos cliente con los horarios reales
      if (params.delivery === "true") query = query.eq("offers_delivery", true)
      if (params.takeaway === "true") query = query.eq("offers_takeaway", true)
      if (params.q) query = query.ilike("name", `%${params.q}%`)

      const { data } = await query
        .order("is_premium", { ascending: false })
        .order("name")
      let result = (data || []) as Business[]

      // Filtro "Abierto ahora" calculado desde los horarios reales
      if (params.abierto === "true") {
        result = result.filter(b => calcIsOpen(b.business_hours, b.is_open))
      }

      setBusinesses(result)
      setLoading(false)
    }

    fetchBusinesses()
  }, [params.categoria, params.abierto, params.delivery, params.takeaway, params.q])

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

  return (
    <div ref={resultsRef} className="scroll-mt-28">
      <p className="text-xs mb-4 font-medium" style={{ color: "rgba(255,255,255,0.60)" }}>
        {businesses.length} resultado{businesses.length !== 1 ? "s" : ""}
      </p>

      {/* Wrapper relativo solo en mobile para posicionar las flechas */}
      <div className="relative">
        {businesses.length > 1 && (
          <>
            <button
              onClick={() => scrollBy("left")}
              className="md:hidden absolute left-0 top-[calc(50%-24px)] -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-opacity duration-200"
              style={{
                background: "rgba(45,69,48,0.85)",
                border: "1px solid rgba(163,177,138,0.4)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                opacity: atStart ? 0 : 1,
                pointerEvents: atStart ? "none" : "auto",
              }}
              aria-label="Anterior"
            >
              <ChevronLeft size={16} color="#E1DBC9" />
            </button>
            <button
              onClick={() => scrollBy("right")}
              className="md:hidden absolute right-0 top-[calc(50%-24px)] -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-opacity duration-200"
              style={{
                background: "rgba(45,69,48,0.85)",
                border: "1px solid rgba(163,177,138,0.4)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                opacity: atEnd ? 0 : 1,
                pointerEvents: atEnd ? "none" : "auto",
              }}
              aria-label="Siguiente"
            >
              <ChevronRight size={16} color="#E1DBC9" />
            </button>
          </>
        )}

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-4 px-4 pb-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:pb-0">
        {businesses.map((biz, i) => {
          const { id, name, slug, category, subcategory, address, cover_url, is_open, offers_delivery, offers_takeaway, description, business_hours, is_premium } = biz
          const isOpen = calcIsOpen(business_hours, is_open)

          return (
            <AnimateIn key={id} direction="up" delay={i * 0.07} className="w-[88vw] flex-shrink-0 snap-center md:w-auto">
              <Card3D>
                <Link href={`/negocios/${slug}`} className="block h-full">
                  <div
                    className="rounded-2xl overflow-hidden h-full"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.20)",
                    }}
                  >
                    {/* Cover */}
                    <div className="h-52 md:h-36 relative" style={{ background: "rgba(255,255,255,0.08)" }}>
                      {is_premium && (
                        <div
                          className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight"
                          style={{ background: "#C9A44B", color: "#1a1a1a" }}
                        >
                          ★ Destacado
                        </div>
                      )}
                      {cover_url ? (
                        <Image src={cover_url} alt={name} fill className="object-cover" sizes="(max-width: 768px) 88vw, (max-width: 1024px) 50vw, 33vw" quality={70} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-xl"
                            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.50)" }}
                          >
                            {name[0]}
                          </div>
                        </div>
                      )}
                      {isOpen && (
                        <span className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: "rgba(74,255,128,0.20)", color: "#6ee7a0" }}>
                          Abierto
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-base font-medium mb-1" style={{ color: "#E1DBC9" }}>{name}</h3>
                      <p className="text-xs mb-2" style={{ color: "rgba(225,219,201,0.65)" }}>
                        {category ? categoryLabel[category] : subcategory || "Gastronomía"}
                        {address && ` · ${address.split(",").pop()?.trim()}`}
                      </p>
                      {description && (
                        <p className="text-sm mb-3 leading-relaxed line-clamp-2" style={{ color: "rgba(225,219,201,0.75)" }}>
                          {description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 flex-wrap mb-3">
                        {!isOpen && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.10)", color: "rgba(225,219,201,0.50)" }}>
                            Cerrado
                          </span>
                        )}
                        {offers_delivery && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.15)", color: "rgba(225,219,201,0.85)" }}>
                            Delivery
                          </span>
                        )}
                        {offers_takeaway && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(255,255,255,0.15)", color: "rgba(225,219,201,0.85)" }}>
                            Take Away
                          </span>
                        )}
                      </div>
                      <div
                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold"
                        style={{
                          background: "rgba(45,69,48,0.55)",
                          color: "#E1DBC9",
                          border: "1px solid rgba(163,177,138,0.25)",
                        }}
                      >
                        <span>Ver más</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  </div>
                </Link>
              </Card3D>
            </AnimateIn>
          )
        })}
      </div>
      </div>
    </div>
  )
}
