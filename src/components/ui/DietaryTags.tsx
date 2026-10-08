"use client"

import { DIETARY_OPTIONS, dietaryOptionsFor } from "@/lib/constants/dietary"

interface SelectorProps {
  value: string[]
  onChange: (next: string[]) => void
  /** "sm" para los formularios de plato */
  size?: "sm" | "md"
}

/** Selector múltiple de opciones alimentarias (panel del comercio). */
export function DietarySelector({ value, onChange, size = "md" }: SelectorProps) {
  const toggle = (key: string) =>
    onChange(value.includes(key) ? value.filter(k => k !== key) : [...value, key])

  return (
    <div className="flex gap-2 flex-wrap">
      {DIETARY_OPTIONS.map(({ key, label, short, icon: Icon }) => {
        const active = value.includes(key)
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            aria-pressed={active}
            className={`flex items-center gap-1.5 rounded-xl font-medium border transition-colors ${
              size === "sm" ? "py-1 px-2.5 text-[11px]" : "py-1.5 px-3 text-xs"
            } ${
              active
                ? "bg-[#2D4530] text-white border-[#2D4530]"
                : "bg-white text-stone-600 border-stone-200 hover:border-stone-300"
            }`}
          >
            <Icon size={size === "sm" ? 12 : 13} />
            {size === "sm" ? short : label}
          </button>
        )
      })}
    </div>
  )
}

interface BadgesProps {
  keys: readonly string[] | null | undefined
  size?: "xs" | "sm"
}

/** Etiquetas de solo lectura, en tonos neutros (perfil público y listas del panel). */
export function DietaryBadges({ keys, size = "sm" }: BadgesProps) {
  const options = dietaryOptionsFor(keys)
  if (options.length === 0) return null

  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(({ key, short, icon: Icon }) => (
        <span
          key={key}
          className={`inline-flex items-center gap-1 rounded-full font-medium ${
            size === "xs" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
          }`}
          style={{ background: "rgba(45,69,48,0.07)", color: "rgba(45,69,48,0.8)" }}
        >
          <Icon size={size === "xs" ? 10 : 12} />
          {short}
        </span>
      ))}
    </div>
  )
}
