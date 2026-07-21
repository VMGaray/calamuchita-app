-- Tabla "novedades": contenido de corto plazo con vida util limitada
-- (ej: "Lunes 22 la AFIP atiende en VGB"), a diferencia de editorial_posts
-- que son notas de fondo sin fecha de vencimiento.

CREATE TABLE IF NOT EXISTS public.novedades (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  content text,
  image_url text,
  locality text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  published boolean DEFAULT true
);

ALTER TABLE public.novedades ENABLE ROW LEVEL SECURITY;

-- Lectura publica: solo novedades publicadas y no vencidas
CREATE POLICY "novedades_public_read"
ON public.novedades
FOR SELECT
TO public
USING (published = true AND (expires_at IS NULL OR expires_at > now()));

-- El panel admin necesita ver TODO (borradores, vencidas) y poder
-- crear/editar/borrar. Sin esta policy, RLS bloquea al admin por completo
-- ya que "public_read" arriba es la unica policy y no cubre ese caso.
--
-- Se usa una funcion SECURITY DEFINER en vez de una subquery directa a
-- profiles: una subquery normal queda sujeta a la RLS propia de profiles
-- y puede devolver vacio (bloqueando al admin real). SECURITY DEFINER
-- consulta profiles con privilegios elevados, evitando ese problema.
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

-- Storage: se reusa el bucket "event-images" (ya usado por Identidad
-- Calamuchitana) con una carpeta "novedades" — no hace falta crear un
-- bucket nuevo, sigue la misma convencion que ya existe en el proyecto.
