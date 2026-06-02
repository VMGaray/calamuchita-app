"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"
import { createClient } from "@/lib/supabase/client"
import { Playfair_Display } from "next/font/google"

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400"],
})

const FALLBACK_PUEBLOS = [
  "Villa General Belgrano",
  "Santa Rosa de Calamuchita",
  "La Cumbrecita",
  "Los Reartes",
  "Embalse",
  "Amboy",
  "Villa del Dique",
  "Villa Rumipal",
  "Potrero de Garay",
  "Villa Yacanto",
  "Villa Alpina",
  "Villa Berna",
  "Villa Ciudad Parque",
  "Villa Quillinzo",
  "La Cruz",
  "Intiyaco",
]

const sections = [
  { label: "Gastronomía", href: "/?seccion=gastronomy" },
  { label: "Servicios", href: "/?seccion=services" },
  { label: "Salud", href: "/?seccion=health" },
  { label: "Educación", href: "/?seccion=education" },
  { label: "Turismo", href: "/?seccion=tourism" },
  { label: "Comercios", href: "/?seccion=commerce" },
  { label: "Eventos", href: "/?seccion=events" },
  { label: "Info útil", href: "/?seccion=info" },
]

export default function Footer() {
  const [pueblos, setPueblos] = useState<string[]>(FALLBACK_PUEBLOS)

  useEffect(() => {
    createClient()
      .from("localities")
      .select("name")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setPueblos(data.map(l => l.name))
      })
  }, [])

  return (
    <footer style={{ background: "#0e1a10", borderTop: "1px solid rgba(225,219,201,0.08)" }}>

      {/* Marquee pueblos */}
      <div className="py-4 overflow-hidden" style={{ borderBottom: "1px solid rgba(225,219,201,0.06)" }}>
        <motion.div
          className="flex gap-10 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        >
          {[...pueblos, ...pueblos].map((pueblo, i) => (
            <span
              key={i}
              className={`${playfair.className} text-base flex items-center gap-10`}
              style={{ color: "rgba(225,219,201,0.55)" }}
            >
              {pueblo}
              <span className="text-xs" style={{ color: "rgba(225,219,201,0.22)" }}>✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Contenido */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          <AnimateIn direction="up" delay={0}>
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(225,219,201,0.1)", border: "1px solid rgba(225,219,201,0.2)" }}>
                  <MapPin size={15} style={{ color: "#E1DBC9" }} />
                </div>
                <span className="font-serif" style={{ color: "#E1DBC9" }}>Calamuchita App</span>
              </Link>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(225,219,201,0.72)" }}>
                La plataforma del Valle de Calamuchita. Gastronomía, servicios, salud, turismo y más.
              </p>
              <p className="text-xs" style={{ color: "rgba(225,219,201,0.55)" }}>Córdoba, Argentina</p>
            </div>
          </AnimateIn>

          <AnimateIn direction="up" delay={0.1}>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "rgba(225,219,201,0.62)" }}>
                Explorar
              </p>
              <div className="grid grid-cols-2 gap-y-2">
                {sections.map(({ label, href }) => (
                  <Link key={label} href={href}
                    className="text-sm transition-colors"
                    style={{ color: "rgba(225,219,201,0.72)" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#E1DBC9")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(225,219,201,0.72)")}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </AnimateIn>

          <AnimateIn direction="up" delay={0.2}>
            <div>
              <motion.a
                href="https://wa.me/5491145311047"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ background: "rgba(225,219,201,0.1)", border: "1px solid rgba(225,219,201,0.2)", color: "#E1DBC9" }}
                whileHover={{ background: "rgba(225,219,201,0.18)" }}
              >
                Quiero sumarme
              </motion.a>
            </div>
          </AnimateIn>
        </div>

        <div className="mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2"
          style={{ borderTop: "1px solid rgba(225,219,201,0.07)" }}>
          <p className="text-xs" style={{ color: "rgba(225,219,201,0.55)" }}>
            © 2025 Calamuchita App · Valle de Calamuchita, Córdoba
          </p>
          <a
            href="https://vmg-setup-ai.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs transition-colors"
            style={{ color: "rgba(225,219,201,0.55)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#E1DBC9")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(225,219,201,0.55)")}
          >
            VMG.Setup.Ai
          </a>
        </div>
      </div>
    </footer>
  )
}
