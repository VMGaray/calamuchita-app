"use client"

import { BusinessSection } from "@/types/database"
import { MASTER_CATEGORIES } from "@/lib/constants/categories"
import RubrosSelector from "@/components/admin/RubrosSelector"

// Secciones del directorio donde un negocio puede aparecer además de la principal.
// Gastronomía, Eventos e Info útil quedan afuera: tienen perfil y listados propios.
const EXTRA_SECTIONS = [
  { value: "services",  label: "Servicios" },
  { value: "commerce",  label: "Comercios" },
  { value: "health",    label: "Salud" },
  { value: "education", label: "Educación" },
  { value: "sports",    label: "Deportes" },
  { value: "tourism",   label: "Turismo" },
] as const satisfies readonly { value: BusinessSection; label: string }[]

type ExtraSection = (typeof EXTRA_SECTIONS)[number]["value"]

const isExtraSection = (s: string): s is ExtraSection => EXTRA_SECTIONS.some(e => e.value === s)

export const rubrosDeSeccion = (section: string): string[] =>
  isExtraSection(section) ? MASTER_CATEGORIES[section].subcategories.map(s => s.label) : []

/** Lo que se guarda en businesses.extra_sections: sin la principal ni secciones no permitidas */
export function limpiarSeccionesExtra(principal: BusinessSection, extra: string[]): BusinessSection[] {
  return [...new Set(extra)].filter(s => s !== principal && isExtraSection(s)) as BusinessSection[]
}

/** Rubro "principal" (businesses.subcategory): el primero que pertenezca a la sección principal */
export function rubroPrincipal(principal: BusinessSection, categories: string[]): string | null {
  const propios = rubrosDeSeccion(principal)
  return categories.find(c => propios.includes(c)) ?? categories[0] ?? null
}

interface Props {
  principal: BusinessSection
  extra: BusinessSection[]
  categories: string[]
  onChange: (extra: BusinessSection[], categories: string[]) => void
}

export default function SeccionesExtra({ principal, extra, categories, onChange }: Props) {
  const elegidas = limpiarSeccionesExtra(principal, extra)

  const toggleSeccion = (s: BusinessSection) => {
    if (!elegidas.includes(s)) {
      onChange([...elegidas, s], categories)
      return
    }
    // Al quitar una sección se quitan sus rubros, salvo los que también son de otra sección elegida
    const restantes = elegidas.filter(e => e !== s)
    const siguenValidos = new Set([principal, ...restantes].flatMap(rubrosDeSeccion))
    const quitados = rubrosDeSeccion(s).filter(r => !siguenValidos.has(r))
    onChange(restantes, categories.filter(c => !quitados.includes(c)))
  }

  const toggleRubro = (rubro: string) =>
    onChange(elegidas, categories.includes(rubro) ? categories.filter(c => c !== rubro) : [...categories, rubro])

  return (
    <div className="mt-5 pt-4 border-t border-stone-100">
      <label className="block text-sm font-medium text-stone-700 mb-1">
        También aparece en <span className="text-stone-400 font-normal">(opcional — podés elegir varias)</span>
      </label>
      <div className="flex gap-2 flex-wrap mt-2">
        {EXTRA_SECTIONS.filter(s => s.value !== principal).map(({ value, label }) => (
          <button key={value} type="button" onClick={() => toggleSeccion(value)}
            className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
              elegidas.includes(value)
                ? "bg-primary-500 text-white border-primary-500"
                : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {elegidas.map(s => (
        <div key={s} className="mt-4 p-4 rounded-xl border border-stone-200 bg-stone-50">
          <p className="text-xs font-semibold text-stone-600">
            Rubros en {EXTRA_SECTIONS.find(e => e.value === s)?.label}
          </p>
          <RubrosSelector
            options={rubrosDeSeccion(s)}
            selected={categories}
            onToggle={toggleRubro}
            grouped={s === "services"}
            legacyIgnore={categories}
          />
        </div>
      ))}
    </div>
  )
}
