"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"

interface Props {
  to: number
  duration?: number
  suffix?: string
  prefix?: string
}

export default function AnimatedCounter({ to, duration = 2, suffix = "", prefix = "" }: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let startTime: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * to))
      if (progress < 1) requestAnimationFrame(animate)
      else setCount(to)
    }

    requestAnimationFrame(animate)
  }, [isInView, to, duration])

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  )
}