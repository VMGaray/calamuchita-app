"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"

const pueblos = [
  "Villa General Belgrano", "Los Reartes", "Santa Rosa de Calamuchita",
  "La Cumbrecita",
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
    <footer className="bg-primary-600 mt-auto">

      {/* Marquee de pueblos */}
      <div className="border-b border-primary-500 py-3 overflow-hidden">
        <motion.div
          className="flex gap-8 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...pueblos, ...pueblos].map((pueblo, i) => (
            <span key={i} className="text-primary-300 text-xs font-medium tracking-widest uppercase flex items-center gap-8">
              {pueblo}
              <span className="text-primary-400">✦</span>
            </span>
          ))}
        </motion.div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Marca */}
          <AnimateIn direction="up" delay={0}>
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <MapPin size={15} className="text-primary-100" />
                </div>
                <span className="font-serif text-sand-100 text-lg">Calamuchita App</span>
              </Link>
              <p className="text-primary-300 text-sm leading-relaxed mb-4">
                La plataforma del Valle de Calamuchita. Gastronomía, servicios, salud, turismo y más.
              </p>
              <p className="text-primary-400 text-xs">
                Córdoba, Argentina
              </p>
            </div>
          </AnimateIn>

          {/* Secciones */}
          <AnimateIn direction="up" delay={0.1}>
            <div>
              <p className="text-xs font-medium text-primary-400 uppercase tracking-wider mb-4">
                Explorar
              </p>
              <div className="grid grid-cols-2 gap-y-2">
                {sections.map(({ label, href }) => (
                  <Link
                    key={label}
                    href={href}
                    className="text-sm text-primary-300 hover:text-sand-100 transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </AnimateIn>

          {/* Para comercios */}
          <AnimateIn direction="up" delay={0.2}>
            <div>
              <p className="text-xs font-medium text-primary-400 uppercase tracking-wider mb-4">
                Para comercios
              </p>
              <ul className="space-y-2 mb-6">
                <li>
                  <Link href="/registro" className="text-sm text-primary-300 hover:text-sand-100 transition-colors">
                    Sumá tu local
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-sm text-primary-300 hover:text-sand-100 transition-colors">
                    Acceder al panel
                  </Link>
                </li>
              </ul>
              <motion.a
                href="/registro"
                className="inline-block bg-accent-400 text-accent-50 px-5 py-2.5 rounded-xl text-sm font-medium"
                whileHover={{ scale: 1.05, backgroundColor: "#E09356" }}
                whileTap={{ scale: 0.97 }}
              >
                Quiero sumarme
              </motion.a>
            </div>
          </AnimateIn>

        </div>

        {/* Bottom */}
        <div className="border-t border-primary-500 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-primary-400">
            © 2025 Calamuchita App · Valle de Calamuchita, Córdoba
          </p>
          <p className="text-xs text-primary-400">
            Hecho con amor en las sierras 🌿
          </p>
        </div>
      </div>

    </footer>
  )
}