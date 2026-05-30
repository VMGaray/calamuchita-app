"use client"

import { useEffect } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export default function ScrollProgress() {
  const progress = useMotionValue(0)
  const smoothProgress = useSpring(progress, { stiffness: 200, damping: 30 })

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      progress.set(total > 0 ? window.scrollY / total : 0)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [progress])

  return (
    <motion.div
      className="fixed top-0 left-0 h-0.5 bg-accent-400 z-[9998] origin-left"
      style={{ scaleX: smoothProgress }}
    />
  )
}