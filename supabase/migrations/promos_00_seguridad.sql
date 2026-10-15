-- Promos · SEGURIDAD (fuera de los grupos A y B: correr YA en producción)
-- Cierra la política "Permitir todo a autenticados", que deja a cualquier usuario logueado
-- crear, editar o borrar promos de cualquier negocio.
--
-- POLÍTICAS EN PRODUCCIÓN ANTES DE CORRER (15/10/2026)
--   "Permitir lectura publica de promos"       SELECT  {public}         USING true
--   "Permitir lectura pública de promociones"  SELECT  {public}         USING true
--   "Permitir todo a autenticados"             ALL     {authenticated}  USING true  WITH CHECK true
--
-- RESULTADO
--   · admin (public.is_admin()): todo, incluidas promos vencidas o pausadas (filtro "Vencidas" del panel)
--   · dueño: todo sobre las promos de SU negocio (no puede pasar una promo a otro negocio)
--   · público: solo promos activas, vigentes en hora de Argentina y de negocios visibles.
--     "Negocio visible" = EXISTS sobre businesses, que respeta la RLS de businesses para quien
--     consulta (status = 'active' + business_is_public), igual que gastronomia_B2.
--   · valid_until pasa a NOT NULL (al 15/10/2026: 0 promos sin fecha, 7 en total).
--
-- Qué cambia en la app: nada visible. El inicio y los perfiles ya filtran is_active y
-- valid_until >= hoyAR(); el inicio ya descartaba las promos con negocio oculto (embed = null).
-- Ahora esas filas directamente no llegan.
--
-- REQUISITO: existe public.is_admin() (fix_novedades_admin_policy.sql). Verificar:
--   SELECT proname FROM pg_proc WHERE proname = 'is_admin';   -- debe devolver 1 fila

BEGIN;

-- 1. Fecha de vencimiento obligatoria
ALTER TABLE public.promotions ALTER COLUMN valid_until SET NOT NULL;

-- 2. Borrar las políticas actuales
DROP POLICY IF EXISTS "Permitir lectura publica de promos"      ON public.promotions;
DROP POLICY IF EXISTS "Permitir lectura pública de promociones" ON public.promotions;
DROP POLICY IF EXISTS "Permitir todo a autenticados"            ON public.promotions;
-- (las del archivo original add_premium_promotions.sql, por si existieran)
DROP POLICY IF EXISTS "promotions_public_read"                  ON public.promotions;
DROP POLICY IF EXISTS "promotions_owner_all"                    ON public.promotions;

-- 3. Admin: todo
CREATE POLICY "Promos: admin gestiona todas"
ON public.promotions FOR ALL TO authenticated
USING      ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

-- 4. Dueño: todo sobre las promos de su negocio
CREATE POLICY "Promos: dueño gestiona las de su negocio"
ON public.promotions FOR ALL TO authenticated
USING (
  business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (SELECT auth.uid()))
)
WITH CHECK (
  business_id IN (SELECT b.id FROM public.businesses b WHERE b.owner_id = (SELECT auth.uid()))
);

-- 5. Público: activas, vigentes (hora de Argentina) y de negocios visibles
CREATE POLICY "Promos: público ve vigentes de negocios visibles"
ON public.promotions FOR SELECT TO public
USING (
  is_active = true
  AND valid_until >= (now() AT TIME ZONE 'America/Argentina/Cordoba')::date
  AND EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = promotions.business_id)
);

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura)
-- ─────────────────────────────────────────────────────────────────────────────
-- A) Esperado: exactamente las 3 políticas nuevas
-- SELECT policyname, cmd, roles FROM pg_policies
--  WHERE schemaname = 'public' AND tablename = 'promotions' ORDER BY policyname;
--
-- B) Como público sin login: solo vigentes de negocios visibles.
--    Esperado: "visibles" = cantidad de promos que hoy muestra el inicio; "fuera_de_regla" = 0
-- BEGIN; SET LOCAL ROLE anon;
-- SELECT count(*) AS visibles,
--        count(*) FILTER (WHERE NOT is_active
--                            OR valid_until < (now() AT TIME ZONE 'America/Argentina/Cordoba')::date
--                            OR NOT public.business_is_public(business_id)) AS fuera_de_regla
--   FROM public.promotions;
-- ROLLBACK;
--
-- C) Desde la app:
--    · Admin → Promociones: se ven las 7 (Todas / Activas / Vencidas), crear, editar,
--      pausar y borrar funcionan
--    · Inicio y perfil de un negocio con promo vigente: la promo se sigue viendo
--
-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (vuelve a las políticas abiertas; solo si algo del admin deja de andar)
-- ─────────────────────────────────────────────────────────────────────────────
-- BEGIN;
-- DROP POLICY IF EXISTS "Promos: admin gestiona todas"                     ON public.promotions;
-- DROP POLICY IF EXISTS "Promos: dueño gestiona las de su negocio"         ON public.promotions;
-- DROP POLICY IF EXISTS "Promos: público ve vigentes de negocios visibles" ON public.promotions;
-- CREATE POLICY "Permitir lectura pública de promociones" ON public.promotions FOR SELECT TO public USING (true);
-- CREATE POLICY "Permitir todo a autenticados" ON public.promotions FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- ALTER TABLE public.promotions ALTER COLUMN valid_until DROP NOT NULL;
-- COMMIT;
