"use client"

import { motion } from "framer-motion"

interface Props {
  text: string
  className?: string
}

export default function InteractiveText({ text, className = "" }: Props) {
  const words = text.split(" ")

  return (
    <span className={`inline-flex flex-wrap justify-center gap-x-4 ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", cursor: "default" }}
          whileHover={{
            y: -8,
            scale: 1.08,
            color: "#D4E2F4",
            textShadow: "0 8px 30px rgba(163,189,237,0.6)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  )
}