-- Migración: tabla para fotos de guardias (veterinarias, farmacias, etc.)
-- Ejecutar en Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS guardia_photos (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  category    text        NOT NULL UNIQUE,
  photo_url   text,
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE guardia_photos DISABLE ROW LEVEL SECURITY;

-- Fila inicial para veterinarias
INSERT INTO guardia_photos (category) VALUES ('veterinarias') ON CONFLICT DO NOTHING;
