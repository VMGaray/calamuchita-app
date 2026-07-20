import { BusinessCategory } from "@/types/database"

const RESTAURANT_CATEGORIES: BusinessCategory[] = [
  "restaurant", "cafe_bar", "cafe", "bar", "sushi", "pizzeria", "hamburgueseria",
]

export function isRestaurante(category: BusinessCategory | null | undefined): boolean {
  if (!category) return false
  return RESTAURANT_CATEGORIES.includes(category)
}
