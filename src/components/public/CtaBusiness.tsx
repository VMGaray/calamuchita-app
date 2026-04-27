"use client"

import { motion } from "framer-motion"
import AnimateIn from "@/components/ui/AnimateIn"

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
        <motion.a
          href="/registro"
          className="inline-block bg-accent-400 text-accent-50 px-6 py-3 rounded-xl text-sm font-medium"
          whileHover={{ scale: 1.05, backgroundColor: "#E09356" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          Quiero sumar mi local
        </motion.a>
      </div>
    </AnimateIn>
  )
}