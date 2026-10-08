-- Gastronomía · GRUPO A (correr ANTES del merge) · 3 de 5
-- Servicio de mesa en la carta.
--
--   charges_table_service  null  = el local no lo informó (en la carta no se muestra nada)
--                          false = "Sin cargo de servicio de mesa"
--                          true  = "Servicio de mesa: $X por persona" (table_service_fee obligatorio)
--
-- Solo agrega columnas: la versión actual del sitio las ignora.
-- RLS: cubiertas por "Business owner gestiona su negocio" (owner_id = auth.uid()).
-- Nota: no confundir con has_table_service, que el perfil público consulta pero no existe
-- en la tabla (ver resumen de la rama).

BEGIN;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS charges_table_service boolean,
  ADD COLUMN IF NOT EXISTS table_service_fee numeric(12,2);

ALTER TABLE public.businesses
  DROP CONSTRAINT IF EXISTS businesses_table_service_fee_valido;
ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_table_service_fee_valido
  CHECK (
    (charges_table_service IS DISTINCT FROM true OR table_service_fee > 0)
    AND (table_service_fee IS NULL OR table_service_fee >= 0)
  );

COMMIT;

-- ROLLBACK
-- ALTER TABLE public.businesses
--   DROP COLUMN IF EXISTS charges_table_service,
--   DROP COLUMN IF EXISTS table_service_fee;
