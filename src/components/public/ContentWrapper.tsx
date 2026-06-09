"use client"

import { usePathname } from "next/navigation"

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isCategoryPage =
    pathname.startsWith("/negocios") || pathname.startsWith("/directorio")

  return (
    <div className={`relative flex flex-col flex-1 ${!isCategoryPage ? "-mt-20" : ""}`}>
      {children}
    </div>
  )
}
