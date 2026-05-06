"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"

const pueblos = [
  "Villa General Belgrano", "Los Reartes", "Santa Rosa de Calamuchita",
  "La Cumbrecita", "Yacanto", "Amboy", "Villa Ciudad de América",
  "Embalse", "Villa del Dique",
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
  return (
    <footer style={{ background: "rgba(8,14,26,0.95)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Marquee pueblos */}
      <div className="py-3 overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...pueblos, ...pueblos].map((pueblo, i) => (
            <span key={i} className="text-xs font-medium tracking-widest uppercase flex items-center gap-8"
              style={{ color: "rgba(255,255,255,0.2)" }}>
              {pueblo}
              <span style={{ color: "rgba(255,255,255,0.08)" }}>✦</span>
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
                  style={{ background: "rgba(74,144,217,0.2)", border: "1px solid rgba(74,144,217,0.3)" }}>
                  <MapPin size={15} style={{ color: "#4A90D9" }} />
                </div>
                <span className="font-serif text-white">Calamuchita App</span>
              </Link>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                La plataforma del Valle de Calamuchita. Gastronomía, servicios, salud, turismo y más.
              </p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>Córdoba, Argentina</p>
            </div>
          </AnimateIn>

          <AnimateIn direction="up" delay={0.1}>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                Explorar
              </p>
              <div className="grid grid-cols-2 gap-y-2">
                {sections.map(({ label, href }) => (
                  <Link key={label} href={href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.4)" }}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </AnimateIn>

          <AnimateIn direction="up" delay={0.2}>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.25)" }}>
                Para comercios
              </p>
              <ul className="space-y-2 mb-6">
                <li>
                  <Link href="/registro" className="text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.4)" }}>
                    Sumá tu local
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.4)" }}>
                    Acceder al panel
                  </Link>
                </li>
              </ul>
              <motion.a
                href="/registro"
                className="inline-block px-5 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: "rgba(74,144,217,0.2)", border: "1px solid rgba(74,144,217,0.3)" }}
                whileHover={{ background: "rgba(74,144,217,0.35)" }}
              >
                Quiero sumarme
              </motion.a>
            </div>
          </AnimateIn>
        </div>

        <div className="mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            © 2025 Calamuchita App · Valle de Calamuchita, Córdoba
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
            Hecho con amor en las sierras 🌿
          </p>
        </div>
      </div>
    </footer>
  )
}