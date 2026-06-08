"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "@/components/ui/ImageUpload"
import { Save } from "lucide-react"
import Image from "next/image"

export default function AdminVetGuardia() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    createClient()
      .from("guardia_photos")
      .select("photo_url")
      .eq("category", "veterinarias")
      .single()
      .then(({ data, error: err }) => {
        if (err) setError("Error al cargar: " + err.message)
        else setPhotoUrl(data?.photo_url ?? null)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const { error: err } = await createClient()
      .from("guardia_photos")
      .update({ photo_url: photoUrl, updated_at: new Date().toISOString() })
      .eq("category", "veterinarias")
    setSaving(false)
    if (err) { setError("Error al guardar: " + err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return <div className="bg-white rounded-2xl border border-stone-200 h-48 animate-pulse" />
  }

  return (
    <div className="space-y-5 max-w-lg">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-stone-700 mb-1">Foto del cuadro de guardias</p>
          <p className="text-xs text-stone-400 mb-4">
            Se muestra para todo el Valle, sin importar la localidad seleccionada.
          </p>
          <ImageUpload
            value={photoUrl}
            onChange={setPhotoUrl}
            bucket="businesses"
            folder="guardias"
            label="Subir foto del cuadro de guardias"
          />
        </div>

        {photoUrl && (
          <div className="rounded-xl overflow-hidden border border-stone-100">
            <div className="relative w-full aspect-[4/3]">
              <Image src={photoUrl} alt="Cuadro de guardias veterinarias" fill className="object-contain bg-stone-50" />
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          style={{ background: "#2D4530", color: "white" }}
        >
          <Save size={14} />
          {saving ? "Guardando…" : saved ? "¡Guardado!" : "Guardar foto"}
        </button>
      </div>
    </div>
  )
}
