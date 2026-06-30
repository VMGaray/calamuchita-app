-- Agregar columna video_url a la tabla businesses
-- El campo es opcional (nullable) y almacena la URL de YouTube del negocio
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS video_url text;
