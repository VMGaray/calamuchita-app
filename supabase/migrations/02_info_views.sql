-- Vistas de Info Útil: cuenta cada vez que alguien abre /info-util o una de sus
-- categorías (farmacias de turno, veterinarias de turno, transporte, etc.).
-- Mismo patrón que increment_view sobre businesses.total_views, pero con una
-- clave por categoría porque Info Útil no son negocios.
-- Correr en Supabase → SQL Editor.

create table if not exists public.info_views (
  key          text primary key,   -- clave de categoría ("todos" = página general)
  total_views  integer not null default 0
);

-- RLS: lectura pública (son contadores agregados, igual que businesses.total_views);
-- nadie escribe directo, solo a través de increment_info_view().
alter table public.info_views enable row level security;

drop policy if exists "Cualquiera puede leer vistas de info util" on public.info_views;
create policy "Cualquiera puede leer vistas de info util"
  on public.info_views for select
  to anon, authenticated
  using (true);

create or replace function public.increment_info_view(p_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo claves cortas en minúscula (las categorías de InfoUtilPage), para que no
  -- se puedan inventar filas arbitrarias.
  if p_key is null or p_key !~ '^[a-z]{1,30}$' then
    return;
  end if;

  insert into public.info_views (key, total_views)
  values (p_key, 1)
  on conflict (key) do update
    set total_views = public.info_views.total_views + 1;
end;
$$;

revoke all on function public.increment_info_view(text) from public;
grant execute on function public.increment_info_view(text) to anon, authenticated;
