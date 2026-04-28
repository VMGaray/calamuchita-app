"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dotPos, setDotPos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleEnter = () => setIsVisible(true)
    const handleLeave = () => setIsVisible(false)

    window.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseenter", handleEnter)
    document.addEventListener("mouseleave", handleLeave)

    const interval = setInterval(() => {
      setDotPos(prev => ({
        x: prev.x + (pos.x - prev.x) * 0.12,
        y: prev.y + (pos.y - prev.y) * 0.12,
      }))
    }, 16)

    const handleHoverOn = () => setIsHovering(true)
    const handleHoverOff = () => setIsHovering(false)

    const interactives = document.querySelectorAll("a, button, [data-hover]")
    interactives.forEach(el => {
      el.addEventListener("mouseenter", handleHoverOn)
      el.addEventListener("mouseleave", handleHoverOff)
    })

    return () => {
      window.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseenter", handleEnter)
      document.removeEventListener("mouseleave", handleLeave)
      clearInterval(interval)
      interactives.forEach(el => {
        el.removeEventListener("mouseenter", handleHoverOn)
        el.removeEventListener("mouseleave", handleHoverOff)
      })
    }
  }, [pos.x, pos.y])

  if (typeof window === "undefined") return null

  return (
    <>
      {/* Círculo grande con delay */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-primary-500"
        animate={{
          x: dotPos.x - (isHovering ? 24 : 16),
          y: dotPos.y - (isHovering ? 24 : 16),
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          opacity: isVisible ? 1 : 0,
          backgroundColor: isHovering ? "rgba(45, 106, 79, 0.1)" : "transparent",
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
      />

      {/* Punto central que sigue exacto */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-primary-500"
        animate={{
          x: pos.x - 3,
          y: pos.y - 3,
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0 }}
        style={{ width: 6, height: 6 }}
      />
    </>
  )
}