-- Promos · GRUPO A (correr ANTES del merge) · 2 de 2
-- Flyers (imágenes opcionales) de cada promo: tabla promotion_flyers, tope de 10 por negocio.
--
-- Tabla nueva: la versión actual del sitio no la usa, así que no rompe nada. Por eso va
-- completa acá, con sus políticas definitivas.
--
-- ARCHIVOS: bucket businesses, ruta <business_id>/promos/<archivo>. Las reglas de Storage son
-- las de gastronomia_B1 (admin todo; dueño solo dentro de la carpeta de su negocio).
--
-- business_id se copia de la promo con un trigger (no se confía en lo que manda el navegador):
-- sirve para el tope por negocio y para la política del dueño sin otro JOIN.
--
-- RLS
--   · admin (public.is_admin()): todo
--   · dueño: todo sobre los flyers de las promos de su negocio
--   · público: solo flyers de promos que puede ver. El EXISTS sobre promotions respeta la RLS
--     de promotions (activa, vigente en hora de Argentina y de negocio visible: promos_00).
--
-- REQUISITOS: promos_00_seguridad.sql aplicado y public.is_admin() existente.

BEGIN;

CREATE TABLE IF NOT EXISTS public.promotion_flyers (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id  uuid        NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
  business_id   uuid        NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  url           text        NOT NULL,
  sort_order    integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promotion_flyers_promotion_idx ON public.promotion_flyers (promotion_id, sort_order);
CREATE INDEX IF NOT EXISTS promotion_flyers_business_idx  ON public.promotion_flyers (business_id);

-- business_id = el de la promo, y tope de 10 flyers por negocio (sumando todas sus promos)
CREATE OR REPLACE FUNCTION public.promotion_flyers_antes_de_guardar()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_business uuid;
BEGIN
  SELECT p.business_id INTO v_business FROM public.promotions p WHERE p.id = NEW.promotion_id;
  IF v_business IS NULL THEN
    RAISE EXCEPTION 'La promo no existe o no tiene negocio'
      USING ERRCODE = 'foreign_key_violation';
  END IF;
  NEW.business_id := v_business;

  IF TG_OP = 'INSERT' THEN
    -- Serializa las subidas del mismo negocio para que dos simultáneas no pasen el tope
    PERFORM pg_advisory_xact_lock(hashtext('promotion_flyers:' || v_business::text));
    IF (SELECT count(*) FROM public.promotion_flyers f WHERE f.business_id = v_business) >= 10 THEN
      RAISE EXCEPTION 'Máximo 10 flyers por negocio'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS promotion_flyers_antes_de_guardar ON public.promotion_flyers;
CREATE TRIGGER promotion_flyers_antes_de_guardar
  BEFORE INSERT OR UPDATE OF promotion_id, business_id ON public.promotion_flyers
  FOR EACH ROW EXECUTE FUNCTION public.promotion_flyers_antes_de_guardar();

-- Si el admin cambia una promo de negocio, sus flyers lo acompañan
CREATE OR REPLACE FUNCTION public.promotions_mueve_flyers()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.promotion_flyers SET business_id = NEW.business_id WHERE promotion_id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS promotions_mueve_flyers ON public.promotions;
CREATE TRIGGER promotions_mueve_flyers
  AFTER UPDATE OF business_id ON public.promotions
  FOR EACH ROW
  WHEN (OLD.business_id IS DISTINCT FROM NEW.business_id)
  EXECUTE FUNCTION public.promotions_mueve_flyers();

-- RLS
ALTER TABLE public.promotion_flyers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Flyers: admin gestiona todos" ON public.promotion_flyers;
CREATE POLICY "Flyers: admin gestiona todos"
ON public.promotion_flyers FOR ALL TO authenticated
USING      ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Flyers: dueño gestiona los de su negocio" ON public.promotion_flyers;
CREATE POLICY "Flyers: dueño gestiona los de su negocio"
ON public.promotion_flyers FOR ALL TO authenticated
USING (
  business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (SELECT auth.uid()))
)
WITH CHECK (
  business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (SELECT auth.uid()))
);

DROP POLICY IF EXISTS "Flyers: público ve los de promos visibles" ON public.promotion_flyers;
CREATE POLICY "Flyers: público ve los de promos visibles"
ON public.promotion_flyers FOR SELECT TO public
USING (
  EXISTS (SELECT 1 FROM public.promotions p WHERE p.id = promotion_flyers.promotion_id)
);

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura)
-- A) Esperado: 3 políticas
-- SELECT policyname, cmd, roles FROM pg_policies
--  WHERE schemaname = 'public' AND tablename = 'promotion_flyers' ORDER BY policyname;
--
-- B) Como público sin login no se ven flyers de promos vencidas, pausadas o de negocios
--    ocultos. Esperado: 0
-- BEGIN; SET LOCAL ROLE anon;
-- SELECT count(*) FROM public.promotion_flyers f
--   JOIN public.promotions p ON p.id = f.promotion_id
--  WHERE NOT p.is_active
--     OR p.valid_until < (now() AT TIME ZONE 'America/Argentina/Cordoba')::date;
-- ROLLBACK;
--
-- ROLLBACK (borra la tabla y sus filas; los archivos de Storage quedan)
-- BEGIN;
-- DROP TRIGGER IF EXISTS promotions_mueve_flyers ON public.promotions;
-- DROP FUNCTION IF EXISTS public.promotions_mueve_flyers();
-- DROP TABLE IF EXISTS public.promotion_flyers;
-- DROP FUNCTION IF EXISTS public.promotion_flyers_antes_de_guardar();
-- COMMIT;
