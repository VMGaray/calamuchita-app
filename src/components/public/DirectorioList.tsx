"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import { useScrollLock } from "@/lib/hooks/useScrollLock"
import { useLocalidad } from "@/lib/context/LocalidadContext"
import AnimateIn from "@/components/ui/AnimateIn"
import Card3D from "@/components/ui/Card3D"
import { SkeletonBusinessGrid } from "@/components/ui/Skeleton"
import { createClient } from "@/lib/supabase/client"
import { sectionCategories, SectionKey } from "@/lib/sections"
import { Phone, AtSign, MapPin, X, LayoutGrid, Check, ChevronLeft, ChevronRight, Star } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Business {
  id: string
  name: string
  slug: string
  subcategory: string | null
  address: string | null
  pueblo: string | null
  phone: string | null
  instagram: string | null
  logo_url: string | null
  cover_url: string | null
  description: string | null
  is_premium: boolean
  is_featured_rubro: boolean
  medical_specialties: string[] | null
}

interface Props {
  section: SectionKey
  filters: { cat?: string; q?: string; pueblo?: string }
}

const PAGE_SIZE = 12

const pueblos = [
  "Villa General Belgrano",
  "Los Reartes",
  "Santa Rosa de Calamuchita",
  "La Cumbrecita",
  "Yacanto",
  "Amboy",
  "Villa Ciudad de América",
  "Embalse",
  "Villa del Dique",
  "Villa Rumipal",
  "San Agustín",
  "Intiyaco",
  "El Durazno",
  "Potrero de Garay",
  "Villa Alpina",
  "Villa Berna",
  "Villa Ciudad Parque",
  "La Cruz",
]

const PUEBLO_SHORT: Record<string, string> = {
  "Villa General Belgrano": "VGB",
  "Santa Rosa de Calamuchita": "Santa Rosa",
  "Villa Ciudad de América": "V. Cd. Amé.",
  "Villa Ciudad Parque": "V. Cd. Parque",
}

const maskFade = {
  WebkitMaskImage: "linear-gradient(to right, black 80%, transparent 100%)",
  maskImage: "linear-gradient(to right, black 80%, transparent 100%)",
  paddingBottom: "2px",
}

// ─── Drawer de fondo crema ───────────────────────────────────────────────────
const creamSheet = {
  background: "#E1DBC9",
  borderTop: "2px solid rgba(45,69,48,0.18)",
  maxHeight: "75vh",
  display: "flex" as const,
  flexDirection: "column" as const,
}

function DrawerHandle() {
  return (
    <div className="flex justify-center pt-3 flex-shrink-0">
      <div className="w-10 h-1 rounded-full" style={{ background: "rgba(45,69,48,0.25)" }} />
    </div>
  )
}

interface DrawerHeaderProps {
  icon: React.ReactNode
  title: string
  onClose: () => void
}
function DrawerHeader({ icon, title, onClose }: DrawerHeaderProps) {
  return (
    <>
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span style={{ color: "#2D4530" }}>{icon}</span>
          <p className="text-base font-semibold" style={{ color: "#2D4530" }}>{title}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full"
          style={{ background: "rgba(45,69,48,0.08)" }}
        >
          <X size={18} style={{ color: "rgba(45,69,48,0.55)" }} />
        </button>
      </div>
      <div className="mx-5 flex-shrink-0" style={{ height: 1, background: "rgba(45,69,48,0.15)" }} />
    </>
  )
}

// ─── Etiqueta de sección con icono ───────────────────────────────────────────
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <span style={{ color: "rgba(225,219,201,0.65)" }}>{icon}</span>
      <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(225,219,201,0.65)" }}>
        {label}
      </span>
    </div>
  )
}

// ─── Botón "Ver todos" ───────────────────────────────────────────────────────
function VerTodosBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap"
      style={{
        background: "rgba(45,69,48,0.70)",
        color: "#E1DBC9",
        border: "1px solid rgba(163,177,138,0.30)",
      }}
    >
      + Ver todas
    </button>
  )
}

// Detecta si un negocio no tiene pueblo asignado en su dirección.
// Un negocio sin pueblo debe aparecer en cualquier localidad seleccionada.
function hasNoPueblo(address: string | null): boolean {
  if (!address) return true
  const lower = address.toLowerCase()
  return !pueblos.some(p => lower.includes(p.toLowerCase()))
}

export default function DirectorioList({ section, filters }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { localidad, setLocalidad, hydrated } = useLocalidad()
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(filters.q || "")
  const [showPueblos, setShowPueblos] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [mounted, setMounted] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setAtStart(el.scrollLeft <= 4)
    setAtEnd(el.scrollLeft >= el.scrollWidth - el.clientWidth - 4)
  }

  const scrollBy = (ref: React.RefObject<HTMLDivElement | null>, dir: "left" | "right") => {
    const el = ref.current
    if (!el) return
    const cardWidth = el.clientWidth * 0.82 + 16
    el.scrollBy({ left: dir === "left" ? -cardWidth : cardWidth, behavior: "smooth" })
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener("scroll", checkScroll, { passive: true })
    return () => el.removeEventListener("scroll", checkScroll)
  }, [businesses])

  const categories = sectionCategories[section] || []
  const activeCategory = filters.cat || ""

  useScrollLock(showPueblos || showCategories)
  useEffect(() => { setMounted(true) }, [])

  // Al entrar sin pueblo en la URL, aplicar la localidad global como filtro inicial.
  // Depende de [hydrated, localidad] para: (a) esperar la lectura de localStorage antes
  // de actuar, y (b) reaccionar si la localidad cambia mientras el componente está montado.
  useEffect(() => {
    if (!hydrated) return
    if (!filters.pueblo && localidad) {
      const current = new URLSearchParams(searchParams.toString())
      current.set("pueblo", localidad)
      router.replace(`/directorio/${section}?${current.toString()}`, { scroll: false })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, localidad])

  // Fetch sin filtro de pueblo — el filtro de pueblo se aplica client-side
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from("businesses")
        .select("id, name, slug, subcategory, address, pueblo, phone, whatsapp, instagram, logo_url, cover_url, description, is_premium, is_featured_rubro, medical_specialties")
        .eq("status", "active")
        .eq("section", section)

      if (activeCategory && activeCategory !== "varios") {
        const catLabel = (sectionCategories[section] ?? []).find(c => {
          const key = c.href.includes("cat=") ? c.href.split("cat=")[1] : ""
          return key === activeCategory
        })?.label ?? activeCategory
        query = query.or(`subcategory.ilike.%${catLabel}%,categories.cs.{"${catLabel}"}`)
      }
      if (filters.q) query = query.ilike("name", `%${filters.q}%`)

      const { data } = await query
        .order("is_premium", { ascending: false })
        .order("is_featured_rubro", { ascending: false })
        .order("name")
      setAllBusinesses(data || [])
      setLoading(false)
    }
    fetchBusinesses()
  }, [section, activeCategory, filters.q])

  // Filtro de pueblo client-side
  useEffect(() => {
    const pueblosFilter = filters.pueblo ? filters.pueblo.split(',').filter(Boolean) : []
    if (pueblosFilter.length === 0) {
      setBusinesses(allBusinesses)
      return
    }
    setBusinesses(
      allBusinesses.filter(b => {
        // Columna pueblo explícita (registros nuevos o con backfill)
        if (b.pueblo) {
          return pueblosFilter.some(p => b.pueblo!.toLowerCase() === p.toLowerCase())
        }
        // Fallback: buscar en address; si la dirección existe pero no tiene pueblo → excluir
        if (b.address?.trim()) {
          return pueblosFilter.some(p =>
            b.address!.toLowerCase().includes(p.toLowerCase())
          )
        }
        // Sin dirección ni pueblo: servicio genuinamente global → incluir siempre
        return true
      })
    )
  }, [allBusinesses, filters.pueblo])

  // Reinicia la paginación cada vez que cambia el resultado filtrado
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [businesses])

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (!loading && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [loading])

  const updateFilter = (key: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString())
    if (value) current.set(key, value)
    else current.delete(key)
    router.push(`/directorio/${section}?${current.toString()}`)
  }

  const selectedPueblos = filters.pueblo ? filters.pueblo.split(',').filter(Boolean) : []

  const togglePueblo = (pueblo: string) => {
    const set = new Set(selectedPueblos)
    if (set.has(pueblo)) set.delete(pueblo)
    else set.add(pueblo)
    const next = Array.from(set)
    updateFilter("pueblo", next.join(','))
    if (next.length === 1) setLocalidad(next[0])
  }

  const clearPueblos = () => updateFilter("pueblo", "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilter("q", search)
  }

  return (
    <div>
      {/* Búsqueda */}
      <form onSubmit={handleSearch} className="mb-5">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="flex-1 rounded-2xl px-5 py-3 text-sm outline-none placeholder:text-white/40"
            style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.20)",
              color: "#E1DBC9",
            }}
          />
          <button
            type="submit"
            className="px-5 py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: "#2D4530", color: "#E1DBC9" }}
          >
            Buscar
          </button>
        </div>
      </form>

      {/* ── Localidad ── */}
      <SectionLabel icon={<MapPin size={11} />} label="Localidad" />
      <div className="flex items-center gap-2 mb-5">
        <div
          className="flex-1 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={maskFade}
        >
          <button
            onClick={clearPueblos}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-shadow"
            style={
              selectedPueblos.length === 0
                ? { background: "#2D4530", color: "#E1DBC9", boxShadow: "0 4px 14px rgba(45,69,48,0.35)" }
                : { background: "#E1DBC9", color: "#2D4530" }
            }
          >
            Todas
          </button>
          {pueblos.map(p => (
            <button
              key={p}
              onClick={() => togglePueblo(p)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-shadow"
              style={
                selectedPueblos.includes(p)
                  ? { background: "#2D4530", color: "#E1DBC9", boxShadow: "0 4px 14px rgba(45,69,48,0.35)" }
                  : { background: "#E1DBC9", color: "#2D4530" }
              }
            >
              {PUEBLO_SHORT[p] ?? p}
            </button>
          ))}
        </div>
        <VerTodosBtn onClick={() => setShowPueblos(true)} />
      </div>

      {/* ── Subcategoría ── */}
      <SectionLabel icon={<LayoutGrid size={11} />} label="Categoría" />
      <div className="flex items-center gap-2 mb-6">
        <div
          className="flex-1 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={maskFade}
        >
          {categories.map(({ label, href }) => {
            const catKey = href.includes("cat=") ? href.split("cat=")[1] : ""
            const isActive = activeCategory === catKey
            return (
              <button
                key={label}
                onClick={() => updateFilter("cat", catKey)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                style={
                  isActive
                    ? { background: "#2D4530", color: "#E1DBC9", border: "1.5px solid #A3B18A", boxShadow: "0 0 12px rgba(163,177,138,0.40)" }
                    : { background: "rgba(45,69,48,0.70)", color: "rgba(225,219,201,0.85)", border: "1px solid rgba(163,177,138,0.15)" }
                }
              >
                {label}
              </button>
            )
          })}
        </div>
        <VerTodosBtn onClick={() => setShowCategories(true)} />
      </div>

      {/* ── Resultados ── */}
      <div ref={resultsRef} className="scroll-mt-28">
        {loading ? (
          <SkeletonBusinessGrid count={6} />
        ) : businesses.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <p className="text-sm" style={{ color: "rgba(225,219,201,0.65)" }}>
              No encontramos negocios con esos filtros.
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs mb-4 font-medium" style={{ color: "rgba(255,255,255,0.60)" }}>
              Mostrando {Math.min(visibleCount, businesses.length)} de {businesses.length} resultado{businesses.length !== 1 ? "s" : ""}
            </p>

            {/* Carrusel en mobile, grilla en desktop */}
            <div className="relative">
              {businesses.length > 1 && (
                <>
                  <button
                    onClick={() => scrollBy(scrollRef, "left")}
                    className="md:hidden absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-opacity duration-200"
                    style={{ background: "rgba(45,69,48,0.85)", border: "1px solid rgba(163,177,138,0.4)", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", opacity: atStart ? 0 : 1, pointerEvents: atStart ? "none" : "auto" }}
                    aria-label="Anterior"
                  >
                    <ChevronLeft size={16} color="#E1DBC9" />
                  </button>
                  <button
                    onClick={() => scrollBy(scrollRef, "right")}
                    className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-opacity duration-200"
                    style={{ background: "rgba(45,69,48,0.85)", border: "1px solid rgba(163,177,138,0.4)", boxShadow: "0 2px 12px rgba(0,0,0,0.3)", opacity: atEnd ? 0 : 1, pointerEvents: atEnd ? "none" : "auto" }}
                    aria-label="Siguiente"
                  >
                    <ChevronRight size={16} color="#E1DBC9" />
                  </button>
                </>
              )}
            <div ref={scrollRef} className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-4 px-4 pb-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:pb-0 md:gap-5">
              {businesses.slice(0, visibleCount).map((business, i) => (
                <AnimateIn
                  key={business.id}
                  direction="up"
                  delay={i * 0.05}
                  className="w-[82vw] flex-shrink-0 snap-center md:w-auto"
                >
                  <Link
                    href={`/directorio/${section}/${business.slug}`}
                    className="block rounded-2xl overflow-hidden shadow-sm transition-shadow hover:shadow-md"
                    style={{ background: "#FFFFFF", border: "1px solid rgba(45,69,48,0.09)" }}
                  >
                    {/* ── Image area ── */}
                    <div className="relative overflow-hidden aspect-[4/3] bg-stone-50">
                      {(business.is_premium || business.is_featured_rubro) && (
                        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1.5">
                          {business.is_premium && (
                            <div
                              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight"
                              style={{ background: "#C9A44B", color: "#1a1a1a" }}
                            >
                              ★ Destacado
                            </div>
                          )}
                          {business.is_featured_rubro && (
                            <div
                              className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                              style={{ background: "#3b82f6", color: "white" }}
                            >
                              <Star size={10} fill="currentColor" />
                              Destacado
                            </div>
                          )}
                        </div>
                      )}
                      {business.cover_url ? (
                        <Image
                          src={business.cover_url}
                          alt={business.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 82vw, (max-width: 1024px) 50vw, 33vw"
                          quality={70}
                        />
                      ) : business.logo_url ? (
                        <div className="w-full h-full bg-white flex items-center justify-center p-5">
                          <div className="relative w-full h-full">
                            <Image
                              src={business.logo_url}
                              alt={business.name}
                              fill
                              className="object-contain"
                              sizes="(max-width: 768px) 82vw, (max-width: 1024px) 50vw, 33vw"
                              quality={80}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ background: "#E1DBC9" }}>
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-serif text-2xl font-bold"
                            style={{ background: "#2D4530", color: "#E1DBC9" }}>
                            {business.name[0]}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ── Text area — cream background ── */}
                    <div className="px-4 pt-3.5 pb-4" style={{ background: "#F5EFE3" }}>
                      <h3 className="text-sm font-bold leading-snug mb-1.5 line-clamp-2"
                        style={{ color: "#2D4530" }}>
                        {business.name}
                      </h3>

                      {/* min-h-[24px] reserva la fila de badge aunque subcategory sea null */}
                      <div className="min-h-[24px]">
                        {(section === "health"
                          ? (business.medical_specialties?.[0] ?? business.subcategory)
                          : business.subcategory
                        ) && (
                          <span
                            className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide"
                            style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}
                          >
                            {section === "health"
                              ? (business.medical_specialties?.[0] ?? business.subcategory)
                              : business.subcategory}
                          </span>
                        )}
                      </div>

                      {/* min-h-[32px] reserva espacio para descripción cuando es null */}
                      <div className="min-h-[32px]">
                        {business.description && (
                          <p className="text-xs mb-2.5 leading-relaxed line-clamp-2"
                            style={{ color: "rgba(45,69,48,0.60)" }}>
                            {business.description}
                          </p>
                        )}
                      </div>

                      {/* separador condicional seguro: solo agrega coma si address existe */}
                      {business.address && (
                        <div className="flex items-center gap-1.5 text-xs mb-3"
                          style={{ color: "rgba(45,69,48,0.50)" }}>
                          <MapPin size={11} className="flex-shrink-0" />
                          <span className="truncate">{business.address}</span>
                        </div>
                      )}

                      <div
                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold"
                        style={{ background: "#2D4530", color: "#E1DBC9" }}
                      >
                        <span>Ver más</span>
                        <ChevronRight size={13} />
                      </div>
                    </div>
                  </Link>
                </AnimateIn>
              ))}
            </div>
            </div>{/* /relative wrapper */}

            {/* ── Paginación: cargar más ── */}
            <div className="flex flex-col items-center mt-6">
              {visibleCount < businesses.length ? (
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
          </>
        )}
      </div>

      {/* ── Portals ── */}
      {mounted && createPortal(
        <AnimatePresence>
          {/* Drawer Localidades */}
          {showPueblos && (
            <>
              <motion.div className="fixed inset-0" style={{ zIndex: 100, background: "rgba(0,0,0,0.45)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowPueblos(false)} />
              <motion.div className="fixed bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden" style={{ zIndex: 101, ...creamSheet }}
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 320 }}>
                <DrawerHandle />
                <DrawerHeader icon={<MapPin size={16} />} title="Localidades" onClose={() => setShowPueblos(false)} />
                <div className="overflow-y-auto flex-1 py-2">
                  <button
                    onClick={() => { clearPueblos(); setShowPueblos(false) }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors"
                    style={selectedPueblos.length === 0 ? { background: "rgba(45,69,48,0.08)" } : undefined}
                  >
                    <MapPin size={13} style={{ color: selectedPueblos.length === 0 ? "#2D4530" : "rgba(45,69,48,0.30)", flexShrink: 0 }} />
                    <span className="text-sm flex-1" style={{ color: selectedPueblos.length === 0 ? "#2D4530" : "rgba(45,69,48,0.65)", fontWeight: selectedPueblos.length === 0 ? 600 : 400 }}>
                      Todas las localidades
                    </span>
                    {selectedPueblos.length === 0 && <Check size={14} style={{ color: "#2D4530", flexShrink: 0 }} />}
                  </button>
                  {pueblos.map(p => {
                    const isActive = selectedPueblos.includes(p)
                    return (
                      <button
                        key={p}
                        onClick={() => togglePueblo(p)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors"
                        style={isActive ? { background: "rgba(45,69,48,0.08)" } : undefined}
                      >
                        <MapPin size={13} style={{ color: isActive ? "#2D4530" : "rgba(45,69,48,0.30)", flexShrink: 0 }} />
                        <span className="text-sm flex-1" style={{ color: isActive ? "#2D4530" : "rgba(45,69,48,0.65)", fontWeight: isActive ? 600 : 400 }}>
                          {p}
                        </span>
                        {isActive && <Check size={14} style={{ color: "#2D4530", flexShrink: 0 }} />}
                      </button>
                    )
                  })}
                </div>
                <div className="px-5 pb-5 pt-2 flex-shrink-0">
                  <button
                    onClick={() => setShowPueblos(false)}
                    className="w-full py-3 rounded-2xl text-sm font-semibold"
                    style={{ background: "#2D4530", color: "#E1DBC9" }}
                  >
                    {selectedPueblos.length > 0
                      ? `Aplicar (${selectedPueblos.length} localidad${selectedPueblos.length > 1 ? 'es' : ''})`
                      : 'Cerrar'}
                  </button>
                </div>
              </motion.div>
            </>
          )}

          {/* Drawer Subcategorías */}
          {showCategories && (
            <>
              <motion.div className="fixed inset-0" style={{ zIndex: 100, background: "rgba(0,0,0,0.45)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setShowCategories(false)} />
              <motion.div className="fixed bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden" style={{ zIndex: 101, ...creamSheet }}
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 320 }}>
                <DrawerHandle />
                <DrawerHeader icon={<LayoutGrid size={16} />} title="Subcategorías" onClose={() => setShowCategories(false)} />
                <div className="overflow-y-auto flex-1 py-2">
                  {categories.map(({ label, href, desc }) => {
                    const catKey = href.includes("cat=") ? href.split("cat=")[1] : ""
                    const isActive = activeCategory === catKey
                    return (
                      <button
                        key={label}
                        onClick={() => { updateFilter("cat", catKey); setShowCategories(false) }}
                        className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors"
                        style={isActive ? { background: "rgba(45,69,48,0.08)" } : undefined}
                      >
                        <LayoutGrid size={14} style={{ color: isActive ? "#2D4530" : "rgba(45,69,48,0.30)", flexShrink: 0 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm" style={{ color: isActive ? "#2D4530" : "rgba(45,69,48,0.75)", fontWeight: isActive ? 600 : 400 }}>
                            {label}
                          </p>
                          {desc && (
                            <p className="text-xs mt-0.5" style={{ color: "rgba(45,69,48,0.45)" }}>
                              {desc}
                            </p>
                          )}
                        </div>
                        {isActive && <Check size={14} style={{ color: "#2D4530", flexShrink: 0 }} />}
                      </button>
                    )
                  })}
                </div>
                <div className="h-6 flex-shrink-0" />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
