-- Gastronomía · GRUPO A (correr ANTES del merge) · 4 de 4
-- Pedidos sin cuenta: customer_id opcional + función crear_pedido().
--
-- No rompe la versión actual: el carrito de producción sigue insertando directo en
-- orders/order_items con un usuario logueado (esas políticas se quitan recién en el grupo B).
--
-- Qué hace crear_pedido (SECURITY DEFINER, search_path vacío, todo calificado con public.):
--   · valida que el negocio sea gastronómico, esté activo y visible (business_is_public)
--   · delivery solo si el local ofrece delivery; take away siempre
--   · nombre, teléfono (6 a 20 dígitos), dirección (obligatoria en delivery), nota: largos acotados
--   · productos: 1 a 50 distintos, cantidad 1 a 20; tienen que ser del negocio, estar disponibles
--     y en una categoría visible. Nombre y PRECIO salen de menu_items (no del navegador)
--   · tope anti pedidos falsos: 3 pedidos por teléfono y negocio en la última hora
--     (ignora los cancelados, para que un pedido cancelado no bloquee al vecino)
--   · si el usuario está logueado y tiene perfil, guarda su customer_id; si no, queda null
--   · inserta pedido + productos en la misma transacción y devuelve { id, total }
-- EXECUTE solo para anon y authenticated.

BEGIN;

-- 1. customer_id opcional (la FK a profiles se mantiene)
ALTER TABLE public.orders ALTER COLUMN customer_id DROP NOT NULL;

-- 2. Índice para el tope por hora y para el panel de pedidos
CREATE INDEX IF NOT EXISTS orders_business_created_idx
  ON public.orders (business_id, created_at DESC);

-- 3. Función
CREATE OR REPLACE FUNCTION public.crear_pedido(
  p_business_id      uuid,
  p_type             text,
  p_items            jsonb,
  p_customer_name    text,
  p_customer_phone   text,
  p_delivery_address text DEFAULT NULL,
  p_notes            text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  c_max_por_hora  constant int := 3;
  v_business      record;
  v_type          public.order_type;
  v_name          text := btrim(coalesce(p_customer_name, ''));
  v_phone         text := btrim(coalesce(p_customer_phone, ''));
  v_phone_digits  text := regexp_replace(coalesce(p_customer_phone, ''), '\D', '', 'g');
  v_address       text := nullif(btrim(coalesce(p_delivery_address, '')), '');
  v_notes         text := nullif(btrim(coalesce(p_notes, '')), '');
  v_customer_id   uuid;
  v_recientes     int;
  v_items_count   int;
  v_validos       int;
  v_total         numeric;
  v_order_id      uuid;
BEGIN
  -- Negocio
  SELECT b.id, b.offers_delivery
    INTO v_business
    FROM public.businesses b
   WHERE b.id = p_business_id
     AND b.status = 'active'
     AND b.section = 'gastronomy'
     AND public.business_is_public(b.id);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Este local no está recibiendo pedidos por la app.';
  END IF;

  -- Tipo de pedido
  IF p_type NOT IN ('takeaway', 'delivery') THEN
    RAISE EXCEPTION 'Tipo de pedido inválido.';
  END IF;
  v_type := p_type::public.order_type;
  IF v_type = 'delivery' AND NOT coalesce(v_business.offers_delivery, false) THEN
    RAISE EXCEPTION 'Este local no hace delivery.';
  END IF;

  -- Datos del cliente
  IF char_length(v_name) < 2 OR char_length(v_name) > 80 THEN
    RAISE EXCEPTION 'Ingresá tu nombre.';
  END IF;
  IF char_length(v_phone_digits) < 6 OR char_length(v_phone_digits) > 20 OR char_length(v_phone) > 30 THEN
    RAISE EXCEPTION 'Ingresá un teléfono válido.';
  END IF;
  IF v_type = 'delivery' AND v_address IS NULL THEN
    RAISE EXCEPTION 'Ingresá la dirección de entrega.';
  END IF;
  IF char_length(coalesce(v_address, '')) > 200 THEN
    RAISE EXCEPTION 'La dirección es demasiado larga.';
  END IF;
  IF char_length(coalesce(v_notes, '')) > 500 THEN
    RAISE EXCEPTION 'La nota es demasiado larga (máximo 500 caracteres).';
  END IF;
  IF v_type <> 'delivery' THEN
    v_address := NULL;
  END IF;

  -- Productos: [{ "id": uuid, "qty": int }, ...]
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' THEN
    RAISE EXCEPTION 'El pedido está vacío.';
  END IF;
  v_items_count := jsonb_array_length(p_items);
  IF v_items_count < 1 OR v_items_count > 50 THEN
    RAISE EXCEPTION 'El pedido tiene que tener entre 1 y 50 productos.';
  END IF;
  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(p_items) e
     WHERE coalesce(jsonb_typeof(e->'id'), '') <> 'string'
        OR coalesce(jsonb_typeof(e->'qty'), '') <> 'number'
        OR (e->>'id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        -- CASE: el cast a int solo se evalúa si el texto es un entero corto
        OR CASE WHEN (e->>'qty') ~ '^\d{1,3}$' THEN (e->>'qty')::int NOT BETWEEN 1 AND 20 ELSE true END
  ) THEN
    RAISE EXCEPTION 'Hay productos con cantidades inválidas (máximo 20 de cada uno).';
  END IF;
  IF (SELECT count(DISTINCT e->>'id') FROM jsonb_array_elements(p_items) e) <> v_items_count THEN
    RAISE EXCEPTION 'Hay productos repetidos en el pedido.';
  END IF;

  SELECT count(*), sum(mi.price * (e->>'qty')::int)
    INTO v_validos, v_total
    FROM jsonb_array_elements(p_items) e
    JOIN public.menu_items mi ON mi.id = (e->>'id')::uuid
    LEFT JOIN public.menu_categories mc ON mc.id = mi.category_id
   WHERE mi.business_id = p_business_id
     AND coalesce(mi.is_available, false)
     AND (mi.category_id IS NULL OR coalesce(mc.is_active, false));
  IF v_validos <> v_items_count THEN
    RAISE EXCEPTION 'Algún producto ya no está disponible. Actualizá la página y armá el pedido de nuevo.';
  END IF;

  -- Tope anti pedidos falsos (serializado por negocio + teléfono)
  PERFORM pg_advisory_xact_lock(hashtext('crear_pedido:' || p_business_id::text || ':' || v_phone_digits));
  SELECT count(*) INTO v_recientes
    FROM public.orders o
   WHERE o.business_id = p_business_id
     AND o.created_at > now() - interval '1 hour'
     AND o.status <> 'cancelled'
     AND regexp_replace(coalesce(o.customer_phone, ''), '\D', '', 'g') = v_phone_digits;
  IF v_recientes >= c_max_por_hora THEN
    RAISE EXCEPTION 'Ya hiciste varios pedidos a este local en la última hora. Si necesitás cambiar algo, escribiles por WhatsApp.';
  END IF;

  -- Cliente logueado (solo si tiene perfil, por la FK a profiles)
  SELECT p.id INTO v_customer_id FROM public.profiles p WHERE p.id = auth.uid();

  INSERT INTO public.orders
    (business_id, customer_id, type, status, total, notes, customer_name, customer_phone, delivery_address)
  VALUES
    (p_business_id, v_customer_id, v_type, 'pending', v_total, v_notes, v_name, v_phone, v_address)
  RETURNING id INTO v_order_id;

  INSERT INTO public.order_items (order_id, item_name, item_price, quantity)
  SELECT v_order_id, mi.name, mi.price, (e->>'qty')::int
    FROM jsonb_array_elements(p_items) WITH ORDINALITY AS e(value, ord)
    JOIN public.menu_items mi ON mi.id = (e.value->>'id')::uuid
   ORDER BY e.ord;

  RETURN jsonb_build_object('id', v_order_id, 'total', v_total);
END;
$$;

REVOKE ALL ON FUNCTION public.crear_pedido(uuid, text, jsonb, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.crear_pedido(uuid, text, jsonb, text, text, text, text) TO anon, authenticated;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura)
-- ─────────────────────────────────────────────────────────────────────────────
-- A) customer_id ya acepta null. Esperado: YES
-- SELECT is_nullable FROM information_schema.columns
--  WHERE table_schema='public' AND table_name='orders' AND column_name='customer_id';
--
-- B) Permisos de la función. Esperado: anon y authenticated (más el dueño, postgres)
-- SELECT grantee, privilege_type FROM information_schema.routine_privileges
--  WHERE routine_schema='public' AND routine_name='crear_pedido';
--
-- C) search_path fijo y SECURITY DEFINER. Esperado: prosecdef = true, proconfig = {search_path=""}
-- SELECT prosecdef, proconfig FROM pg_proc WHERE proname = 'crear_pedido';

-- ROLLBACK (solo si todavía no entró ningún pedido sin cuenta; si no, el SET NOT NULL falla)
-- DROP FUNCTION IF EXISTS public.crear_pedido(uuid, text, jsonb, text, text, text, text);
-- ALTER TABLE public.orders ALTER COLUMN customer_id SET NOT NULL;
