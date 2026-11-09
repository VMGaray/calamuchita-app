/**
 * Dominio canónico del sitio: siempre con www y https. Search Console marcaba como duplicadas
 * las URLs con query params (?from=, filtros); todas las páginas públicas declaran su
 * canonical con esta base y sin query.
 */
export const SITE_URL = "https://www.calamuchita-app.com.ar"

/** Path limpio para alternates.canonical (se resuelve contra metadataBase del layout raíz). */
export function canonical(path: string) {
  const clean = path.split("?")[0].split("#")[0]
  return { canonical: clean === "" ? "/" : clean }
}
