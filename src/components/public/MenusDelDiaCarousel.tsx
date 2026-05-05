"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { UtensilsCrossed, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface MenuDelDia {
  id: string
  business: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    address: string | null
  }
  items: {
    id: string
    name: string
    description: string | null
    price: number
    includes_drink: boolean
  }[]
}

const CARD_WIDTH = 280
const CARD_GAP = 24

export default function MenusDelDiaCarousel() {
  const [menus, setMenus] = useState<MenuDelDia[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [dragDelta, setDragDelta] = useState(0)
  const autoRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const mockMenus: MenuDelDia[] = [
      {
        id: "1",
        business: { id: "1", name: "Vinto", slug: "vinto", logo_url: null, address: "Villa General Belgrano" },
        items: [
          { id: "1", name: "Milanesa a caballo", description: "Con papas fritas", price: 14000, includes_drink: false },
          { id: "2", name: "Pollo al limón", description: "Con ensalada mixta", price: 12000, includes_drink: true },
        ]
      },
      {
        id: "2",
        business: { id: "2", name: "Pipa Bistro VGB", slug: "pipa-bistro-vgb", logo_url: null, address: "Villa General Belgrano" },
        items: [
          { id: "3", name: "Pasta del día", description: "Fettuccine al pesto", price: 11000, includes_drink: false },
          { id: "4", name: "Carne a la parrilla", description: "Con chimichurri", price: 16000, includes_drink: true },
        ]
      },
      {
        id: "3",
        business: { id: "3", name: "La Casona del Valle", slug: "la-casona", logo_url: null, address: "Los Reartes" },
        items: [
          { id: "5", name: "Locro serrano", description: "Receta tradicional", price: 9000, includes_drink: false },
          { id: "6", name: "Trucha a la plancha", description: "Con vegetales grillados", price: 15000, includes_drink: true },
        ]
      },
      {
        id: "4",
        business: { id: "4", name: "El Rincón Alemán", slug: "rincon-aleman", logo_url: null, address: "Villa General Belgrano" },
        items: [
          { id: "7", name: "Schnitzel", description: "Con kartoffelsalat", price: 13000, includes_drink: false },
          { id: "8", name: "Bratwurst", description: "Con chucrut y mostaza", price: 10000, includes_drink: true },
        ]
      },
    ]
    setMenus(mockMenus)
    setLoading(false)
  }, [])

  const startAutoPlay = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => {
      setActive(a => (a + 1) % menus.length)
    }, 3500)
  }, [menus.length])

  useEffect(() => {
    if (menus.length > 1) startAutoPlay()
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [startAutoPlay, menus.length])

  const prev = () => {
    if (autoRef.current) clearInterval(autoRef.current)
    setActive(a => (a - 1 + menus.length) % menus.length)
    startAutoPlay()
  }

  const next = () => {
    if (autoRef.current) clearInterval(autoRef.current)
    setActive(a => (a + 1) % menus.length)
    startAutoPlay()
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (autoRef.current) clearInterval(autoRef.current)
    setIsDragging(true)
    setStartX(e.clientX)
    setDragDelta(0)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setDragDelta(e.clientX - startX)
  }

  const onMouseUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragDelta < -60) next()
    else if (dragDelta > 60) prev()
    setDragDelta(0)
    startAutoPlay()
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (autoRef.current) clearInterval(autoRef.current)
    setIsDragging(true)
    setStartX(e.touches[0].clientX)
    setDragDelta(0)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    setDragDelta(e.touches[0].clientX - startX)
  }

  const onTouchEnd = () => {
    setIsDragging(false)
    if (dragDelta < -60) next()
    else if (dragDelta > 60) prev()
    setDragDelta(0)
    startAutoPlay()
  }

  if (loading) return (
    <div className="mb-16">
      <div className="h-6 bg-stone-200 rounded-full w-48 mb-8 animate-pulse" />
      <div className="h-96 bg-white/50 rounded-3xl animate-pulse" />
    </div>
  )

  if (menus.length === 0) return null

  const gradients = [
    "linear-gradient(135deg, #537895 0%, #6991C7 100%)",
    "linear-gradient(135deg, #5A9470 0%, #7CAE8D 100%)",
    "linear-gradient(135deg, #9A7B4F 0%, #C9A96E 100%)",
    "linear-gradient(135deg, #7B6FA0 0%, #A090C0 100%)",
  ]

  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <UtensilsCrossed size={18} className="text-primary-500" />
          <h2 className="font-serif text-2xl text-stone-900">Menús del día</h2>
        </div>
        <p className="text-xs text-stone-400 capitalize">
          {new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Coverflow */}
      <div
        className="relative select-none"
        style={{ perspective: "1200px", height: 440 }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          {menus.map((menu, i) => {
            const offset = i - active
            const absOffset = Math.abs(offset)

            const translateX = offset * (CARD_WIDTH * 0.65 + CARD_GAP) + (isDragging ? dragDelta * 0.3 : 0)
            const rotateY = offset * -48
            const translateZ = absOffset === 0 ? 80 : absOffset === 1 ? -40 : -120
            const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.88 : 0.75
            const opacity = absOffset === 0 ? 1 : absOffset === 1 ? 0.7 : absOffset === 2 ? 0.4 : 0
            const zIndex = 10 - absOffset

            if (absOffset > 2) return null

            return (
              <div
                key={menu.id}
                style={{
                  position: "absolute",
                  width: CARD_WIDTH,
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  transition: isDragging ? "none" : "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  opacity,
                  zIndex,
                  pointerEvents: absOffset === 0 ? "auto" : "none",
                  transformStyle: "preserve-3d",
                }}
              >
                <Link href={`/negocios/${menu.business.slug}`}>
                  <div
                    className="rounded-3xl overflow-hidden"
                    style={{
                      boxShadow: absOffset === 0
                        ? "0 30px 60px rgba(83,120,149,0.25), 0 10px 20px rgba(0,0,0,0.1)"
                        : "0 10px 30px rgba(0,0,0,0.1)",
                      background: "white",
                      border: absOffset === 0 ? "1.5px solid rgba(83,120,149,0.2)" : "1px solid rgba(200,215,230,0.5)",
                    }}
                  >
                    {/* Header con gradiente */}
                    <div
                      className="p-5 pb-4"
                      style={{ background: gradients[i % gradients.length] }}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-sm flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/30">
                          {menu.business.logo_url ? (
                            <Image src={menu.business.logo_url} alt={menu.business.name} width={44} height={44} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-serif text-white text-lg">{menu.business.name[0]}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-base truncate leading-tight">{menu.business.name}</p>
                          <p className="text-white/70 text-xs truncate">
                            {menu.business.address?.split(",").pop()?.trim()}
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/20 flex-shrink-0">
                          Hoy
                        </span>
                      </div>
                    </div>

                    {/* Platos */}
                    <div className="p-4 space-y-1">
                      {menu.items.map((item, idx) => (
                        <div
                          key={item.id}
                          className={`flex items-start justify-between gap-3 py-2.5 ${
                            idx !== menu.items.length - 1 ? "border-b border-stone-100" : ""
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-800 leading-tight">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-stone-400 mt-0.5 leading-tight">{item.description}</p>
                            )}
                            {item.includes_drink && (
                              <span className="text-xs text-primary-400 mt-1 block">🥤 Incluye bebida</span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-primary-600 flex-shrink-0">
                            ${item.price.toLocaleString("es-AR")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>

        {/* Botones nav */}
        {menus.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm z-20"
            >
              <ChevronLeft size={18} className="text-stone-600" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full border border-stone-200 flex items-center justify-center hover:bg-white transition-colors shadow-sm z-20"
            >
              <ChevronRight size={18} className="text-stone-600" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      {menus.length > 1 && (
        <div className="flex justify-center gap-2 -mt-2">
          {menus.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (autoRef.current) clearInterval(autoRef.current); setActive(i); startAutoPlay() }}
              className={`rounded-full transition-all duration-300 ${
                i === active ? "w-6 h-2 bg-primary-500" : "w-2 h-2 bg-stone-300 hover:bg-stone-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}