-- Gastronomía · GRUPO B (correr DESPUÉS del merge a main) · 4 de 5
-- Reservas: crear_reserva() pasa a ser el único camino para crear reservas,
-- se limpian las políticas duplicadas y el dueño solo puede cambiar el estado.
--
-- REQUISITOS
--   · gastronomia_A5_reservas_crear_reserva.sql aplicado.
--   · El código de feat/gastronomia ya en producción.
--
-- RESULTADO
--   · INSERT: ninguno directo (solo crear_reserva, que es SECURITY DEFINER)
--   · SELECT: dueño del negocio y admin. El cliente ya no lee reservas (nombre y teléfono
--     solo los ven dueño y admin; la app no tiene pantalla de "mis reservas")
--   · UPDATE: dueño y admin, y solo la columna status (no fecha, hora, personas ni datos)
--   · DELETE: admin
-- Usa public.is_admin() (ya existe, ver fix_novedades_admin_policy.sql).

BEGIN;

-- ── Borrar todas las políticas actuales (9, varias duplicadas) ────────────────
DROP POLICY IF EXISTS "Cliente crea reserva"                ON public.reservations;
DROP POLICY IF EXISTS "customers_create_reservations"       ON public.reservations;
DROP POLICY IF EXISTS "Cliente ve sus reservas"             ON public.reservations;
DROP POLICY IF EXISTS "customers_see_own_reservations"      ON public.reservations;
DROP POLICY IF EXISTS "Dueño ve reservas de su negocio"     ON public.reservations;
DROP POLICY IF EXISTS "business_sees_own_reservations"      ON public.reservations;
DROP POLICY IF EXISTS "Dueño actualiza estado de reserva"   ON public.reservations;
DROP POLICY IF EXISTS "business_update_reservation_status"  ON public.reservations;
DROP POLICY IF EXISTS "admin_all_reservations"              ON public.reservations;

-- ── Políticas nuevas ──────────────────────────────────────────────────────────
CREATE POLICY "Reservas: dueño y admin leen"
ON public.reservations FOR SELECT TO authenticated
USING (
  (SELECT public.is_admin())
  OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = reservations.business_id AND b.owner_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Reservas: dueño y admin cambian el estado"
ON public.reservations FOR UPDATE TO authenticated
USING (
  (SELECT public.is_admin())
  OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = reservations.business_id AND b.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  (SELECT public.is_admin())
  OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = reservations.business_id AND b.owner_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Reservas: admin borra"
ON public.reservations FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));

-- Solo la columna status se puede actualizar desde la API (RLS decide qué filas)
REVOKE INSERT, UPDATE, DELETE ON public.reservations FROM anon;
REVOKE INSERT, UPDATE ON public.reservations FROM authenticated;
GRANT UPDATE (status) ON public.reservations TO authenticated;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura)
-- ─────────────────────────────────────────────────────────────────────────────
-- A) Esperado: 3 políticas, todas TO {authenticated}
-- SELECT policyname, cmd, roles FROM pg_policies
--  WHERE schemaname='public' AND tablename='reservations' ORDER BY policyname;
--
-- B) Como público sin login no se ve ninguna reserva. Esperado: 0
-- BEGIN; SET LOCAL ROLE anon; SELECT count(*) FROM public.reservations; ROLLBACK;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (vuelve a las políticas del cliente; no recrea los duplicados)
-- ─────────────────────────────────────────────────────────────────────────────
-- BEGIN;
-- DROP POLICY IF EXISTS "Reservas: dueño y admin leen"             ON public.reservations;
-- DROP POLICY IF EXISTS "Reservas: dueño y admin cambian el estado" ON public.reservations;
-- DROP POLICY IF EXISTS "Reservas: admin borra"                    ON public.reservations;
-- GRANT INSERT, UPDATE ON public.reservations TO authenticated;
-- CREATE POLICY "Cliente crea reserva" ON public.reservations FOR INSERT TO public WITH CHECK (auth.uid() = customer_id);
-- CREATE POLICY "Cliente ve sus reservas" ON public.reservations FOR SELECT TO public USING (auth.uid() = customer_id);
-- CREATE POLICY "Dueño ve reservas de su negocio" ON public.reservations FOR SELECT TO public
--   USING (auth.uid() = (SELECT owner_id FROM public.businesses WHERE id = reservations.business_id));
-- CREATE POLICY "Dueño actualiza estado de reserva" ON public.reservations FOR UPDATE TO public
--   USING (auth.uid() = (SELECT owner_id FROM public.businesses WHERE id = reservations.business_id));
-- CREATE POLICY "admin_all_reservations" ON public.reservations FOR ALL TO public
--   USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
-- COMMIT;
