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
import { Phone, AtSign, MapPin, X, LayoutGrid, Check } from "lucide-react"
import Link from "next/link"

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
      if (filters.pueblo) query = query.ilike("address", `%${filters.pueblo}%`)

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

  const selectPueblo = (pueblo: string) => {
    updateFilter("pueblo", pueblo)
    if (pueblo) setLocalidad(pueblo)
  }

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
            onClick={() => selectPueblo("")}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-shadow"
            style={
              !filters.pueblo
                ? { background: "#2D4530", color: "#E1DBC9", boxShadow: "0 4px 14px rgba(45,69,48,0.35)" }
                : { background: "#E1DBC9", color: "#2D4530" }
            }
          >
            Todos
          </button>
          {pueblos.map(p => (
            <button
              key={p}
              onClick={() => selectPueblo(p)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-shadow"
              style={
                filters.pueblo === p
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
            <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-4 px-4 pb-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:pb-0">
              {businesses.map((business, i) => (
                <AnimateIn
                  key={business.id}
                  direction="up"
                  delay={i * 0.05}
                  className="w-[88vw] flex-shrink-0 snap-center md:w-auto"
                >
                  <Card3D>
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{
                        background: "rgba(255,255,255,0.10)",
                        backdropFilter: "blur(16px)",
                        WebkitBackdropFilter: "blur(16px)",
                        border: "1px solid rgba(255,255,255,0.20)",
                      }}
                    >
                      <Link href={`/directorio/${section}/${business.slug}`} className="block">
                        <div className="h-48 md:h-32 relative" style={{ background: "rgba(255,255,255,0.08)" }}>
                          {business.cover_url ? (
                            <img src={business.cover_url} alt={business.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div
                                className="w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl"
                                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.50)" }}
                              >
                                {business.name[0]}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="px-4 pt-4 pb-2">
                          <h3 className="text-base font-medium mb-0.5" style={{ color: "#E1DBC9" }}>
                            {business.name}
                          </h3>
                          {business.subcategory && (
                            <span
                              className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2"
                              style={{ background: "rgba(255,255,255,0.15)", color: "rgba(225,219,201,0.85)" }}
                            >
                              {business.subcategory}
                            </span>
                          )}
                          {business.description && (
                            <p className="text-sm mb-3 leading-relaxed line-clamp-2" style={{ color: "rgba(225,219,201,0.75)" }}>
                              {business.description}
                            </p>
                          )}
                          {business.address && (
                            <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "rgba(225,219,201,0.55)" }}>
                              <MapPin size={12} />
                              <span>{business.address}</span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="px-4 pb-4 space-y-1">
                        {business.phone && (
                          <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-xs" style={{ color: "rgba(225,219,201,0.70)" }}>
                            <Phone size={12} />
                            <span>{business.phone}</span>
                          </a>
                        )}
                        {business.instagram && (
                          <a
                            href={`https://instagram.com/${business.instagram.replace("@", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs"
                            style={{ color: "rgba(225,219,201,0.70)" }}
                          >
                            <AtSign size={12} />
                            <span>{business.instagram}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </Card3D>
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
                    onClick={() => { selectPueblo(""); setShowPueblos(false) }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors"
                    style={!filters.pueblo ? { background: "rgba(45,69,48,0.08)" } : undefined}
                  >
                    <MapPin size={13} style={{ color: !filters.pueblo ? "#2D4530" : "rgba(45,69,48,0.30)", flexShrink: 0 }} />
                    <span className="text-sm flex-1" style={{ color: !filters.pueblo ? "#2D4530" : "rgba(45,69,48,0.65)", fontWeight: !filters.pueblo ? 600 : 400 }}>
                      Todos los pueblos
                    </span>
                    {!filters.pueblo && <Check size={14} style={{ color: "#2D4530", flexShrink: 0 }} />}
                  </button>
                  {pueblos.map(p => {
                    const isActive = filters.pueblo === p
                    return (
                      <button
                        key={p}
                        onClick={() => { selectPueblo(p); setShowPueblos(false) }}
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
                <div className="h-6 flex-shrink-0" />
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
