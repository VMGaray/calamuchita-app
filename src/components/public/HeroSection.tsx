"use client"

import { motion } from "framer-motion"

const words = ["Todo", "el", "valle,", "en", "un", "solo", "lugar"]

export default function HeroSection() {
  return (
    <section className="bg-primary-500 px-4 py-16 text-center relative overflow-hidden">

      {/* Floating elements */}
      <motion.div
        className="absolute top-12 left-16 text-primary-300 text-4xl opacity-30"
        animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        🌿
      </motion.div>
      <motion.div
        className="absolute top-20 right-20 text-primary-300 text-3xl opacity-20"
        animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        ⛰️
      </motion.div>
      <motion.div
        className="absolute bottom-16 left-24 text-primary-300 text-2xl opacity-20"
        animate={{ y: [0, -8, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        🍽️
      </motion.div>
      <motion.div
        className="absolute bottom-12 right-16 text-primary-300 text-3xl opacity-20"
        animate={{ y: [0, 8, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        🌄
      </motion.div>

      {/* Eyebrow */}
      <motion.span
        className="inline-block bg-primary-400 text-primary-100 text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Valle de Calamuchita · Córdoba
      </motion.span>

      {/* Title word by word */}
      <h1 className="font-serif text-5xl md:text-6xl text-sand-100 leading-tight mb-4">
        <span className="flex flex-wrap justify-center gap-x-4">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.3 + i * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              style={{ display: "inline-block" }}
            >
              {word}
            </motion.span>
          ))}
        </span>
      </h1>

      {/* Subtitle */}
      <motion.p
        className="text-primary-200 text-base max-w-md mx-auto mb-8 leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        Gastronomía, salud, servicios, turismo y más. Explorá lo mejor de los pueblos serranos.
      </motion.p>

      {/* Search */}
      <motion.div
        className="flex max-w-md mx-auto bg-sand-100 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.3 }}
      >
        <input
          type="text"
          placeholder="Buscar restaurantes, servicios..."
          className="flex-1 bg-transparent border-none outline-none px-5 py-3.5 text-stone-700 placeholder:text-stone-400 text-sm"
        />
        <motion.button
          className="bg-accent-400 text-accent-50 px-5 py-3.5 text-sm font-medium"
          whileHover={{ backgroundColor: "#E09356" }}
          whileTap={{ scale: 0.97 }}
        >
          Buscar
        </motion.button>
      </motion.div>

    </section>
  )
}