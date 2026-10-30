-- Deportes: "Yoga / Pilates" se separa en "Yoga", "Pilates" y "Pilates Clásico"
-- (migración de datos, idempotente: se puede correr más de una vez)
--
-- Los rubros viven en el código (src/lib/constants/categories.ts): solo se
-- ajustan datos de businesses. Cada negocio pasa a "Pilates", salvo que el
-- nombre diga yoga y no pilates (esos pasan a "Yoga"). "Pilates Clásico" se
-- asigna a mano desde el admin.

BEGIN;

-- ── Vista previa (lo que se va a tocar) ────────────────────────────────────
SELECT id, name, status, subcategory, categories
FROM businesses
WHERE subcategory = 'Yoga / Pilates'
   OR 'Yoga / Pilates' = ANY(coalesce(categories, '{}'));

-- ── Reemplazo del rubro viejo ──────────────────────────────────────────────
WITH destino AS (
  SELECT id,
    CASE WHEN name ILIKE '%yoga%' AND name NOT ILIKE '%pilates%'
      THEN 'Yoga' ELSE 'Pilates' END AS rubro
  FROM businesses
  WHERE subcategory = 'Yoga / Pilates'
     OR 'Yoga / Pilates' = ANY(coalesce(categories, '{}'))
)
UPDATE businesses b
SET categories = array_replace(b.categories, 'Yoga / Pilates', d.rubro),
    subcategory = CASE WHEN b.subcategory = 'Yoga / Pilates' THEN d.rubro ELSE b.subcategory END
FROM destino d
WHERE b.id = d.id;

COMMIT;
