"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

type Direction = "up" | "down" | "left" | "right"

interface Props {
  children: ReactNode
  direction?: Direction
  delay?: number
  className?: string
}

const variants = {
  up:    { hidden: { opacity: 0, y: 40 },  visible: { opacity: 1, y: 0 } },
  down:  { hidden: { opacity: 0, y: -40 }, visible: { opacity: 1, y: 0 } },
  left:  { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 40 },  visible: { opacity: 1, x: 0 } },
}

export default function AnimateIn({ children, direction = "up", delay = 0, className }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      variants={variants[direction]}
      className={className}
    >
      {children}
    </motion.div>
  )
}