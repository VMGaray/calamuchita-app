// Subida y borrado de flyers de promos (tabla promotion_flyers + bucket businesses).
// Lo usa el formulario de promos del admin; sirve igual para el panel del comercio.

import type { SupabaseClient } from "@supabase/supabase-js"
import type { PromotionFlyer } from "@/types/database"
import { MAX_INPUT_BYTES, MAX_UPLOAD_BYTES, resizeImage, storagePath, storagePathFromPublicUrl } from "@/lib/images"

/** Espejo del tope de promos_A2_flyers.sql (trigger promotion_flyers_antes_de_guardar). */
export const MAX_FLYERS_PER_BUSINESS = 10

export const FLYERS_BUCKET = "businesses"

export const FLYER_COLUMNS = "id, promotion_id, business_id, url, sort_order, created_at"

/** Comprime, sube a <business_id>/promos/ y crea la fila. Si la base la rechaza, borra el archivo. */
export async function uploadPromoFlyer(
  supabase: SupabaseClient,
  { promotionId, businessId, file, sortOrder }: { promotionId: string; businessId: string; file: File; sortOrder: number }
): Promise<PromotionFlyer> {
  if (file.size > MAX_INPUT_BYTES) throw new Error(`"${file.name}" es demasiado pesada (máx. 25 MB)`)
  const { blob, ext } = await resizeImage(file, 1600, 0.85)
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error(`"${file.name}" sigue muy pesada después de comprimirla`)

  const path = storagePath("promos", ext, businessId)
  const { data: up, error: upErr } = await supabase.storage
    .from(FLYERS_BUCKET)
    .upload(path, blob, { cacheControl: "31536000", contentType: blob.type })
  if (upErr || !up) throw new Error(upErr?.message ?? `No se pudo subir "${file.name}"`)

  const url = supabase.storage.from(FLYERS_BUCKET).getPublicUrl(up.path).data.publicUrl
  const { data: row, error: insErr } = await supabase
    .from("promotion_flyers")
    .insert({ promotion_id: promotionId, business_id: businessId, url, sort_order: sortOrder })
    .select(FLYER_COLUMNS)
    .single()
  if (insErr || !row) {
    await supabase.storage.from(FLYERS_BUCKET).remove([up.path])
    throw new Error(insErr?.message.includes("10 flyers")
      ? `El negocio ya tiene ${MAX_FLYERS_PER_BUSINESS} flyers`
      : `No se pudo guardar "${file.name}"`)
  }
  return row as PromotionFlyer
}

/** Borra los archivos de Storage de estas URLs (los que no son del bucket se ignoran). */
export async function removeFlyerFiles(supabase: SupabaseClient, urls: string[]) {
  const paths = urls
    .map(u => storagePathFromPublicUrl(u, FLYERS_BUCKET))
    .filter((p): p is string => !!p)
  if (paths.length) await supabase.storage.from(FLYERS_BUCKET).remove(paths)
}

/** Borra la fila y después el archivo (si falla la fila, el archivo queda intacto). */
export async function deletePromoFlyer(supabase: SupabaseClient, flyer: Pick<PromotionFlyer, "id" | "url">) {
  const { error } = await supabase.from("promotion_flyers").delete().eq("id", flyer.id)
  if (error) throw new Error("No se pudo borrar el flyer")
  await removeFlyerFiles(supabase, [flyer.url])
}
