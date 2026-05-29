"use client"

import { motion } from "framer-motion"

interface Props {
  text: string
  className?: string
}

export default function InteractiveText({ text, className = "" }: Props) {
  const words = text.split(" ")

  return (
    // inline (not flex) eliminates flex-wrap reflow that was shifting content
    // margin-right uses em so spacing scales with font-size across breakpoints
    <span className={`inline leading-[inherit] ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          style={{
            display: "inline-block",
            cursor: "default",
            marginRight: i < words.length - 1 ? "0.28em" : 0,
          }}
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