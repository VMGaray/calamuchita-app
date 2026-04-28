"use client"

import { useEffect, useState, useRef } from "react"

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%"

interface Props {
  text: string
  className?: string
  delay?: number
}

export default function TextScramble({ text, className = "", delay = 0 }: Props) {
  const [display, setDisplay] = useState("")
  const frameRef = useRef(0)
  const startedRef = useRef(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      startedRef.current = true
      let frame = 0
      const totalFrames = 30

      const animate = () => {
        frame++
        const progress = frame / totalFrames

        const result = text
          .split("")
          .map((char, i) => {
            if (char === " ") return " "
            const charProgress = Math.max(0, (progress * text.length - i) / 3)
            if (charProgress >= 1) return char
            return chars[Math.floor(Math.random() * chars.length)]
          })
          .join("")

        setDisplay(result)

        if (frame < totalFrames) {
          frameRef.current = requestAnimationFrame(animate)
        } else {
          setDisplay(text)
        }
      }

      frameRef.current = requestAnimationFrame(animate)
    }, delay * 1000)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(frameRef.current)
    }
  }, [text, delay])

  return (
    <span className={className}>
      {display || text}
    </span>
  )
}