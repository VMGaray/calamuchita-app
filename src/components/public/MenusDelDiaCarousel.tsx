"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, UtensilsCrossed } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useLocalidad } from "@/lib/context/LocalidadContext"

// Tipo que refleja exactamente lo que devuelve Supabase
interface MenuDelDiaRow {
  id: string
  date: string
  businesses: {
    id: string
    name: string
    slug: string
    address: string | null
    status: string
  } | null
  daily_menu_items: {
    id: string
    name: string
    description: string | null
    price: number
  }[]
}

// Tipo de UI — lo que el carrusel consume
interface MenuDelDia {
  id: string
  business: {
    id: string
    name: string
    slug: string
    address: string | null
  }
  items: {
    id: string
    name: string
    description: string | null
    price: number
  }[]
}

const CARD_WIDTH = 220
const CARD_HEIGHT = 380

const gradients = [
  "linear-gradient(180deg, #2D4530 0%, #3d5e42 100%)",
  "linear-gradient(180deg, #5E4B3B 0%, #7a6250 100%)",
  "linear-gradient(180deg, #6B7B84 0%, #8a9ba5 100%)",
]

// Esqueleto de tarjeta del carrusel
function CardSkeleton({ opacity }: { opacity: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT, opacity, background: "rgba(45,69,48,0.10)" }}
    >
      <div className="h-16 bg-brand-pine/20" />
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <div className="h-4 rounded-full bg-brand-pine/10 w-3/4 mx-auto" />
          <div className="h-4 rounded-full bg-brand-pine/10 w-1/2 mx-auto" />
        </div>
        <div className="h-px w-10 bg-brand-pine/10 mx-auto" />
        <div className="h-6 rounded-full bg-brand-pine/10 w-1/3 mx-auto" />
      </div>
    </div>
  )
}

export default function MenusDelDiaCarousel() {
  const { localidad } = useLocalidad()
  const [allMenus, setAllMenus] = useState<MenuDelDia[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch único al montar — trae todos los menús publicados hoy
  useEffect(() => {
    async function fetchMenus() {
      const supabase = createClient()
      const today = new Date().toISOString().split("T")[0]

      const { data, error } = await supabase
        .from("daily_menus")
        .select(`
          id,
          date,
          businesses!inner (
            id,
            name,
            slug,
            address,
            status
          ),
          daily_menu_items (
            id,
            name,
            description,
            price
          )
        `)
        .eq("date", today)
        .eq("is_published", true)

      if (error || !data) {
        setLoading(false)
        return
      }

      const rows = data as unknown as MenuDelDiaRow[]

      const mapped: MenuDelDia[] = rows
        .filter(
          (row) =>
            row.businesses?.status === "active" &&
            row.daily_menu_items.length > 0
        )
        .map((row) => ({
          id: row.id,
          business: {
            id: row.businesses!.id,
            name: row.businesses!.name,
            slug: row.businesses!.slug,
            address: row.businesses!.address,
          },
          items: row.daily_menu_items,
        }))

      setAllMenus(mapped)
      setLoading(false)
    }

    fetchMenus()
  }, [])

  // Re-ordena sin refetch cuando cambia la localidad: los del pueblo activo van primero
  const menus = useMemo(() => {
    if (!allMenus.length || !localidad) return allMenus
    const localidadLower = localidad.toLowerCase()
    return [...allMenus].sort((a, b) => {
      const aMatch = a.business.address?.toLowerCase().includes(localidadLower) ?? false
      const bMatch = b.business.address?.toLowerCase().includes(localidadLower) ?? false
      if (aMatch === bMatch) return 0
      return aMatch ? -1 : 1
    })
  }, [allMenus, localidad])

  // Resetea la posición del carrusel al cambiar de localidad
  useEffect(() => {
    setActive(0)
  }, [localidad])

  // Autoplay
  const startAutoPlay = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % menus.length)
    }, 4500)
  }, [menus.length])

  useEffect(() => {
    if (menus.length > 1) startAutoPlay()
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [startAutoPlay, menus.length])

  const move = (dir: number) => {
    if (autoRef.current) clearInterval(autoRef.current)
    setActive((prev) => (prev + dir + menus.length) % menus.length)
    startAutoPlay()
  }

  // ---- Render: cabecera común a todos los estados ----
  const Header = (
    <div className="relative z-20 max-w-6xl w-full px-4 md:px-6 mb-4 md:mb-10">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-3 text-left"
        >
          <h2
            className="font-serif text-3xl sm:text-4xl md:text-6xl tracking-tighter leading-tight"
            style={{ color: "#2D4530" }}
          >
            ¿Qué almorzamos hoy?
          </h2>
          <p className="mt-3 md:mt-5 text-brand-slate text-base md:text-xl font-medium max-w-xl">
            Explorá las propuestas gastronómicas que el valle tiene preparadas para este mediodía.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="md:col-span-2 relative flex justify-center md:justify-end"
        >
          {/* will-change: transform aísla el video en su propia capa GPU */}
          <div
            className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.2)] border-4 md:border-8 border-white/50"
            style={{ willChange: "transform" }}
          >
            <video
              src="/videoMenu.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-brand-pine/10 pointer-events-none" />
          </div>
          <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-brand-earth/10 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </div>
  )

  const SectionLabel = (
    <div className="w-full max-w-6xl px-4 md:px-6 mb-8 md:mb-12 flex items-center gap-4 md:gap-6">
      <h3 className="text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] font-black text-brand-pine/50 whitespace-nowrap">
        Menú del día
      </h3>
      <div className="h-px bg-brand-pine/10 flex-1" />
    </div>
  )

  // ---- Estado: cargando ----
  if (loading) {
    return (
      <div
        className="relative z-60 overflow-hidden pt-0 pb-16 md:py-16 flex flex-col items-center"
        style={{ background: "linear-gradient(160deg, #D6CEBC 0%, #C9C0A9 100%)" }}
      >
        {/* Cabecera esqueleto */}
        <div className="max-w-6xl w-full px-4 md:px-6 mb-8 md:mb-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-10 items-center">
            <div className="md:col-span-3 space-y-3">
              <div className="h-9 md:h-14 rounded-2xl animate-pulse bg-brand-pine/10 w-3/4" />
              <div className="h-9 md:h-14 rounded-2xl animate-pulse bg-brand-pine/10 w-1/2" />
              <div className="h-4 md:h-5 rounded-xl animate-pulse bg-brand-pine/10 w-2/3 mt-2 md:mt-4" />
            </div>
            <div className="md:col-span-2 flex justify-center md:justify-end">
              <div className="w-48 h-48 md:w-80 md:h-80 rounded-full animate-pulse bg-brand-pine/10" />
            </div>
          </div>
        </div>

        {SectionLabel}

        {/* Tarjetas esqueleto */}
        <div className="relative h-[400px] w-full flex items-center justify-center gap-6">
          <CardSkeleton opacity={0.35} />
          <CardSkeleton opacity={1} />
          <CardSkeleton opacity={0.35} />
        </div>
      </div>
    )
  }

  // ---- Estado: sin menús publicados hoy ----
  if (menus.length === 0) {
    return (
      <div
        className="relative z-60 overflow-hidden pt-0 pb-16 md:py-16 flex flex-col items-center"
        style={{ background: "linear-gradient(160deg, #D6CEBC 0%, #C9C0A9 100%)" }}
      >
        {Header}
        {SectionLabel}
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-16 h-16 rounded-2xl bg-brand-pine/10 flex items-center justify-center">
            <UtensilsCrossed size={28} style={{ color: "#2D4530" }} strokeWidth={1.5} />
          </div>
          <p className="font-serif text-xl" style={{ color: "#2D4530" }}>
            Sin menús publicados hoy
          </p>
          <p className="text-sm text-brand-slate max-w-xs text-center">
            Los restaurantes del valle aún no cargaron su propuesta de hoy. Volvé al mediodía.
          </p>
        </div>
      </div>
    )
  }

  // ---- Estado: datos listos ----
  return (
    <div
      className="relative z-60 overflow-hidden pt-0 pb-16 md:py-16 flex flex-col items-center"
      style={{ background: "linear-gradient(160deg, #D6CEBC 0%, #C9C0A9 100%)" }}
    >
      {Header}
      {SectionLabel}

      {/* Carrusel 3D */}
      <div className="relative z-10 w-full">
        <div
          className="relative h-[400px] w-full flex items-center justify-center"
          style={{ perspective: "1500px" }}
        >
          <AnimatePresence mode="popLayout">
            {menus.map((menu, i) => {
              const offset = i - active
              const isVisible =
                i === active ||
                i === (active - 1 + menus.length) % menus.length ||
                i === (active + 1) % menus.length

              if (!isVisible) return null

              return (
                <motion.div
                  key={menu.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    x: offset === 0 ? 0 : offset > 0 ? 340 : -340,
                    rotateY: offset * -45,
                    z: offset === 0 ? 150 : -150,
                    opacity: offset === 0 ? 1 : 0.35,
                    scale: offset === 0 ? 1.15 : 0.8,
                  }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "spring", stiffness: 180, damping: 22 }}
                  className="absolute"
                  style={{ width: CARD_WIDTH, height: CARD_HEIGHT, willChange: "transform" }}
                >
                  <Link href={`/negocios/${menu.business.slug}`}>
                    <motion.div
                      whileHover={{ y: -15, scale: 1.03 }}
                      className="bg-white h-full rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.2)] border border-stone-100 overflow-hidden relative"
                    >
                      <div
                        className="p-4 pt-9 text-center"
                        style={{ background: gradients[i % gradients.length] }}
                      >
                        <p className="font-black text-white text-[11px] uppercase tracking-widest">
                          {menu.business.name}
                        </p>
                        {menu.business.address && (
                          <p className="text-white/50 text-[9px] uppercase tracking-widest mt-1">
                            {menu.business.address}
                          </p>
                        )}
                      </div>

                      <div className="p-8 flex-1 flex flex-col justify-center space-y-7">
                        {menu.items.map((item) => (
                          <div key={item.id} className="text-center">
                            <p className="text-base font-bold text-stone-900 leading-snug">
                              {item.name}
                            </p>
                            {item.description && (
                              <p className="text-xs text-stone-400 mt-1">{item.description}</p>
                            )}
                            <div className="h-px w-10 bg-brand-earth/20 mx-auto my-4" />
                            <p className="text-lg font-black" style={{ color: "#5E4B3B" }}>
                              ${item.price.toLocaleString("es-AR")}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="absolute bottom-5 left-0 right-0 text-center">
                        <span className="text-xs text-brand-pine font-bold tracking-widest uppercase bg-brand-sand/50 px-3 py-1 rounded-full">
                          Ver Detalle
                        </span>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <button
            onClick={() => move(-1)}
            className="absolute left-3 md:left-20 p-3 md:p-5 bg-white/95 backdrop-blur-md rounded-full shadow-xl z-50 hover:scale-110 hover:bg-brand-pine hover:text-white transition-all text-brand-pine border border-brand-pine/10"
          >
            <ChevronLeft size={20} className="md:hidden" />
            <ChevronLeft size={28} className="hidden md:block" />
          </button>
          <button
            onClick={() => move(1)}
            className="absolute right-3 md:right-20 p-3 md:p-5 bg-white/95 backdrop-blur-md rounded-full shadow-xl z-50 hover:scale-110 hover:bg-brand-pine hover:text-white transition-all text-brand-pine border border-brand-pine/10"
          >
            <ChevronRight size={20} className="md:hidden" />
            <ChevronRight size={28} className="hidden md:block" />
          </button>
        </div>

        {/* Indicador de localidad activa */}
        <AnimatePresence mode="wait">
          <motion.p
            key={localidad}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-center text-xs text-brand-pine/40 mt-6 uppercase tracking-widest"
          >
            {localidad && menus.filter(m => m.business.address?.toLowerCase().includes(localidad.toLowerCase())).length > 0
              ? `Mostrando primero: ${localidad}`
              : "Mostrando todo el valle"}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}
