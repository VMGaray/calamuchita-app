"use client"

import { useEffect, useState } from "react"
import { motion, useSpring } from "framer-motion"

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0)
  const smoothProgress = useSpring(progress, { stiffness: 200, damping: 30 })

  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      const current = window.scrollY
      setProgress(total > 0 ? current / total : 0)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.div
      className="fixed top-0 left-0 h-0.5 bg-accent-400 z-[9998] origin-left"
      style={{ scaleX: smoothProgress }}
    />
  )
}