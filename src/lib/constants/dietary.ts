import { WheatOff, Carrot, Sprout, MilkOff, CandyOff, Baby, type LucideIcon } from "lucide-react"

// Opciones alimentarias declaradas por el local (businesses.dietary_options)
// y por plato (menu_items.dietary_tags). Las claves deben coincidir con el CHECK
// de la migración gastronomia_A2_opciones_alimentarias.sql.
export const DIETARY_OPTIONS = [
  { key: "sin_tacc",      label: "Sin TACC (apto celíacos)",     short: "Sin TACC",      icon: WheatOff },
  { key: "vegetariano",   label: "Vegetariano",                  short: "Vegetariano",   icon: Carrot   },
  { key: "vegano",        label: "Vegano",                       short: "Vegano",        icon: Sprout   },
  { key: "sin_lactosa",   label: "Sin lactosa",                  short: "Sin lactosa",   icon: MilkOff  },
  { key: "sin_azucar",    label: "Sin azúcar / apto diabéticos", short: "Sin azúcar",    icon: CandyOff },
  { key: "menu_infantil", label: "Menú infantil",                short: "Menú infantil", icon: Baby     },
] as const satisfies readonly { key: string; label: string; short: string; icon: LucideIcon }[]

export type DietaryKey = (typeof DIETARY_OPTIONS)[number]["key"]

export const DIETARY_DISCLAIMER = "Información declarada por el local"

const KEYS = new Set<string>(DIETARY_OPTIONS.map(o => o.key))

export function isDietaryKey(value: string): value is DietaryKey {
  return KEYS.has(value)
}

/** Devuelve las opciones conocidas en el orden canónico (ignora claves desconocidas). */
export function dietaryOptionsFor(keys: readonly string[] | null | undefined) {
  if (!keys?.length) return []
  return DIETARY_OPTIONS.filter(o => keys.includes(o.key))
}
