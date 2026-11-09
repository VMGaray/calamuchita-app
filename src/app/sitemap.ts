import type { MetadataRoute } from "next"
import { createPublicClient } from "@/lib/supabase/public"
import { businessProfileUrl } from "@/lib/utils/business"
import { SITE_URL } from "@/lib/seo"

// Se regenera cada hora: altas y suspensiones de negocios aparecen sin redeploy.
export const revalidate = 3600

const STATIC_PATHS = [
  "/",
  "/negocios",
  "/destacados",
  "/menu-del-dia",
  "/novedades",
  "/info-util",
  "/eventos",
  "/mapa",
  "/unite",
  "/directorio/services",
  "/directorio/commerce",
  "/directorio/health",
  "/directorio/education",
  "/directorio/tourism",
  "/directorio/sports",
  "/politica-de-privacidad",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient()

  // Solo negocios visibles (status = active); los suspendidos quedan afuera.
  const { data } = await supabase
    .from("businesses")
    .select("slug, section, updated_at")
    .eq("status", "active")
    .not("slug", "is", null)

  const businesses = (data ?? []).map((b: any) => ({
    url: `${SITE_URL}${businessProfileUrl(b.section, b.slug)}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : undefined,
  }))

  return [
    ...STATIC_PATHS.map((path) => ({ url: `${SITE_URL}${path === "/" ? "" : path}` })),
    ...businesses,
  ]
}
