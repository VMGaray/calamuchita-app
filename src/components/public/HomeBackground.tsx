"use client"

import { usePathname } from "next/navigation"

export default function HomeBackground() {
  const pathname = usePathname()
  const isCategoryPage =
    pathname.startsWith("/negocios") || pathname.startsWith("/directorio")

  if (isCategoryPage) return null

  return (
    <div className="absolute inset-0 z-0 h-[500px] pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/valle.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)" }}
      />
    </div>
  )
}
