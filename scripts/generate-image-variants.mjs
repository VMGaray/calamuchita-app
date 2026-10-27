/**
 * Genera variantes WebP de las imágenes estáticas de /public que se muestran con next/image.
 * Vercel Image Optimization está desactivado (límite del plan), así que src/lib/imageLoader.ts
 * apunta a estos archivos: /images/<nombre>-<ancho>.webp
 *
 * Uso: node scripts/generate-image-variants.mjs
 * Volver a correrlo si cambia la imagen original o los anchos de next.config.ts.
 */

import sharp from "sharp"
import path from "node:path"

// Mismos anchos que imageSizes + deviceSizes en next.config.ts (los mayores al original se recortan)
const WIDTHS = [32, 48, 64, 96, 128, 256, 384, 640, 828, 1080, 1200, 1920]

const SOURCES = [
  { file: "public/valle.jpg", name: "valle" },
]

for (const { file, name } of SOURCES) {
  const { width: original } = await sharp(file).metadata()
  for (const w of WIDTHS) {
    const out = path.join("public/images", `${name}-${w}.webp`)
    const info = await sharp(file)
      .resize({ width: Math.min(w, original) })
      .webp({ quality: 62, effort: 6 })
      .toFile(out)
    console.log(`${out}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`)
  }
}
