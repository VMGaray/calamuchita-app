-- Promos · GRUPO A (correr ANTES del merge) · 1 de 2
-- Valor destacado: porcentaje, precio o texto libre.
--
--   discount_kind        'percentage' → discount_percentage (1 a 100)        ej. "20%"
--                        'price'      → discount_price (> 0)                 ej. "$12.500"
--                        'text'       → discount_label                       ej. "2x1", "Regalo"
--                        null         → promo cargada antes de esta rama: se muestra como siempre
--                                       (porcentaje si hay, si no la etiqueta)
--   discount_label       con 'text' es el valor; con 'percentage' o 'price' es una aclaración
--                        opcional ("en cervezas"), igual que hoy cuando hay porcentaje.
--
-- Solo agrega columnas nullable: la versión actual del sitio las ignora y el admin actual
-- sigue insertando y editando igual (deja discount_kind en null).
-- Las reglas (valor obligatorio, coherencia tipo/valor) y el backfill de las promos viejas
-- van en promos_B1_valor_destacado_reglas.sql, DESPUÉS del merge: si fueran acá, el admin
-- viejo podría dejar una promo con un tipo que ya no coincide con sus valores.
-- RLS: cubiertas por las políticas de promos_00_seguridad.sql.

BEGIN;

ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS discount_kind  text,
  ADD COLUMN IF NOT EXISTS discount_price numeric(12,2);

ALTER TABLE public.promotions DROP CONSTRAINT IF EXISTS promotions_discount_kind_valido;
ALTER TABLE public.promotions
  ADD CONSTRAINT promotions_discount_kind_valido
  CHECK (discount_kind IS NULL OR discount_kind IN ('percentage', 'price', 'text'));

ALTER TABLE public.promotions DROP CONSTRAINT IF EXISTS promotions_discount_price_valido;
ALTER TABLE public.promotions
  ADD CONSTRAINT promotions_discount_price_valido
  CHECK (discount_price IS NULL OR discount_price > 0);

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura). Esperado: 2 filas
-- SELECT column_name, data_type, is_nullable FROM information_schema.columns
--  WHERE table_name = 'promotions' AND column_name IN ('discount_kind', 'discount_price');
--
-- ROLLBACK
-- BEGIN;
-- ALTER TABLE public.promotions DROP CONSTRAINT IF EXISTS promotions_discount_kind_valido;
-- ALTER TABLE public.promotions DROP CONSTRAINT IF EXISTS promotions_discount_price_valido;
-- ALTER TABLE public.promotions DROP COLUMN IF EXISTS discount_kind, DROP COLUMN IF EXISTS discount_price;
-- COMMIT;
