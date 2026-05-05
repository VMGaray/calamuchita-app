"use client"

import { useState } from "react"

const days = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
]

export interface HorarioDay {
  day_of_week: number
  opens_at: string
  closes_at: string
  is_closed: boolean
}

interface Props {
  value: HorarioDay[]
  onChange: (horarios: HorarioDay[]) => void
}

const defaultHorarios: HorarioDay[] = days.map(d => ({
  day_of_week: d.value,
  opens_at: "09:00",
  closes_at: "18:00",
  is_closed: d.value === 0,
}))

export default function HorariosEditor({ value, onChange }: Props) {
  const horarios = value.length > 0 ? value : defaultHorarios

  const updateDay = (dayOfWeek: number, field: keyof HorarioDay, val: any) => {
    const updated = horarios.map(h =>
      h.day_of_week === dayOfWeek ? { ...h, [field]: val } : h
    )
    onChange(updated)
  }

  const copyToAll = (dayOfWeek: number) => {
    const source = horarios.find(h => h.day_of_week === dayOfWeek)
    if (!source) return
    const updated = horarios.map(h => ({
      ...h,
      opens_at: source.opens_at,
      closes_at: source.closes_at,
    }))
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      {days.map(({ value: dayValue, label }) => {
        const horario = horarios.find(h => h.day_of_week === dayValue) || {
          day_of_week: dayValue,
          opens_at: "09:00",
          closes_at: "18:00",
          is_closed: false,
        }

        return (
          <div key={dayValue} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
            horario.is_closed ? "bg-stone-50 border-stone-100" : "bg-white border-stone-200"
          }`}>
            {/* Día */}
            <div className="w-24 flex-shrink-0">
              <span className="text-sm font-medium text-stone-700">{label}</span>
            </div>

            {/* Toggle cerrado */}
            <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={horario.is_closed}
                onChange={(e) => updateDay(dayValue, "is_closed", e.target.checked)}
                className="w-3.5 h-3.5 accent-primary-500"
              />
              <span className="text-xs text-stone-400">Cerrado</span>
            </label>

            {/* Horarios */}
            {!horario.is_closed && (
              <>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={horario.opens_at}
                    onChange={(e) => updateDay(dayValue, "opens_at", e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-800 text-xs outline-none focus:ring-2 focus:ring-primary-300"
                  />
                  <span className="text-xs text-stone-400">a</span>
                  <input
                    type="time"
                    value={horario.closes_at}
                    onChange={(e) => updateDay(dayValue, "closes_at", e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-800 text-xs outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <button
                  onClick={() => copyToAll(dayValue)}
                  className="text-xs text-primary-400 hover:text-primary-600 flex-shrink-0 whitespace-nowrap"
                  title="Copiar a todos los días"
                >
                  Copiar a todos
                </button>
              </>
            )}

            {horario.is_closed && (
              <span className="text-xs text-stone-400 italic">No abre este día</span>
            )}
          </div>
        )
      })}
    </div>
  )
}