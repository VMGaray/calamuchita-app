-- Agregar columna facebook a la tabla businesses
-- El campo es opcional (nullable) y almacena el usuario o URL de Facebook del negocio
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS facebook text;
