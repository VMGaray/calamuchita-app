import BuscarResults from "@/components/public/BuscarResults"
import { createClient } from "@/lib/supabase/server"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" — Búsqueda` : "Búsqueda",
  }
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams
  const supabase = await createClient()

  const { data: results } = q
    ? await supabase
        .from("businesses")
        .select("id, name, slug, section, subcategory, address, logo_url, cover_url, description, is_open, phone, whatsapp, business_hours(day_of_week, opens_at, closes_at, is_closed)")
        .eq("status", "active")
        .or(`name.ilike.%${q}%,description.ilike.%${q}%,subcategory.ilike.%${q}%,address.ilike.%${q}%`)
        .order("name")
        .limit(30)
    : { data: [] }

  return <BuscarResults query={q || ""} results={results || []} />
}