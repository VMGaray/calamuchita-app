"use client"

import { useEffect, useRef } from "react"

export default function CustomCursor() {
  const bigRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Sin cursor en touch devices
    if (typeof window === "undefined") return
    if (window.matchMedia("(hover: none)").matches) return

    const big = bigRef.current
    const dot = dotRef.current
    if (!big || !dot) return

    let mouseX = -100, mouseY = -100
    let lagX = -100, lagY = -100
    let hovering = false
    let rafId: number

    // RAF único — manipulación directa del DOM, cero re-renders de React
    const animate = () => {
      lagX += (mouseX - lagX) * 0.12
      lagY += (mouseY - lagY) * 0.12

      const size = hovering ? 48 : 32
      big.style.width = `${size}px`
      big.style.height = `${size}px`
      big.style.transform = `translate(${lagX - size / 2}px, ${lagY - size / 2}px)`
      big.style.backgroundColor = hovering ? "rgba(45, 106, 79, 0.1)" : "transparent"

      dot.style.transform = `translate(${mouseX - 3}px, ${mouseY - 3}px)`
      dot.style.opacity = hovering ? "0" : "1"

      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      big.style.opacity = "1"
      if (!hovering) dot.style.opacity = "1"
    }

    const onLeave = () => {
      big.style.opacity = "0"
      dot.style.opacity = "0"
    }

    // Event delegation — cubre elementos añadidos dinámicamente
    const onOver = (e: MouseEvent) => {
      hovering = !!(e.target as Element).closest("a, button, [data-hover]")
    }

    window.addEventListener("mousemove", onMove)
    document.addEventListener("mouseleave", onLeave)
    document.addEventListener("mouseover", onOver)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseleave", onLeave)
      document.removeEventListener("mouseover", onOver)
    }
  }, []) // Se monta una sola vez

  return (
    <>
      <div
        ref={bigRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border border-primary-500"
        style={{ opacity: 0, width: 32, height: 32, willChange: "transform" }}
      />
      <div
        ref={dotRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-primary-500"
        style={{ opacity: 0, width: 6, height: 6, willChange: "transform" }}
      />
    </>
  )
}
