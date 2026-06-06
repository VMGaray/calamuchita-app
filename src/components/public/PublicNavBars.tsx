"use client"

import { usePathname } from "next/navigation"
import StickyCategoryBar from "@/components/public/StickyCategoryBar"
import ContextBar from "@/components/public/ContextBar"
import FloatingLocalidadButton from "@/components/public/FloatingLocalidadButton"

export default function PublicNavBars() {
  const pathname = usePathname()

  const isCategoryPage =
    pathname.startsWith("/negocios") || pathname.startsWith("/directorio")

  const isDetailPage =
    /^\/directorio\/[^/]+\/[^/]+/.test(pathname) ||
    /^\/negocios\/[^/?]+/.test(pathname)

  const showFloatingButton = isCategoryPage && !isDetailPage

  if (isDetailPage) return null

  return (
    <>
      <div className="sticky top-0 z-[150]">
        <StickyCategoryBar stickyOffset={isCategoryPage ? 64 : 0} />
        <ContextBar />
      </div>
      {showFloatingButton && (
        <div className="relative z-[160]">
          <FloatingLocalidadButton />
        </div>
      )}
    </>
  )
}
