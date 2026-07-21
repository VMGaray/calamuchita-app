import { BusinessCategory } from "@/types/database"

export const GASTRONOMY_CATEGORY_GROUPS: { group: string; options: { value: BusinessCategory; label: string }[] }[] = [
  { group: "Gastronómicos con salón", options: [
    { value: "restaurant", label: "Restaurante" },
    { value: "cafe", label: "Café" },
    { value: "bar", label: "Bar" },
    { value: "sushi", label: "Sushi" },
    { value: "pizzeria", label: "Pizzería" },
    { value: "hamburgueseria", label: "Hamburguesería" },
  ]},
  { group: "Para llevar y delivery", options: [
    { value: "viandas", label: "Viandas" },
    { value: "comida_para_llevar", label: "Comida para llevar" },
  ]},
  { group: "Otros", options: [
    { value: "panaderia", label: "Panadería" },
    { value: "other", label: "Otro" },
  ]},
]

export const GASTRONOMY_CATEGORIES = GASTRONOMY_CATEGORY_GROUPS.flatMap(g => g.options)
