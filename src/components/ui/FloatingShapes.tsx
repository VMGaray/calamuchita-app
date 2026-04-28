"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function FloatingShapes() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const progress = Math.min(scrollY / 400, 1)

  const leftX = -progress * 80
  const rightX = progress * 80
  const topY = -progress * 60
  const rotate1 = progress * 40
  const rotate2 = -progress * 50
  const rotate3 = 12 + progress * 58
  const scale1 = 1 + progress * 0.15

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Flor grande — izquierda */}
      <motion.div
        className="absolute -left-8 top-4"
        animate={{ x: leftX, rotate: rotate1, scale: scale1 }}
        transition={{ type: "tween", duration: 0 }}
      >
        <svg width="200" height="200" viewBox="0 0 180 180" fill="none">
          <defs>
            <radialGradient id="flower1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#74C69D" />
              <stop offset="100%" stopColor="#1B4332" />
            </radialGradient>
            <radialGradient id="petal1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#B7E4C7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#52B788" stopOpacity="0.6" />
            </radialGradient>
          </defs>
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <ellipse
              key={i}
              cx={90 + 38 * Math.cos((angle * Math.PI) / 180)}
              cy={90 + 38 * Math.sin((angle * Math.PI) / 180)}
              rx="28" ry="18"
              fill="url(#petal1)"
              transform={`rotate(${angle}, ${90 + 38 * Math.cos((angle * Math.PI) / 180)}, ${90 + 38 * Math.sin((angle * Math.PI) / 180)})`}
            />
          ))}
          <circle cx="90" cy="90" r="26" fill="url(#flower1)" />
          <circle cx="90" cy="90" r="14" fill="#B7E4C7" opacity="0.6" />
        </svg>
      </motion.div>

      {/* Gema — derecha arriba */}
      <motion.div
        className="absolute -right-6 top-4"
        animate={{ x: rightX, rotate: rotate2 }}
        transition={{ type: "tween", duration: 0 }}
      >
        <svg width="180" height="180" viewBox="0 0 160 160" fill="none">
          <defs>
            <linearGradient id="gem1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9854A" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#F9BA8F" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#9A4F1A" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="gem2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8F0" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#C9854A" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <polygon points="80,10 130,35 150,80 130,125 80,150 30,125 10,80 30,35" fill="url(#gem1)" />
          <polygon points="80,10 130,35 80,80" fill="url(#gem2)" />
          <polygon points="130,35 150,80 80,80" fill="#F9BA8F" opacity="0.3" />
          <polygon points="80,10 130,35 150,80 130,125 80,150 30,125 10,80 30,35" fill="none" stroke="#FFF8F0" strokeWidth="1.5" opacity="0.4" />
          <ellipse cx="65" cy="45" rx="15" ry="8" fill="white" opacity="0.2" transform="rotate(-30, 65, 45)" />
        </svg>
      </motion.div>

      {/* Corazón — izquierda abajo */}
      <motion.div
        className="absolute -left-6 bottom-4"
        animate={{ x: leftX, y: topY, rotate: rotate3 }}
        transition={{ type: "tween", duration: 0 }}
      >
        <svg width="160" height="160" viewBox="0 0 140 140" fill="none">
          <defs>
            <radialGradient id="heart1" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#74C69D" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#1B4332" stopOpacity="0.8" />
            </radialGradient>
          </defs>
          <path d="M70 115 C70 115 15 78 15 45 C15 28 28 18 42 18 C53 18 63 25 70 35 C77 25 87 18 98 18 C112 18 125 28 125 45 C125 78 70 115 70 115Z" fill="url(#heart1)" />
          <path d="M70 115 C70 115 15 78 15 45 C15 28 28 18 42 18 C53 18 63 25 70 35 C77 25 87 18 98 18 C112 18 125 28 125 45 C125 78 70 115 70 115Z" fill="none" stroke="#B7E4C7" strokeWidth="1.5" opacity="0.4" />
          <ellipse cx="52" cy="38" rx="12" ry="7" fill="white" opacity="0.2" transform="rotate(-30, 52, 38)" />
        </svg>
      </motion.div>

      {/* Estrella — derecha abajo */}
      <motion.div
        className="absolute -right-6 bottom-4"
        animate={{ x: rightX, y: topY, rotate: rotate1 }}
        transition={{ type: "tween", duration: 0 }}
      >
        <svg width="170" height="170" viewBox="0 0 150 150" fill="none">
          <defs>
            <radialGradient id="star1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#B7E4C7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.7" />
            </radialGradient>
          </defs>
          {[0, 45, 90, 135].map((angle, i) => (
            <ellipse key={i} cx="75" cy="75" rx="55" ry="22" fill="url(#star1)" transform={`rotate(${angle}, 75, 75)`} opacity="0.85" />
          ))}
          <circle cx="75" cy="75" r="18" fill="#2D6A4F" opacity="0.9" />
          <circle cx="75" cy="75" r="10" fill="#B7E4C7" opacity="0.6" />
        </svg>
      </motion.div>

      {/* Burbuja — centro arriba */}
      <motion.div
        className="absolute left-1/2 -top-8 -translate-x-1/2"
        animate={{ y: topY, rotate: rotate2 }}
        transition={{ type: "tween", duration: 0 }}
      >
        <svg width="140" height="140" viewBox="0 0 120 120" fill="none">
          <defs>
            <radialGradient id="bubble1" cx="35%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#F5EFE6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2D6A4F" stopOpacity="0.15" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="55" fill="url(#bubble1)" stroke="#74C69D" strokeWidth="1.5" opacity="0.5" />
          <circle cx="42" cy="38" r="12" fill="white" opacity="0.15" />
          <circle cx="38" cy="35" r="5" fill="white" opacity="0.25" />
        </svg>
      </motion.div>

    </div>
  )
}