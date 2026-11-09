"use client"

import { useSyncExternalStore } from "react"

/**
 * Origen de navegación hacia un perfil (por ejemplo, "vino desde Destacados"), guardado en
 * sessionStorage en vez de en la URL: así los perfiles no tienen variantes ?from= que Google
 * indexa como duplicadas.
 */
const KEY = "calamuchita:navOrigin"

function slugOf(path: string) {
  return path.split("?")[0].split("#")[0].replace(/\/$/, "").split("/").pop() ?? ""
}

/** Guarda desde dónde se navega hacia `href` (un perfil de negocio). */
export function setNavOrigin(href: string, from: string) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ slug: slugOf(href), from }))
  } catch {}
}

/**
 * Lee el origen guardado para el perfil `slug`. Se compara por slug y no por path completo
 * porque /negocios/<slug> redirige a /directorio/<sección>/<slug> para negocios no gastronómicos.
 * Como respaldo acepta el viejo ?from= de links ya compartidos.
 */
export function useNavOrigin(slug: string, legacyFrom?: string | null): string | null {
  // En el servidor (y en la hidratación) no hay sessionStorage: arranca en null y se lee en el cliente.
  const raw = useSyncExternalStore(noopSubscribe, readRaw, () => null)
  if (legacyFrom) return legacyFrom
  if (!raw) return null
  try {
    const saved = JSON.parse(raw) as { slug?: string; from?: string }
    return saved.slug === slug && saved.from ? saved.from : null
  } catch {
    return null
  }
}

const noopSubscribe = () => () => {}

function readRaw(): string | null {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}
