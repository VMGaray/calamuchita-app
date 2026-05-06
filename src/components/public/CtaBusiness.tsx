"use client"

import AnimateIn from "@/components/ui/AnimateIn"
import MagneticButton from "@/components/ui/MagneticButton"

export default function CtaBusiness() {
  return (
    <AnimateIn direction="up">
      <div
        className="rounded-3xl px-8 py-12 text-center"
        style={{
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <h2 className="font-serif text-3xl text-white mb-3">
          ¿Tenés un negocio en el valle?
        </h2>
        <p className="text-sm mb-8 leading-relaxed max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
          Sumate a Calamuchita App y llegá a miles de vecinos y turistas todos los días.
        </p>
        <MagneticButton
          href="/registro"
          className="inline-block bg-white text-dark-600 px-8 py-3.5 rounded-2xl text-sm font-medium cursor-pointer hover:bg-white/90 transition-colors"
          style={{ color: "#0f1a2e" }}
        >
          Quiero sumar mi local
        </MagneticButton>
      </div>
    </AnimateIn>
  )
}