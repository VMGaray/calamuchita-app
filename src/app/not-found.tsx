"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { MapPin } from "lucide-react"

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number
    let t = 0
    let mouseX = 0.5

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    setTimeout(resize, 100)
    window.addEventListener("resize", resize)

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = (e.clientX - rect.left) / rect.width
    }
    window.addEventListener("mousemove", handleMouse)

    const animate = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const layers = [
        {
          color: "rgba(200,96,58,0.06)",
          yBase: H * 0.82,
          shift: 0.015,
          peaks: [0.0, 0.18, 0.38, 0.55, 0.72, 0.9, 1.0],
          heights: [0.22, 0.35, 0.18, 0.42, 0.28, 0.38, 0.2],
        },
        {
          color: "rgba(200,96,58,0.09)",
          yBase: H * 0.88,
          shift: 0.025,
          peaks: [0.0, 0.15, 0.32, 0.52, 0.7, 0.88, 1.0],
          heights: [0.18, 0.3, 0.14, 0.36, 0.22, 0.32, 0.15],
        },
        {
          color: "rgba(200,96,58,0.14)",
          yBase: H * 0.93,
          shift: 0.04,
          peaks: [0.0, 0.2, 0.42, 0.62, 0.82, 1.0],
          heights: [0.12, 0.26, 0.1, 0.3, 0.18, 0.1],
        },
      ]

      layers.forEach((layer, li) => {
        const wave = Math.sin(t * 0.4 + li) * 0.008
        const parallax = (mouseX - 0.5) * layer.shift

        const pts = layer.peaks.map((x, i) => ({
          x: (x + parallax + wave) * W,
          y: layer.yBase - layer.heights[i] * H * 0.45 + Math.sin(t * 0.3 + i + li) * 3,
        }))

        ctx.beginPath()
        ctx.moveTo(-10, H)
        ctx.lineTo(pts[0].x, pts[0].y)

        for (let i = 0; i < pts.length - 1; i++) {
          const cpx = (pts[i].x + pts[i + 1].x) / 2
          const cpy = (pts[i].y + pts[i + 1].y) / 2
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, cpx, cpy)
        }

        const last = pts[pts.length - 1]
        ctx.lineTo(last.x, last.y)
        ctx.lineTo(W + 10, H)
        ctx.closePath()
        ctx.fillStyle = layer.color
        ctx.fill()
      })

      // Estrellas
      const stars = [
        [0.1, 0.18], [0.25, 0.09], [0.45, 0.14],
        [0.65, 0.07], [0.8, 0.17], [0.9, 0.11], [0.55, 0.24],
      ]
      stars.forEach(([x, y], si) => {
        const pulse = 0.7 + 0.3 * Math.sin(t * 1.2 + si * 1.7)
        ctx.beginPath()
        ctx.arc(x * W, y * H, 1.5 * pulse, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,96,58,${0.3 * pulse})`
        ctx.fill()

        ctx.save()
        ctx.translate(x * W, y * H)
        ctx.strokeStyle = `rgba(200,96,58,${0.18 * pulse})`
        ctx.lineWidth = 0.5
        ;[0, 90, 45, 135].forEach(deg => {
          const rad = (deg * Math.PI) / 180
          ctx.beginPath()
          ctx.moveTo(Math.cos(rad) * 3, Math.sin(rad) * 3)
          ctx.lineTo(Math.cos(rad) * (5 + 2 * pulse), Math.sin(rad) * (5 + 2 * pulse))
          ctx.stroke()
        })
        ctx.restore()
      })

      t += 0.016
      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouse)
    }
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
      style={{ background: "#f5ede4" }}
    >
      {/* Canvas montañas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center gap-5">

        {/* 404 con pin flotante */}
        <div className="relative">
          <p
            className="font-serif select-none"
            style={{
              fontSize: "clamp(100px, 20vw, 160px)",
              color: "rgba(200,96,58,0.1)",
              lineHeight: 1,
              letterSpacing: "-4px",
            }}
          >
            404
          </p>
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "#c8603a",
                boxShadow: "0 8px 24px rgba(200,96,58,0.35)",
              }}
            >
              <MapPin size={28} color="white" />
            </div>
          </div>
        </div>

        {/* Texto */}
        <h1
          className="font-serif"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", color: "#2a1a08" }}
        >
          Te perdiste en el valle
        </h1>
        <p
          className="text-sm max-w-xs leading-relaxed"
          style={{ color: "rgba(42,26,8,0.5)" }}
        >
          Esta página no existe o fue movida. Volvé al inicio y encontrá todo el Valle de Calamuchita.
        </p>

        {/* Botón */}
        <Link
          href="/"
          className="px-10 py-3.5 rounded-2xl text-sm font-medium transition-all"
          style={{
            background: "#c8603a",
            color: "white",
            boxShadow: "0 4px 16px rgba(200,96,58,0.35)",
          }}
        >
          Volver al inicio
        </Link>
      </div>

      {/* Animación CSS del pin */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}