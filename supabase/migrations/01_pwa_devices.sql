-- Contador real de instalaciones: registra dispositivos que ABREN la app instalada
-- (iPhone, Android PWA y app de Play Store). Correr en Supabase → SQL Editor.

create table if not exists public.pwa_devices (
  device_id   uuid primary key,
  platform    text not null check (platform in ('ios', 'android', 'android-app', 'desktop')),
  first_seen  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  sessions    integer not null default 1
);

-- RLS activado y SIN políticas para anon: nadie lee ni escribe la tabla directo.
alter table public.pwa_devices enable row level security;

-- Registro: única puerta de entrada pública, valida y hace upsert.
create or replace function public.track_pwa_device(p_device_id uuid, p_platform text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_platform not in ('ios', 'android', 'android-app', 'desktop') then
    return;
  end if;

  insert into public.pwa_devices (device_id, platform)
  values (p_device_id, p_platform)
  on conflict (device_id) do update
    set last_seen = now(),
        sessions  = public.pwa_devices.sessions + 1,
        platform  = excluded.platform;
end;
$$;

revoke all on function public.track_pwa_device(uuid, text) from public;
grant execute on function public.track_pwa_device(uuid, text) to anon, authenticated;

-- Estadísticas para el panel admin.
create or replace function public.pwa_stats()
returns table (
  total        bigint,
  ios          bigint,
  android      bigint,
  android_app  bigint,
  desktop      bigint,
  active_7d    bigint,
  active_30d   bigint,
  new_7d       bigint
)
language sql
security definer
set search_path = public
as $$
  select
    count(*),
    count(*) filter (where platform = 'ios'),
    count(*) filter (where platform = 'android'),
    count(*) filter (where platform = 'android-app'),
    count(*) filter (where platform = 'desktop'),
    count(*) filter (where last_seen  > now() - interval '7 days'),
    count(*) filter (where last_seen  > now() - interval '30 days'),
    count(*) filter (where first_seen > now() - interval '7 days')
  from public.pwa_devices;
$$;

revoke all on function public.pwa_stats() from public;
grant execute on function public.pwa_stats() to authenticated;
-- ⚠️ Si tu panel valida admins con un rol o tabla propia, sumá ese chequeo
-- dentro de pwa_stats() (ej. un "if not is_admin() then raise exception").
