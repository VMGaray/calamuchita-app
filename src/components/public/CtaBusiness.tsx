"use client"

import AnimateIn from "@/components/ui/AnimateIn"
import MagneticButton from "@/components/ui/MagneticButton"

export default function CtaBusiness() {
  return (
    <AnimateIn direction="up">
      <div className="bg-primary-600 rounded-2xl px-8 py-10 text-center">
        <h2 className="font-serif text-2xl text-sand-100 mb-2">
          ¿Tenés un negocio en el valle?
        </h2>
        <p className="text-primary-200 text-sm mb-6 leading-relaxed max-w-sm mx-auto">
          Sumate a Calamuchita App y llegá a miles de vecinos y turistas todos los días.
        </p>
        <MagneticButton
          href="/registro"
          className="inline-block bg-accent-400 text-accent-50 px-6 py-3 rounded-xl text-sm font-medium cursor-pointer"
        >
          Quiero sumar mi local
        </MagneticButton>
      </div>
    </AnimateIn>
  )
}