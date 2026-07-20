-- Agrega el campo para la opcion "Fotos de la carta" del dashboard simplificado (Viandas)
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS menu_photos_urls text[] NOT NULL DEFAULT '{}';
