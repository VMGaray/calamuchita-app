-- Gastronomía · GRUPO B (correr DESPUÉS del merge a main) · 2 de 3
-- Lectura pública "heredada": fotos y carta solo se ven si el negocio se ve.
--
-- Hoy business_photos se lee con USING (true), y menu_categories / menu_items solo miran
-- is_active / is_available: se pueden leer fotos y cartas de negocios suspendidos o con
-- la suscripción vencida.
--
-- La condición nueva es EXISTS (SELECT 1 FROM businesses ...). Esa subconsulta respeta la RLS
-- de businesses para quien consulta, así que hereda exactamente la misma visibilidad:
--   · público: negocio activo y business_is_public
--   · dueño: su negocio siempre (por "Business owner gestiona su negocio")
--   · admin: todos
-- No se tocan las políticas de businesses ni las de gestión del dueño/admin.

BEGIN;

-- ── business_photos ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Cualquiera puede ver fotos" ON public.business_photos;

CREATE POLICY "Fotos visibles si el negocio es visible"
ON public.business_photos FOR SELECT TO public
USING (
  EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_photos.business_id)
);

-- ── menu_categories ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Cualquiera puede ver categorías activas" ON public.menu_categories;

CREATE POLICY "Categorías activas de negocios visibles"
ON public.menu_categories FOR SELECT TO public
USING (
  is_active = true
  AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = menu_categories.business_id)
);

-- ── menu_items ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Cualquiera puede ver items disponibles" ON public.menu_items;

CREATE POLICY "Platos disponibles de negocios y categorías visibles"
ON public.menu_items FOR SELECT TO public
USING (
  is_available = true
  AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = menu_items.business_id)
  -- la subconsulta a menu_categories también aplica su RLS (activa + negocio visible)
  AND (
    category_id IS NULL
    OR EXISTS (SELECT 1 FROM public.menu_categories c WHERE c.id = menu_items.category_id)
  )
);

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura, simula al público sin login)
-- Esperado: 0 en las tres columnas (nada de negocios ocultos)
-- ─────────────────────────────────────────────────────────────────────────────
-- BEGIN; SET LOCAL ROLE anon;
-- SELECT
--   (SELECT count(*) FROM public.business_photos p
--     WHERE NOT public.business_is_public(p.business_id)) AS fotos_ocultas,
--   (SELECT count(*) FROM public.menu_categories c
--     WHERE NOT public.business_is_public(c.business_id)) AS categorias_ocultas,
--   (SELECT count(*) FROM public.menu_items i
--     WHERE NOT public.business_is_public(i.business_id)) AS platos_ocultos;
-- ROLLBACK;

-- ROLLBACK
-- BEGIN;
-- DROP POLICY IF EXISTS "Fotos visibles si el negocio es visible" ON public.business_photos;
-- DROP POLICY IF EXISTS "Categorías activas de negocios visibles" ON public.menu_categories;
-- DROP POLICY IF EXISTS "Platos disponibles de negocios y categorías visibles" ON public.menu_items;
-- CREATE POLICY "Cualquiera puede ver fotos" ON public.business_photos FOR SELECT TO public USING (true);
-- CREATE POLICY "Cualquiera puede ver categorías activas" ON public.menu_categories FOR SELECT TO public USING (is_active = true);
-- CREATE POLICY "Cualquiera puede ver items disponibles" ON public.menu_items FOR SELECT TO public USING (is_available = true);
-- COMMIT;
