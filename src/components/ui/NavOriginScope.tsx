"use client"

import { setNavOrigin } from "@/lib/navOrigin"

/**
 * Envuelve una lista de links a perfiles y, al hacer clic en uno, recuerda desde qué página
 * se entró (para el botón "volver"). Usa display: contents, así no altera el layout.
 */
export default function NavOriginScope({ from, children }: { from: string; children: React.ReactNode }) {
  return (
    <div
      style={{ display: "contents" }}
      onClickCapture={(e) => {
        const a = (e.target as HTMLElement).closest("a")
        const href = a?.getAttribute("href")
        if (href && href.startsWith("/")) setNavOrigin(href, from)
      }}
    >
      {children}
    </div>
  )
}
