import JoyasDelValle from "@/components/public/JoyasDelValle"
import PromosExclusivas from "@/components/public/PromosExclusivas"
import PulsoDelValle from "@/components/public/PulsoDelValle"
import Novedades from "@/components/public/Novedades"
import CtaBusiness from "@/components/public/CtaBusiness"
import LocalidadSelectorWidget from "@/components/public/LocalidadSelectorWidget"
import { createClient } from "@/lib/supabase/server"
import type { Novedad } from "@/types/database"
import { buildPromoGroup, PROMO_VALUE_COLUMNS, PROMO_FLYERS_EMBED, type PromoGroup, type PromotionRow } from "@/lib/promos"
import { businessProfileUrl } from "@/lib/utils/business"
import { hoyAR } from "@/lib/utils/fechas"

const NOVEDADES_LIMIT = 5

type FeaturedBusiness = {
  id: string
  name: string
  slug: string
  cover_url: string | null
  logo_url: string | null
  subcategory: string | null
  section: string
}

type PromoBusiness = {
  id: string
  name: string
  slug: string
  section: string
  logo_url: string | null
}

type PromotionWithBusiness = PromotionRow & {
  businesses: PromoBusiness | null
}

/**
 * Agrupa las promos por negocio: una tarjeta por negocio, en el orden en que vence su
 * primera promo. Las filas sin negocio (oculto por RLS) se descartan.
 */
function groupPromotionsByBusiness(rows: PromotionWithBusiness[]): PromoGroup[] {
  const byBusiness = new Map<string, { business: PromoBusiness; rows: PromotionWithBusiness[] }>()
  for (const row of rows) {
    const biz = row.businesses
    if (!biz) continue
    const entry = byBusiness.get(biz.id) ?? { business: biz, rows: [] }
    entry.rows.push(row)
    byBusiness.set(biz.id, entry)
  }
  return [...byBusiness.values()].map(({ business, rows }) =>
    buildPromoGroup(business, rows, businessProfileUrl(business.section, business.slug))
  )
}

export type EditorialPost = {
  id: string
  title: string
  type: string
  description: string | null
  image_url: string | null
  expires_at: string | null
  created_at: string
}

export default async function HomePage() {
  const supabase = await createClient()
  const today = hoyAR()

  const [
    { data: featuredData },
    { data: promotionsData },
    { data: editorialData },
    { data: novedadesData },
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, slug, cover_url, logo_url, subcategory, section")
      .eq("status", "active")
      .eq("is_premium", true)
      .order("created_at", { ascending: false })
      .limit(100),

    supabase
      .from("promotions")
      .select(`
        id,
        title,
        description,
        ${PROMO_VALUE_COLUMNS},
        valid_until,
        businesses(id, name, slug, section, logo_url),
        ${PROMO_FLYERS_EMBED}
      `)
      .eq("is_active", true)
      .gte("valid_until", today)
      .order("valid_until", { ascending: true })
      .limit(60),

    // Notas sin fecha de expiración, o con fecha de expiración en el futuro
    supabase
      .from("editorial_posts")
      .select("id, title, type, description, image_url, expires_at, created_at")
      .or(`expires_at.is.null,expires_at.gt.${today}`)
      .order("created_at", { ascending: false })
      .limit(10),

    // published=true y no vencidas ya las filtra la policy RLS de lectura pública;
    // traemos NOVEDADES_LIMIT + 1 solo para saber si hay que mostrar "Ver todas"
    supabase
      .from("novedades")
      .select("id, title, content, image_url, locality, expires_at, created_at, published")
      .order("created_at", { ascending: false })
      .limit(NOVEDADES_LIMIT + 1),
  ])

  const featuredBusinesses: FeaturedBusiness[] =
    (featuredData as FeaturedBusiness[] | null) ?? []
  // Ya vienen ordenadas por vencimiento: cada negocio queda en el lugar de su promo más próxima a vencer
  const promoGroups = groupPromotionsByBusiness(
    (promotionsData as PromotionWithBusiness[] | null) ?? []
  )
  const editorialPosts: EditorialPost[] =
    (editorialData as EditorialPost[] | null) ?? []
  const allNovedades: Novedad[] =
    (novedadesData as Novedad[] | null) ?? []
  const novedades = allNovedades.slice(0, NOVEDADES_LIMIT)
  const hasMoreNovedades = allNovedades.length > NOVEDADES_LIMIT

  return (
    <div className="bg-[#F5F2EB]">
      <div className="max-w-6xl mx-auto px-4 pt-4 pb-12">

        {/* 1 — Localidades */}
        <div className="rounded-3xl border border-[#2D4530]/40 bg-white p-6 md:p-8 my-6 shadow-sm">
          <LocalidadSelectorWidget />
        </div>

        {/* 2 — Destacados (sin padding: el carrusel ocupa todo el ancho) */}
        {featuredBusinesses.length > 0 && (
          <div className="rounded-3xl border border-[#2D4530]/40 bg-[#E6EBE4] my-6 shadow-sm overflow-hidden">
            <JoyasDelValle businesses={featuredBusinesses} />
          </div>
        )}

        {/* 3 — Promos exclusivas (cupones por categoría) */}
        {promoGroups.length > 0 && (
          <div className="rounded-3xl border border-[#2D4530]/40 bg-[#EDF3EE] p-6 md:p-8 my-6 shadow-sm overflow-hidden">
            <PromosExclusivas groups={promoGroups} />
          </div>
        )}

        {/* 4 — Novedades */}
        {novedades.length > 0 && (
          <div className="rounded-3xl border border-[#2D4530]/40 bg-[#EEF0EA] p-6 md:p-8 my-6 shadow-sm overflow-hidden">
            <Novedades novedades={novedades} hasMore={hasMoreNovedades} />
          </div>
        )}

        {/* 5 — Editorial */}
        {editorialPosts.length > 0 && (
          <div className="rounded-3xl border border-[#2D4530]/40 bg-[#2D4530] p-6 md:p-8 my-6 shadow-sm overflow-hidden">
            <PulsoDelValle posts={editorialPosts} />
          </div>
        )}

        {/* 6 — CTA suscripción */}
        <div className="rounded-3xl border border-[#2D4530]/40 bg-[#FAF8F5] my-6 shadow-sm overflow-hidden">
          <CtaBusiness />
        </div>

      </div>
    </div>
  )
}
