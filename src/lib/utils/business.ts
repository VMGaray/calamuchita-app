import { BusinessCategory } from "@/types/database"

const RESTAURANT_CATEGORIES: BusinessCategory[] = [
  "restaurant", "cafe", "bar", "sushi", "pizzeria", "hamburgueseria",
]

export function isRestaurante(category: BusinessCategory | null | undefined): boolean {
  if (!category) return false
  return RESTAURANT_CATEGORIES.includes(category)
}

/**
 * URL canónica del perfil público: gastronomía usa /negocios/<slug> (carta, pedidos, galería);
 * el resto de las secciones, /directorio/<sección>/<slug>.
 */
export function businessProfileUrl(section: string | null | undefined, slug: string): string {
  return section === "gastronomy" || !section ? `/negocios/${slug}` : `/directorio/${section}/${slug}`
}
