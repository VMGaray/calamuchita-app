"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { MAX_INPUT_BYTES, MAX_UPLOAD_BYTES, resizeImage, storagePath, storagePathFromPublicUrl } from "@/lib/images"

export const MAX_GALLERY_PHOTOS = 8
const BUCKET = "businesses"

interface Photo {
  id: string
  url: string
  sort_order: number | null
}

interface Props {
  businessId: string
}

/**
 * Galería del local: hasta 8 fotos, se guardan al instante en `business_photos`.
 * Las fotos se redimensionan en el navegador y se suben a `<businessId>/gallery/`.
 */
export default function GaleriaFotos({ businessId }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await createClient()
        .from("business_photos")
        .select("id, url, sort_order")
        .eq("business_id", businessId)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true })
      setPhotos(data ?? [])
      setLoading(false)
    }
    load()
  }, [businessId])

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (inputRef.current) inputRef.current.value = ""
    if (files.length === 0) return

    const free = MAX_GALLERY_PHOTOS - photos.length
    const selected = files.slice(0, free)
    setError(files.length > free ? `Solo se pueden tener ${MAX_GALLERY_PHOTOS} fotos: subimos las primeras ${free}.` : null)

    const supabase = createClient()
    let nextOrder = photos.reduce((max, p) => Math.max(max, p.sort_order ?? 0), -1) + 1
    setUploading(selected.length)

    for (const file of selected) {
      try {
        if (file.size > MAX_INPUT_BYTES) throw new Error(`"${file.name}" es demasiado pesada (máx. 25 MB)`)
        const { blob, ext } = await resizeImage(file, 1600)
        if (blob.size > MAX_UPLOAD_BYTES) throw new Error(`"${file.name}" sigue muy pesada después de comprimirla`)

        const path = storagePath("gallery", ext, businessId)
        const { data: up, error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, blob, { cacheControl: "31536000", contentType: blob.type })
        if (upErr || !up) throw new Error(upErr?.message ?? "No se pudo subir la foto")

        const url = supabase.storage.from(BUCKET).getPublicUrl(up.path).data.publicUrl
        const { data: row, error: insErr } = await supabase
          .from("business_photos")
          .insert({ business_id: businessId, url, sort_order: nextOrder })
          .select("id, url, sort_order")
          .single()
        if (insErr || !row) {
          // Si la base rechaza la fila (por ejemplo, el tope de 8), no dejamos el archivo huérfano
          await supabase.storage.from(BUCKET).remove([up.path])
          throw new Error(insErr?.message.includes("8 fotos") ? `Llegaste al máximo de ${MAX_GALLERY_PHOTOS} fotos` : "No se pudo guardar la foto")
        }
        nextOrder++
        setPhotos(prev => [...prev, row])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir la foto")
      } finally {
        setUploading(n => n - 1)
      }
    }
  }

  const handleDelete = async (photo: Photo) => {
    if (!confirm("¿Borrás esta foto?")) return
    setBusyId(photo.id)
    const supabase = createClient()
    const { error: delErr } = await supabase.from("business_photos").delete().eq("id", photo.id)
    if (delErr) {
      setError("No se pudo borrar la foto")
    } else {
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
      const path = storagePathFromPublicUrl(photo.url, BUCKET)
      // Si el archivo no se puede borrar (por ejemplo, lo subió el admin), la foto igual deja de mostrarse
      if (path) await supabase.storage.from(BUCKET).remove([path])
    }
    setBusyId(null)
  }

  const handleMove = async (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= photos.length) return
    const reordered = [...photos]
    ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
    const withOrder = reordered.map((p, i) => ({ ...p, sort_order: i }))
    const previous = photos
    setPhotos(withOrder)
    setBusyId(photos[index].id)

    // Se reescribe el orden de todas: normaliza galerías viejas con sort_order vacío o repetido
    const supabase = createClient()
    const results = await Promise.all(
      withOrder.map(p => supabase.from("business_photos").update({ sort_order: p.sort_order }).eq("id", p.id))
    )
    if (results.some(r => r.error)) {
      setPhotos(previous)
      setError("No se pudo cambiar el orden")
    }
    setBusyId(null)
  }

  if (loading) return <div className="h-28 rounded-xl bg-stone-100 animate-pulse" />

  const canAdd = photos.length + uploading < MAX_GALLERY_PHOTOS

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {photos.map((photo, i) => (
          <div key={photo.id} className="relative rounded-xl overflow-hidden border border-stone-200 aspect-square bg-stone-100">
            <Image src={photo.url} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="(max-width: 640px) 50vw, 160px" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 text-stone-700">
                Principal
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1.5 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(i, -1)}
                  disabled={i === 0 || busyId !== null}
                  aria-label="Mover antes"
                  className="w-7 h-7 rounded-full bg-white/90 text-stone-700 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(i, 1)}
                  disabled={i === photos.length - 1 || busyId !== null}
                  aria-label="Mover después"
                  className="w-7 h-7 rounded-full bg-white/90 text-stone-700 flex items-center justify-center disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                disabled={busyId !== null}
                aria-label="Borrar foto"
                className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center disabled:opacity-30"
              >
                {busyId === photo.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className="rounded-xl border border-stone-200 aspect-square flex items-center justify-center bg-stone-50">
            <Loader2 size={20} className="animate-spin text-stone-400" />
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading > 0}
            className="rounded-xl border-2 border-dashed border-stone-200 aspect-square flex flex-col items-center justify-center gap-1 text-stone-400 hover:border-[#2D4530]/40 hover:text-stone-500 transition-colors disabled:opacity-50"
          >
            <ImagePlus size={22} />
            <span className="text-xs">Agregar fotos</span>
          </button>
        )}
      </div>

      <p className="text-xs text-stone-400">
        {photos.length}/{MAX_GALLERY_PHOTOS} fotos · la primera es la principal · usá las flechas para ordenarlas
      </p>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" aria-hidden />
    </div>
  )
}
