-- Gastronomía · GRUPO A (correr ANTES del merge) · 1 de 5
-- Tope de 8 fotos por negocio en business_photos.
--
-- Solo agrega un trigger: no cambia políticas ni datos. La versión actual del panel
-- ya limita a 8 en pantalla, así que no se rompe nada.
-- Las filas que ya existan por encima de 8 no se tocan (el trigger mira solo los INSERT).

BEGIN;

CREATE OR REPLACE FUNCTION public.business_photos_tope()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Serializa los INSERT del mismo negocio para que dos subidas simultáneas no pasen el tope
  PERFORM pg_advisory_xact_lock(hashtext('business_photos:' || NEW.business_id::text));

  IF (SELECT count(*) FROM public.business_photos WHERE business_id = NEW.business_id) >= 8 THEN
    RAISE EXCEPTION 'Máximo 8 fotos por negocio'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS business_photos_tope ON public.business_photos;

CREATE TRIGGER business_photos_tope
BEFORE INSERT ON public.business_photos
FOR EACH ROW EXECUTE FUNCTION public.business_photos_tope();

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura): negocios que hoy ya tienen más de 8 fotos.
-- Esperado: ninguna fila (o pocas, cargadas por el admin antes del tope).
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT b.name, count(*) AS fotos
-- FROM public.business_photos p JOIN public.businesses b ON b.id = p.business_id
-- GROUP BY b.name HAVING count(*) > 8 ORDER BY fotos DESC;

-- ROLLBACK
-- DROP TRIGGER IF EXISTS business_photos_tope ON public.business_photos;
-- DROP FUNCTION IF EXISTS public.business_photos_tope();
