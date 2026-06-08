"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import ImageUpload from "@/components/ui/ImageUpload"
import { Save } from "lucide-react"
import Image from "next/image"
import { LOCALIDADES } from "@/lib/constants/telefonos"

export default function AdminFarmaciaGuardia() {
  const [locality, setLocality] = useState(LOCALIDADES[0])
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setPhotoUrl(null)
    setError(null)
    createClient()
      .from("guardia_photos")
      .select("photo_url")
      .eq("category", "farmacias")
      .eq("locality", locality)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (err) setError("Error al cargar: " + err.message)
        else setPhotoUrl(data?.photo_url ?? null)
        setLoading(false)
      })
  }, [locality])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const { error: err } = await createClient()
      .from("guardia_photos")
      .upsert(
        { category: "farmacias", locality, photo_url: photoUrl, updated_at: new Date().toISOString() },
        { onConflict: "category,locality" }
      )
    setSaving(false)
    if (err) { setError("Error al guardar: " + err.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
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
          <label className="text-sm font-medium text-stone-700 block mb-1">Localidad</label>
          <select
            value={locality}
            onChange={e => setLocality(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-700 bg-white outline-none focus:border-stone-400"
          >
            {LOCALIDADES.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-stone-700 mb-1">Foto del cronograma de turnos</p>
          <p className="text-xs text-stone-400 mb-4">
            Se muestra en Info Útil → Farmacias de turno solo para la localidad seleccionada.
          </p>
          {loading ? (
            <div className="h-32 rounded-xl bg-stone-100 animate-pulse" />
          ) : (
            <ImageUpload
              value={photoUrl}
              onChange={setPhotoUrl}
              bucket="businesses"
              folder="guardias"
              label="Subir cronograma de farmacias"
            />
          )}
        </div>

        {!loading && photoUrl && (
          <div className="rounded-xl overflow-hidden border border-stone-100">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={photoUrl}
                alt={`Farmacias de turno — ${locality}`}
                fill
                className="object-contain bg-stone-50"
              />
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || loading}
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
