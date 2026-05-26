import MenusDelDiaCarousel from "@/components/public/MenusDelDiaCarousel"
import JoyasDelValle from "@/components/public/JoyasDelValle"
import CalamuchitaSale from "@/components/public/CalamuchitaSale"
import VMGPromoSection from "@/components/public/VMGPromoSection"
import CtaBusiness from "@/components/public/CtaBusiness"
import WaveDivider from "@/components/public/WaveDivider"
import LocalidadSelectorWidget from "@/components/public/LocalidadSelectorWidget"
import WebGLBackground from "@/components/public/WebGLBackgroundLazy"
import { createClient } from "@/lib/supabase/server"

const CAROUSEL_BG_TOP = "#D6CEBC"
const CAROUSEL_BG_BOTTOM = "#C9C0A9"
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
      <WaveDivider fill={CAROUSEL_BG_TOP} bgColor={BODY_BG} />
      <div className="mt-10">
            <LocalidadSelectorWidget />
          </div>

      <MenusDelDiaCarousel />

      <WaveDivider fill={BODY_BG} bgColor={CAROUSEL_BG_BOTTOM} />

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
