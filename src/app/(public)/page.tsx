import JoyasDelValle from "@/components/public/JoyasDelValle"
import CalamuchitaSale from "@/components/public/CalamuchitaSale"
import VMGPromoSection from "@/components/public/VMGPromoSection"
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
  discount_percentage: number | null // <--- Cambiado de discount_percent a discount_percentage
  discount_label: string | null
  valid_until: string | null
  businesses: PromoBusiness | null
}

export default async function HomePage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split("T")[0]

  const [
    { data: featuredData },
    { data: promotionsData },
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
  ])

  const featuredBusinesses: FeaturedBusiness[] =
    (featuredData as FeaturedBusiness[] | null) ?? []
  const activePromotions: Promotion[] =
    (promotionsData as Promotion[] | null) ?? []

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-4">
        <LocalidadSelectorWidget />
      </div>

      <div className="relative overflow-hidden" style={{ background: BODY_BG }}>
        <WebGLBackground />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-10">
          <JoyasDelValle businesses={featuredBusinesses} />
          <CalamuchitaSale promotions={activePromotions} />
          
          <VMGPromoSection />
          <CtaBusiness />
        </div>
      </div>
    </div>
  )
}
