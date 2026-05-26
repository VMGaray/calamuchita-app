"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, GripVertical, Pencil, Check, X } from "lucide-react"
import { Locality } from "@/types/database"

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

export default function AdminLocalidades() {
  const [localities, setLocalities] = useState<Locality[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const fetch = async () => {
    const { data } = await createClient()
      .from("localities")
      .select("*")
      .order("sort_order", { ascending: true })
    setLocalities(data || [])
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const handleAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    const maxOrder = localities.reduce((m, l) => Math.max(m, l.sort_order), 0)
    await createClient().from("localities").insert([{
      name: name.trim(),
      slug: toSlug(name.trim()),
      sort_order: maxOrder + 1,
    }])
    setName("")
    setSaving(false)
    fetch()
  }

  const startEdit = (loc: Locality) => {
    setEditingId(loc.id)
    setEditingName(loc.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return
    await createClient().from("localities").update({
      name: editingName.trim(),
      slug: toSlug(editingName.trim()),
    }).eq("id", id)
    setLocalities(prev => prev.map(l =>
      l.id === id ? { ...l, name: editingName.trim(), slug: toSlug(editingName.trim()) } : l
    ))
    cancelEdit()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta localidad? También se eliminarán sus servicios asociados.")) return
    await createClient().from("localities").delete().eq("id", id)
    fetch()
  }

  return (
    <div className="space-y-6">
      {/* Formulario rápido */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h3 className="text-sm font-medium text-stone-700 mb-3">Agregar localidad</h3>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="Nombre de la localidad…"
            className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:ring-2 focus:ring-[#A3B18A]/50"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !name.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4530] text-white text-sm font-medium hover:bg-[#3a5a3e] transition-colors disabled:opacity-40"
          >
            <Plus size={14} />
            Agregar
          </button>
        </div>
        {name.trim() && (
          <p className="text-[10px] text-stone-400 mt-2">
            Slug generado: <code className="bg-stone-50 px-1 rounded">{toSlug(name)}</code>
          </p>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-12 animate-pulse border border-stone-200" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          {localities.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-10">Sin localidades todavía</p>
          ) : localities.map((loc, i) => (
            <div
              key={loc.id}
              className={`flex items-center gap-3 px-5 py-3 ${i !== localities.length - 1 ? "border-b border-stone-100" : ""}`}
            >
              <GripVertical size={14} className="text-stone-300 flex-shrink-0" />

              {editingId === loc.id ? (
                /* Modo edición inline */
                <div className="flex-1 flex items-center gap-2">
                  <input
                    autoFocus
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleUpdate(loc.id)
                      if (e.key === "Escape") cancelEdit()
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[#A3B18A] text-sm text-stone-800 outline-none"
                  />
                  {editingName.trim() && (
                    <p className="text-[10px] text-stone-400 font-mono hidden sm:block">
                      {toSlug(editingName)}
                    </p>
                  )}
                  <button
                    onClick={() => handleUpdate(loc.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#2D4530] text-white hover:bg-[#3a5a3e] transition-colors"
                    title="Guardar"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-400 transition-colors"
                    title="Cancelar"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                /* Modo vista */
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800">{loc.name}</p>
                    <p className="text-[10px] text-stone-400 font-mono">{loc.slug}</p>
                  </div>
                  <span className="text-xs text-stone-300 tabular-nums">#{loc.sort_order}</span>
                  <button
                    onClick={() => startEdit(loc)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-100 text-stone-300 hover:text-stone-500 transition-colors"
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(loc.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-stone-400">
        {localities.length} localidades registradas
      </p>
    </div>
  )
}
