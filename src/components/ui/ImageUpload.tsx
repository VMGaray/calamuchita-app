"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  bucket?: string
  folder?: string
  label?: string
}

export default function ImageUpload({
  value,
  onChange,
  bucket = "businesses",
  folder = "covers",
  label = "Subir imagen",
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Verificar que haya un archivo seleccionado antes de continuar
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5 MB")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase()
      const fileName = `${folder}/${Date.now()}.${ext}`

      // 2. Upload con desestructuración completa — data puede ser null si falla
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true })

      // 3. Guardia doble: chequear tanto uploadError como uploadData nulo
      if (uploadError || !uploadData) {
        setError(
          uploadError?.message ??
          "El upload falló. Verificá que el bucket exista y tenga acceso público."
        )
        return
      }

      // Usar uploadData.path (path real confirmado por Supabase) en lugar de fileName
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path)

      onChange(urlData.publicUrl)

      // Resetear el input para permitir re-seleccionar el mismo archivo
      if (inputRef.current) inputRef.current.value = ""

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error inesperado al subir la imagen"
      setError(message)
      console.error("[ImageUpload] error:", err)
    } finally {
      // setLoading siempre se ejecuta, incluso si hay excepción
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!value) return

    try {
      const supabase = createClient()
      // Extraer el path relativo al bucket desde la URL pública
      const bucketPrefix = `/storage/v1/object/public/${bucket}/`
      const relativePath = value.split(bucketPrefix)[1]
      if (relativePath) {
        await supabase.storage.from(bucket).remove([relativePath])
      }
    } catch (err) {
      console.error("[ImageUpload] error al eliminar:", err)
    }

    onChange(null)
  }

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-stone-700 mb-2">{label}</p>
      )}

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-stone-200 group">
          <div className="relative h-48 w-full">
            <Image
              src={value}
              alt="Imagen subida"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Eliminar imagen"
            className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !loading && inputRef.current?.click()}
          onKeyDown={e => e.key === "Enter" && !loading && inputRef.current?.click()}
          className="border-2 border-dashed border-stone-200 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-[#2D4530]/40 hover:bg-[#2D4530]/4 transition-colors"
        >
          {loading ? (
            <div className="text-center">
              <Loader2
                size={24}
                className="animate-spin mx-auto mb-2"
                style={{ color: "#2D4530", opacity: 0.5 }}
              />
              <p className="text-xs text-stone-400">Subiendo imagen…</p>
            </div>
          ) : (
            <div className="text-center pointer-events-none">
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ImageIcon size={22} className="text-stone-400" />
              </div>
              <p className="text-sm text-stone-500 mb-1">
                Hacé click para subir
              </p>
              <p className="text-xs text-stone-400">PNG, JPG o WEBP · máx. 5 MB</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-2 leading-snug">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        aria-hidden
      />
    </div>
  )
}
