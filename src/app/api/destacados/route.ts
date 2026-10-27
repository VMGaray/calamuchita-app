import { createPublicClient } from "@/lib/supabase/public"

// Lista completa de destacados para el carrusel de la home, que sortea cuáles mostrar en el navegador.
// Va aparte del HTML para que la home no cargue los ~100 negocios en el render inicial.
// Cacheada como la home (ISR, 2 minutos).
export const revalidate = 120

export async function GET() {
  const { data, error } = await createPublicClient()
    .from("businesses")
    .select("id, name, slug, cover_url, section")
    .eq("status", "active")
    .eq("is_premium", true)

  // Si falla, que tire: con ISR se sigue sirviendo la última respuesta buena en vez de cachear un error
  if (error) throw error
  return Response.json(data ?? [])
}
