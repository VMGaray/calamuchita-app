-- Suscripciones: politica de visibilidad publica
-- PARTE 2 de 2: politica RLS RESTRICTIVA sobre businesses.
--
-- REQUISITOS antes de correr:
--   1. Aplicado suscripciones_funciones_estado.sql y la simulacion dio 22 / 22 / 0 / 157.
--   2. Existe public.is_admin() (se crea en fix_novedades_admin_policy.sql). Verificar:
--        SELECT proname FROM pg_proc WHERE proname = 'is_admin';   -- debe devolver 1 fila
--      Si no existe, el CREATE POLICY falla y el BEGIN..COMMIT no aplica nada.
--
-- COMO FUNCIONA
--   La politica existente "Publico ve negocios activos" es PERMISIVA. Postgres arma:
--     visible = (alguna permisiva pasa) AND (todas las restrictivas pasan)
--   Esta politica se SUMA a las tres actuales, no las reemplaza:
--     - la fila debe tener status = 'active'  (politica permisiva actual)
--     - Y debe pasar esta condicion:  admin  OR  dueno  OR  business_is_public(id)
--   Admin y dueno ven siempre su negocio (panel y dashboard siguen funcionando).
--
--   RLS se aplica en TODA consulta de PostgREST, incluidos los embeds:
--     - embed a-uno (promotions -> businesses(...)): devuelve businesses = null
--     - businesses!inner (carrusel de menus del dia): descarta la fila padre
--   No se tocan politicas de subscriptions ni de otras tablas.

BEGIN;

DROP POLICY IF EXISTS "Oculta negocios por suscripcion" ON public.businesses;

CREATE POLICY "Oculta negocios por suscripcion"
ON public.businesses
AS RESTRICTIVE
FOR SELECT
TO public
USING (
  (SELECT public.is_admin())
  OR owner_id = (SELECT auth.uid())
  OR public.business_is_public(id)
);

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACION POSTERIOR (solo lectura)
-- ─────────────────────────────────────────────────────────────────────────────

-- A) Desde el SQL editor, simulando al publico sin login (no persiste nada).
--    Esperado hoy: visibles_para_anon = 157, no_activos = 0.
--
-- BEGIN;
-- SET LOCAL ROLE anon;
-- SELECT count(*) AS visibles_para_anon,
--        count(*) FILTER (WHERE status <> 'active') AS no_activos
-- FROM public.businesses;
-- ROLLBACK;

-- B) Con la clave anon por la API REST (sin sesion). Reemplazar URL y clave.
--    Esperado: [] en el primero. En el segundo, ninguna promo trae un negocio oculto
--    con datos (aparece "businesses": null).
--
--   curl "$SUPABASE_URL/rest/v1/businesses?select=id,name&status=eq.suspended" \
--     -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
--
--   curl "$SUPABASE_URL/rest/v1/promotions?select=id,businesses(id,name)" \
--     -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"

-- C) Con sesion de admin: el panel debe seguir listando los 179 negocios
--    (Admin > Negocios) y todas las suscripciones.

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (descomentar y correr). Vuelve al comportamiento anterior al instante.
-- ─────────────────────────────────────────────────────────────────────────────
-- DROP POLICY IF EXISTS "Oculta negocios por suscripcion" ON public.businesses;
