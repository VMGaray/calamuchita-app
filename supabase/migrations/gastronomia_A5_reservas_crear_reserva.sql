-- Gastronomía · GRUPO A (correr ANTES del merge) · 5 de 5
-- Reservas sin cuenta: customer_id opcional, datos del cliente y función crear_reserva().
--
-- Se puede volver a correr entera sin problema (todo es idempotente / CREATE OR REPLACE).
-- No rompe la versión actual: hoy el sitio no guarda reservas (solo abre WhatsApp) y la tabla
-- está vacía. Las políticas viejas se quitan recién en el grupo B (B4).
--
-- Qué hace crear_reserva (SECURITY DEFINER, search_path vacío, todo calificado con public.):
--   · el local tiene que ser gastronómico, activo, visible (business_is_public) y aceptar
--     reservas (accepts_reservations)
--   · fecha desde hoy hasta 90 días, en hora de Argentina; si es hoy, la hora no puede haber pasado
--   · de 1 a 30 personas
--   · nombre, teléfono (6 a 20 dígitos) y aclaraciones con largos acotados
--   · tope anti reservas falsas: 3 por teléfono y local en la última hora (sin contar rechazadas)
--   · si el usuario está logueado y tiene perfil, guarda su customer_id; si no, queda null
--   · devuelve { id }
-- EXECUTE solo para anon y authenticated.

BEGIN;

-- 1. Cliente sin cuenta
ALTER TABLE public.reservations ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS customer_name  text,
  ADD COLUMN IF NOT EXISTS customer_phone text;

-- 2. Índice para el tope por hora y para el panel
CREATE INDEX IF NOT EXISTS reservations_business_created_idx
  ON public.reservations (business_id, created_at DESC);

-- 3. Función
CREATE OR REPLACE FUNCTION public.crear_reserva(
  p_business_id    uuid,
  p_date           date,
  p_time           time,
  p_party_size     int,
  p_customer_name  text,
  p_customer_phone text,
  p_notes          text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  c_max_por_hora  constant int := 3;
  v_ahora_ar      timestamp := now() AT TIME ZONE 'America/Argentina/Cordoba';
  v_hoy_ar        date := (now() AT TIME ZONE 'America/Argentina/Cordoba')::date;
  v_name          text := btrim(coalesce(p_customer_name, ''));
  v_phone         text := btrim(coalesce(p_customer_phone, ''));
  v_phone_digits  text := regexp_replace(coalesce(p_customer_phone, ''), '\D', '', 'g');
  v_notes         text := nullif(btrim(coalesce(p_notes, '')), '');
  v_customer_id   uuid;
  v_recientes     int;
  v_id            uuid;
BEGIN
  -- Negocio
  PERFORM 1
     FROM public.businesses b
    WHERE b.id = p_business_id
      AND b.status = 'active'
      AND b.section = 'gastronomy'
      AND coalesce(b.accepts_reservations, false)
      AND public.business_is_public(b.id);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Este local no está tomando reservas por la app.';
  END IF;

  -- Fecha, hora y personas
  IF p_date IS NULL OR p_time IS NULL THEN
    RAISE EXCEPTION 'Elegí la fecha y la hora.';
  END IF;
  IF p_date < v_hoy_ar OR (p_date + p_time) < v_ahora_ar THEN
    RAISE EXCEPTION 'La fecha y la hora tienen que ser a partir de ahora.';
  END IF;
  IF p_date > v_hoy_ar + 90 THEN
    RAISE EXCEPTION 'Se puede reservar hasta 90 días antes.';
  END IF;
  IF p_party_size IS NULL OR p_party_size NOT BETWEEN 1 AND 30 THEN
    RAISE EXCEPTION 'La reserva tiene que ser de 1 a 30 personas.';
  END IF;

  -- Datos del cliente
  IF char_length(v_name) < 2 OR char_length(v_name) > 80 THEN
    RAISE EXCEPTION 'Ingresá tu nombre.';
  END IF;
  IF char_length(v_phone_digits) < 6 OR char_length(v_phone_digits) > 20 OR char_length(v_phone) > 30 THEN
    RAISE EXCEPTION 'Ingresá un teléfono válido.';
  END IF;
  IF char_length(coalesce(v_notes, '')) > 500 THEN
    RAISE EXCEPTION 'Las aclaraciones son demasiado largas (máximo 500 caracteres).';
  END IF;

  -- Tope anti reservas falsas (serializado por negocio + teléfono)
  PERFORM pg_advisory_xact_lock(hashtext('crear_reserva:' || p_business_id::text || ':' || v_phone_digits));
  SELECT count(*) INTO v_recientes
    FROM public.reservations r
   WHERE r.business_id = p_business_id
     AND r.created_at > now() - interval '1 hour'
     AND r.status <> 'rejected'
     AND regexp_replace(coalesce(r.customer_phone, ''), '\D', '', 'g') = v_phone_digits;
  IF v_recientes >= c_max_por_hora THEN
    RAISE EXCEPTION 'Ya pediste varias reservas a este local en la última hora. Si necesitás cambiar algo, escribiles por WhatsApp.';
  END IF;

  -- Cliente logueado (solo si tiene perfil, por la FK a profiles)
  SELECT p.id INTO v_customer_id FROM public.profiles p WHERE p.id = auth.uid();

  INSERT INTO public.reservations
    (business_id, customer_id, date, time, party_size, status, notes, customer_name, customer_phone)
  VALUES
    (p_business_id, v_customer_id, p_date, p_time, p_party_size, 'pending', v_notes, v_name, v_phone)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('id', v_id);
END;
$$;

REVOKE ALL ON FUNCTION public.crear_reserva(uuid, date, time, int, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.crear_reserva(uuid, date, time, int, text, text, text) TO anon, authenticated;

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura)
-- ─────────────────────────────────────────────────────────────────────────────
-- A) Esperado: customer_id YES; customer_name y customer_phone existen
-- SELECT column_name, is_nullable FROM information_schema.columns
--  WHERE table_schema='public' AND table_name='reservations'
--    AND column_name IN ('customer_id','customer_name','customer_phone');
--
-- B) Permisos y configuración de la función
-- SELECT grantee, privilege_type FROM information_schema.routine_privileges
--  WHERE routine_schema='public' AND routine_name='crear_reserva';
-- SELECT prosecdef, proconfig FROM pg_proc WHERE proname = 'crear_reserva';

-- ROLLBACK (solo si todavía no entró ninguna reserva sin cuenta; si no, el SET NOT NULL falla)
-- DROP FUNCTION IF EXISTS public.crear_reserva(uuid, date, time, int, text, text, text);
-- ALTER TABLE public.reservations DROP COLUMN IF EXISTS customer_name, DROP COLUMN IF EXISTS customer_phone;
-- ALTER TABLE public.reservations ALTER COLUMN customer_id SET NOT NULL;
