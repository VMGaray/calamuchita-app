import NegocioDetalle from "@/components/public/NegocioDetalle"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export default async function NegocioDetallePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: business } = await supabase
    .from("businesses")
    .select(`
      *,
      business_hours (*),
      menu_categories (
        *,
        menu_items (*)
      ),
      daily_menus (
        *,
        daily_menu_items (*)
      )
    `)
    .eq("slug", slug)
    .eq("status", "active")
    .single()

  if (!business) notFound()

  return <NegocioDetalle business={business} />
}