"use client"

import { SERVICE_GROUPS } from "@/lib/constants/categories"

interface Props {
  options: string[]
  selected: string[]
  onToggle: (rubro: string) => void
  /** Agrupa los chips bajo los grupos de Servicios */
  grouped?: boolean
}

function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
        selected
          ? "bg-primary-500 text-white border-primary-500"
          : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
      }`}
    >
      {label}
    </button>
  )
}

// Chips de rubros con multiselección. En Servicios se muestran agrupados;
// un rubro puede elegirse junto a otros del mismo grupo o de grupos distintos.
export default function RubrosSelector({ options, selected, onToggle, grouped = false }: Props) {
  // Rubros asignados que ya no están en la lista (p. ej. un rubro dado de baja):
  // se muestran marcados para que no se pierdan en silencio al guardar.
  const legacy = selected.filter(s => !options.includes(s))

  const legacyBlock = legacy.length > 0 && (
    <div className="mt-3">
      <p className="text-xs font-semibold text-amber-700 mb-1.5">Rubros asignados fuera de la lista (tocá para quitar)</p>
      <div className="flex gap-2 flex-wrap">
        {legacy.map(r => <Chip key={r} label={r} selected onClick={() => onToggle(r)} />)}
      </div>
    </div>
  )

  if (!grouped) {
    return (
      <div className="mt-2 mb-3">
        <div className="flex gap-2 flex-wrap">
          {options.map(opt => (
            <Chip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => onToggle(opt)} />
          ))}
        </div>
        {legacyBlock}
      </div>
    )
  }

  const groupedRubros = new Set(SERVICE_GROUPS.flatMap(g => g.rubros))
  const ungrouped = options.filter(o => !groupedRubros.has(o))

  return (
    <div className="mt-2 mb-3 space-y-3">
      {SERVICE_GROUPS.map(({ slug, label, icon: Icon, rubros }) => {
        const groupOptions = rubros.filter(r => options.includes(r))
        if (groupOptions.length === 0) return null
        const count = groupOptions.filter(r => selected.includes(r)).length
        return (
          <div key={slug}>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 mb-1.5">
              <Icon size={14} className="text-stone-500" />
              {label}
              {count > 0 && <span className="text-primary-500">· {count}</span>}
            </p>
            <div className="flex gap-2 flex-wrap">
              {groupOptions.map(opt => (
                <Chip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => onToggle(opt)} />
              ))}
            </div>
          </div>
        )
      })}
      {ungrouped.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-stone-400 mb-1.5">Sin grupo</p>
          <div className="flex gap-2 flex-wrap">
            {ungrouped.map(opt => (
              <Chip key={opt} label={opt} selected={selected.includes(opt)} onClick={() => onToggle(opt)} />
            ))}
          </div>
        </div>
      )}
      {legacyBlock}
    </div>
  )
}
