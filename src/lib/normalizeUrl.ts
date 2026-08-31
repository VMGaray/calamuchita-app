// Asegura que una URL ingresada por el usuario tenga protocolo (http/https).
// Sin esto, un link cargado como "www.negocio.com" (sin "https://") se
// interpreta como ruta relativa del sitio al ponerlo en href, y romper con
// 404 al hacer click en vez de abrir la web externa.
export function normalizeUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim()
  if (!trimmed) return null
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}
