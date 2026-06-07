"use client"

import { Plus, X } from "lucide-react"

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
  has_split?: boolean
  opens_at_2?: string
  closes_at_2?: string
}

export function expandHorariosForSave(
  horarios: HorarioDay[],
): { day_of_week: number; opens_at: string; closes_at: string; is_closed: boolean }[] {
  const rows: { day_of_week: number; opens_at: string; closes_at: string; is_closed: boolean }[] = []
  for (const h of horarios) {
    rows.push({ day_of_week: h.day_of_week, opens_at: h.opens_at, closes_at: h.closes_at, is_closed: h.is_closed })
    if (!h.is_closed && h.has_split && h.opens_at_2 && h.closes_at_2) {
      rows.push({ day_of_week: h.day_of_week, opens_at: h.opens_at_2, closes_at: h.closes_at_2, is_closed: false })
    }
  }
  return rows
}

export function mergeHorariosFromDB(rows: any[]): HorarioDay[] {
  const byDay = new Map<number, any[]>()
  for (const row of rows) {
    const arr = byDay.get(row.day_of_week) ?? []
    arr.push(row)
    byDay.set(row.day_of_week, arr)
  }
  return days.map(d => {
    const dayRows = byDay.get(d.value) ?? []
    if (dayRows.length === 0) {
      return { day_of_week: d.value, opens_at: "09:00", closes_at: "18:00", is_closed: d.value === 0 }
    }
    const first = dayRows[0]
    if (dayRows.length >= 2) {
      const second = dayRows[1]
      return {
        day_of_week: first.day_of_week,
        opens_at: first.opens_at,
        closes_at: first.closes_at,
        is_closed: first.is_closed,
        has_split: true,
        opens_at_2: second.opens_at,
        closes_at_2: second.closes_at,
      }
    }
    return { day_of_week: first.day_of_week, opens_at: first.opens_at, closes_at: first.closes_at, is_closed: first.is_closed }
  })
}

export const defaultHorarios: HorarioDay[] = days.map(d => ({
  day_of_week: d.value,
  opens_at: "09:00",
  closes_at: "18:00",
  is_closed: d.value === 0,
}))

interface Props {
  value: HorarioDay[]
  onChange: (horarios: HorarioDay[]) => void
}

export default function HorariosEditor({ value, onChange }: Props) {
  const horarios = value.length > 0 ? value : defaultHorarios

  const updateDay = (dayOfWeek: number, field: keyof HorarioDay, val: any) => {
    onChange(horarios.map(h => h.day_of_week === dayOfWeek ? { ...h, [field]: val } : h))
  }

  const toggleSplit = (dayOfWeek: number) => {
    onChange(horarios.map(h => {
      if (h.day_of_week !== dayOfWeek) return h
      if (h.has_split) {
        const { has_split, opens_at_2, closes_at_2, ...rest } = h
        return rest
      }
      return { ...h, has_split: true, opens_at_2: "15:00", closes_at_2: "20:00" }
    }))
  }

  const copyToAll = (dayOfWeek: number) => {
    const src = horarios.find(h => h.day_of_week === dayOfWeek)
    if (!src) return
    onChange(horarios.map(h => ({
      ...h,
      opens_at: src.opens_at,
      closes_at: src.closes_at,
      has_split: src.has_split,
      opens_at_2: src.opens_at_2,
      closes_at_2: src.closes_at_2,
    })))
  }

  const timeInput = (val: string, onChangeFn: (v: string) => void, accent = false) => (
    <input
      type="time"
      value={val}
      onChange={e => onChangeFn(e.target.value)}
      className={`flex-1 min-w-0 px-2 py-1.5 rounded-lg border text-stone-800 text-sm outline-none focus:ring-2 focus:ring-primary-300 ${
        accent ? "border-primary-200 bg-primary-50" : "border-stone-200"
      }`}
    />
  )

  return (
    <div className="space-y-2">
      {days.map(({ value: dayValue, label }) => {
        const h = horarios.find(item => item.day_of_week === dayValue) ?? {
          day_of_week: dayValue, opens_at: "09:00", closes_at: "18:00", is_closed: false,
        }
        const hasSplit = !h.is_closed && !!h.has_split

        return (
          <div
            key={dayValue}
            className={`px-3 py-2.5 rounded-xl border transition-colors ${
              h.is_closed ? "bg-stone-50 border-stone-100" : "bg-white border-stone-200"
            }`}
          >
            {/* Fila superior: día + acciones + cerrado */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-stone-700 w-24 flex-shrink-0">{label}</span>

              <div className="flex items-center gap-2 ml-auto">
                {!h.is_closed && (
                  <>
                    <button
                      type="button"
                      onClick={() => copyToAll(dayValue)}
                      className="text-xs text-primary-400 hover:text-primary-600 whitespace-nowrap"
                    >
                      Copiar a todos
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSplit(dayValue)}
                      title={hasSplit ? "Quitar 2do turno" : "Agregar 2do turno"}
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                        hasSplit
                          ? "bg-red-100 text-red-400 hover:bg-red-200"
                          : "bg-primary-50 text-primary-500 hover:bg-primary-100"
                      }`}
                    >
                      {hasSplit ? <X size={11} /> : <Plus size={11} />}
                    </button>
                  </>
                )}

                <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={h.is_closed}
                    onChange={e => updateDay(dayValue, "is_closed", e.target.checked)}
                    className="w-3.5 h-3.5 accent-primary-500"
                  />
                  <span className="text-xs text-stone-400">Cerrado</span>
                </label>
              </div>
            </div>

            {/* Fila inferior: inputs de hora (solo si abierto) */}
            {!h.is_closed && (
              <div className="mt-2 space-y-1.5">
                {/* Primer turno */}
                <div className="flex items-center gap-2">
                  {timeInput(h.opens_at, v => updateDay(dayValue, "opens_at", v))}
                  <span className="text-xs text-stone-400 flex-shrink-0">a</span>
                  {timeInput(h.closes_at, v => updateDay(dayValue, "closes_at", v))}
                </div>

                {/* Segundo turno */}
                {hasSplit && (
                  <div className="flex items-center gap-2">
                    {timeInput(h.opens_at_2 ?? "15:00", v => updateDay(dayValue, "opens_at_2", v), true)}
                    <span className="text-xs text-stone-400 flex-shrink-0">a</span>
                    {timeInput(h.closes_at_2 ?? "20:00", v => updateDay(dayValue, "closes_at_2", v), true)}
                    <span className="text-[10px] text-primary-400 flex-shrink-0 whitespace-nowrap">2° turno</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
