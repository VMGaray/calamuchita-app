"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, ImageIcon } from "lucide-react"
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
  label = "Subir imagen"
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede superar 5MB")
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const fileName = `${folder}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setError("Error al subir la imagen")
      setLoading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
    onChange(data.publicUrl)
    setLoading(false)
  }

  const handleRemove = async () => {
    if (!value) return
    const supabase = createClient()
    const path = value.split(`${bucket}/`)[1]
    if (path) await supabase.storage.from(bucket).remove([path])
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
              alt="imagen"
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={handleRemove}
            className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-stone-200 rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors"
        >
          {loading ? (
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-stone-400">Subiendo...</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ImageIcon size={22} className="text-stone-400" />
              </div>
              <p className="text-sm text-stone-500 mb-1">Hacé click para subir</p>
              <p className="text-xs text-stone-400">PNG, JPG hasta 5MB</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}