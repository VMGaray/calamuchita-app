"use client"

import { motion } from "framer-motion"
import TextScramble from "@/components/ui/TextScramble"
import FloatingShapes from "@/components/ui/FloatingShapes"
import MagneticButton from "@/components/ui/MagneticButton"

export default function HeroSection() {
  return (
    <section className="bg-primary-500 px-4 py-16 text-center relative overflow-hidden">

      {/* Shapes 3D flotantes */}
      <FloatingShapes />

      {/* Eyebrow */}
      <motion.span
        className="relative z-10 inline-block bg-primary-400 text-primary-100 text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Valle de Calamuchita · Córdoba
      </motion.span>

      {/* Title con scramble */}
      <h1 className="relative z-10 font-serif text-5xl md:text-6xl text-sand-100 leading-tight mb-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <TextScramble text="Todo el valle," className="block" delay={0.4} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <TextScramble text="en un solo lugar" className="block" delay={0.7} />
        </motion.div>
      </h1>

      {/* Subtitle */}
      <motion.p
        className="relative z-10 text-primary-200 text-base max-w-md mx-auto mb-8 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        Gastronomía, salud, servicios, turismo y más. Explorá lo mejor de los pueblos serranos.
      </motion.p>

      {/* Search */}
      <motion.div
        className="relative z-10 flex max-w-md mx-auto bg-sand-100 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.3 }}
      >
        <input
          type="text"
          placeholder="Buscar restaurantes, servicios..."
          className="flex-1 bg-transparent border-none outline-none px-5 py-3.5 text-stone-700 placeholder:text-stone-400 text-sm"
        />
        <MagneticButton
  className="bg-accent-400 text-accent-50 px-5 py-3.5 text-sm font-medium cursor-pointer"
  onClick={() => {}}
>
  Buscar
</MagneticButton>
      </motion.div>

    </section>
  )
}