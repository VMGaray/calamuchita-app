"use client"

import dynamic from "next/dynamic"

const CustomCursor = dynamic(() => import("@/components/ui/CustomCursor"), { ssr: false })
const ScrollProgress = dynamic(() => import("@/components/ui/ScrollProgress"), { ssr: false })
const SmoothScroll = dynamic(() => import("@/components/ui/SmoothScroll"), { ssr: false })

export default function ClientOnly() {
  return (
    <>
      <CustomCursor />
      <ScrollProgress />
      <SmoothScroll />
    </>
  )
}