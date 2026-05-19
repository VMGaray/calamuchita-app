"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Edit2, Trash2, X, ImageIcon, CalendarDays, MapPin } from "lucide-react"
import Image from "next/image"
import { DATA_TELEFONOS } from "@/lib/constants/telefonos"

const LOCALIDADES = Object.keys(DATA_TELEFONOS)

export default function AdminEventosPage() {
  const supabase = createClient()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    localidad: "Villa General Belgrano",
    date_description: "",
    category: "festival",
  })

  const [files, setFiles] = useState<FileList | null>(null)

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false })
    if (data) setEvents(data)
  }

  useEffect(() => { fetchEvents() }, [])

  const handleEdit = (event: any) => {
    setEditingId(event.id)
    setFormData({
      title: event.title ?? "",
      description: event.description ?? "",
      localidad: event.localidad ?? "Villa General Belgrano",
      date_description: event.date_description ?? "",
      category: event.category ?? "festival",
    })
    setFiles(null)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({ title: "", description: "", localidad: "Villa General Belgrano", date_description: "", category: "festival" })
    setFiles(null)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar el evento "${title}"? Esta acción no se puede deshacer.`)) return
    await supabase.from("events").delete().eq("id", id)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrls: string[] = []

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i]
          const fileName = `${Date.now()}-${file.name}`
          const { error: uploadError } = await supabase.storage
            .from("event-images")
            .upload(fileName, file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from("event-images")
            .getPublicUrl(fileName)

          imageUrls.push(publicUrl)
        }
      }

      const payload: any = { ...formData }
      if (imageUrls.length > 0) payload.image_url = imageUrls

      if (editingId) {
        await supabase.from("events").update(payload).eq("id", editingId)
      } else {
        await supabase.from("events").insert([payload])
      }

      handleCancel()
      fetchEvents()
    } catch (error: any) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* ── Formulario ── */}
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-8 rounded-[32px] border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-[#2D4530]">
              {editingId ? "Editar evento" : "Nuevo evento"}
            </h2>
            {editingId && (
              <button type="button" onClick={handleCancel}
                className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                <X size={14} /> Cancelar edición
              </button>
            )}
          </div>

          <input
            type="text" required placeholder="Título del evento" value={formData.title}
            className="w-full px-4 py-3 rounded-2xl border border-stone-100 bg-stone-50 outline-none text-sm"
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />

          <input
            type="text" required placeholder='Fechas (ej: "2 al 4 de octubre")' value={formData.date_description}
            className="w-full px-4 py-3 rounded-2xl border border-stone-100 bg-stone-50 outline-none text-sm"
            onChange={e => setFormData({ ...formData, date_description: e.target.value })}
          />

          <select
            value={formData.localidad}
            className="w-full px-4 py-3 rounded-2xl border border-stone-100 bg-stone-50 outline-none text-sm"
            onChange={e => setFormData({ ...formData, localidad: e.target.value })}
          >
            {LOCALIDADES.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <textarea
            rows={5} placeholder="Descripción completa..." value={formData.description}
            className="w-full px-4 py-3 rounded-2xl border border-stone-100 bg-stone-50 outline-none text-sm"
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="space-y-1">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">
              {editingId ? "Reemplazar fotos (opcional)" : "Fotos (podés seleccionar varias)"}
            </label>
            <input
              type="file" multiple accept="image/*"
              className="w-full text-sm text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#2D4530] file:text-[#E1DBC9] file:font-bold"
              onChange={e => setFiles(e.target.files)}
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#2D4530] text-[#E1DBC9] font-bold py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : editingId ? "Guardar cambios" : "Publicar evento"}
          </button>
        </form>

        {/* ── Lista de eventos ── */}
        {events.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-serif text-lg text-[#2D4530] px-1">Eventos publicados ({events.length})</h3>
            {events.map(event => {
              const images: string[] = Array.isArray(event.image_url) ? event.image_url : []
              const isEditing = editingId === event.id
              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-2xl border p-4 flex gap-4 items-start transition-all ${isEditing ? "border-[#2D4530] ring-1 ring-[#2D4530]/20" : "border-stone-200"}`}
                >
                  {/* Miniatura */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100 flex items-center justify-center">
                    {images[0] ? (
                      <Image src={images[0]} alt={event.title} width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-stone-300" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{event.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {event.date_description && (
                        <span className="flex items-center gap-1 text-xs text-stone-400">
                          <CalendarDays size={10} />{event.date_description}
                        </span>
                      )}
                      {event.localidad && (
                        <span className="flex items-center gap-1 text-xs text-stone-400">
                          <MapPin size={10} />{event.localidad}
                        </span>
                      )}
                      {images.length > 1 && (
                        <span className="text-xs text-stone-400">{images.length} fotos</span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(event)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-400 hover:text-[#2D4530] transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 text-stone-400 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </div>
  )
}
