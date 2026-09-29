-- Grupos de Servicios — migración de datos (idempotente: se puede correr más de una vez)
--
-- Los grupos y rubros viven en el código (src/lib/constants/categories.ts),
-- así que no se crean tablas ni policies: solo se ajustan datos de businesses.
--
-- 1. Backfill: categories vacío + subcategory con valor → categories = [subcategory]
--    (todas las secciones). El código ya usa subcategory como respaldo, pero así
--    el filtro por rubro y el buscador funcionan igual para todos.
-- 2. "Escuela de Equitación" pasa de Servicios a Deportes (section = 'sports').
--    Solo se mueven negocios cuyo ÚNICO rubro es ese, para no sacar de
--    Servicios a nadie que tenga además otros rubros de Servicios.
--
-- "Licenciado en higiene y seguridad" no tenía negocios asignados: se quitó
-- solo de la lista de rubros en el código, sin migrar datos.

BEGIN;

-- ── Vista previa (lo que se va a tocar) ────────────────────────────────────
SELECT 'backfill categories' AS cambio, id, name, section, subcategory, categories
FROM businesses
WHERE coalesce(cardinality(categories), 0) = 0
  AND nullif(trim(subcategory), '') IS NOT NULL
UNION ALL
SELECT 'equitacion -> sports', id, name, section, subcategory, categories
FROM businesses
WHERE section = 'services'
  AND ('Escuela de Equitación' = ANY(coalesce(categories, '{}')) OR subcategory = 'Escuela de Equitación')
  AND coalesce(categories, '{}') <@ ARRAY['Escuela de Equitación']::text[];

-- ── 1. Backfill de categories desde subcategory ────────────────────────────
UPDATE businesses
SET categories = ARRAY[trim(subcategory)]
WHERE coalesce(cardinality(categories), 0) = 0
  AND nullif(trim(subcategory), '') IS NOT NULL;

-- ── 2. Escuela de Equitación → Deportes ────────────────────────────────────
UPDATE businesses
SET section = 'sports'
WHERE section = 'services'
  AND ('Escuela de Equitación' = ANY(coalesce(categories, '{}')) OR subcategory = 'Escuela de Equitación')
  AND coalesce(categories, '{}') <@ ARRAY['Escuela de Equitación']::text[];

-- ── Verificación ──────────────────────────────────────────────────────────
-- Las tres filas deben dar count = 0:
SELECT 'sin backfill' AS pendiente, count(*) FROM businesses
WHERE coalesce(cardinality(categories), 0) = 0 AND nullif(trim(subcategory), '') IS NOT NULL
UNION ALL
SELECT 'equitacion en services', count(*) FROM businesses
WHERE section = 'services' AND 'Escuela de Equitación' = ANY(coalesce(categories, '{}'))
UNION ALL
SELECT 'licenciado hys', count(*) FROM businesses
WHERE 'Licenciado en higiene y seguridad' = ANY(coalesce(categories, '{}'))
   OR subcategory = 'Licenciado en higiene y seguridad';

COMMIT;
