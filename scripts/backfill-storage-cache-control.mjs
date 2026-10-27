/**
 * Las imágenes subidas antes de que los uploads usaran cacheControl quedaron con
 * Cache-Control: max-age=3600 (el default de Supabase). Este script las vuelve a subir
 * (mismo archivo, misma ruta, mismo content-type) con cacheControl de 1 año.
 *
 * Supabase no permite cambiar solo la metadata: hay que re-subir el objeto. Las URLs no cambian.
 *
 * Uso (las keys salen de .env.local):
 *   node --env-file=.env.local scripts/backfill-storage-cache-control.mjs           → solo lista (dry run, alcanza la anon key)
 *   node --env-file=.env.local scripts/backfill-storage-cache-control.mjs --apply   → re-sube (necesita SUPABASE_SERVICE_ROLE_KEY)
 */

import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://mipljgnmpkkfveoaqlyx.supabase.co"
const APPLY = process.argv.includes("--apply")
const KEY = APPLY ? process.env.SUPABASE_SERVICE_ROLE_KEY : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const BUCKETS = ["businesses", "event-images"]
const TARGET = "max-age=31536000"

if (!KEY) {
  console.error(APPLY
    ? "❌ Falta SUPABASE_SERVICE_ROLE_KEY en el entorno (agregala a .env.local, no se commitea)."
    : "❌ Falta NEXT_PUBLIC_SUPABASE_ANON_KEY. Correr con: node --env-file=.env.local scripts/backfill-storage-cache-control.mjs")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const mb = bytes => `${(bytes / 1024 / 1024).toFixed(1)} MB`

/** Lista recursivamente los archivos de un bucket (las carpetas vienen con id null). */
async function listAll(bucket, prefix = "") {
  const files = []
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000, offset })
    if (error) throw error
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name
      if (item.id === null) files.push(...(await listAll(bucket, path)))
      else files.push({
        path,
        cacheControl: item.metadata?.cacheControl,
        mimetype: item.metadata?.mimetype,
        size: item.metadata?.size ?? 0,
      })
    }
    if (data.length < 1000) break
  }
  return files
}

async function main() {
  let pending = 0, pendingBytes = 0, fixed = 0, failed = 0

  for (const bucket of BUCKETS) {
    const files = await listAll(bucket)
    const stale = files.filter(f => !f.cacheControl?.includes(TARGET))
    const staleBytes = stale.reduce((sum, f) => sum + f.size, 0)
    console.log(`\n${bucket}: ${files.length} archivos, ${stale.length} sin caché larga (${mb(staleBytes)})`)
    pending += stale.length
    pendingBytes += staleBytes

    if (!APPLY) {
      stale.slice(0, 10).forEach(f => console.log(`  ${f.path}  (${f.cacheControl ?? "sin cacheControl"})`))
      if (stale.length > 10) console.log(`  … y ${stale.length - 10} más`)
      continue
    }

    for (const f of stale) {
      const { data: blob, error: dlError } = await supabase.storage.from(bucket).download(f.path)
      if (dlError) { failed++; console.error(`  ✗ ${f.path}: ${dlError.message}`); continue }
      const { error: upError } = await supabase.storage.from(bucket).upload(f.path, blob, {
        upsert: true,
        cacheControl: "31536000",
        contentType: f.mimetype ?? blob.type,
      })
      if (upError) { failed++; console.error(`  ✗ ${f.path}: ${upError.message}`); continue }
      fixed++
      console.log(`  ✓ ${f.path}`)
    }
  }

  console.log(APPLY
    ? `\nListo: ${fixed} actualizados, ${failed} con error.`
    : `\nDry run: ${pending} archivos para actualizar (${mb(pendingBytes)}). Correr con --apply para re-subirlos.`)
}

main().catch(err => { console.error(err); process.exit(1) })
