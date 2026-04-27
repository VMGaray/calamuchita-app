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
    <div className="bg-accent-400 py-2.5 overflow-hidden">
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-accent-50 text-xs font-medium tracking-widest uppercase flex items-center gap-8">
            {item}
            <span className="text-accent-200">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}