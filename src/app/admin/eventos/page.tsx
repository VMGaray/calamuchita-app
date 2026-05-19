"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Calendar, MapPin, Type, Image as ImageIcon, Loader2, Edit2, Trash2, X, AlignLeft } from "lucide-react"

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
    category: "festival"
  })
  
  // Ahora manejamos un array de archivos
  const [files, setFiles] = useState<FileList | null>(null)

  const fetchEvents = async () => {
    const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false })
    if (data) setEvents(data)
  }

  useEffect(() => { fetchEvents() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrls: string[] = []

      // 1. Subida múltiple de imágenes
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
      // Si hay fotos nuevas, las guardamos como array. Si no, no tocamos el campo.
      if (imageUrls.length > 0) payload.image_url = imageUrls

      if (editingId) {
        await supabase.from("events").update(payload).eq("id", editingId)
      } else {
        await supabase.from("events").insert([payload])
      }

      alert("¡Evento guardado con éxito!")
      setEditingId(null)
      setFormData({ title: "", description: "", localidad: "Villa General Belgrano", date_description: "", category: "festival" })
      setFiles(null)
      fetchEvents()
    } catch (error: any) {
      alert("Error de RLS o Conexión: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-[32px] border border-stone-200 shadow-sm">
          <h2 className="font-serif text-2xl text-[#2D4530]">{editingId ? "Editar" : "Nuevo"} Evento</h2>
          
          <input 
            type="text" required placeholder="Título del Evento" value={formData.title}
            className="w-full px-4 py-3 rounded-2xl border border-stone-100 bg-stone-50 outline-none"
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />

          <input 
            type="text" required placeholder="Fechas (Ej: 2 al 4 de Octubre)" value={formData.date_description}
            className="w-full px-4 py-3 rounded-2xl border border-stone-100 bg-stone-50 outline-none"
            onChange={(e) => setFormData({...formData, date_description: e.target.value})}
          />

          <textarea 
            rows={6} placeholder="Descripción completa..." value={formData.description}
            className="w-full px-4 py-3 rounded-2xl border border-stone-100 bg-stone-50 outline-none text-sm"
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-400 uppercase">Puedes seleccionar varias fotos</label>
            <input 
              type="file" multiple accept="image/*"
              className="w-full text-sm text-stone-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#2D4530] file:text-[#E1DBC9] file:font-bold"
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#2D4530] text-[#E1DBC9] font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "PUBLICAR EVENTO"}
          </button>
        </form>
      </div>
    </div>
  )
}