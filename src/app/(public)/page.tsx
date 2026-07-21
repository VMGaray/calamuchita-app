import JoyasDelValle from "@/components/public/JoyasDelValle"
import CalamuchitaSale from "@/components/public/CalamuchitaSale"
import PulsoDelValle from "@/components/public/PulsoDelValle"
import Novedades from "@/components/public/Novedades"
import CtaBusiness from "@/components/public/CtaBusiness"
import LocalidadSelectorWidget from "@/components/public/LocalidadSelectorWidget"
import { createClient } from "@/lib/supabase/server"
import type { Novedad } from "@/types/database"

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
}

type Promotion = {
  id: string
  title: string
  description: string | null
  discount_percentage: number | null
  discount_label: string | null
  valid_until: string | null
  businesses: PromoBusiness | null
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
  const today = new Date().toISOString().split("T")[0]

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
        discount_percentage,
        valid_until,
        businesses(id, name, slug, section)
      `)
      .eq("is_active", true)
      .gte("valid_until", today)
      .order("created_at", { ascending: false })
      .limit(6),

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
      .select("id, title, content, image_url, expires_at, created_at, published")
      .order("created_at", { ascending: false })
      .limit(NOVEDADES_LIMIT + 1),
  ])

  const featuredBusinesses: FeaturedBusiness[] =
    (featuredData as FeaturedBusiness[] | null) ?? []
  const activePromotions: Promotion[] =
    (promotionsData as Promotion[] | null) ?? []
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

        {/* 3 — Promos */}
        {activePromotions.length > 0 && (
          <div className="rounded-3xl border border-[#2D4530]/40 bg-[#fdeee6] p-6 md:p-8 my-6 shadow-sm overflow-hidden">
            <CalamuchitaSale promotions={activePromotions} />
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
