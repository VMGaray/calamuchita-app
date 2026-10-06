-- Eventos de actividad con fecha, para medir por período (7 días, 30 días…).
-- Cada vista y cada contacto queda como una fila en view_events, ADEMÁS de los
-- contadores de siempre (businesses.total_views, business_leads, info_views),
-- que no se modifican.
--
-- No hace falta cambiar el código de la app: los eventos se registran con
-- triggers sobre lo que ya escribe la app:
--   · increment_view       → businesses.total_views sube  → evento 'vista' del negocio
--   · increment_info_view  → info_views sube              → evento 'vista' de Info Útil
--   · insert en business_leads                            → evento 'contacto' (canal = whatsapp/phone/reserva)
--
-- Requisitos: correr antes 02_info_views.sql. Debe existir public.is_admin()
-- (se crea en fix_novedades_admin_policy.sql). Verificar:
--   SELECT proname FROM pg_proc WHERE proname = 'is_admin';   -- debe devolver 1 fila
--
-- Correr en Supabase → SQL Editor.

create table if not exists public.view_events (
  id           bigint generated always as identity primary key,
  -- Si se borra un negocio, sus eventos quedan (sin negocio) para no alterar
  -- los totales de períodos pasados.
  business_id  uuid references public.businesses(id) on delete set null,
  info_key     text,
  event_type   text not null check (event_type in ('vista', 'contacto')),
  canal        text,   -- solo contactos: whatsapp / phone / reserva
  created_at   timestamptz not null default now(),
  check (business_id is null or info_key is null)
);

create index if not exists view_events_created_at_idx on public.view_events (created_at);
create index if not exists view_events_business_idx   on public.view_events (business_id, created_at);

-- RLS: nadie inserta directo (solo los triggers de abajo, SECURITY DEFINER);
-- lectura solo admin.
alter table public.view_events enable row level security;

drop policy if exists "view_events_admin_select" on public.view_events;
create policy "view_events_admin_select"
  on public.view_events for select
  to authenticated
  using ((select public.is_admin()));

-- ── Vistas de negocios ──────────────────────────────────────────────────────
create or replace function public.log_business_view_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.view_events (business_id, event_type) values (new.id, 'vista');
  return null;
end;
$$;

drop trigger if exists businesses_view_event on public.businesses;
create trigger businesses_view_event
  after update of total_views on public.businesses
  for each row
  when (new.total_views > old.total_views)
  execute function public.log_business_view_event();

-- ── Vistas de Info Útil ─────────────────────────────────────────────────────
create or replace function public.log_info_view_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.view_events (info_key, event_type) values (new.key, 'vista');
  return null;
end;
$$;

drop trigger if exists info_views_event on public.info_views;
create trigger info_views_event
  after insert or update of total_views on public.info_views
  for each row
  execute function public.log_info_view_event();

-- ── Contactos ───────────────────────────────────────────────────────────────
create or replace function public.log_lead_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.view_events (business_id, event_type, canal, created_at)
  values (new.business_id, 'contacto', new.type, coalesce(new.created_at, now()));
  return null;
end;
$$;

drop trigger if exists business_leads_event on public.business_leads;
create trigger business_leads_event
  after insert on public.business_leads
  for each row
  execute function public.log_lead_event();

revoke all on function public.log_business_view_event() from public, anon, authenticated;
revoke all on function public.log_info_view_event()     from public, anon, authenticated;
revoke all on function public.log_lead_event()          from public, anon, authenticated;

-- ── Histórico de contactos ──────────────────────────────────────────────────
-- business_leads ya guarda la fecha, así que los contactos anteriores se
-- copian con su fecha real. (Las vistas anteriores no tienen fecha: los
-- períodos de vistas empiezan a contar desde hoy.) Solo corre si todavía no
-- hay contactos en view_events, así que es seguro volver a correr el archivo.
insert into public.view_events (business_id, event_type, canal, created_at)
select l.business_id, 'contacto', l.type, coalesce(l.created_at, now())
from public.business_leads l
where not exists (select 1 from public.view_events where event_type = 'contacto');

-- ── Resumen por período para el panel admin ─────────────────────────────────
-- SECURITY INVOKER: corre con los permisos de quien llama, así que la RLS de
-- view_events hace que solo un admin vea datos (cualquier otro recibe vacío).
-- Una fila por negocio / clave de Info Útil; business_id e info_key nulos =
-- eventos de negocios borrados.
create or replace function public.admin_activity(p_since timestamptz)
returns table (
  business_id  uuid,
  info_key     text,
  views        bigint,
  contacts     bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    e.business_id,
    e.info_key,
    count(*) filter (where e.event_type = 'vista'),
    count(*) filter (where e.event_type = 'contacto')
  from public.view_events e
  where e.created_at >= p_since
  group by e.business_id, e.info_key;
$$;

revoke all on function public.admin_activity(timestamptz) from public, anon;
grant execute on function public.admin_activity(timestamptz) to authenticated;

-- ── Pruebas (opcional) ──────────────────────────────────────────────────────
-- A) Contactos copiados del histórico (debe coincidir con business_leads):
--      SELECT count(*) FROM view_events WHERE event_type = 'contacto';
--      SELECT count(*) FROM business_leads;
-- B) Abrir la ficha de un negocio en la app y verificar:
--      
-- C) Como anon no se puede leer ni insertar:
--      SET LOCAL ROLE anon;
--      SELECT count(*) FROM view_events;                                 -- 0
--      INSERT INTO view_events (event_type) VALUES ('vista');            -- error de RLS
