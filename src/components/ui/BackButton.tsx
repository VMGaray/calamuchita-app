"use client"

import { useRouter } from "next/navigation"
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
  const router = useRouter()

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-1.5 transition-opacity hover:opacity-70 active:opacity-50 ${className}`}
      style={style}
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  )
}
