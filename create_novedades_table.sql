-- Tabla "novedades": contenido de corto plazo con vida util limitada
-- (ej: "Lunes 22 la AFIP atiende en VGB"), a diferencia de editorial_posts
-- que son notas de fondo sin fecha de vencimiento.

CREATE TABLE IF NOT EXISTS public.novedades (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  content text,
  image_url text,
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
CREATE POLICY "novedades_admin_all"
ON public.novedades
FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
WITH CHECK (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'));

-- Storage: se reusa el bucket "event-images" (ya usado por Identidad
-- Calamuchitana) con una carpeta "novedades" — no hace falta crear un
-- bucket nuevo, sigue la misma convencion que ya existe en el proyecto.
