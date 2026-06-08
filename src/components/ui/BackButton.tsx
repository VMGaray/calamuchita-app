"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Props {
  fallbackHref?: string
  label?: string
  className?: string
  style?: React.CSSProperties
}

export default function BackButton({
  fallbackHref = "/",
  label = "Volver",
  className = "",
  style,
}: Props) {
  return (
    <Link
      href={fallbackHref}
      className={`inline-flex items-center gap-1.5 transition-opacity hover:opacity-70 active:opacity-50 ${className}`}
      style={style}
    >
      <ArrowLeft size={14} />
      {label}
    </Link>
  )
}
