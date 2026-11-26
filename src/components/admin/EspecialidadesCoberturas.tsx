"use client"

import { ESPECIALIDADES, COBERTURAS } from "@/lib/constants/salud"

type Field = "medical_specialties" | "health_coverages"

// Muestra las opciones fijas y, además, los valores ya guardados que no están
// en la lista (cargados a mano o con un nombre viejo), para poder quitarlos.
function withSaved(options: string[], saved: string[]) {
  return [...options, ...saved.filter(v => !options.includes(v))]
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
        active
          ? "bg-primary-500 text-white border-primary-500"
          : "bg-white text-stone-600 border-stone-200 hover:border-primary-300"
      }`}
    >
      {label}
    </button>
  )
}

export default function EspecialidadesCoberturas({ specialties, coverages, onToggle }: {
  specialties: string[]
  coverages: string[]
  onToggle: (field: Field, value: string) => void
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Especialidades</label>
        <div className="flex gap-2 flex-wrap mb-3">
          {withSaved(ESPECIALIDADES, specialties).map(esp => (
            <Chip key={esp} label={esp} active={specialties.includes(esp)}
              onClick={() => onToggle("medical_specialties", esp)} />
          ))}
        </div>
        <input
          type="text"
          placeholder="¿Falta alguna? Escribila y presioná Enter..."
          className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300"
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault()
              const value = e.currentTarget.value.trim()
              if (value && !specialties.includes(value)) onToggle("medical_specialties", value)
              e.currentTarget.value = ""
            }
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">Coberturas aceptadas</label>
        <div className="flex gap-2 flex-wrap">
          {withSaved(COBERTURAS, coverages).map(cob => (
            <Chip key={cob} label={cob} active={coverages.includes(cob)}
              onClick={() => onToggle("health_coverages", cob)} />
          ))}
        </div>
      </div>
    </>
  )
}
