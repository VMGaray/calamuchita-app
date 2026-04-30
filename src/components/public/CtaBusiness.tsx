"use client"

import AnimateIn from "@/components/ui/AnimateIn"
import MagneticButton from "@/components/ui/MagneticButton"

export default function CtaBusiness() {
  return (
    <AnimateIn direction="up">
      <div className="bg-primary-600/90 backdrop-blur-sm rounded-2xl px-8 py-10 text-center border border-primary-500/30">
        <h2 className="font-serif text-2xl text-white mb-2">
          ¿Tenés un negocio en el valle?
        </h2>
        <p className="text-primary-200 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
          Sumate a Calamuchita App y llegá a miles de vecinos y turistas todos los días.
        </p>
        <MagneticButton
          href="/registro"
          className="inline-block bg-white text-primary-600 px-6 py-3 rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-50 transition-colors"
        >
          Quiero sumar mi local
        </MagneticButton>
      </div>
    </AnimateIn>
  )
}