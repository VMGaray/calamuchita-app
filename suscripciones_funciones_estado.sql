-- Suscripciones: estados efectivos y visibilidad publica
-- PARTE 1 de 2: funciones + indice. NO cambia lo que ve el publico.
--
-- La regla se activa recien al aplicar suscripciones_politica_visibilidad.sql.
--
-- Orden recomendado:
--   1. Correr este archivo (bloque BEGIN..COMMIT).
--   2. Correr la SIMULACION del final. Esperado hoy: 22 / 22 / 0 / 157.
--   3. Recien despues, suscripciones_politica_visibilidad.sql.
--
-- Estados (enum subscription_status ya cargado, sin ALTER TYPE):
--   visibles al publico: trial, active, discount, complimentary, free
--   ocultos:             expired, suspended
--   legado (no se ofrece en la UI, se mapea): overdue -> expired, cancelled -> suspended
--
-- Vencimiento automatico: se CALCULA al leer (estado efectivo), no se guarda.
-- Aplica solo a active, discount y complimentary con current_period_end no nulo,
-- una vez pasados los dias de gracia. 'trial' NO vence solo (igual que antes).
-- 'free' nunca vence.

BEGIN;

-- 0) current_period_end debe aceptar NULL ('free' no tiene vencimiento).
--    Ya aplicado a mano en produccion; se deja aca para que el archivo sirva de
--    referencia completa si hay que recrear la base. Idempotente: si ya es
--    nullable, no hace nada. No toca datos.
ALTER TABLE public.subscriptions
  ALTER COLUMN current_period_end DROP NOT NULL;

-- 1) Dias de gracia. UNICO lugar donde se cambia el numero.
--    STABLE (no IMMUTABLE) para que Postgres re-planifique si se edita.
CREATE OR REPLACE FUNCTION public.subscription_grace_days()
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT 7
$$;

-- 2) Estado efectivo. Usa la fecha de Argentina (no UTC) para no adelantar
--    el vencimiento entre las 21 y las 24 hs.
--    PostgREST la expone como columna calculada: select=*,effective_status
CREATE OR REPLACE FUNCTION public.effective_status(sub public.subscriptions)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT CASE
    WHEN sub.status::text IN ('active', 'discount', 'complimentary')
     AND sub.current_period_end IS NOT NULL
     AND sub.current_period_end + public.subscription_grace_days()
           < (now() AT TIME ZONE 'America/Argentina/Buenos_Aires')::date
      THEN 'expired'
    WHEN sub.status::text = 'overdue'   THEN 'expired'    -- legado
    WHEN sub.status::text = 'cancelled' THEN 'suspended'  -- legado
    ELSE sub.status::text
  END
$$;

-- 3) Equivalente mensual del precio (anual / 12). Para la tarjeta de ingreso
--    estimado. Columna calculada: select=*,monthly_price
CREATE OR REPLACE FUNCTION public.monthly_price(sub public.subscriptions)
RETURNS numeric
LANGUAGE sql
STABLE
AS $$
  SELECT CASE sub.billing_cycle::text
    WHEN 'yearly' THEN COALESCE(sub.price, 0) / 12
    ELSE COALESCE(sub.price, 0)
  END
$$;

-- 4) UNICA fuente de verdad de visibilidad publica por suscripcion.
--    - Sin suscripcion -> visible (mantiene el comportamiento actual).
--    - Con varias, manda la del periodo mas reciente.
--    - Estado desconocido o NULL -> oculto (falla cerrado).
--    SECURITY DEFINER: el publico (anon) no tiene acceso a subscriptions, y la
--    politica necesita poder consultarla. Devuelve solo un booleano.
--    NO revocar EXECUTE a anon/authenticated: la politica RLS lo necesita.
CREATE OR REPLACE FUNCTION public.business_is_public(biz_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT COALESCE(public.effective_status(s), '')
               IN ('trial', 'active', 'discount', 'complimentary', 'free')
      FROM public.subscriptions s
      WHERE s.business_id = biz_id
      ORDER BY s.current_period_start DESC NULLS LAST, s.id DESC
      LIMIT 1
    ),
    true
  )
$$;

GRANT EXECUTE ON FUNCTION public.business_is_public(uuid) TO anon, authenticated;

-- 5) Indice para la subconsulta de business_is_public (una por fila de businesses).
CREATE INDEX IF NOT EXISTS subscriptions_business_period_idx
  ON public.subscriptions (business_id, current_period_start DESC);

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- SIMULACION (solo lectura). Correr DESPUES del COMMIT y ANTES de la politica.
-- Resultado esperado con los datos de hoy:
--   ocultos_total                   = 22  (20 suspended/suspended + 2 suspended/trial)
--   ocultos_por_status_negocio      = 22  (ya ocultos hoy por businesses.status)
--   ocultos_nuevos_por_suscripcion  = 0   <- el numero clave: la regla no oculta nada nuevo
--   visibles                        = 157 (42 + 16 + 99)
-- Si hubiera negocios 'pending', se suman a ocultos_total y a ocultos_por_status_negocio.
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  count(*) FILTER (WHERE NOT (b.status = 'active' AND public.business_is_public(b.id))) AS ocultos_total,
  count(*) FILTER (WHERE b.status <> 'active')                                          AS ocultos_por_status_negocio,
  count(*) FILTER (WHERE b.status = 'active' AND NOT public.business_is_public(b.id))   AS ocultos_nuevos_por_suscripcion,
  count(*) FILTER (WHERE b.status = 'active' AND public.business_is_public(b.id))       AS visibles
FROM public.businesses b;

-- Chequeos opcionales (correr de a uno):
--
-- a) Negocios con mas de una suscripcion (esperado: 0 filas; si hay, manda la mas reciente):
--    SELECT business_id, count(*) FROM public.subscriptions GROUP BY 1 HAVING count(*) > 1;
--
-- b) Reparto por estado efectivo:
--    SELECT public.effective_status(s) AS estado, count(*) FROM public.subscriptions s GROUP BY 1 ORDER BY 2 DESC;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (descomentar y correr). Si la politica del archivo 2 ya esta aplicada,
-- dropearla PRIMERO (depende de business_is_public).
-- El NOT NULL de current_period_end no se restaura a proposito: fallaria si ya
-- hay filas 'free' con fecha nula.
-- ─────────────────────────────────────────────────────────────────────────────
-- BEGIN;
-- DROP INDEX IF EXISTS public.subscriptions_business_period_idx;
-- DROP FUNCTION IF EXISTS public.business_is_public(uuid);
-- DROP FUNCTION IF EXISTS public.effective_status(public.subscriptions);
-- DROP FUNCTION IF EXISTS public.monthly_price(public.subscriptions);
-- DROP FUNCTION IF EXISTS public.subscription_grace_days();
-- COMMIT;
