-- Navegadores internos de Instagram / Facebook: se registran aparte
-- ('inapp-instagram', 'inapp-facebook') para que no inflen "Android (Play Store)".
-- No cuentan en total / activos / nuevos: son visitas desde redes o anuncios,
-- no personas que usan la app. Correr en Supabase → SQL Editor ANTES del merge.

begin;

-- 1. Check de platform
alter table public.pwa_devices drop constraint if exists pwa_devices_platform_check;
alter table public.pwa_devices
  add constraint pwa_devices_platform_check
  check (platform in ('ios', 'android', 'android-app', 'desktop', 'inapp-instagram', 'inapp-facebook'));

-- 2. Validación del registro
create or replace function public.track_pwa_device(p_device_id uuid, p_platform text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_platform not in ('ios', 'android', 'android-app', 'desktop', 'inapp-instagram', 'inapp-facebook') then
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

-- 3. Estadísticas: cambia el tipo de retorno, hay que borrarla y recrearla
drop function if exists public.pwa_stats();

create function public.pwa_stats()
returns table (
  total            bigint,
  ios              bigint,
  android          bigint,
  android_app      bigint,
  desktop          bigint,
  active_7d        bigint,
  active_30d       bigint,
  new_7d           bigint,
  inapp_instagram  bigint,
  inapp_facebook   bigint,
  inapp_7d         bigint
)
language sql
security definer
set search_path = public
as $$
  select
    count(*)                 filter (where not inapp),
    count(*)                 filter (where platform = 'ios'),
    count(*)                 filter (where platform = 'android'),
    count(*)                 filter (where platform = 'android-app'),
    count(*)                 filter (where platform = 'desktop'),
    count(*)                 filter (where not inapp and last_seen  > now() - interval '7 days'),
    count(*)                 filter (where not inapp and last_seen  > now() - interval '30 days'),
    count(*)                 filter (where not inapp and first_seen > now() - interval '7 days'),
    count(*)                 filter (where platform = 'inapp-instagram'),
    count(*)                 filter (where platform = 'inapp-facebook'),
    count(*)                 filter (where inapp and last_seen > now() - interval '7 days')
  from (
    select *, platform like 'inapp-%' as inapp
    from public.pwa_devices
  ) d;
$$;

revoke all on function public.pwa_stats() from public;
grant execute on function public.pwa_stats() to authenticated;

commit;
