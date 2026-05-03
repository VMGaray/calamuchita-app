"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { FileText } from "lucide-react"

interface Props {
  onChange: (url: string | null) => void
}

export default function PdfUpload({ onChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("El PDF no puede superar 10MB")
      return
    }

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const fileName = `menus/${Date.now()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from("businesses")
      .upload(fileName, file, { upsert: true })

    if (uploadError) {
      setError("Error al subir el PDF")
      setLoading(false)
      return
    }

    const { data } = supabase.storage.from("businesses").getPublicUrl(fileName)
    onChange(data.publicUrl)
    setLoading(false)
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-stone-200 rounded-2xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors"
      >
        {loading ? (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-stone-400">Subiendo PDF...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText size={22} className="text-stone-400" />
            </div>
            <p className="text-sm text-stone-500 mb-1">Hacé click para subir el PDF</p>
            <p className="text-xs text-stone-400">PDF hasta 10MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
