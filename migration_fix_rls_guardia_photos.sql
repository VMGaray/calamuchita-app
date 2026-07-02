-- Fix: RLS en guardia_photos bloqueaba escritura desde el panel admin
-- (mismo problema que ya se dio en useful_contacts)
-- Ejecutar en Supabase → SQL Editor

-- Opción A (recomendada): deshabilitar RLS para que coincida con las demás tablas del admin
ALTER TABLE guardia_photos DISABLE ROW LEVEL SECURITY;

-- Opción B (alternativa más restrictiva): mantener RLS pero permitir todo a usuarios autenticados
-- Descomentar las líneas de abajo y comentar la línea de arriba si preferís mantener RLS activo:
--
-- ALTER TABLE guardia_photos ENABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS "admin_full_access" ON guardia_photos;
-- CREATE POLICY "admin_full_access" ON guardia_photos
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);
