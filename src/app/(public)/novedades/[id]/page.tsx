import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import ImageLightbox from "@/components/ui/ImageLightbox"

const ACCENT = "#6B7A5E"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("novedades")
    .select("title, content")
    .eq("id", id)
    .single()

  if (!data) return {}
  return {
    title: `${data.title ?? "Novedad"} | Novedades`,
    description: data.content ?? undefined,
  }
}

export default async function NovedadPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: novedad } = await supabase
    .from("novedades")
    .select("*")
    .eq("id", id)
    .single()

  if (!novedad) notFound()

  const formattedDate = new Date(novedad.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen pb-20" style={{ background: "#F5F2EB" }}>
      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* Volver */}
        <Link
          href="/novedades"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-opacity hover:opacity-60"
          style={{ color: ACCENT }}
        >
          <ArrowLeft size={15} />
          Volver a novedades
        </Link>

        {/* Imagen principal — clic abre lightbox */}
        {novedad.image_url && (
          <ImageLightbox
            src={novedad.image_url}
            alt={novedad.title ?? "Novedad"}
            containerClassName="aspect-video w-full rounded-3xl overflow-hidden bg-stone-100 mb-6 shadow-sm"
            sizes="(max-width: 672px) 100vw, 672px"
            quality={85}
            priority
          />
        )}

        {/* Fecha + localidad */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
            <CalendarDays size={12} />
            {formattedDate}
          </span>
          {novedad.locality && (
            <span
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ background: "rgba(107,122,94,0.12)", color: ACCENT }}
            >
              <MapPin size={11} />
              {novedad.locality}
            </span>
          )}
        </div>

        {/* Título */}
        {novedad.title && (
          <h1
            className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-5"
            style={{ color: ACCENT }}
          >
            {novedad.title}
          </h1>
        )}

        {/* Contenido */}
        {novedad.content && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100">
            <p className="text-stone-700 text-base leading-relaxed whitespace-pre-wrap">
              {novedad.content}
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
