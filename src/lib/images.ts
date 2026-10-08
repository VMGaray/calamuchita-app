// Redimensionado de imágenes en el navegador antes de subirlas a Supabase Storage.
// Baja el peso de fotos de celular (3–10 MB) a unos cientos de KB: menos Storage y menos egress.

export const MAX_INPUT_BYTES = 25 * 1024 * 1024   // lo que aceptamos elegir (antes de comprimir)
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024   // lo que efectivamente se sube

type Resized = { blob: Blob; ext: "webp" | "jpg" }

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      // from-image respeta la rotación EXIF de las fotos de celular
      return await createImageBitmap(file, { imageOrientation: "from-image" })
    } catch { /* algunos Safari no aceptan opciones: probamos con <img> */ }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality))
}

/**
 * Achica la imagen a `maxWidth` px de ancho (sin agrandar) y la comprime en WebP.
 * Si el navegador no genera WebP, usa JPG con fondo blanco (JPG no tiene transparencia).
 */
export async function resizeImage(file: File, maxWidth = 1600, quality = 0.8): Promise<Resized> {
  const source = await loadBitmap(file)
  const srcW = source.width
  const srcH = source.height
  const scale = Math.min(1, maxWidth / srcW)
  const width = Math.round(srcW * scale)
  const height = Math.round(srcH * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("No se pudo procesar la imagen")
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(source, 0, 0, width, height)
  if ("close" in source) source.close()

  const webp = await canvasToBlob(canvas, "image/webp", quality)
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" }

  // Fallback JPG: pintamos fondo blanco debajo para que los PNG transparentes no queden negros
  const flat = document.createElement("canvas")
  flat.width = width
  flat.height = height
  const fctx = flat.getContext("2d")!
  fctx.fillStyle = "#ffffff"
  fctx.fillRect(0, 0, width, height)
  fctx.drawImage(canvas, 0, 0)
  const jpg = await canvasToBlob(flat, "image/jpeg", quality)
  if (!jpg) throw new Error("No se pudo comprimir la imagen")
  return { blob: jpg, ext: "jpg" }
}

/** Ruta de Storage: `<prefijo>/<carpeta>/<timestamp>-<aleatorio>.<ext>` (el prefijo es el id del negocio). */
export function storagePath(folder: string, ext: string, prefix?: string | null): string {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  return prefix ? `${prefix}/${folder}/${name}` : `${folder}/${name}`
}

/** Extrae la ruta dentro del bucket a partir de la URL pública de Supabase. */
export function storagePathFromPublicUrl(url: string, bucket: string): string | null {
  const marker = `/storage/v1/object/public/${bucket}/`
  const idx = url.indexOf(marker)
  return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length).split("?")[0])
}
