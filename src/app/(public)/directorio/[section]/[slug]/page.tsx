import type { Metadata } from "next"
import { Suspense } from "react"
import DirectorioDetalle from "@/components/public/DirectorioDetalle"
import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { businessProfileUrl } from "@/lib/utils/business"
import { hoyAR } from "@/lib/utils/fechas"
import { promoHeadline, PROMO_VALUE_COLUMNS } from "@/lib/promos"

interface Props {
  params: Promise<{ section: string; slug: string }>
}

const DEFAULT_IMAGE = "/valle.jpg"


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const today = hoyAR()

  const { data: business } = await supabase
    .from("businesses")
    .select(`
      name, description, cover_url,
      promotions (${PROMO_VALUE_COLUMNS}, valid_until, is_active)
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (!business) return {}

  const image = business.cover_url || DEFAULT_IMAGE
  const description = (
    business.description || `${business.name} en el Valle de Calamuchita`
  ).slice(0, 160)

  const promos: any[] = (business as any).promotions ?? []
  const activePromo = promos.find((p) => p.is_active && p.valid_until >= today) ?? null
  const promoLabel = promoHeadline(activePromo)

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
  const today = hoyAR()

  const { data: business } = await supabase
    .from("businesses")
    .select(`
      *,
      business_hours (*),
      business_photos (*)
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (!business) notFound()

  // El slug es único en toda la tabla; el section de la URL es solo
  // para mostrar el breadcrumb/back correcto. Si un negocio fue
  // recategorizado, redirigimos a la URL canónica en vez de romper
  // links viejos compartidos con la sección anterior.
  // Gastronomía va a /negocios/<slug> (los links /directorio/gastronomy/... ya los redirige next.config).
  // Las secciones extra (extra_sections) también son válidas: así el "volver" lleva a la sección desde la que se entró.
  const enSeccionExtra = business.section !== "gastronomy" && (business.extra_sections ?? []).includes(section)
  if (business.section !== section && !enSeccionExtra) {
    redirect(businessProfileUrl(business.section, slug))
  }

  const { data: promotionsData } = await supabase
    .from("promotions")
    .select(`id, title, description, ${PROMO_VALUE_COLUMNS}, valid_until`)
    .eq("business_id", business.id)
    .eq("is_active", true)
    .gte("valid_until", today)
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <Suspense>
      <DirectorioDetalle business={business} section={section} promotions={promotionsData ?? []} />
    </Suspense>
  )
}
