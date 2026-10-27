"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { motion, useMotionValue, animate } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type FeaturedBusiness = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  section: string
}

const FALLBACK = "/valle.jpg"

const SECTION_ES: Record<string, string> = {
  gastronomy: "Gastronomía",
  services:   "Servicios",
  commerce:   "Comercios",
  health:     "Salud",
  education:  "Educación",
  tourism:    "Turismo",
  sports:     "Deportes",
  events:     "Eventos",
  info:       "Info útil",
}

const CARD_W = 320
const GAP = 32    // gap-8 = 2rem = 32px
const SPEED = 80  // px per second
// Tarjetas repetidas al final de cada fila para que el loop no muestre un hueco (cubre pantallas de hasta 2560px)
const LOOP_EXTRA = Math.ceil(2560 / (CARD_W + GAP)) + 1

/** La fila completa + las primeras LOOP_EXTRA tarjetas otra vez (antes eran 3 copias: ~540 KB de HTML). */
function loopItems<T>(row: T[]): T[] {
  if (row.length === 0) return []
  return Array.from({ length: row.length + LOOP_EXTRA }, (_, i) => row[i % row.length])
}

// Cuántos destacados se muestran por visita (el resto está en /destacados)
const COUNT_MOBILE = 12
const COUNT_DESKTOP = 24

/**
 * Elige n al azar y en orden aleatorio (Fisher–Yates parcial): cada negocio tiene la
 * misma probabilidad de aparecer y en cualquier posición.
 */
function randomSample<T>(items: T[], n: number): T[] {
  const a = [...items]
  const k = Math.min(n, a.length)
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(Math.random() * (a.length - i))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, k)
}

/** Mismo tamaño que la tarjeta: se muestra hasta que el navegador sortea los destacados. */
function CardPlaceholder() {
  return (
    <div className="relative flex-shrink-0" style={{ width: CARD_W }} aria-hidden="true">
      <div className="w-full aspect-[4/3] rounded-[40px] bg-[#2D4530]/80 shadow-2xl" />
    </div>
  )
}

function FeaturedCard({ biz }: { biz: FeaturedBusiness }) {
  return (
    <motion.div
      whileHover={{ y: -15, scale: 1.02 }}
      className="relative flex-shrink-0 group cursor-pointer"
      style={{ width: CARD_W }}
    >
      <Link
        href={biz.section === "gastronomy" ? `/negocios/${biz.slug}?from=/` : `/directorio/${biz.section}/${biz.slug}?from=/`}
        className="block w-full"
      >
        <div className="w-full aspect-[4/3] relative overflow-hidden rounded-[40px] bg-[#2D4530] shadow-2xl">
          {/* Imagen con zoom lento — animación CSS (compositor), solo con mouse: en mobile
              eran ~300 animaciones JS infinitas que trababan el hilo principal */}
          <div className="absolute inset-0 jdv-slow-zoom">
            <Image
              src={biz.cover_url || FALLBACK}
              alt={biz.name}
              width={CARD_W}
              height={CARD_W * 3 / 4}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

          {/* Brillo en hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transform" />

          {/* Info */}
          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-[1px] w-4 bg-yellow-500" />
              <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.3em]">{SECTION_ES[biz.section] ?? biz.section}</p>
            </div>
            <h3 className="text-white text-2xl font-serif font-bold leading-tight group-hover:text-yellow-400 transition-colors">
              {biz.name}
            </h3>
          </div>

          {/* Ícono hover */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#2D4530]">
              <Plus size={18} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function JoyasDelValle({ businesses }: { businesses: FeaturedBusiness[] }) {
  // El sorteo se hace en el navegador: la home está cacheada (ISR) y si se sorteara en el
  // servidor todos los visitantes verían los mismos durante 2 minutos.
  // Hasta entonces se muestran placeholders del mismo tamaño (sin saltos de layout).
  const [picked, setPicked] = useState<FeaturedBusiness[] | null>(null)

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)").matches
    // Intencional: el sorteo tiene que pasar después de hidratar (el HTML del servidor es igual para todos)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPicked(randomSample(businesses, desktop ? COUNT_DESKTOP : COUNT_MOBILE))
  }, [businesses])

  // Dos filas con la mitad cada una (fila 2 vacía si hay un solo destacado)
  const slots: (FeaturedBusiness | null)[] =
    picked ?? Array(Math.min(businesses.length, COUNT_MOBILE)).fill(null)
  const half = Math.ceil(slots.length / 2)
  const row1 = slots.slice(0, half)
  const row2 = slots.slice(half)

  const SET_W1 = row1.length * (CARD_W + GAP)
  const SET_W2 = row2.length * (CARD_W + GAP)

  // Fila 1: derecha → izquierda
  const x1 = useMotionValue(0)
  // Fila 2: izquierda → derecha, desfasada media tira
  const x2 = useMotionValue(SET_W2 > 0 ? -Math.floor(SET_W2 / 2) : 0)

  const isPausedRef = useRef(false)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number | undefined>(undefined)
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const STEP = CARD_W + GAP

  const normalize1 = (v: number) => {
    let r = v % SET_W1
    if (r > 0) r -= SET_W1
    return r
  }

  const tick = useCallback(
    (time: number) => {
      if (!document.hidden && lastTimeRef.current !== undefined && !isPausedRef.current) {
        const dt = Math.min(time - lastTimeRef.current, 50) / 1000

        if (SET_W1 > 0) {
          let next1 = x1.get() - SPEED * dt
          if (next1 <= -SET_W1) next1 += SET_W1
          x1.set(next1)
        }

        if (SET_W2 > 0) {
          let next2 = x2.get() + SPEED * dt
          if (next2 >= 0) next2 -= SET_W2
          x2.set(next2)
        }
      }
      lastTimeRef.current = time
      rafRef.current = requestAnimationFrame(tick)
    },
    [x1, x2, SET_W1, SET_W2],
  )

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    }
  }, [tick])

  const navigate = (dir: 1 | -1) => {
    const current = x1.get()
    const snapped = Math.round(current / STEP) * STEP
    const next = normalize1(snapped + dir * -STEP)
    animate(x1, next, { type: "spring", stiffness: 300, damping: 35 })
    isPausedRef.current = true
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    pauseTimerRef.current = setTimeout(() => { isPausedRef.current = false }, 3000)
  }

  const navigate2 = (dir: 1 | -1) => {
    const current = x2.get()
    const snapped = Math.round(current / STEP) * STEP
    let next = snapped + dir * -STEP
    next = next % SET_W2
    if (next >= 0) next -= SET_W2
    animate(x2, next, { type: "spring", stiffness: 300, damping: 35 })
    isPausedRef.current = true
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
    pauseTimerRef.current = setTimeout(() => { isPausedRef.current = false }, 3000)
  }

  if (row1.length === 0 && row2.length === 0) return null

  const items1 = loopItems(row1)
  const items2 = loopItems(row2)

  return (
    <section
      className="pt-4 pb-8 md:pt-6 md:pb-12 bg-transparent overflow-hidden group/jdv"
      onMouseEnter={() => { isPausedRef.current = true }}
      onMouseLeave={() => { isPausedRef.current = false }}
      onTouchStart={() => { isPausedRef.current = true }}
      onTouchEnd={() => {
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current)
        pauseTimerRef.current = setTimeout(() => { isPausedRef.current = false }, 3000)
      }}
    >
      {/* Header */}
      <div className="px-6 mb-8 md:mb-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl sm:text-6xl md:text-9xl font-black tracking-tighter leading-none text-[#2D4530] mb-1 md:mb-3">
            DESTACADOS
          </h2>
         
          <div className="flex justify-end items-end gap-4">
            <Link
              href="/destacados"
              className="group flex items-center gap-2 text-xs font-black text-[#2D4530] uppercase border-b-2 border-[#2D4530] pb-1 flex-shrink-0"
            >
              Ver más <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Fila 1 — derecha → izquierda */}
      {items1.length > 0 && (
        <div className="relative">
          <button
            onClick={() => navigate(-1)}
            aria-label="Anterior"
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20
                       w-10 h-10 md:w-12 md:h-12 rounded-full
                       flex items-center justify-center
                       bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg
                       text-[#2D4530] hover:bg-white transition-all
                       opacity-100 md:opacity-0 md:group-hover/jdv:opacity-100 md:duration-300"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => navigate(1)}
            aria-label="Siguiente"
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20
                       w-10 h-10 md:w-12 md:h-12 rounded-full
                       flex items-center justify-center
                       bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg
                       text-[#2D4530] hover:bg-white transition-all
                       opacity-100 md:opacity-0 md:group-hover/jdv:opacity-100 md:duration-300"
          >
            <ChevronRight size={20} />
          </button>

          <div className="overflow-hidden py-4 md:py-6">
            <motion.div
              className="flex"
              style={{ x: x1, gap: GAP, marginLeft: `calc(50% - ${CARD_W / 2}px)` }}
            >
              {items1.map((biz, idx) => biz
                ? <FeaturedCard key={`r1-${biz.id}-${idx}`} biz={biz} />
                : <CardPlaceholder key={`r1-${idx}`} />
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Fila 2 — izquierda → derecha */}
      {items2.length > 0 && (
        <div className="relative">
          <button
            onClick={() => navigate2(-1)}
            aria-label="Anterior"
            className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-20
                       w-10 h-10 md:w-12 md:h-12 rounded-full
                       flex items-center justify-center
                       bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg
                       text-[#2D4530] hover:bg-white transition-all
                       opacity-100 md:opacity-0 md:group-hover/jdv:opacity-100 md:duration-300"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => navigate2(1)}
            aria-label="Siguiente"
            className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-20
                       w-10 h-10 md:w-12 md:h-12 rounded-full
                       flex items-center justify-center
                       bg-white/80 backdrop-blur-sm border border-white/60 shadow-lg
                       text-[#2D4530] hover:bg-white transition-all
                       opacity-100 md:opacity-0 md:group-hover/jdv:opacity-100 md:duration-300"
          >
            <ChevronRight size={20} />
          </button>

          <div className="overflow-hidden py-4 md:py-6">
            <motion.div
              className="flex"
              style={{ x: x2, gap: GAP, marginLeft: `calc(50% - ${CARD_W / 2}px)` }}
            >
              {items2.map((biz, idx) => biz
                ? <FeaturedCard key={`r2-${biz.id}-${idx}`} biz={biz} />
                : <CardPlaceholder key={`r2-${idx}`} />
              )}
            </motion.div>
          </div>
        </div>
      )}

      {/* Siempre visible: si apareciera solo cuando sobran destacados, en desktop (24) podría desaparecer y mover el layout */}
      {slots.length > 0 && (
        <div className="px-6 mt-2 flex justify-center">
          <Link
            href="/destacados"
            className="inline-flex items-center gap-2 rounded-full bg-[#2D4530] px-6 py-3 text-sm font-semibold text-[#E1DBC9] shadow-sm hover:opacity-90 transition-opacity"
          >
            Ver todos los destacados <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </section>
  )
}
