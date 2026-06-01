-- Fix: RLS en useful_contacts bloqueaba escritura desde el panel admin
-- Ejecutar en Supabase → SQL Editor

-- Opción A (recomendada): deshabilitar RLS para que coincida con las demás tablas del admin
ALTER TABLE useful_contacts DISABLE ROW LEVEL SECURITY;

-- Opción B (alternativa más restrictiva): mantener RLS pero permitir todo a usuarios autenticados
-- Descomentar las líneas de abajo y comentar la línea de arriba si preferís mantener RLS activo:
--
-- ALTER TABLE useful_contacts ENABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS "admin_full_access" ON useful_contacts;
-- CREATE POLICY "admin_full_access" ON useful_contacts
--   FOR ALL
--   TO authenticated
--   USING (true)
--   WITH CHECK (true);
