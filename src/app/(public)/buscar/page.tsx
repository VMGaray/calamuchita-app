import BuscarResults from "@/components/public/BuscarResults"
import { createClient } from "@/lib/supabase/server"
import { MASTER_CATEGORIES } from "@/lib/constants/categories"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams
  return {
    title: q ? `"${q}" — Búsqueda` : "Búsqueda",
  }
}

function normalizeStr(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
}

const SYNONYMS: Record<string, string[]> = {
  electricista: ["Electricidad"],
  plomero: ["Plomería"],
  gasista: ["Gasista"],
  pintor: ["Pintor"],
  cerrajero: ["Cerrajero"],
  herrero: ["Herrero"],
  mecanico: ["Mecánica"],
  medico: ["Clínicas y Consultorios", "Especialidades"],
  psicologo: ["Psicología"],
  psicologa: ["Psicología"],
  dentista: ["Clínicas y Consultorios"],
  veterinario: ["Veterinarias"],
  veterinaria: ["Veterinarias"],
  kinesiologo: ["Especialidades"],
  nutricionista: ["Especialidades"],
  fonoaudiologo: ["Especialidades", "Clínicas y Consultorios"],
  fonoaudiologa: ["Especialidades", "Clínicas y Consultorios"],
  fonoaudiologia: ["Especialidades", "Clínicas y Consultorios"],
  farmacia: ["Clínicas y Consultorios"],
  carpintero: ["Profesionales"],
  albañil: ["Construcción"],
  albanil: ["Construcción"],
  contador: ["Profesionales"],
  abogado: ["Profesionales"],
  arquitecto: ["Profesionales"],
}

function findMatchingSubcategories(q: string): string[] {
  const nq = normalizeStr(q)

  const fromSynonyms = SYNONYMS[nq] ?? []

  const allSubcats = Object.values(MASTER_CATEGORIES).flatMap(c =>
    c.subcategories.map(s => s.label)
  )
  const fromLabels = allSubcats.filter(label => {
    const nl = normalizeStr(label)
    return nl.includes(nq) || nq.includes(nl)
  })

  return [...new Set([...fromSynonyms, ...fromLabels])]
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams
  const supabase = await createClient()

  const { data: results } = q
    ? await (async () => {
        const matchingSubcats = findMatchingSubcategories(q)

        const orParts = [
          `name.ilike.%${q}%`,
          `description.ilike.%${q}%`,
          `address.ilike.%${q}%`,
          ...matchingSubcats.map(s => `subcategory.eq.${s}`),
        ]

        return supabase
          .from("businesses")
          .select("id, name, slug, section, subcategory, address, logo_url, cover_url, description, is_open, phone, whatsapp, business_hours(day_of_week, opens_at, closes_at, is_closed)")
          .eq("status", "active")
          .or(orParts.join(","))
          .order("name")
          .limit(30)
      })()
    : { data: [] }

  return <BuscarResults query={q || ""} results={results || []} />
}
