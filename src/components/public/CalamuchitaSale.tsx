"use client"

import { useRef, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Share2, ArrowRight, Tag, Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import AnimateIn from "@/components/ui/AnimateIn"

type PromoBusiness = {
  id: string
  name: string
  slug: string
  section: string
}

type Promotion = {
  id: string
  title: string
  description: string | null
  discount_percentage: number | null // Coincide con la base de datos
  discount_label: string | null
  valid_until: string | null
  businesses: PromoBusiness | null
}

const SECTION_BG = "#EBE3D5"

const ticketMask: React.CSSProperties = {
  maskImage: [
    "radial-gradient(circle 15px at 0px 50%, transparent 14px, black 15px)",
    "radial-gradient(circle 15px at 100% 50%, transparent 14px, black 15px)",
  ].join(", "),
  WebkitMaskImage: [
    "radial-gradient(circle 15px at 0px 50%, transparent 14px, black 15px)",
    "radial-gradient(circle 15px at 100% 50%, transparent 14px, black 15px)",
  ].join(", "),
  maskComposite: "intersect",
  WebkitMaskComposite: "destination-in",
}

function TicketCard({
  promo,
  onShare,
}: {
  promo: Promotion
  onShare: () => void
}) {
  const biz = promo.businesses
  
  // Usamos discount_percentage para generar el label si no existe discount_label
  const discountLabel =
    promo.discount_label ||
    (promo.discount_percentage ? `${promo.discount_percentage}% OFF` : "Oferta especial")

  const validDate = promo.valid_until
    ? new Date(promo.valid_until + "T12:00:00").toLocaleDateString("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 16px 40px rgba(45,26,14,0.14)" }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      className="rounded-2xl overflow-hidden border-2 border-dashed"
      style={{
        ...ticketMask,
        borderColor: "#C4A480",
        background: "#FFFAF4",
      }}
    >
      {/* Discount banner */}
      <div
        className="flex flex-col items-center justify-center py-6 px-4 text-center"
        style={{
          background: "linear-gradient(135deg, #B85C38 0%, #D47A56 100%)",
        }}
      >
        <p
          className="font-black text-4xl md:text-5xl text-white tracking-tight leading-none"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.20)" }}
        >
          {discountLabel}
        </p>
        <p className="text-xs font-semibold mt-2 uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.78)" }}>
          {promo.title}
        </p>
      </div>

      {/* Dashed divider */}
      <div
        className="mx-4"
        style={{ borderTop: "2px dashed #D4B896", margin: "0 16px" }}
      />

      {/* Details */}
      <div className="px-4 py-4">
        {biz && (
          <p className="font-bold text-sm mb-1" style={{ color: "#2D1A0E" }}>
            {biz.name}
          </p>
        )}
        {promo.description && (
          <p
            className="text-xs leading-relaxed mb-3"
            style={{ color: "rgba(45,26,14,0.58)" }}
          >
            {promo.description}
          </p>
        )}
        {validDate && (
          <div className="flex items-center gap-1.5 mb-4">
            <Calendar size={11} style={{ color: "rgba(45,26,14,0.42)" }} />
            <span className="text-xs" style={{ color: "rgba(45,26,14,0.42)" }}>
              Válido hasta: {validDate}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-70 active:opacity-50"
            style={{
              background: "rgba(45,26,14,0.07)",
              color: "#2D1A0E",
            }}
          >
            <Share2 size={12} />
            Compartir
          </button>

          {biz && (
            <Link
              href={`/negocios/${biz.slug}`}
              className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: "#B85C38" }}
            >
              Ver promo <ArrowRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function CalamuchitaSale({
  promotions,
}: {
  promotions: Promotion[]
}) {
  if (!promotions || promotions.length === 0) return null

  const scrollRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

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
  }, [])

  const scrollBy = (dir: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === "left" ? -(el.clientWidth * 0.85) : el.clientWidth * 0.85, behavior: "smooth" })
  }

  const handleShare = async (promo: Promotion) => {
    const biz = promo.businesses
    if (!biz) return
    const url = `${window.location.origin}/negocios/${biz.slug}`
    const label =
      promo.discount_label ||
      (promo.discount_percentage ? `${promo.discount_percentage}% OFF` : "una oferta especial")
    const text = `¡Mirá esta promo en Calamuchita App!: ${biz.name} tiene ${label}. Mirala acá:`

    if (navigator.share) {
      await navigator.share({ title: "Calamuchita App", text, url }).catch(() => {})
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`)
    }
  }

  return (
    <section
      className="mb-12 rounded-3xl px-6 md:px-8 py-8"
      style={{ background: SECTION_BG }}
    >
      <AnimateIn direction="left">
        <div className="flex items-center gap-2 mb-1">
          <Tag size={14} style={{ color: "#B85C38" }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#B85C38" }}>
            Ofertas vigentes
          </span>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl mb-6" style={{ color: "#2D1A0E" }}>
          Calamuchita Sale
        </h2>
      </AnimateIn>

      {/* ── MOBILE: carrusel con flechas ── */}
      <div className="md:hidden relative">
        {promotions.length > 1 && (
          <>
            <button
              onClick={() => scrollBy("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-opacity duration-200"
              style={{
                background: "rgba(184,92,56,0.85)",
                border: "1px solid rgba(196,164,128,0.5)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                opacity: atStart ? 0 : 1,
                pointerEvents: atStart ? "none" : "auto",
              }}
              aria-label="Anterior"
            >
              <ChevronLeft size={16} color="#FFFAF4" />
            </button>
            <button
              onClick={() => scrollBy("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full transition-opacity duration-200"
              style={{
                background: "rgba(184,92,56,0.85)",
                border: "1px solid rgba(196,164,128,0.5)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                opacity: atEnd ? 0 : 1,
                pointerEvents: atEnd ? "none" : "auto",
              }}
              aria-label="Siguiente"
            >
              <ChevronRight size={16} color="#FFFAF4" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory -mx-2 px-2 pb-2"
        >
          {promotions.map((promo) => (
            <div key={promo.id} className="w-[85vw] flex-shrink-0 snap-center">
              <TicketCard promo={promo} onShare={() => handleShare(promo)} />
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP: grilla original ── */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        {promotions.map((promo, i) => (
          <AnimateIn key={promo.id} direction="up" delay={i * 0.07}>
            <TicketCard promo={promo} onShare={() => handleShare(promo)} />
          </AnimateIn>
        ))}
      </div>
    </section>
  )
}