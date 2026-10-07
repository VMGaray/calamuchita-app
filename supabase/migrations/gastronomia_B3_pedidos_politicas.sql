-- Gastronomía · GRUPO B (correr DESPUÉS del merge a main) · 3 de 5
-- Pedidos: crear_pedido() pasa a ser el único camino para crear pedidos,
-- se limpian las políticas duplicadas y se suma el admin en order_items.
--
-- REQUISITOS
--   · gastronomia_A4_pedidos_crear_pedido.sql aplicado.
--   · El código de feat/gastronomia ya en producción: el carrito viejo insertaba directo
--     en orders/order_items y deja de funcionar después de esta migración.
--
-- RESULTADO
--   orders
--     · INSERT: ninguno directo (solo crear_pedido, que es SECURITY DEFINER)
--     · SELECT: dueño del negocio y admin. El cliente ya no lee pedidos (nombre, teléfono y
--       dirección solo los ven dueño y admin; la app no tiene pantalla de "mis pedidos")
--     · UPDATE: dueño y admin, y solo la columna status (dueño no puede cambiar total ni datos)
--     · DELETE: admin
--   order_items
--     · INSERT: ninguno directo
--     · SELECT: dueño del negocio del pedido y admin
--     · ALL: admin
-- Usa public.is_admin() (ya existe, ver fix_novedades_admin_policy.sql).

BEGIN;

-- ── orders: borrar todas las políticas actuales (9, varias duplicadas) ─────────
DROP POLICY IF EXISTS "Cliente crea pedido"                 ON public.orders;
DROP POLICY IF EXISTS "customers_create_orders"             ON public.orders;
DROP POLICY IF EXISTS "Cliente ve sus pedidos"              ON public.orders;
DROP POLICY IF EXISTS "customers_see_own_orders"            ON public.orders;
DROP POLICY IF EXISTS "Dueño ve pedidos de su negocio"      ON public.orders;
DROP POLICY IF EXISTS "business_sees_own_orders"            ON public.orders;
DROP POLICY IF EXISTS "Dueño actualiza estado del pedido"   ON public.orders;
DROP POLICY IF EXISTS "business_update_order_status"        ON public.orders;
DROP POLICY IF EXISTS "admin_all_orders"                    ON public.orders;

-- ── orders: políticas nuevas ──────────────────────────────────────────────────
CREATE POLICY "Pedidos: dueño y admin leen"
ON public.orders FOR SELECT TO authenticated
USING (
  (SELECT public.is_admin())
  OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = orders.business_id AND b.owner_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Pedidos: dueño y admin cambian el estado"
ON public.orders FOR UPDATE TO authenticated
USING (
  (SELECT public.is_admin())
  OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = orders.business_id AND b.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  (SELECT public.is_admin())
  OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = orders.business_id AND b.owner_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Pedidos: admin borra"
ON public.orders FOR DELETE TO authenticated
USING ((SELECT public.is_admin()));

-- Solo la columna status se puede actualizar desde la API (RLS decide qué filas)
REVOKE INSERT, UPDATE, DELETE ON public.orders FROM anon;
REVOKE INSERT, UPDATE ON public.orders FROM authenticated;
GRANT UPDATE (status) ON public.orders TO authenticated;

-- ── order_items: borrar todas las políticas actuales ──────────────────────────
DROP POLICY IF EXISTS "Cliente crea items de pedido"            ON public.order_items;
DROP POLICY IF EXISTS "customers_create_order_items"            ON public.order_items;
DROP POLICY IF EXISTS "Cliente ve items de su pedido"           ON public.order_items;
DROP POLICY IF EXISTS "Dueño ve items de pedidos de su negocio" ON public.order_items;
DROP POLICY IF EXISTS "see_order_items"                         ON public.order_items;

-- ── order_items: políticas nuevas ─────────────────────────────────────────────
CREATE POLICY "Items de pedido: dueño lee"
ON public.order_items FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.businesses b ON b.id = o.business_id
    WHERE o.id = order_items.order_id AND b.owner_id = (SELECT auth.uid())
  )
);

CREATE POLICY "Items de pedido: admin gestiona"
ON public.order_items FOR ALL TO authenticated
USING ((SELECT public.is_admin()))
WITH CHECK ((SELECT public.is_admin()));

REVOKE INSERT, UPDATE, DELETE ON public.order_items FROM anon;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura)
-- ─────────────────────────────────────────────────────────────────────────────
-- A) Esperado: 3 políticas en orders y 2 en order_items, todas TO {authenticated}
-- SELECT tablename, policyname, cmd, roles FROM pg_policies
--  WHERE schemaname='public' AND tablename IN ('orders','order_items') ORDER BY 1, 2;
--
-- B) Como público sin login no se ve ningún pedido. Esperado: 0 y 0
-- BEGIN; SET LOCAL ROLE anon;
-- SELECT (SELECT count(*) FROM public.orders) AS pedidos, (SELECT count(*) FROM public.order_items) AS items;
-- ROLLBACK;
--
-- C) Probar desde la app: pedido sin cuenta en "Bodegón del Valle" → aparece en el panel
--    → Confirmar / Entregado / Cancelar funcionan.

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (vuelve a las políticas del cliente; no recrea los duplicados)
-- ─────────────────────────────────────────────────────────────────────────────
-- BEGIN;
-- GRANT INSERT, UPDATE ON public.orders TO authenticated;
-- CREATE POLICY "Cliente crea pedido" ON public.orders FOR INSERT TO public WITH CHECK (auth.uid() = customer_id);
-- CREATE POLICY "Cliente ve sus pedidos" ON public.orders FOR SELECT TO public USING (auth.uid() = customer_id);
-- CREATE POLICY "Cliente crea items de pedido" ON public.order_items FOR INSERT TO public
--   WITH CHECK (auth.uid() = (SELECT customer_id FROM public.orders WHERE id = order_items.order_id));
-- CREATE POLICY "Cliente ve items de su pedido" ON public.order_items FOR SELECT TO public
--   USING (auth.uid() = (SELECT customer_id FROM public.orders WHERE id = order_items.order_id));
-- COMMIT;
