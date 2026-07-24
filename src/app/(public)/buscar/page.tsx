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
  "energia renovable": ["Energía Renovable"],
  solar:          ["Energía Renovable"],
  paneles:        ["Energía Renovable"],
  fotovoltaico:   ["Energía Renovable"],
  plomero:        ["Plomería"],
  plomeria:       ["Plomería"],
  gasista:        ["Gasista"],
  pintor:         ["Pintor"],
  cerrajero:      ["Cerrajero"],
  herrero:        ["Herrero"],
  tapicero:       ["Tapicería"],
  tapiceria:      ["Tapicería"],
  mecanico:       ["Mecánica"],
  mecanica:       ["Mecánica"],
  veterinario:    ["Veterinarias"],
  veterinaria:    ["Veterinarias"],
  psicologo:      ["Psicología"],
  psicologa:      ["Psicología"],
  psicologia:     ["Psicología"],
  aberturas:      ["Aberturas de aluminio"],
  aluminio:       ["Aberturas de aluminio"],
  ventanas:       ["Aberturas de aluminio"],
  aberturista:    ["Aberturas de aluminio"],
  albanil:        ["Construcción"],
  construccion:   ["Construcción"],
  decoracion:     ["Decoración y Terminaciones de Interiores"],
  decorador:      ["Decoración y Terminaciones de Interiores"],
  decoradora:     ["Decoración y Terminaciones de Interiores"],
  terminaciones:  ["Decoración y Terminaciones de Interiores"],
  alambrados:     ["Alambrados"],
  alambrado:      ["Alambrados"],
  cerco:          ["Alambrados"],
  tejido:         ["Alambrados"],
  animacion:      ["Animación Cumpleaños", "Ambientación de eventos"],
  cumpleanos:     ["Animación Cumpleaños"],
  cumpleaños:     ["Animación Cumpleaños"],
  animador:       ["Animación Cumpleaños"],
  ambientacion:   ["Ambientación de eventos"],
  eventos:        ["Ambientación de eventos"],
  "ambientacion de eventos": ["Ambientación de eventos"],
  artista:        ["Artista plástica"],
  pintora:        ["Artista plástica"],
  escultor:       ["Artista plástica"],
  escultora:      ["Artista plástica"],
  tatuador:       ["Tatuajes"],
  tatuadora:      ["Tatuajes"],
  tattoo:         ["Tatuajes"],
  piercing:       ["Tatuajes"],
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
  complementarias: ["Terapias complementarias"],
  reiki:          ["Terapias complementarias"],
  reflexologia:   ["Terapias complementarias"],
  odontologo:     ["Odontología"],
  odontologia:    ["Odontología"],
  dentista:       ["Odontología"],
  pediatra:       ["Pediatría"],
  pediatria:      ["Pediatría"],
  estetica:       ["Estética"],
  esteticista:    ["Estética"],
  belleza:        ["Estética"],
  pizza:          ["Pizzería"],
  pizzas:         ["Pizzería"],
  pizzeria:       ["Pizzería"],
  hamburguesa:    ["Hamburguesería"],
  hamburguesas:   ["Hamburguesería"],
  hamburgueseria: ["Hamburguesería"],
  burger:         ["Hamburguesería"],
  "para llevar":  ["Comida para llevar"],
  viandas:        ["Comida para llevar", "Viandas"],
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
}

export default async function BuscarPage({ searchParams }: Props) {
  const { q } = await searchParams
  const supabase = await createClient()

  if (!q) {
    return <BuscarResults query="" results={[]} />
  }

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

  // ── Query secundaria: profesionales de salud por especialidad ──────────
  // Cada profesional es su propia ficha (subcategory/medical_specialties);
  // esta query cubre términos que sugieren una especialidad médica pero no
  // matchean el nombre/subcategoría de la ficha directamente.
  const specialtyResults: SearchResult[] = []

  if (targetGroups.length > 0) {
    const { data: specialtyData } = await supabase
      .from("businesses")
      .select("id, name, slug, section, subcategory, address, logo_url, cover_url, description, is_open, phone, whatsapp, business_hours(day_of_week, opens_at, closes_at, is_closed)")
      .eq("status", "active")
      .eq("section", "health")
      .overlaps("medical_specialties", targetGroups)

    for (const biz of specialtyData ?? []) {
      if (mainIds.has(biz.id)) continue
      specialtyResults.push(biz as SearchResult)
    }
  }

  const results = [...mainResults, ...specialtyResults]

  return <BuscarResults query={q} results={results} />
}
