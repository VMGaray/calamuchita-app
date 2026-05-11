import type { Metadata } from "next"
import DirectorioDetalle from "@/components/public/DirectorioDetalle"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ section: string; slug: string }>
}

const DEFAULT_IMAGE = "/valle.jpg"

function buildPromoLabel(promo: { discount_label?: string | null; discount_percentage?: number | null } | null) {
  if (!promo) return null
  if (promo.discount_label) return promo.discount_label
  if (promo.discount_percentage) return `${promo.discount_percentage}% OFF`
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, section } = await params
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  const { data: business } = await supabase
    .from("businesses")
    .select(`
      name, description, cover_url,
      promotions (discount_label, discount_percentage, valid_until, is_active)
    `)
    .eq("slug", slug)
    .eq("section", section)
    .eq("status", "active")
    .single()

  if (!business) return {}

  const image = business.cover_url || DEFAULT_IMAGE
  const description = (
    business.description || `${business.name} en el Valle de Calamuchita`
  ).slice(0, 160)

  const promos: any[] = (business as any).promotions ?? []
  const activePromo = promos.find((p) => p.is_active && p.valid_until >= today) ?? null
  const promoLabel = buildPromoLabel(activePromo)

  const title = promoLabel
    ? `¡${promoLabel} en ${business.name}! — Calamuchita App`
    : `${business.name} | Calamuchita App`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "es_AR",
      siteName: "Calamuchita App",
      images: [{ url: image, width: 1200, height: 630, alt: business.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
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
