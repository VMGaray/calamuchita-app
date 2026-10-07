-- Gastronomía · GRUPO A (correr ANTES del merge) · 2 de 5
-- Opciones alimentarias del local y de cada plato.
--
-- Solo agrega columnas con default '{}': la versión actual del sitio las ignora.
-- Las claves válidas están en src/lib/constants/dietary.ts (si se agrega una, sumarla acá también).
-- RLS: no hace falta tocar nada. Las columnas nuevas quedan cubiertas por las políticas
-- existentes de businesses ("Business owner gestiona su negocio": owner_id = auth.uid())
-- y de menu_items ("Dueño gestiona items").

BEGIN;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS dietary_options text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS dietary_tags text[] NOT NULL DEFAULT '{}';

ALTER TABLE public.businesses
  DROP CONSTRAINT IF EXISTS businesses_dietary_options_validas;
ALTER TABLE public.businesses
  ADD CONSTRAINT businesses_dietary_options_validas
  CHECK (dietary_options <@ ARRAY['sin_tacc','vegetariano','vegano','sin_lactosa','sin_azucar','menu_infantil']::text[]);

ALTER TABLE public.menu_items
  DROP CONSTRAINT IF EXISTS menu_items_dietary_tags_validas;
ALTER TABLE public.menu_items
  ADD CONSTRAINT menu_items_dietary_tags_validas
  CHECK (dietary_tags <@ ARRAY['sin_tacc','vegetariano','vegano','sin_lactosa','sin_azucar','menu_infantil']::text[]);

COMMIT;

-- VERIFICACIÓN (solo lectura). Esperado: 2 filas, default '{}'::text[]
-- SELECT table_name, column_name, column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND column_name IN ('dietary_options', 'dietary_tags');

-- ROLLBACK
-- ALTER TABLE public.businesses DROP COLUMN IF EXISTS dietary_options;
-- ALTER TABLE public.menu_items DROP COLUMN IF EXISTS dietary_tags;
