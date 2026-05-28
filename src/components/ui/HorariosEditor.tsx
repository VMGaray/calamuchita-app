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

/** Expande HorarioDay[] en filas limpias para guardar en business_hours. */
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

/** Fusiona las filas crudas de business_hours (puede haber 2 por día) en HorarioDay[]. */
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

  const timeInput = (val: string, onChange: (v: string) => void, accent = false) => (
    <input
      type="time"
      value={val}
      onChange={e => onChange(e.target.value)}
      className={`w-full px-2 py-1.5 rounded-lg border text-stone-800 text-xs outline-none focus:ring-2 focus:ring-primary-300 ${
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
            className={`p-3 rounded-xl border transition-colors ${
              h.is_closed ? "bg-stone-50 border-stone-100" : "bg-white border-stone-200"
            }`}
          >
            {/* ── Fila principal ── */}
            <div className="flex items-center gap-2">
              <span className="w-24 flex-shrink-0 text-sm font-medium text-stone-700">{label}</span>

              <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={h.is_closed}
                  onChange={e => updateDay(dayValue, "is_closed", e.target.checked)}
                  className="w-3.5 h-3.5 accent-primary-500"
                />
                <span className="text-xs text-stone-400">Cerrado</span>
              </label>

              {!h.is_closed && (
                <>
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    {timeInput(h.opens_at, v => updateDay(dayValue, "opens_at", v))}
                    <span className="text-xs text-stone-400 flex-shrink-0">a</span>
                    {timeInput(h.closes_at, v => updateDay(dayValue, "closes_at", v))}
                  </div>

                  {/* Botón agregar / quitar 2do turno */}
                  <button
                    type="button"
                    onClick={() => toggleSplit(dayValue)}
                    title={hasSplit ? "Quitar 2do turno" : "Agregar 2do turno"}
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      hasSplit
                        ? "bg-red-100 text-red-400 hover:bg-red-200"
                        : "bg-primary-50 text-primary-500 hover:bg-primary-100"
                    }`}
                  >
                    {hasSplit ? <X size={11} /> : <Plus size={11} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToAll(dayValue)}
                    className="text-xs text-primary-400 hover:text-primary-600 flex-shrink-0 whitespace-nowrap"
                  >
                    Copiar
                  </button>
                </>
              )}

              {h.is_closed && (
                <span className="text-xs text-stone-400 italic">No abre este día</span>
              )}
            </div>

            {/* ── 2do turno ── */}
            {hasSplit && (
              <div className="flex items-center gap-1 mt-2 pl-[6.5rem]">
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  {timeInput(h.opens_at_2 ?? "15:00", v => updateDay(dayValue, "opens_at_2", v), true)}
                  <span className="text-xs text-stone-400 flex-shrink-0">a</span>
                  {timeInput(h.closes_at_2 ?? "20:00", v => updateDay(dayValue, "closes_at_2", v), true)}
                </div>
                <span className="text-[10px] text-primary-400 flex-shrink-0 whitespace-nowrap w-6 text-center">2°</span>
                <span className="text-xs text-stone-400 flex-shrink-0 whitespace-nowrap">2do turno</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
