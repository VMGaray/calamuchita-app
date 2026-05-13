"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useLocalidad } from "@/lib/context/LocalidadContext"
import { localidadImages, activeLocalidadImages } from "@/lib/constants/localidadImages"

function Background() {
  const { localidad } = useLocalidad()
  const imgSrc = activeLocalidadImages.has(localidad) ? localidadImages[localidad] : undefined

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      // z-index 5: encima del valle.jpg (z-0) pero debajo del header nav (z-10)
      // y del contenido principal (z-30). Al estar en el Portal (body), participa
      // en el root stacking context en lugar del z-30 del layout.
      style={{ zIndex: 5, background: "#2D4530" }}
    >
      <AnimatePresence>
        <motion.div
          key={localidad}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1.07 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            style={
              imgSrc
                ? { backgroundImage: `url(${imgSrc})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: "linear-gradient(145deg, #2D4530 0%, #4A6D4F 55%, #3A5C3F 100%)" }
            }
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay verde 62 % para legibilidad del texto blanco */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(45,69,48,0.62)" }}
      />
    </div>
  )
}

export default function FullPageBackground() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // Solo renderiza en el cliente para evitar mismatch de hidratación
  if (!mounted) return null

  return createPortal(<Background />, document.body)
}
