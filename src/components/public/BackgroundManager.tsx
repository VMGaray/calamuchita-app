"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useLocalidad } from "@/lib/context/LocalidadContext"
import { localidadImages, activeLocalidadImages } from "@/lib/constants/localidadImages"

interface Props {
  children: React.ReactNode
}

export default function BackgroundManager({ children }: Props) {
  const { localidad } = useLocalidad()
  const imgSrc = activeLocalidadImages.has(localidad) ? localidadImages[localidad] : undefined

  return (
    <>
      {/* Imagen con Ken Burns — pointer-events-none en todas las capas, sin excepción */}
      <div
        className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{ zIndex: -20, background: "#2D4530" }}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={localidad}
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 22, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              style={
                imgSrc
                  ? { backgroundImage: `url(${imgSrc})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: "linear-gradient(145deg, #2D4530 0%, #4A6D4F 55%, #3A5C3F 100%)" }
              }
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Overlay verde */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -19, background: "rgba(45,69,48,0.6)" }}
      />

      {/* Gradiente de contraste */}
      <div
        className="fixed inset-0 pointer-events-none bg-gradient-to-b from-black/70 via-transparent to-black/20"
        style={{ zIndex: -18 }}
      />

      {/* Contenido de la página */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </>
  )
}
