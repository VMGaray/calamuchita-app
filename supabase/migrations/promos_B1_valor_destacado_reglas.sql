-- Promos · GRUPO B (correr DESPUÉS del merge a main) · 1 de 2
-- Valor destacado: completa el tipo de las promos viejas y hace obligatorios los datos.
--
-- REQUISITOS
--   · promos_A1_valor_destacado.sql aplicado.
--   · El código de la rama ya en producción (el admin nuevo siempre guarda discount_kind).
--
-- QUÉ HACE
--   1. Backfill: promos con discount_kind null
--        · con porcentaje               → 'percentage' (la etiqueta queda como aclaración)
--        · sin porcentaje y con etiqueta → 'text'
--        · sin ninguno de los dos        → quedan en null (se listan en la verificación)
--   2. Coherencia (CHECK, vale para todas las filas): si hay tipo, tiene que estar su valor.
--   3. Título no vacío (CHECK NOT VALID: lo cumplen las nuevas y las que se editen).
--   4. Tipo obligatorio al CREAR (trigger solo en INSERT): una promo vieja sin valor se puede
--      seguir pausando o borrando; al editarla en el admin, el formulario pide el valor.

BEGIN;

-- 1. Backfill
UPDATE public.promotions
   SET discount_kind = CASE
         WHEN discount_percentage IS NOT NULL AND discount_percentage > 0 THEN 'percentage'
         WHEN nullif(btrim(discount_label), '') IS NOT NULL                THEN 'text'
       END
 WHERE discount_kind IS NULL;

-- 2. Coherencia tipo / valor
ALTER TABLE public.promotions DROP CONSTRAINT IF EXISTS promotions_valor_coherente;
ALTER TABLE public.promotions
  ADD CONSTRAINT promotions_valor_coherente
  CHECK (
    discount_kind IS NULL
    OR (discount_kind = 'percentage' AND discount_percentage BETWEEN 1 AND 100)
    OR (discount_kind = 'price'      AND discount_price > 0)
    OR (discount_kind = 'text'       AND nullif(btrim(discount_label), '') IS NOT NULL)
  );

-- 3. Título no vacío
ALTER TABLE public.promotions DROP CONSTRAINT IF EXISTS promotions_titulo_no_vacio;
ALTER TABLE public.promotions
  ADD CONSTRAINT promotions_titulo_no_vacio
  CHECK (btrim(title) <> '') NOT VALID;

-- 4. Tipo obligatorio en promos nuevas
CREATE OR REPLACE FUNCTION public.promotions_valor_obligatorio()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.discount_kind IS NULL THEN
    RAISE EXCEPTION 'La promo necesita un valor destacado (porcentaje, precio o texto)'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS promotions_valor_obligatorio ON public.promotions;
CREATE TRIGGER promotions_valor_obligatorio
  BEFORE INSERT ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.promotions_valor_obligatorio();

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura)
-- A) Promos que quedaron sin tipo (sin porcentaje ni etiqueta). Esperado: ninguna;
--    si aparece alguna, editarla en el admin y elegirle un valor.
-- SELECT id, title, discount_percentage, discount_label FROM public.promotions
--  WHERE discount_kind IS NULL;
--
-- B) Reparto por tipo
-- SELECT discount_kind, count(*) FROM public.promotions GROUP BY 1;
--
-- ROLLBACK (no deshace el backfill: discount_kind en las viejas no molesta)
-- BEGIN;
-- DROP TRIGGER IF EXISTS promotions_valor_obligatorio ON public.promotions;
-- DROP FUNCTION IF EXISTS public.promotions_valor_obligatorio();
-- ALTER TABLE public.promotions DROP CONSTRAINT IF EXISTS promotions_valor_coherente;
-- ALTER TABLE public.promotions DROP CONSTRAINT IF EXISTS promotions_titulo_no_vacio;
-- COMMIT;
