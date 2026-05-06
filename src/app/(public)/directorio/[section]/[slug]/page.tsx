import type { Metadata } from "next"
import DirectorioDetalle from "@/components/public/DirectorioDetalle"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ section: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, section } = await params
  const supabase = await createClient()
  const { data: business } = await supabase
    .from("businesses")
    .select("name, description, cover_url")
    .eq("slug", slug)
    .eq("section", section)
    .eq("status", "active")
    .single()

  if (!business) return {}

  const description = business.description || `${business.name} en el Valle de Calamuchita`
  const image = business.cover_url || "/valle.jpg"

  return {
    title: business.name,
    description,
    openGraph: {
      title: business.name,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: business.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: business.name,
      description,
      images: [image],
    },
  }
}

export default async function DirectorioDetallePage({ params }: Props) {
  const { slug, section } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from("businesses")
    .select(`
      *,
      business_hours (*),
      business_photos (*)
    `)
    .eq("slug", slug)
    .eq("section", section)
    .eq("status", "active")
    .single()

  if (!business) notFound()

  return <DirectorioDetalle business={business} section={section} />
}