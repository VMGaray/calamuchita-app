"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, X, Check } from "lucide-react"
import { useLocalidad } from "@/lib/context/LocalidadContext"
import { LOCALIDADES } from "@/lib/constants/telefonos"
import { activeLocalidadImages } from "@/lib/constants/localidadImages"
import { useScrollLock } from "@/lib/hooks/useScrollLock"

const SHORT: Record<string, string> = {
  "Villa General Belgrano": "VGB",
  "Santa Rosa de Calamuchita": "Santa Rosa",
  "La Cumbrecita": "Cumbrecita",
  "Villa del Dique": "V. del Dique",
  "Villa Rumipal": "V. Rumipal",
  "Potrero de Garay": "Potrero",
}

function short(loc: string) {
  return SHORT[loc] || loc.split(" ").slice(0, 2).join(" ")
}

export default function FloatingLocalidadButton() {
  const { localidad, setLocalidad } = useLocalidad()
  const [open, setOpen] = useState(false)
  useScrollLock(open)

  return (
    <>
      {/* Floating trigger — mobile only */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-4 md:hidden flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl"
        style={{
          zIndex: 50,
          background: "rgba(45,69,48,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1.5px solid rgba(163,177,138,0.55)",
          color: "#E1DBC9",
        }}
        whileTap={{ scale: 0.95 }}
      >
        <MapPin size={15} />
        <span className="text-sm font-medium">{short(localidad)}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 md:hidden"
              style={{ zIndex: 100, background: "rgba(0,0,0,0.55)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            {/* Bottom sheet */}
            <motion.div
              className="fixed bottom-0 left-0 right-0 md:hidden rounded-t-3xl overflow-hidden"
              style={{
                zIndex: 101,
                background: "rgba(28,48,31,0.97)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderTop: "1px solid rgba(163,177,138,0.25)",
                maxHeight: "72vh",
                display: "flex",
                flexDirection: "column",
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-0 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: "rgba(225,219,201,0.25)" }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
                <div>
                  <p className="text-base font-semibold" style={{ color: "#E1DBC9" }}>Elegí tu localidad</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(225,219,201,0.50)" }}>
                    Cambia el fondo y los datos
                  </p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-full"
                  style={{ background: "rgba(255,255,255,0.07)" }}
                >
                  <X size={18} style={{ color: "rgba(225,219,201,0.70)" }} />
                </button>
              </div>

              {/* Divider */}
              <div className="mx-5 flex-shrink-0" style={{ height: 1, background: "rgba(163,177,138,0.15)" }} />

              {/* List */}
              <div className="overflow-y-auto flex-1 py-2">
                {LOCALIDADES.map((loc) => {
                  const isActive = loc === localidad
                  const hasImage = activeLocalidadImages.has(loc)
                  return (
                    <button
                      key={loc}
                      onClick={() => { setLocalidad(loc); setOpen(false) }}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left"
                      style={
                        isActive
                          ? { background: "rgba(163,177,138,0.18)" }
                          : undefined
                      }
                    >
                      <MapPin
                        size={14}
                        style={{ color: isActive ? "#A3B18A" : "rgba(225,219,201,0.35)", flexShrink: 0 }}
                      />
                      <span
                        className="text-sm flex-1"
                        style={{ color: isActive ? "#E1DBC9" : "rgba(225,219,201,0.70)", fontWeight: isActive ? 500 : 400 }}
                      >
                        {loc}
                      </span>
                      {hasImage && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "rgba(163,177,138,0.20)", color: "#A3B18A" }}
                        >
                          foto
                        </span>
                      )}
                      {isActive && <Check size={14} style={{ color: "#A3B18A", flexShrink: 0 }} />}
                    </button>
                  )
                })}
              </div>

              {/* Bottom safe area spacer */}
              <div className="h-6 flex-shrink-0" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
