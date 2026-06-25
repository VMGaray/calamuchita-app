import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, CalendarDays } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

const TYPE_STYLES: Record<string, { bg: string; color: string }> = {
  "Entrevista":      { bg: "rgba(45,69,48,0.10)",   color: "#2D4530" },
  "Efeméride":       { bg: "rgba(124,92,58,0.12)",  color: "#7C5C3A" },
  "Tip del Finde":   { bg: "rgba(180,145,30,0.13)", color: "#7A6000" },
  "Novedad":         { bg: "rgba(74,85,162,0.10)",  color: "#4A55A2" },
  "Noticias":        { bg: "rgba(190,30,30,0.10)",  color: "#B01E1E" },
  "Nota de interés": { bg: "rgba(20,130,160,0.11)", color: "#0F7A96" },
}

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("editorial_posts")
    .select("title, description")
    .eq("id", id)
    .single()

  if (!data) return {}
  return {
    title: `${data.title} | Identidad Calamuchitana`,
    description: data.description ?? undefined,
  }
}

export default async function EditorialPostPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("editorial_posts")
    .select("*")
    .eq("id", id)
    .single()

  if (!post) notFound()

  const badge = TYPE_STYLES[post.type] ?? { bg: "rgba(45,69,48,0.08)", color: "#2D4530" }

  const formattedDate = new Date(post.created_at).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="min-h-screen pb-20" style={{ background: "#F0EBE0" }}>
      <div className="max-w-2xl mx-auto px-4 pt-6">

        {/* Volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-6 transition-opacity hover:opacity-60"
          style={{ color: "#2D4530" }}
        >
          <ArrowLeft size={15} />
          Volver al inicio
        </Link>

        {/* Imagen principal */}
        {post.image_url && (
          <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-stone-100 mb-6 shadow-sm">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100" />
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              priority
              className="object-cover object-top"
              sizes="(max-width: 672px) 100vw, 672px"
              quality={85}
            />
          </div>
        )}

        {/* Tipo + fecha */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
            style={{ background: badge.bg, color: badge.color }}
          >
            {post.type}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-stone-400 font-medium">
            <CalendarDays size={12} />
            {formattedDate}
          </span>
          {post.expires_at && (
            <span className="text-[10px] text-stone-400">
              · Expira: {new Date(post.expires_at + "T00:00:00").toLocaleDateString("es-AR")}
            </span>
          )}
        </div>

        {/* Título */}
        <h1
          className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-5"
          style={{ color: "#2D4530" }}
        >
          {post.title}
        </h1>

        {/* Descripción / cuerpo */}
        {post.description && (
          <div
            className="bg-white rounded-3xl p-6 shadow-sm border border-stone-100"
          >
            <p className="text-stone-700 text-base leading-relaxed whitespace-pre-wrap">
              {post.description}
            </p>
          </div>
        )}

        {/* Sección Identidad Calamuchitana */}
        <div className="mt-8 pt-6 border-t border-stone-200 flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black"
            style={{ background: "#2D4530", color: "#E1DBC9" }}
          >
            IC
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider" style={{ color: "#2D4530" }}>
              Identidad Calamuchitana
            </p>
            <p className="text-xs text-stone-400">Valle de Calamuchita · Córdoba</p>
          </div>
        </div>

      </div>
    </div>
  )
}
