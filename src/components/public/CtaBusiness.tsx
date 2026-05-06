"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"
import MagneticButton from "@/components/ui/MagneticButton"

export default function CtaBusiness() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number
    let t = 0

    const setSize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    setSize()
    setTimeout(setSize, 100)
    window.addEventListener("resize", setSize)

    // Líneas de grilla 3D perspectiva
    const drawGrid = () => {
      const W = canvas.width
      const H = canvas.height
      const horizon = H * 0.52
      const fov = W * 0.9
      const cols = 12
      const rows = 10
      const speed = 0.4

      // Líneas horizontales (van hacia el horizonte)
      for (let r = 0; r <= rows; r++) {
        const progress = ((r / rows) + (t * speed * 0.015)) % 1
        const z = progress
        const y = horizon + (H - horizon) * z
        const scaleX = z * fov
        const alpha = z * 0.35

        ctx.beginPath()
        ctx.moveTo(W / 2 - scaleX, y)
        ctx.lineTo(W / 2 + scaleX, y)
        ctx.strokeStyle = `rgba(200,96,58,${alpha})`
        ctx.lineWidth = z * 1.2
        ctx.stroke()
      }

      // Líneas verticales (van al punto de fuga)
      for (let c = 0; c <= cols; c++) {
        const xRatio = c / cols - 0.5
        ctx.beginPath()
        ctx.moveTo(W / 2 + xRatio * fov * 0.08, horizon)
        ctx.lineTo(W / 2 + xRatio * fov, H + 20)
        const alpha = 0.12 + Math.abs(xRatio) * 0.08
        ctx.strokeStyle = `rgba(200,96,58,${alpha})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
    }

    // Partículas flotantes doradas
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * 1200,
      y: Math.random() * 400,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.5 + 0.2,
      pulseOffset: Math.random() * Math.PI * 2,
      isStar: Math.random() > 0.7,
      color: [
        { r: 212, g: 160, b: 60 },
        { r: 230, g: 185, b: 90 },
        { r: 245, g: 210, b: 120 },
        { r: 200, g: 96, b: 58 },
      ][Math.floor(Math.random() * 4)]
    }))

    const drawParticles = () => {
      const W = canvas.width
      const H = canvas.height

      particles.forEach(p => {
        const pulse = Math.sin(t * 1.5 + p.pulseOffset)
        const a = p.alpha * (0.7 + 0.3 * pulse)
        const r = p.r * (0.85 + 0.15 * pulse)
        const { r: cr, g, b } = p.color

        if (p.isStar) {
          const halo = r * 7
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, halo)
          grad.addColorStop(0, `rgba(${cr},${g},${b},${a})`)
          grad.addColorStop(0.3, `rgba(${cr},${g},${b},${a * 0.3})`)
          grad.addColorStop(1, `rgba(${cr},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(p.x, p.y, halo, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()

          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,240,180,${a})`
          ctx.fill()

          ctx.save()
          ctx.globalAlpha = a * 0.5
          ctx.strokeStyle = `rgba(255,230,150,0.8)`
          ctx.lineWidth = 0.5
          const ray = r * 8
          ctx.beginPath()
          ctx.moveTo(p.x - ray, p.y); ctx.lineTo(p.x + ray, p.y)
          ctx.moveTo(p.x, p.y - ray); ctx.lineTo(p.x, p.y + ray)
          ctx.stroke()
          ctx.restore()
        } else {
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 3)
          grad.addColorStop(0, `rgba(255,240,180,${a})`)
          grad.addColorStop(0.4, `rgba(${cr},${g},${b},${a * 0.7})`)
          grad.addColorStop(1, `rgba(${cr},${g},${b},0)`)
          ctx.beginPath()
          ctx.arc(p.x, p.y, r * 3, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()
        }

        p.x += p.vx; p.y += p.vy
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W }
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
      })
    }

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)
      drawGrid()
      drawParticles()
      t += 0.016
      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", setSize)
    }
  }, [])

  return (
    <div
      className="relative rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #1a0d05 0%, #2d1508 50%, #1a0d05 100%)",
        minHeight: 340,
      }}
    >
      {/* Canvas 3D */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Overlay gradiente central para legibilidad */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(26,13,5,0.55) 0%, transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Borde brillante coral */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          border: "1px solid rgba(200,96,58,0.3)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Contenido */}
      <div
        className="relative flex flex-col items-center justify-center text-center px-8 py-16 gap-6"
        style={{ zIndex: 3, minHeight: 340 }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase"
          style={{
            background: "rgba(200,96,58,0.15)",
            border: "1px solid rgba(200,96,58,0.3)",
            color: "#e8a882",
          }}
        >
          <span>🏔</span> Valle de Calamuchita
        </motion.div>

        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif leading-tight"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "rgba(255,255,255,0.97)",
            maxWidth: 640,
            textShadow: "0 2px 40px rgba(223, 134, 102, 0.973)",
          }}
        >
          ¿Querés formar parte de <br />CALAMUCHITA APP?
        </motion.h2>

        {/* Subtítulo */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-base leading-relaxed max-w-md"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Tenes un negocio, brindas algún servicio, sumate!! 
        </motion.p>

        {/* Stats rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex items-center gap-8"
        >
          {[
            { value: "16", label: "localidades" },
            { value: "∞", label: "alcance" },
            { value: "24/7", label: "disponible" },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-0.5">
              <span
                className="font-serif text-2xl"
                style={{ color: "#e8a882" }}
              >
                {stat.value}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full"
        >
          {/* BOTÓN CENTRADO Y MAGNÉTICO */}
          <div className="pt-6 flex justify-center">
            <motion.a
              href="https://wa.me/541145311047"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-12 py-5 bg-[#d4af37] rounded-2xl flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(212,175,55,0.3)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              <span className="relative z-10 text-black font-black uppercase tracking-tighter">
                Escribime ahora
              </span>
              <Send size={18} className="relative z-10 text-black group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}