"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react"
import { Locality, TransportSchedule } from "@/types/database"

const DAYS = [
  { key: "lunes",    short: "Lu" },
  { key: "martes",   short: "Ma" },
  { key: "miercoles",short: "Mi" },
  { key: "jueves",   short: "Ju" },
  { key: "viernes",  short: "Vi" },
  { key: "sabado",   short: "Sá" },
  { key: "domingo",  short: "Do" },
]

const EMPTY_FORM = {
  company: "", origin_id: "", destination_id: "",
  departure_time: "", arrival_time: "", days: [] as string[], notes: "",
}

interface ScheduleWithLocalities extends TransportSchedule {
  origin: { name: string } | null
  destination: { name: string } | null
}

export default function AdminTransporte() {
  const [localities, setLocalities] = useState<Locality[]>([])
  const [schedules, setSchedules] = useState<ScheduleWithLocalities[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterOrigin, setFilterOrigin] = useState("")

  const fetchAll = async () => {
    const supabase = createClient()
    const [{ data: locs }, { data: scheds }] = await Promise.all([
      supabase.from("localities").select("*").order("sort_order"),
      supabase.from("transport_schedules")
        .select("*, origin:localities!transport_schedules_origin_id_fkey(name), destination:localities!transport_schedules_destination_id_fkey(name)")
        .order("departure_time"),
    ])
    setLocalities(locs || [])
    setSchedules((scheds as ScheduleWithLocalities[]) || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const toggleDay = (day: string) => {
    setForm(p => ({
      ...p,
      days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day],
    }))
  }

  const handleSave = async () => {
    if (!form.company || !form.origin_id || !form.destination_id || !form.departure_time) return
    setSaving(true)
    await createClient().from("transport_schedules").insert([{
      company: form.company,
      origin_id: form.origin_id,
      destination_id: form.destination_id,
      departure_time: form.departure_time,
      arrival_time: form.arrival_time || null,
      days: form.days,
      notes: form.notes || null,
      is_active: true,
    }])
    setSaving(false)
    setShowForm(false)
    setForm(EMPTY_FORM)
    fetchAll()
  }

  const handleToggle = async (id: string, current: boolean) => {
    await createClient().from("transport_schedules").update({ is_active: !current }).eq("id", id)
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, is_active: !current } : s))
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este horario?")) return
    await createClient().from("transport_schedules").delete().eq("id", id)
    setSchedules(prev => prev.filter(s => s.id !== id))
  }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const filtered = filterOrigin
    ? schedules.filter(s => s.origin_id === filterOrigin)
    : schedules

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterOrigin}
          onChange={e => setFilterOrigin(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
        >
          <option value="">Todos los orígenes</option>
          {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors"
        >
          <Plus size={14} />
          Nuevo horario
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-14 animate-pulse border border-stone-200" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <p className="text-sm text-stone-400">Sin horarios cargados</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {filtered.map((s, i) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 px-5 py-3.5 ${!s.is_active ? "opacity-50" : ""} ${i !== filtered.length - 1 ? "border-b border-stone-100" : ""}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-medium text-stone-800">{s.company}</span>
                  <span className="text-xs text-stone-400">
                    {s.origin?.name} → {s.destination?.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs font-mono text-[#2D4530]">
                    {s.departure_time.slice(0, 5)}{s.arrival_time ? ` → ${s.arrival_time.slice(0, 5)}` : ""}
                  </span>
                  <div className="flex gap-0.5">
                    {DAYS.map(d => (
                      <span
                        key={d.key}
                        className="text-[9px] px-1 py-0.5 rounded font-medium"
                        style={
                          s.days.includes(d.key)
                            ? { background: "#A3B18A", color: "white" }
                            : { background: "rgba(45,69,48,0.06)", color: "rgba(45,69,48,0.3)" }
                        }
                      >
                        {d.short}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => handleToggle(s.id, s.is_active)}>
                {s.is_active
                  ? <ToggleRight size={20} className="text-[#A3B18A]" />
                  : <ToggleLeft size={20} className="text-stone-300" />}
              </button>
              <button onClick={() => handleDelete(s.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-medium text-stone-800">Nuevo horario</h3>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Empresa *</label>
              <input value={form.company} onChange={e => set("company", e.target.value)}
                placeholder="Ej: COTAP, Sierras de Calamuchita…"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Desde *</label>
                <select value={form.origin_id} onChange={e => set("origin_id", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50">
                  <option value="">— Elegí —</option>
                  {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Hasta *</label>
                <select value={form.destination_id} onChange={e => set("destination_id", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm bg-white outline-none focus:ring-2 focus:ring-[#A3B18A]/50">
                  <option value="">— Elegí —</option>
                  {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Salida *</label>
                <input type="time" value={form.departure_time} onChange={e => set("departure_time", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Llegada</label>
                <input type="time" value={form.arrival_time} onChange={e => set("arrival_time", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-2">Días</label>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS.map(d => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={
                      form.days.includes(d.key)
                        ? { background: "#2D4530", color: "white" }
                        : { background: "rgba(45,69,48,0.07)", color: "rgba(45,69,48,0.6)" }
                    }
                  >
                    {d.short}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Notas</label>
              <input value={form.notes} onChange={e => set("notes", e.target.value)}
                placeholder="Ej: Solo en temporada alta"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-sm outline-none focus:ring-2 focus:ring-[#A3B18A]/50" />
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors">Cancelar</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.company || !form.origin_id || !form.destination_id || !form.departure_time}
                className="flex-1 py-2.5 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
