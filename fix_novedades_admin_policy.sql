-- Fix: la policy "novedades_admin_all" original subconsultaba profiles
-- directamente, y esa subquery queda sujeta a la RLS propia de profiles
-- (aunque sea solo "ver tu propia fila"), asi que en algunos contextos
-- devuelve vacio y el check de admin falla incluso para un admin real.
--
-- La solucion estandar de Postgres/Supabase: una funcion SECURITY DEFINER
-- que consulta profiles con privilegios elevados, evitando por completo
-- ese problema de RLS anidada.

DROP POLICY IF EXISTS "novedades_admin_all" ON public.novedades;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE POLICY "novedades_admin_all"
ON public.novedades
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
