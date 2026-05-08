"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UtensilsCrossed, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

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

export default function MenusDelDiaCarousel() {
  const [menus, setMenus] = useState<MenuDelDia[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const autoRef = useRef<NodeJS.Timeout | null>(null)

  // --- Fondo de Destellos (Estilo Pinterest) ---
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number
    
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.8 + 0.2,
      opacity: Math.random(),
      blink: 0.005 + Math.random() * 0.01
    }))

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener("resize", handleResize)
    handleResize()

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.opacity += p.blink
        if (p.opacity > 0.8 || p.opacity < 0.2) p.blink *= -1
        
        ctx.save()
        ctx.globalAlpha = p.opacity
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = "#E1DBC9"
        ctx.shadowBlur = 12
        ctx.shadowColor = "#E1DBC9"
        ctx.fill()
        ctx.restore()
        
        p.y -= p.speed
        if (p.y < -20) p.y = canvas.height + 20
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", handleResize)
    }
  }, [loading])

  // --- Carga de Datos ---
  useEffect(() => {
    const mockMenus: MenuDelDia[] = [
      { id: "1", business: { id: "1", name: "Vinto", slug: "vinto", address: "VGB" }, items: [{ id: "1", name: "Milanesa a caballo", description: "Con fritas", price: 14000 }] },
      { id: "2", business: { id: "2", name: "Pipa Bistro", slug: "pipa-bistro-vgb", address: "VGB" }, items: [{ id: "2", name: "Pasta del día", description: "Pesto", price: 11000 }] },
      { id: "3", business: { id: "3", name: "La Casona", slug: "la-casona", address: "Los Reartes" }, items: [{ id: "3", name: "Locro", description: "Serrano", price: 9000 }] }
    ]
    setMenus(mockMenus)
    setLoading(false)
  }, [])

  // --- Lógica de Giro Automático ---
  const startAutoPlay = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % menus.length)
    }, 4500)
  }, [menus.length])

  useEffect(() => {
    if (menus.length > 1) startAutoPlay()
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [startAutoPlay, menus.length])

  const move = (dir: number) => {
    if (autoRef.current) clearInterval(autoRef.current) // Pausa al interactuar
    setActive((prev) => (prev + dir + menus.length) % menus.length)
    startAutoPlay() // Reinicia el contador
  }

  if (loading) return <div className="h-[600px] bg-brand-sand rounded-3xl animate-pulse" />

  const gradients = [
    "linear-gradient(180deg, #2D4530 0%, #3d5e42 100%)",
    "linear-gradient(180deg, #5E4B3B 0%, #7a6250 100%)",
    "linear-gradient(180deg, #6B7B84 0%, #8a9ba5 100%)",
  ]

  return (
    <div className="mb-16 relative rounded-3xl overflow-hidden py-20 min-h-[650px] flex flex-col items-center justify-center" style={{ background: "#E1DBC9" }}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 w-full">
        <h2 className="font-serif text-4xl text-center mb-20 tracking-tighter" style={{ color: "#2D4530" }}>Menu del día</h2>

        <div className="relative h-[400px] w-full flex items-center justify-center" style={{ perspective: "1200px" }}>
          <AnimatePresence mode="popLayout">
            {menus.map((menu, i) => {
              const offset = i - active
              const isVisible = i === active || i === (active - 1 + menus.length) % menus.length || i === (active + 1) % menus.length

              if (!isVisible) return null

              return (
                <motion.div
                  key={menu.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    x: offset === 0 ? 0 : offset > 0 ? 280 : -280,
                    rotateY: offset * -35,
                    opacity: offset === 0 ? 1 : 0.5,
                    scale: offset === 0 ? 1.08 : 0.88,
                  }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: "tween", duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute"
                  style={{ width: CARD_WIDTH, height: CARD_HEIGHT, willChange: "transform" }}
                >
                  <Link href={`/negocios/${menu.business.slug}`}>
                    <div className="bg-white h-full rounded-2xl shadow-2xl border border-stone-100 overflow-hidden">
                      <div className="p-4 pt-8 text-center" style={{ background: gradients[i % gradients.length] }}>
                        <p className="font-black text-white text-xs uppercase tracking-widest">{menu.business.name}</p>
                      </div>
                      <div className="p-8 flex-1 flex flex-col justify-center space-y-6">
                        {menu.items.map(item => (
                          <div key={item.id} className="text-center">
                            <p className="text-sm font-bold text-stone-800">{item.name}</p>
                            <p className="text-xs font-black mt-2" style={{ color: "#5E4B3B" }}>${item.price}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>

          <button onClick={() => move(-1)} className="absolute left-10 p-4 bg-white/80 rounded-full shadow-xl z-50 hover:scale-110 transition-transform"><ChevronLeft /></button>
          <button onClick={() => move(1)} className="absolute right-10 p-4 bg-white/80 rounded-full shadow-xl z-50 hover:scale-110 transition-transform"><ChevronRight /></button>
        </div>
      </div>
    </div>
  )
}