import JoyasDelValle from "@/components/public/JoyasDelValle"
import CalamuchitaSale from "@/components/public/CalamuchitaSale"
import PulsoDelValle from "@/components/public/PulsoDelValle"
import CtaBusiness from "@/components/public/CtaBusiness"
import LocalidadSelectorWidget from "@/components/public/LocalidadSelectorWidget"
import WebGLBackground from "@/components/public/WebGLBackgroundLazy"
import { createClient } from "@/lib/supabase/server"

const BODY_BG = "#E1DBC9"

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
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, slug, cover_url, logo_url, subcategory, section")
      .eq("status", "active")
      .eq("is_premium", true)
      .order("created_at", { ascending: false })
      .limit(8),

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
  ])

  const featuredBusinesses: FeaturedBusiness[] =
    (featuredData as FeaturedBusiness[] | null) ?? []
  const activePromotions: Promotion[] =
    (promotionsData as Promotion[] | null) ?? []
  const editorialPosts: EditorialPost[] =
    (editorialData as EditorialPost[] | null) ?? []

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-4">
        <LocalidadSelectorWidget />
      </div>

      <div className="relative overflow-hidden" style={{ background: BODY_BG }}>
        <WebGLBackground />
        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-2 pb-10">
          <JoyasDelValle businesses={featuredBusinesses} />
          <CalamuchitaSale promotions={activePromotions} />
          
          <PulsoDelValle posts={editorialPosts} />
          <CtaBusiness />
        </div>
      </div>
    </div>
  )
}
