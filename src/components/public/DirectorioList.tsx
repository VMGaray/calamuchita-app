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
import { Phone, AtSign, MapPin, X, LayoutGrid, Check, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Business {
  id: string
  name: string
  slug: string
  subcategory: string | null
  address: string | null
  phone: string | null
  instagram: string | null
  logo_url: string | null
  cover_url: string | null
  description: string | null
}

interface Props {
  section: SectionKey
  filters: { cat?: string; q?: string; pueblo?: string }
}

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

export default function DirectorioList({ section, filters }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setLocalidad } = useLocalidad()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(filters.q || "")
  const [showPueblos, setShowPueblos] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [mounted, setMounted] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const categories = sectionCategories[section] || []
  const activeCategory = filters.cat || ""

  useScrollLock(showPueblos || showCategories)
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from("businesses")
        .select("id, name, slug, subcategory, address, phone, whatsapp, instagram, logo_url, cover_url, description")
        .eq("status", "active")
        .eq("section", section)

      if (activeCategory && activeCategory !== "varios") {
        query = query.ilike("subcategory", `%${activeCategory}%`)
      }
      if (filters.q) query = query.ilike("name", `%${filters.q}%`)
      const pueblosFilter = filters.pueblo ? filters.pueblo.split(',').filter(Boolean) : []
      if (pueblosFilter.length > 0) {
        const orParts = [...pueblosFilter.map(p => `address.ilike.%${p}%`), 'address.is.null'].join(',')
        query = query.or(orParts)
      }

      const { data } = await query.order("name")
      setBusinesses(data || [])
      setLoading(false)
    }
    fetchBusinesses()
  }, [section, activeCategory, filters.q, filters.pueblo])

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
              {businesses.length} resultado{businesses.length !== 1 ? "s" : ""}
            </p>

            {/* Carrusel en mobile, grilla en desktop */}
            <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-4 px-4 pb-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:pb-0 md:gap-5">
              {businesses.map((business, i) => (
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
                    <div className="relative overflow-hidden aspect-[4/3]">
                      {business.cover_url ? (
                        <Image
                          src={business.cover_url}
                          alt={business.name}
                          fill
                          className="object-cover"
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

                      {business.subcategory && (
                        <span
                          className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide"
                          style={{ background: "rgba(45,69,48,0.10)", color: "#2D4530" }}
                        >
                          {business.subcategory}
                        </span>
                      )}

                      {business.description && (
                        <p className="text-xs mb-2.5 leading-relaxed line-clamp-2"
                          style={{ color: "rgba(45,69,48,0.60)" }}>
                          {business.description}
                        </p>
                      )}

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
