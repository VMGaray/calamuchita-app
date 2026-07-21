"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Check, ChevronDown, ChevronUp } from "lucide-react"
import { useLocalidad } from "@/lib/context/LocalidadContext"
import { LOCALIDADES, MAIN_LOCALIDADES } from "@/lib/constants/telefonos"

export default function LocalidadSelectorWidget() {
  const { localidad, setLocalidad } = useLocalidad()
  const [showAll, setShowAll] = useState(false)

  const shown = showAll ? LOCALIDADES : MAIN_LOCALIDADES

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#2D4530" }}
          >
            <MapPin size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-serif text-xl leading-tight" style={{ color: "#2D4530" }}>
              ¿Dónde estás?
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(45,69,48,0.82)" }}>
              Elegí tu localidad para ver la información del lugar.
            </p>
          </div>
        </div>

      </div>

      {/* Locality pills */}
      <div className="flex flex-wrap gap-2">
        <motion.button
          onClick={() => setLocalidad("")}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-shadow"
          style={
            !localidad
              ? {
                  background: "#2D4530",
                  color: "#E1DBC9",
                  boxShadow: "0 4px 14px rgba(45,69,48,0.28)",
                }
              : {
                  background: "rgba(255,255,255,0.70)",
                  color: "rgba(45,69,48,0.70)",
                  border: "1px solid rgba(45,69,48,0.12)",
                }
          }
        >
          {!localidad && <Check size={11} strokeWidth={2.5} />}
          Todas
        </motion.button>
        {shown.map(loc => {
          const active = localidad === loc
          return (
            <motion.button
              key={loc}
              onClick={() => setLocalidad(loc)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-shadow"
              style={
                active
                  ? {
                      background: "#2D4530",
                      color: "#E1DBC9",
                      boxShadow: "0 4px 14px rgba(45,69,48,0.28)",
                    }
                  : {
                      background: "rgba(255,255,255,0.70)",
                      color: "rgba(45,69,48,0.70)",
                      border: "1px solid rgba(45,69,48,0.12)",
                    }
              }
            >
              {active && <Check size={11} strokeWidth={2.5} />}
              {loc}
            </motion.button>
          )
        })}

        <button
          onClick={() => setShowAll(s => !s)}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors"
          style={{
            background: "rgba(45,69,48,0.07)",
            color: "rgba(45,69,48,0.55)",
            border: "1px solid rgba(45,69,48,0.12)",
          }}
        >
          {showAll ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {showAll ? "Menos" : `+${LOCALIDADES.length - MAIN_LOCALIDADES.length} más`}
        </button>
      </div>

      {/* Confirmation */}
      <AnimatePresence mode="wait">
        <motion.p
          key={localidad || "todas"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs mt-4"
          style={{ color: "rgba(45,69,48,0.80)" }}
        >
          {localidad ? (
            <>
              Mostrando info para{" "}
              <strong style={{ color: "#2D4530" }}>{localidad}</strong>.
              {" "}Tu elección se guarda automáticamente.
            </>
          ) : (
            "Mostrando información de todo el valle. Elegí una localidad para filtrar."
          )}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
