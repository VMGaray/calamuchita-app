import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { Novedad } from "@/types/database"

const ACCENT = "#6B7A5E"

export const metadata = {
  title: "Novedades | Calamuchita App",
  description: "Avisos y novedades de corto plazo del Valle de Calamuchita",
}

export default async function NovedadesPage() {
  const supabase = await createClient()

  // published=true y no vencidas ya las filtra la policy RLS de lectura pública
  const { data } = await supabase
    .from("novedades")
    .select("id, title, content, image_url, expires_at, created_at, published")
    .order("created_at", { ascending: false })

  const novedades = (data as Novedad[] | null) ?? []

  return (
    <main className="min-h-screen bg-[#F5F2EB]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-6 transition-opacity hover:opacity-70"
          style={{ color: ACCENT }}
        >
          <ArrowLeft size={14} /> Inicio
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(107,122,94,0.12)" }}
          >
            <Sparkles size={20} style={{ color: ACCENT }} />
          </div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: ACCENT }}>
            Novedades
          </h1>
        </div>

        {novedades.length === 0 ? (
          <p className="text-stone-400 text-sm">No hay novedades activas por el momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {novedades.map(n => (
              <div
                key={n.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col"
                style={{ borderLeft: `3px solid ${ACCENT}` }}
              >
                {n.image_url && (
                  <div className="relative aspect-video bg-stone-100">
                    <Image
                      src={n.image_url}
                      alt={n.title ?? "Novedad"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 480px"
                    />
                  </div>
                )}
                <div className="p-4 flex flex-col gap-1.5">
                  {n.title && (
                    <h3 className="font-serif text-sm font-bold text-stone-900 leading-snug">
                      {n.title}
                    </h3>
                  )}
                  {n.content && (
                    <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                      {n.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
