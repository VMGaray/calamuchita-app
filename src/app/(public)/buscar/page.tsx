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

// ── Sinónimos → subcategorías de negocios ──────────────────────────────────
const SYNONYMS: Record<string, string[]> = {
  electricista:   ["Electricidad"],
  plomero:        ["Plomería"],
  plomeria:       ["Plomería"],
  gasista:        ["Gasista"],
  pintor:         ["Pintor"],
  cerrajero:      ["Cerrajero"],
  herrero:        ["Herrero"],
  mecanico:       ["Mecánica"],
  mecanica:       ["Mecánica"],
  veterinario:    ["Veterinarias"],
  veterinaria:    ["Veterinarias"],
  psicologo:      ["Psicología"],
  psicologa:      ["Psicología"],
  psicologia:     ["Psicología"],
  albanil:        ["Construcción"],
  construccion:   ["Construcción"],
  decoracion:     ["Decoración y Terminaciones de Interiores"],
  decorador:      ["Decoración y Terminaciones de Interiores"],
  decoradora:     ["Decoración y Terminaciones de Interiores"],
  terminaciones:  ["Decoración y Terminaciones de Interiores"],
  coach:          ["Coaching"],
  gestoria:       ["Gestoría"],
  gestor:         ["Gestoría"],
  tramites:       ["Gestoría"],
  jardinero:      ["Paisajismo y Jardines"],
  jardineria:     ["Paisajismo y Jardines"],
  limpieza:       ["Limpieza"],
  piletero:       ["Piletero"],
  pintura:        ["Pintor"],
  zinguero:       ["Zinguero"],
  fletes:         ["Fletes"],
  flete:          ["Fletes"],
  carpintero:     ["Profesionales"],
  contador:       ["Profesionales"],
  abogado:        ["Profesionales"],
  arquitecto:     ["Profesionales"],
  alojamiento:    ["Alojamiento"],
  excursion:      ["Excursiones"],
  excursiones:    ["Excursiones"],
  zapatero:       ["Compostura de calzado"],
  zapatera:       ["Compostura de calzado"],
  zapateria:      ["Compostura de calzado"],
  nutricionista:  ["Nutrición"],
  nutricion:      ["Nutrición"],
  kinesiologo:    ["Kinesiología"],
  kinesiologia:   ["Kinesiología"],
  odontologo:     ["Odontología"],
  odontologia:    ["Odontología"],
  dentista:       ["Odontología"],
  pediatra:       ["Pediatría"],
  pediatria:      ["Pediatría"],
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

// ── Sinónimos → specialty_group del JSONB professionals ────────────────────
// Los grupos deben coincidir exactamente con los valores guardados en la DB.
const SPECIALTY_SYNONYMS: Record<string, string[]> = {
  nutricionista:   ["Nutrición"],
  nutricion:       ["Nutrición"],
  psicologo:       ["Psicología"],
  psicologa:       ["Psicología"],
  psicologia:      ["Psicología"],
  kinesiologo:     ["Kinesiología / Fisioterapia"],
  kinesiologia:    ["Kinesiología / Fisioterapia"],
  fisioterapeuta:  ["Kinesiología / Fisioterapia"],
  fisioterapia:    ["Kinesiología / Fisioterapia"],
  fonoaudiologo:   ["Fonoaudiología"],
  fonoaudiologia:  ["Fonoaudiología"],
  cosmiatra:       ["Cosmiatría"],
  cosmetologa:     ["Cosmiatría"],
  odontologo:      ["Odontología"],
  odontologia:     ["Odontología"],
  dentista:        ["Odontología"],
  medico:          ["Medicina"],
  medicina:        ["Medicina"],
  clinico:         ["Medicina"],
  clinica:         ["Medicina"],
  pediatra:        ["Pediatría"],
  pediatria:       ["Pediatría"],
  reflexologo:     ["Reflexología"],
  reflexologia:    ["Reflexología"],
  osteopata:       ["Osteopatía"],
  osteopatia:      ["Osteopatía"],
}

const ALL_SPECIALTY_GROUPS = [
  "Nutrición", "Psicología", "Kinesiología / Fisioterapia", "Fonoaudiología",
  "Cosmiatría", "Odontología", "Medicina", "Pediatría", "Reflexología", "Osteopatía",
  "Laboratorio", "Farmacia", "Otros",
]

function findMatchingSpecialtyGroups(q: string): string[] {
  const nq = normalizeStr(q)
  const fromSynonyms = SPECIALTY_SYNONYMS[nq] ?? []
  const fromGroups = ALL_SPECIALTY_GROUPS.filter(g => {
    const ng = normalizeStr(g)
    return ng.includes(nq) || nq.includes(ng)
  })
  return [...new Set([...fromSynonyms, ...fromGroups])]
}

interface Professional {
  name: string
  specialty_group: string
  specialty: string
  description: string
  schedule: string
  contact: string
  photo_url: string | null
}

export interface SearchResult {
  id: string
  name: string
  slug: string
  section: string
  subcategory: string | null
  address: string | null
  logo_url: string | null
  cover_url: string | null
  description: string | null
  is_open: boolean
  phone: string | null
  whatsapp: string | null
  business_hours: { day_of_week: number; opens_at: string; closes_at: string; is_closed: boolean }[]
  matchedProfessional?: Professional
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams
  const supabase = await createClient()

  if (!q) {
    return <BuscarResults query="" results={[]} />
  }

  const nq = normalizeStr(q)
  const matchingSubcats   = findMatchingSubcategories(q)
  const targetGroups      = findMatchingSpecialtyGroups(q)

  // ── Query principal: negocios por nombre / descripción / subcategoría ──
  const orParts: string[] = [
    `name.ilike.%${q}%`,
    `description.ilike.%${q}%`,
    `address.ilike.%${q}%`,
  ]
  // Búsqueda por prefijo (primeros 8 chars) para tolerar acentos en nombres
  const prefix = q.substring(0, 8)
  if (prefix.length >= 6 && prefix !== q) {
    orParts.push(`name.ilike.%${prefix}%`)
  }
  for (const s of matchingSubcats) {
    orParts.push(`subcategory.eq.${s}`)
  }

  const { data: mainData } = await supabase
    .from("businesses")
    .select("id, name, slug, section, subcategory, address, logo_url, cover_url, description, is_open, phone, whatsapp, business_hours(day_of_week, opens_at, closes_at, is_closed)")
    .eq("status", "active")
    .or(orParts.join(","))
    .order("name")
    .limit(30)

  const mainResults: SearchResult[] = (mainData ?? []) as SearchResult[]
  const mainIds = new Set(mainResults.map(r => r.id))

  // ── Query secundaria: profesionales dentro de centros de salud ─────────
  // Solo se ejecuta cuando el término sugiere una especialidad médica.
  const professionalResults: SearchResult[] = []

  if (targetGroups.length > 0) {
    const { data: healthData } = await supabase
      .from("businesses")
      .select("id, name, slug, section, subcategory, address, logo_url, cover_url, description, is_open, phone, whatsapp, professionals, business_hours(day_of_week, opens_at, closes_at, is_closed)")
      .eq("status", "active")
      .eq("section", "health")

    if (healthData) {
      for (const biz of healthData) {
        const profs = Array.isArray((biz as any).professionals)
          ? (biz as any).professionals as Professional[]
          : []

        for (const prof of profs) {
          const groupNorm = normalizeStr(prof.specialty_group ?? "")
          const nameNorm  = normalizeStr(prof.name ?? "")
          const specNorm  = normalizeStr(prof.specialty ?? "")
          const descNorm  = normalizeStr(prof.description ?? "")

          const groupMatch = targetGroups.some(g => normalizeStr(g) === groupNorm)
          const textMatch  = nameNorm.includes(nq) || specNorm.includes(nq) || descNorm.includes(nq)

          if (groupMatch || textMatch) {
            // Si el negocio ya aparece en la búsqueda principal no lo duplicamos
            if (mainIds.has(biz.id)) continue

            professionalResults.push({
              id: biz.id,
              name: biz.name,
              slug: biz.slug,
              section: biz.section,
              subcategory: biz.subcategory ?? null,
              address: biz.address ?? null,
              logo_url: biz.logo_url ?? null,
              cover_url: biz.cover_url ?? null,
              description: biz.description ?? null,
              is_open: biz.is_open,
              phone: biz.phone ?? null,
              whatsapp: biz.whatsapp ?? null,
              business_hours: (biz as any).business_hours ?? [],
              matchedProfessional: {
                name: prof.name,
                specialty_group: prof.specialty_group,
                specialty: prof.specialty,
                description: prof.description,
                schedule: prof.schedule,
                contact: prof.contact,
                photo_url: prof.photo_url ?? null,
              },
            })
          }
        }
      }
    }
  }

  // Negocios primero, profesionales después; sin duplicados por (id + prof.name)
  const seen = new Set<string>()
  const results = [...mainResults, ...professionalResults].filter(r => {
    const key = r.id + (r.matchedProfessional?.name ?? "")
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return <BuscarResults query={q} results={results} />
}
