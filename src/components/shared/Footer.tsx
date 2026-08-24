"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { MapPin, UtensilsCrossed } from "lucide-react"
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
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    createClient()
      .from("localities")
      .select("name")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) setPueblos(data.map(l => l.name))
      })
  }, [])

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true
    if (standalone) return

    const ua = navigator.userAgent
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua)
    if (isMobile) setCanInstall(true)

    // También mostrar si llega el evento en desktop
    const onPrompt = () => setCanInstall(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const handleInstallFromFooter = async () => {
    const ua = navigator.userAgent
    const ios = /iPhone|iPad|iPod/.test(ua)

    if (ios) {
      alert('Para instalar: tocá el ícono Compartir ⬆ en la barra de Safari y después tocá "Agregar a inicio"')
      return
    }

    const prompt = (window as any).__pwaPrompt
    if (prompt) {
      prompt.prompt()
      await prompt.userChoice
      ;(window as any).__pwaPrompt = null
      setCanInstall(false)
      return
    }

    // Sin prompt nativo disponible — instrucciones manuales Android/Chrome
    alert('Para instalar: tocá los tres puntitos ⋮ arriba a la derecha en Chrome y elegí "Instalar app" o "Agregar a pantalla de inicio"')
  }

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
                href="https://wa.me/5493546547950"
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

        <div className="mt-10 pt-6 flex flex-col gap-4"
          style={{ borderTop: "1px solid rgba(225,219,201,0.07)" }}>

          {/* Fila 1: copyright e ingreso gastronómico */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="flex flex-col items-center md:items-start gap-1">
              <Link
                href="/gastronomicos"
                className="text-xs transition-colors inline-flex items-center gap-1"
                style={{ color: "rgba(225,219,201,0.3)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(225,219,201,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(225,219,201,0.3)")}
              >
                <UtensilsCrossed size={12} style={{ color: "inherit" }} />
                Ingreso gastronómico →
              </Link>
              <p className="text-xs" style={{ color: "rgba(225,219,201,0.55)" }}>
                © 2026 Calamuchita App · Valle de Calamuchita, Córdoba
              </p>
            </div>

            {/* Links legales */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <Link
                href="/politica-de-privacidad"
                className="text-xs transition-colors"
                style={{ color: "rgba(225,219,201,0.55)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#E1DBC9")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(225,219,201,0.55)")}
              >
                Política de Privacidad
              </Link>
              <Link
                href="/eliminar-cuenta"
                className="text-xs transition-colors"
                style={{ color: "rgba(225,219,201,0.55)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#E1DBC9")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(225,219,201,0.55)")}
              >
                Eliminar mi cuenta
              </Link>
              <span className="text-xs inline-flex items-center gap-1" style={{ color: "rgba(225,219,201,0.55)" }}>
                Desarrollado por
                <a
                  href="https://vmg-setup-ai.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  style={{ color: "rgba(225,219,201,0.55)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#E1DBC9")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(225,219,201,0.55)")}
                >
                  VMG.Setup.Ai
                </a>
              </span>
            </div>
          </div>

          {/* Fila 2: botón instalar — solo en mobile, centrado y en su propia fila */}
          {canInstall && (
            <div className="flex justify-center md:justify-end">
              <button
                onClick={handleInstallFromFooter}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: "rgba(200,96,58,0.15)",
                  color: "#c8603a",
                  border: "1px solid rgba(200,96,58,0.3)"
                }}
              >
                📲 Instalá la app
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
