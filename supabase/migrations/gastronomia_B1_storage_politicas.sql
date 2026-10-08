-- Gastronomía · GRUPO B (correr DESPUÉS del merge a main) · 1 de 5
-- Storage: cada dueño maneja solo los archivos de su negocio; el admin, todos.
--
-- CÓMO SE NOMBRAN LOS ARCHIVOS
--   Bucket businesses
--     · Panel del comercio (desde esta rama): <business_id>/<carpeta>/<archivo>
--       carpetas: logos, covers, gallery, menus (PDF), menu-items, menu-fotos
--     · Admin y archivos viejos: <carpeta>/<archivo> (sin id de negocio)
--   Bucket event-images: solo lo usa el admin (eventos, novedades, identidad)
--
-- REQUISITO: el código de feat/gastronomia ya en producción. La versión anterior del panel
-- sube sin el id del negocio adelante y esos uploads quedarían bloqueados.
--
-- REGLAS NUEVAS
--   event-images  · subir / reemplazar / borrar: solo admin
--   businesses    · subir:      admin, o dueño si la 1.ª carpeta es el id de SU negocio
--                 · reemplazar: admin, o dueño (por carpeta, o archivo que subió él: owner_id)
--                 · borrar:     admin, o dueño (por carpeta, o archivo que subió él: owner_id)
--   Lectura pública de los dos buckets: sin cambios.
--
-- owner_id lo completa Supabase con el usuario que subió el archivo: así el dueño también
-- puede borrar sus archivos viejos (sin id de negocio en la ruta), pero no los de otros.

BEGIN;

-- 1. Borrar las políticas abiertas
DROP POLICY IF EXISTS "Permitir edición a usuarios autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subidas a usuarios autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir subida de imágenes"              ON storage.objects;
DROP POLICY IF EXISTS "Storage admin delete"                     ON storage.objects;
DROP POLICY IF EXISTS "Storage admin insert"                     ON storage.objects;
DROP POLICY IF EXISTS "Storage admin update"                     ON storage.objects;

-- 2. Admin: todo en los dos buckets
CREATE POLICY "Storage: admin gestiona businesses y event-images"
ON storage.objects FOR ALL TO authenticated
USING      (bucket_id IN ('businesses', 'event-images') AND (SELECT public.is_admin()))
WITH CHECK (bucket_id IN ('businesses', 'event-images') AND (SELECT public.is_admin()));

-- 3. Dueño: subir dentro de la carpeta de su negocio
CREATE POLICY "Storage: dueño sube a la carpeta de su negocio"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'businesses'
  AND (storage.foldername(name))[1] IN (
    SELECT b.id::text FROM public.businesses b WHERE b.owner_id = (SELECT auth.uid())
  )
);

-- 4. Dueño: reemplazar (upsert del PDF de la carta)
CREATE POLICY "Storage: dueño reemplaza sus archivos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'businesses'
  AND (
    owner_id = (SELECT auth.uid())::text
    OR (storage.foldername(name))[1] IN (
      SELECT b.id::text FROM public.businesses b WHERE b.owner_id = (SELECT auth.uid())
    )
  )
)
WITH CHECK (
  bucket_id = 'businesses'
  AND (storage.foldername(name))[1] IN (
    SELECT b.id::text FROM public.businesses b WHERE b.owner_id = (SELECT auth.uid())
  )
);

-- 5. Dueño: borrar
CREATE POLICY "Storage: dueño borra sus archivos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'businesses'
  AND (
    owner_id = (SELECT auth.uid())::text
    OR (storage.foldername(name))[1] IN (
      SELECT b.id::text FROM public.businesses b WHERE b.owner_id = (SELECT auth.uid())
    )
  )
);

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN
-- ─────────────────────────────────────────────────────────────────────────────
-- A) Esperado: "Permitir ver imágenes", "Storage public read" y las 4 nuevas
-- SELECT policyname, cmd, roles FROM pg_policies
--  WHERE schemaname='storage' AND tablename='objects' ORDER BY policyname;
--
-- B) Desde la app (después de correrla):
--    · Bodegón del Valle sube logo, portada, fotos de galería, PDF de carta → funciona
--    · Bodegón del Valle borra una foto de la galería → desaparece también de Storage
--    · Admin sube imágenes en Negocios, Eventos y Novedades → funciona
--
-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK (vuelve a las políticas anteriores, abiertas)
-- ─────────────────────────────────────────────────────────────────────────────
-- BEGIN;
-- DROP POLICY IF EXISTS "Storage: admin gestiona businesses y event-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Storage: dueño sube a la carpeta de su negocio"    ON storage.objects;
-- DROP POLICY IF EXISTS "Storage: dueño reemplaza sus archivos"             ON storage.objects;
-- DROP POLICY IF EXISTS "Storage: dueño borra sus archivos"                 ON storage.objects;
-- CREATE POLICY "Permitir edición a usuarios autenticados" ON storage.objects FOR UPDATE TO authenticated USING (true);
-- CREATE POLICY "Permitir subidas a usuarios autenticados" ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);
-- CREATE POLICY "Permitir subida de imágenes" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'event-images');
-- CREATE POLICY "Storage admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'businesses');
-- CREATE POLICY "Storage admin insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'businesses');
-- CREATE POLICY "Storage admin update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'businesses');
-- COMMIT;
