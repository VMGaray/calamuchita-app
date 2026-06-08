-- Agrega columna locality a guardia_photos para soportar fotos por localidad
-- El valor vacío ('') representa "global / sin localidad" (ej: veterinarias)

ALTER TABLE guardia_photos ADD COLUMN IF NOT EXISTS locality text NOT NULL DEFAULT '';

-- Reemplaza el unique constraint de solo category por uno compuesto (category, locality)
ALTER TABLE guardia_photos DROP CONSTRAINT IF EXISTS guardia_photos_category_key;
ALTER TABLE guardia_photos ADD CONSTRAINT guardia_photos_category_locality_key UNIQUE (category, locality);
