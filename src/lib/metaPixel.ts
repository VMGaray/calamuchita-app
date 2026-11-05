/**
 * Helper para mandar eventos estándar al Meta Pixel.
 *
 * El script base (components/MetaPixel.tsx) se carga con afterInteractive, o sea
 * DESPUÉS de la hidratación. Los useEffect de un perfil abierto directo corren
 * antes, cuando window.fbq todavía no existe: esos eventos se guardan en
 * window.__metaPixelQueue y el script base los manda apenas hace init + PageView.
 */

type MetaStandardEvent = "PageView" | "ViewContent" | "Contact"
type MetaParams = Record<string, unknown>
type QueuedEvent = [MetaStandardEvent, MetaParams | undefined]

type MetaWindow = Window & {
  fbq?: (...args: unknown[]) => void
  __metaPixelQueue?: QueuedEvent[]
}

export function trackMeta(event: MetaStandardEvent, params?: MetaParams) {
  if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_META_PIXEL_ID) return
  const w = window as MetaWindow
  if (w.fbq) {
    if (params) w.fbq("track", event, params)
    else w.fbq("track", event)
  } else {
    ;(w.__metaPixelQueue ??= []).push([event, params])
  }
}
