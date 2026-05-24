"use client"

import dynamic from "next/dynamic"

const WebGLBackground = dynamic(() => import("./WebGLBackground"), { ssr: false })

export default function WebGLBackgroundLazy() {
  return <WebGLBackground />
}
