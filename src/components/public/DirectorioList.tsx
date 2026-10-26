"use client"

import { useState, useEffect, useRef, useMemo } from "react"
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
import {
  SERVICE_GROUPS, OTROS_SERVICIOS_SLUG, businessRubros, groupSlugsForRubros,
  findServiceGroup, serviceGroupForRubro,
} from "@/lib/constants/categories"
import { Phone, AtSign, MapPin, X, LayoutGrid, Check, ChevronLeft, Store } from "lucide-react"
import BusinessGridCard from "@/components/public/BusinessGridCard"

interface Business {
  id: string
  name: string
  slug: string
  subcategory: string | null
  categories: string[] | null
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
  filters: { cat?: string; grupo?: string; q?: string; pueblo?: string }
}

// "Ver todos" dentro de la grilla de grupos de Servicios
const TODOS_SERVICIOS_SLUG = "todos"

// Rubros de un negocio + subcategory (por si categories no la incluye)
function allRubrosOf(b: Business): string[] {
  const rubros = businessRubros(b)
  return b.subcategory && !rubros.includes(b.subcategory) ? [...rubros, b.subcategory] : rubros
}

function matchesServiceGroup(b: Business, groupSlug: string): boolean {
  if (groupSlug === TODOS_SERVICIOS_SLUG) return true
  const groups = groupSlugsForRubros(allRubrosOf(b))
  return groupSlug === OTROS_SERVICIOS_SLUG ? groups.length === 0 : groups.includes(groupSlug)
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
  // Negocios ya filtrados por pueblo (antes del filtro de grupo/rubro de Servicios)
  const [localBusinesses, setLocalBusinesses] = useState<Business[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(filters.q || "")
  const [showPueblos, setShowPueblos] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [mounted, setMounted] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  const isServices = section === "services"
  const activeCategory = filters.cat || ""
  const activeCatLabel = activeCategory
    ? (sectionCategories[section] ?? []).find(c => {
        const key = c.href.includes("cat=") ? c.href.split("cat=")[1] : ""
        return key === activeCategory
      })?.label ?? activeCategory
    : ""

  // ── Servicios: navegación por grupos ──
  // Un link viejo con solo ?cat= se ubica en el grupo de ese rubro; ?cat=varios equivale a "Otros".
  const activeGroupSlug = !isServices ? ""
    : filters.grupo
      || (activeCategory === "varios" ? OTROS_SERVICIOS_SLUG : "")
      || (activeCatLabel ? serviceGroupForRubro(activeCatLabel)?.slug ?? TODOS_SERVICIOS_SLUG : "")
  const activeGroup = findServiceGroup(activeGroupSlug)
  const showGroupGrid = isServices && !activeGroupSlug && !filters.q

  const businesses = useMemo(() => {
    if (!isServices || !activeGroupSlug) return localBusinesses
    return localBusinesses.filter(b =>
      matchesServiceGroup(b, activeGroupSlug)
      && (!activeCatLabel || activeCategory === "varios" || allRubrosOf(b).includes(activeCatLabel))
    )
  }, [isServices, localBusinesses, activeGroupSlug, activeCatLabel, activeCategory])

  // Cantidad de negocios por grupo con la localidad actual (grupos vacíos no se muestran)
  const groupCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    if (!isServices) return counts
    for (const b of localBusinesses) {
      const groups = groupSlugsForRubros(allRubrosOf(b))
      if (groups.length === 0) counts[OTROS_SERVICIOS_SLUG] = (counts[OTROS_SERVICIOS_SLUG] ?? 0) + 1
      for (const g of groups) counts[g] = (counts[g] ?? 0) + 1
    }
    return counts
  }, [isServices, localBusinesses])

  // Chips de rubro: en Servicios, solo los rubros del grupo activo que tienen negocios
  const categories = useMemo(() => {
    if (!isServices) return sectionCategories[section] || []
    if (!activeGroup) return []
    const inGroup = localBusinesses.filter(b => matchesServiceGroup(b, activeGroup.slug))
    const rubroItems = activeGroup.rubros
      .filter(r => r === activeCatLabel || inGroup.some(b => allRubrosOf(b).includes(r)))
      .map(r => sectionCategories.services.find(c => c.label === r)
        ?? { label: r, desc: "", href: `/directorio/services?cat=${encodeURIComponent(r)}` })
    return [
      { label: `Todo ${activeGroup.label}`, desc: "Ver todos los rubros del grupo", href: "/directorio/services" },
      ...rubroItems,
    ]
  }, [isServices, section, activeGroup, localBusinesses, activeCatLabel])

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

  // Fetch sin filtro de pueblo — el filtro de pueblo se aplica client-side.
  // Servicios trae toda la sección: grupo y rubro se filtran client-side
  // (hace falta el total para contar negocios por grupo).
  const serverCatLabel = isServices || !activeCategory || activeCategory === "varios" ? "" : activeCatLabel
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from("businesses")
        .select("id, name, slug, subcategory, categories, address, pueblo, phone, whatsapp, instagram, logo_url, cover_url, description, is_premium, is_featured_rubro, medical_specialties")
        .eq("status", "active")
        // Sección principal o una de las secciones donde también aparece.
        // section viene de la URL: solo letras, para no alterar el filtro or().
        .or(/^[a-z]+$/.test(section) ? `section.eq.${section},extra_sections.cs.{${section}}` : "id.is.null")

      if (serverCatLabel) {
        query = query.or(`subcategory.ilike.%${serverCatLabel}%,categories.cs.{"${serverCatLabel}"}`)
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
  }, [section, serverCatLabel, filters.q])

  // Filtro de pueblo client-side
  useEffect(() => {
    const pueblosFilter = filters.pueblo ? filters.pueblo.split(',').filter(Boolean) : []
    if (pueblosFilter.length === 0) {
      setLocalBusinesses(allBusinesses)
      return
    }
    setLocalBusinesses(
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

  const updateFilters = (changes: Record<string, string>) => {
    const current = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(changes)) {
      if (value) current.set(key, value)
      else current.delete(key)
    }
    router.push(`/directorio/${section}?${current.toString()}`)
  }
  const updateFilter = (key: string, value: string) => updateFilters({ [key]: value })

  // En Servicios el rubro siempre viaja junto con su grupo (así un link con ?cat= queda ubicado)
  const selectCategory = (catKey: string) =>
    isServices ? updateFilters({ grupo: activeGroupSlug, cat: catKey }) : updateFilter("cat", catKey)
  const selectGroup = (slug: string) => updateFilters({ grupo: slug, cat: "" })

  // Badge de la card: en un grupo de Servicios, el rubro del negocio que corresponde a ese grupo
  const badgeFor = (b: Business): string | null => {
    if (section === "health") return b.medical_specialties?.[0] ?? b.subcategory
    if (activeGroup) {
      if (activeCatLabel && allRubrosOf(b).includes(activeCatLabel)) return activeCatLabel
      return allRubrosOf(b).find(r => activeGroup.rubros.includes(r)) ?? b.subcategory
    }
    return b.subcategory
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

      {/* ── Servicios: grilla de grupos ── */}
      {showGroupGrid && (
        <>
          <SectionLabel icon={<LayoutGrid size={11} />} label="¿Qué necesitás?" />
          {loading ? (
            <SkeletonBusinessGrid count={6} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
              {[
                ...SERVICE_GROUPS.map(g => ({ slug: g.slug, label: g.label, Icon: g.icon })),
                { slug: OTROS_SERVICIOS_SLUG, label: "Otros servicios", Icon: Store },
              ]
                .filter(g => (groupCounts[g.slug] ?? 0) > 0)
                .map(({ slug, label, Icon }) => (
                  <button
                    key={slug}
                    onClick={() => selectGroup(slug)}
                    className="flex flex-col items-start gap-3 p-4 rounded-2xl text-left transition-transform active:scale-95 hover:bg-white/15"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      backdropFilter: "blur(18px)",
                      WebkitBackdropFilter: "blur(18px)",
                      border: "1px solid rgba(255,255,255,0.20)",
                    }}
                  >
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(225,219,201,0.15)" }}
                    >
                      <Icon size={20} strokeWidth={1.8} style={{ color: "#E1DBC9" }} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold leading-snug text-white">{label}</span>
                      <span className="block text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {groupCounts[slug]} {groupCounts[slug] === 1 ? "negocio" : "negocios"}
                      </span>
                    </span>
                  </button>
                ))}
              {localBusinesses.length > 0 && (
                <button
                  onClick={() => selectGroup(TODOS_SERVICIOS_SLUG)}
                  className="flex flex-col items-start justify-center gap-1 p-4 rounded-2xl text-left transition-transform active:scale-95"
                  style={{ background: "#2D4530", border: "1px solid rgba(163,177,138,0.30)" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "#E1DBC9" }}>Ver todos</span>
                  <span className="text-xs" style={{ color: "rgba(225,219,201,0.65)" }}>
                    {localBusinesses.length} servicios
                  </span>
                </button>
              )}
              {localBusinesses.length === 0 && (
                <p className="col-span-full text-sm py-10 text-center" style={{ color: "rgba(225,219,201,0.65)" }}>
                  No encontramos servicios en esta localidad.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Servicios: grupo activo ── */}
      {isServices && activeGroupSlug && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => updateFilters({ grupo: "", cat: "" })}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0"
            style={{ background: "#E1DBC9", color: "#2D4530" }}
          >
            <ChevronLeft size={14} />
            Grupos
          </button>
          <span className="flex items-center gap-2 min-w-0 text-base font-semibold text-white">
            {activeGroup && <activeGroup.icon size={18} strokeWidth={1.8} className="flex-shrink-0" style={{ color: "#E1DBC9" }} />}
            <span className="truncate">
              {activeGroup?.label
                ?? (activeGroupSlug === OTROS_SERVICIOS_SLUG ? "Otros servicios" : "Todos los servicios")}
            </span>
          </span>
        </div>
      )}

      {/* ── Subcategoría ── */}
      {categories.length > 0 && (<>
      <SectionLabel icon={<LayoutGrid size={11} />} label={isServices ? "Rubro" : "Categoría"} />
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
                onClick={() => selectCategory(catKey)}
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
      </>)}

      {/* ── Resultados ── */}
      <div ref={resultsRef} className="scroll-mt-28">
        {showGroupGrid ? null : loading ? (
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

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {businesses.slice(0, visibleCount).map((business, i) => (
                <AnimateIn key={business.id} direction="up" delay={Math.min(i, 8) * 0.04}>
                  <BusinessGridCard
                    href={`/directorio/${section}/${business.slug}`}
                    name={business.name}
                    imageUrl={business.cover_url || business.logo_url}
                    eyebrow={badgeFor(business)}
                    isPremium={business.is_premium}
                    isFeaturedRubro={business.is_featured_rubro}
                    priority={i < 4}
                  />
                </AnimateIn>
              ))}
            </div>

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
                        onClick={() => { selectCategory(catKey); setShowCategories(false) }}
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
