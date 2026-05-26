"use client"

import { motion } from "framer-motion"
import { Globe, LayoutDashboard, Calculator, Smartphone, ArrowRight } from "lucide-react"
import AnimateIn from "@/components/ui/AnimateIn"

const servicios = [
  {
    icon: Globe,
    titulo: "Página web",
    desc: "Presencia profesional online para tu negocio o servicio.",
  },
  {
    icon: LayoutDashboard,
    titulo: "App de gestión",
    desc: "Administrá turnos, pedidos, clientes y más desde un panel propio.",
  },
  {
    icon: Calculator,
    titulo: "Presupuestador",
    desc: "Generá presupuestos automáticos y profesionales en segundos.",
  },
  {
    icon: Smartphone,
    titulo: "Soluciones a medida",
    desc: "Si tenés una idea, la hacemos realidad. Sin tecnicismos.",
  },
]

const WA_MSG = encodeURIComponent(
  "Hola! Te contacto desde Calamuchita App por una consulta para VMG.Setup.Ai 👋"
)
const WA_URL = `https://wa.me/5491145311047?text=${WA_MSG}`

export default function VMGPromoSection() {
  return (
    <div
      className="relative overflow-hidden py-10 md:py-16 px-4 my-8 md:my-12 rounded-3xl"
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(45,69,48,0.1)",
      }}
    >
      {/* Fondo decorativo */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(45,69,48,0.07) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(45,69,48,0.05) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <AnimateIn direction="up">
          <div className="text-center mb-10">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
              style={{ background: "rgba(45,69,48,0.08)", color: "#2D4530" }}
            >
              VMG.Setup.Ai
            </span>
            <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-3" style={{ color: "#2D4530" }}>
              ¿Tu negocio no tiene<br className="hidden sm:block" /> presencia digital?
            </h2>
            <p className="text-sm md:text-base max-w-xl mx-auto" style={{ color: "rgba(45,69,48,0.6)" }}>
              Creamos sitios web, apps de gestión y herramientas a medida para comercios,
              servicios y emprendimientos del Valle.
            </p>
          </div>
        </AnimateIn>

        {/* Tarjetas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10">
          {servicios.map(({ icon: Icon, titulo, desc }, i) => (
            <AnimateIn key={titulo} direction="up" delay={i * 0.08}>
              <div
                className="rounded-2xl p-4 h-full flex flex-col gap-2 transition-shadow hover:shadow-md"
                style={{
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(45,69,48,0.1)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(45,69,48,0.09)" }}
                >
                  <Icon size={17} style={{ color: "#2D4530" }} />
                </div>
                <p className="text-sm font-semibold leading-tight" style={{ color: "#2D4530" }}>
                  {titulo}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(45,69,48,0.55)" }}>
                  {desc}
                </p>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* CTA */}
        <AnimateIn direction="up" delay={0.32}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold"
              style={{ background: "#2D4530", color: "#E1DBC9" }}
              whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(45,69,48,0.28)" }}
              whileTap={{ scale: 0.97 }}
            >
              Contactame
              <ArrowRight size={15} />
            </motion.a>
            <a
              href="https://vmg-setup-ai.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium transition-colors"
              style={{ color: "rgba(45,69,48,0.5)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#2D4530")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(45,69,48,0.5)")}
            >
              Ver mi web →
            </a>
          </div>
        </AnimateIn>
      </div>
    </div>
  )
}
