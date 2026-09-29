"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { businessRubros, groupSlugsForRubros, OTROS_SERVICIOS_SLUG } from "@/lib/constants/categories"

// Una sola consulta por carga de página, compartida entre todos los componentes
// que muestran los grupos de Servicios (modal de sección, barra sticky).
let cached: Promise<Set<string>> | null = null

function fetchActiveGroupSlugs(): Promise<Set<string>> {
  if (!cached) {
    cached = (async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("businesses")
        .select("categories, subcategory")
        .eq("status", "active")
        .eq("section", "services")
      const slugs = new Set<string>()
      for (const b of data ?? []) {
        const groups = groupSlugsForRubros(businessRubros(b))
        if (groups.length === 0) slugs.add(OTROS_SERVICIOS_SLUG)
        groups.forEach(g => slugs.add(g))
      }
      return slugs
    })().catch(() => {
      cached = null
      return new Set<string>()
    })
  }
  return cached
}

/**
 * Slugs de los grupos de Servicios que tienen al menos un negocio activo
 * (incluye OTROS_SERVICIOS_SLUG si hay negocios sin grupo). null mientras carga.
 */
export function useActiveServiceGroups(enabled = true): Set<string> | null {
  const [slugs, setSlugs] = useState<Set<string> | null>(null)
  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetchActiveGroupSlugs().then(s => { if (alive) setSlugs(s) })
    return () => { alive = false }
  }, [enabled])
  return slugs
}
