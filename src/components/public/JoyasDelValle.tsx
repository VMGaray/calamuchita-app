"use client"

import { useRef, useCallback, useEffect } from "react"
import { motion, useMotionValue } from "framer-motion"
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"

type FeaturedBusiness = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  subcategory: string | null
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
  events:     "Eventos",
  info:       "Info útil",
}

const CARD_W = 320
const GAP = 32    // gap-8 = 2rem = 32px
const SPEED = 80  // px per second

function FeaturedCard({ biz }: { biz: FeaturedBusiness }) {
  return (
    <motion.div
      whileHover={{ y: -15, scale: 1.02 }}
      className="relative flex-shrink-0 group cursor-pointer"
      style={{ width: CARD_W, height: 420 }}
    >
      <Link href={`/negocios/${biz.slug}`} className="block w-full h-full">
        <div className="w-full h-full relative overflow-hidden rounded-[40px] bg-[#2D4530] shadow-2xl">
          {/* Imagen con zoom lento */}
          <motion.div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${biz.cover_url || FALLBACK})` }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />

          {/* Brillo en hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-700 bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transform" />

          {/* Badge Premium */}
          <div className="absolute top-6 left-6">
            <div className="px-3 py-1 rounded-full bg-yellow-500 text-black text-[10px] font-black uppercase tracking-tighter">
              Premium
            </div>
          </div>

          {/* Info */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="h-[1px] w-4 bg-yellow-500" />
              <p className="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.3em]">{SECTION_ES[biz.section] ?? biz.section}</p>
            </div>
            <h3 className="text-white text-3xl font-serif font-bold leading-tight group-hover:text-yellow-400 transition-colors">
              {biz.name}
            </h3>
          </div>

          {/* Ícono hover */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#2D4530]">
              <Plus size={20} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function JoyasDelValle({ businesses }: { businesses: FeaturedBusiness[] }) {
  const N = businesses.length
  const SET_W = N * (CARD_W + GAP)

  const x = useMotionValue(0)
  const isPausedRef = useRef(false)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number | undefined>(undefined)

  // Normaliza x al rango (-SET_W, 0]
  const normalize = (v: number) => {
    let r = v % SET_W
    if (r > 0) r -= SET_W
    return r
  }

  const tick = useCallback(
    (time: number) => {
      if (!document.hidden && lastTimeRef.current !== undefined && !isPausedRef.current) {
        const dt = Math.min(time - lastTimeRef.current, 50) / 1000
        let next = x.get() - SPEED * dt
        if (next <= -SET_W) next += SET_W
        x.set(next)
      }
      lastTimeRef.current = time
      rafRef.current = requestAnimationFrame(tick)
    },
    [x, SET_W],
  )

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  const navigate = (dir: 1 | -1) => {
    x.set(normalize(x.get() + dir * -(CARD_W + GAP)))
  }

  if (N === 0) return null

  // Triplicamos para el loop infinito sin saltos
  const items = [...businesses, ...businesses, ...businesses]

  return (
    <section
      className="py-16 md:py-24 bg-transparent overflow-hidden group/jdv"
      onMouseEnter={() => { isPausedRef.current = true }}
      onMouseLeave={() => { isPausedRef.current = false }}
    >
      {/* Header */}
      <div className="px-6 mb-12 md:mb-16 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl sm:text-6xl md:text-9xl font-black tracking-tighter leading-none text-[#2D4530] mb-4 md:mb-6">
            DESTACADOS
          </h2>
          <div className="flex justify-end sm:justify-between items-end gap-4">
            <p className="hidden sm:block text-[#C9A44B] font-bold text-xs md:text-sm uppercase tracking-[0.6em] border-l-4 border-[#C9A44B] pl-4">
              Descubrí nuestros negocios destacados.
            </p>
            <Link
              href="/negocios"
              className="group flex items-center gap-2 text-xs font-black text-[#2D4530] uppercase border-b-2 border-[#2D4530] pb-1 flex-shrink-0"
            >
              Explorar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Marquee */}
      <div className="relative">

        {/* Degradados laterales */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 md:w-28 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to right, #E1DBC9 30%, transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 md:w-28 z-10 pointer-events-none"
          style={{ background: "linear-gradient(to left, #E1DBC9 30%, transparent)" }}
        />

        {/* Flecha izquierda */}
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

        {/* Flecha derecha */}
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

        {/* Tira */}
        <div className="overflow-hidden py-6 md:py-10">
          <motion.div className="flex" style={{ x, gap: GAP }}>
            {items.map((biz, idx) => (
              <FeaturedCard key={`${biz.id}-${idx}`} biz={biz} />
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  )
}
