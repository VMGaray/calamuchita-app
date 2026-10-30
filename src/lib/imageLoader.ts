"use client"

// Loader de next/image. Vercel Image Optimization está desactivado (límite del plan agotado), así que:
// - Supabase Storage: usamos su transformación de imágenes (redimensiona y entrega WebP según el navegador).
// - /public: variantes WebP pregeneradas con scripts/generate-image-variants.mjs.
// - Cualquier otra URL se sirve tal cual.

type LoaderProps = { src: string; width: number; quality?: number }

const SUPABASE_OBJECT = "/storage/v1/object/public/"
const SUPABASE_RENDER = "/storage/v1/render/image/public/"

// Supabase no transforma imágenes de más de 2500 px de ancho
const SUPABASE_MAX_WIDTH = 2500

// Imágenes de /public con variantes en /images/<nombre>-<ancho>.webp
const LOCAL_VARIANTS: Record<string, string> = {
  "/valle.jpg": "/images/valle",
}

// SVG no se transforma y un GIF perdería la animación: van directo
const NO_TRANSFORM = /\.(svg|gif)(\?|$)/i

export default function imageLoader({ src, width, quality }: LoaderProps): string {
  if (src.includes(".supabase.co" + SUPABASE_OBJECT) && !NO_TRANSFORM.test(src)) {
    const url = new URL(src.replace(SUPABASE_OBJECT, SUPABASE_RENDER))
    url.searchParams.set("width", String(Math.min(width, SUPABASE_MAX_WIDTH)))
    url.searchParams.set("quality", String(quality ?? 70))
    // Sin esto Supabase usa "cover": mantiene el alto original y recorta los costados
    url.searchParams.set("resize", "contain")
    return url.toString()
  }

  const local = LOCAL_VARIANTS[src]
  if (local) return `${local}-${width}.webp`

  return src
}
