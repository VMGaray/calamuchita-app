import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import BackgroundManager from "@/components/public/BackgroundManager"
import BusinessGridCard from "@/components/public/BusinessGridCard"
import { isOpenNow } from "@/lib/utils/horarios"

const FALLBACK = "/valle.jpg"

const SECTION_ES: Record<string, string> = {
  gastronomy: "Gastronomía",
  services:   "Servicios",
  commerce:   "Comercios",
  health:     "Salud",
  education:  "Educación",
  tourism:    "Turismo",
  sports:     "Deportes",
  events:     "Eventos",
  info:       "Info útil",
}

export const metadata = {
  title: "Destacados | Calamuchita App",
  description: "Los mejores negocios del Valle de Calamuchita",
}

export default async function DestacadosPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from("businesses")
    .select("id, name, slug, cover_url, logo_url, subcategory, section, business_hours(day_of_week, opens_at, closes_at, is_closed)")
    .eq("status", "active")
    .eq("is_premium", true)
    .order("created_at", { ascending: false })

  const businesses = data ?? []

  return (
    <BackgroundManager>
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-6"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            <ArrowLeft size={14} /> Inicio
          </Link>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter leading-none text-white mb-1">
            DESTACADOS
          </h1>
          <p className="text-white font-bold text-sm uppercase tracking-[0.4em] border-l-4 border-[#C9A44B] pl-4 mt-3">
            Del Valle de Calamuchita
          </p>
        </div>

        {/* Grid */}
        {businesses.length === 0 ? (
          <p className="text-stone-400 text-sm">No hay negocios destacados por el momento.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {businesses.map(biz => {
              const href = biz.section === "gastronomy"
                ? `/negocios/${biz.slug}?from=/destacados`
                : `/directorio/${biz.section}/${biz.slug}?from=/destacados`

              return (
                <BusinessGridCard
                  key={biz.id}
                  href={href}
                  name={biz.name}
                  imageUrl={biz.cover_url || FALLBACK}
                  eyebrow={SECTION_ES[biz.section] ?? biz.section}
                  isOpen={isOpenNow(biz.business_hours)}
                />
              )
            })}
          </div>
        )}
      </div>
    </BackgroundManager>
  )
}
