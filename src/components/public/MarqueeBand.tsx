"use client"

import { motion } from "framer-motion"

const items = [
  "Villa General Belgrano",
  "Los Reartes",
  "Santa Rosa de Calamuchita",
  "La Cumbrecita",
  //"Yacanto",
  //"Amboy",
  //"Villa Ciudad de América",
  //"Embalse",
  //"Villa del Dique",
]

export default function MarqueeBand() {
  return (
    <div
      className="py-2.5 overflow-hidden"
      style={{
        background: "rgba(200,96,58,0.08)",
        borderTop: "1px solid rgba(200,96,58,0.1)",
        borderBottom: "1px solid rgba(200,96,58,0.1)",
      }}
    >
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs font-medium tracking-widest uppercase flex items-center gap-8"
            style={{ color: "rgba(26,18,8,0.35)" }}>
            {item}
            <span style={{ color: "rgba(26,18,8,0.15)" }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}