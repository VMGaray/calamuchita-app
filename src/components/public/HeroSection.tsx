"use client"

import { motion } from "framer-motion"
import TextScramble from "@/components/ui/TextScramble"
import MagneticButton from "@/components/ui/MagneticButton"
import dynamic from "next/dynamic"
import InteractiveText from "@/components/ui/InteractiveText"

const WebGLBackground = dynamic(() => import("@/components/public/WebGLBackground"), { ssr: false })

export default function HeroSection() {
  return (
    <section className="relative px-4 py-16 text-center overflow-hidden" style={{ minHeight: "520px" }}>

      {/* WebGL background */}
      <WebGLBackground />

      {/* Grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <svg width="100%" height="100%">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" opacity="1"/>
        </svg>
      </div>

      {/* Eyebrow */}
      <motion.span
        className="relative z-10 inline-block bg-white/15 backdrop-blur-sm text-white border border-white/30 text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Valle de Calamuchita · Córdoba
      </motion.span>

      {/* Title */}
     <h1
  className="relative z-10 font-serif text-5xl md:text-6xl text-white leading-tight mb-4"
  style={{ textShadow: "0 2px 30px rgba(0,0,0,0.15)" }}
>
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.3 }}
    className="block"
  >
    <InteractiveText text="Todo el valle," />
  </motion.div>
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, delay: 0.6 }}
    className="block"
  >
    <InteractiveText text="en un solo lugar" />
  </motion.div>
</h1>

      {/* Subtitle */}
      <motion.p
        className="relative z-10 text-white/75 text-base max-w-md mx-auto mb-8 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        Gastronomía, salud, servicios, turismo y más. Explorá lo mejor del Valle de Calamuchita.
      </motion.p>

      {/* Search */}
      <motion.div
        className="relative z-10 flex max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden"
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
        >
          Buscar
        </MagneticButton>
      </motion.div>

    </section>
  )
}