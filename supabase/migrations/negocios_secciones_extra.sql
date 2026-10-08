-- Negocios en más de una sección (correr ANTES del deploy)
--
--   section         la sección principal: define la URL del perfil, el precio de la
--                   suscripción y las estadísticas del admin (sin cambios).
--   extra_sections  otras secciones donde el negocio TAMBIÉN aparece listado
--                   (p. ej. section = 'services', extra_sections = '{commerce}').
--                   Los rubros de todas las secciones conviven en businesses.categories.
--
-- Solo agrega una columna con default '{}': la versión actual del sitio la ignora.
-- RLS: cubierta por las políticas existentes de businesses.

BEGIN;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS extra_sections text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS businesses_extra_sections_idx
  ON public.businesses USING gin (extra_sections);

COMMIT;

-- ROLLBACK
-- DROP INDEX IF EXISTS public.businesses_extra_sections_idx;
-- ALTER TABLE public.businesses DROP COLUMN IF EXISTS extra_sections;
