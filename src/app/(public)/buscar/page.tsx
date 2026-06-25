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

// Sinónimos que apuntan a subcategorías ESPECÍFICAS (no categorías catch-all)
const SYNONYMS: Record<string, string[]> = {
  electricista: ["Electricidad"],
  plomero:      ["Plomería"],
  plomeria:     ["Plomería"],
  gasista:      ["Gasista"],
  pintor:       ["Pintor"],
  cerrajero:    ["Cerrajero"],
  herrero:      ["Herrero"],
  mecanico:     ["Mecánica"],
  mecanica:     ["Mecánica"],
  veterinario:  ["Veterinarias"],
  veterinaria:  ["Veterinarias"],
  psicologo:    ["Psicología"],
  psicologa:    ["Psicología"],
  psicologia:   ["Psicología"],
  albanil:      ["Construcción"],
  construccion: ["Construcción"],
  jardinero:    ["Paisajismo y Jardines"],
  jardineria:   ["Paisajismo y Jardines"],
  limpieza:     ["Limpieza"],
  piletero:     ["Piletero"],
  pintura:      ["Pintor"],
  zinguero:     ["Zinguero"],
  fletes:       ["Fletes"],
  flete:        ["Fletes"],
  carpintero:   ["Profesionales"],
  contador:     ["Profesionales"],
  abogado:      ["Profesionales"],
  arquitecto:   ["Profesionales"],
  alojamiento:  ["Alojamiento"],
  excursion:    ["Excursiones"],
  excursiones:  ["Excursiones"],
}

function findMatchingSubcategories(q: string): string[] {
  const nq = normalizeStr(q)

  const fromSynonyms = SYNONYMS[nq] ?? []

  const allSubcats = Object.values(MASTER_CATEGORIES).flatMap(c =>
    c.subcategories.map(s => s.label)
  )
  // Coincidencia normalizada con labels de subcategorías
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

        const orParts: string[] = [
          `name.ilike.%${q}%`,
          `description.ilike.%${q}%`,
          `address.ilike.%${q}%`,
        ]

        // Búsqueda por prefijo (primeros 8 chars) para tolerar acentos en nombres.
        // Ej: "fonoaudiologia" → busca también "%fonoaudi%" que sí matchea "Fonoaudióloga"
        const prefix = q.substring(0, 8)
        if (prefix.length >= 6 && prefix !== q) {
          orParts.push(`name.ilike.%${prefix}%`)
        }

        // Coincidencias exactas por subcategoría
        for (const s of matchingSubcats) {
          orParts.push(`subcategory.eq.${s}`)
        }

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
