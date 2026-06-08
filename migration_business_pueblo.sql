-- Migración: agregar columna pueblo a businesses para filtrado preciso
-- Ejecutar en Supabase → SQL Editor

ALTER TABLE businesses ADD COLUMN IF NOT EXISTS pueblo text;

-- Backfill: extraer pueblo de la dirección para registros existentes
UPDATE businesses SET pueblo =
  CASE
    WHEN address ILIKE '%Villa General Belgrano%' THEN 'Villa General Belgrano'
    WHEN address ILIKE '%Santa Rosa de Calamuchita%' THEN 'Santa Rosa de Calamuchita'
    WHEN address ILIKE '%La Cumbrecita%'             THEN 'La Cumbrecita'
    WHEN address ILIKE '%Los Reartes%'               THEN 'Los Reartes'
    WHEN address ILIKE '%Villa Yacanto%'
      OR address ILIKE '%, Yacanto%'
      OR address ILIKE '%Yacanto,%'                  THEN 'Yacanto'
    WHEN address ILIKE '%Amboy%'                     THEN 'Amboy'
    WHEN address ILIKE '%Embalse%'                   THEN 'Embalse'
    WHEN address ILIKE '%Villa del Dique%'           THEN 'Villa del Dique'
    WHEN address ILIKE '%Villa Rumipal%'             THEN 'Villa Rumipal'
    WHEN address ILIKE '%Villa Ciudad de América%'   THEN 'Villa Ciudad de América'
    WHEN address ILIKE '%Villa Alpina%'              THEN 'Villa Alpina'
    WHEN address ILIKE '%Villa Berna%'               THEN 'Villa Berna'
    WHEN address ILIKE '%Villa Ciudad Parque%'       THEN 'Villa Ciudad Parque'
    WHEN address ILIKE '%La Cruz%'                   THEN 'La Cruz'
    WHEN address ILIKE '%Intiyaco%'                  THEN 'Intiyaco'
    WHEN address ILIKE '%Potrero de Garay%'          THEN 'Potrero de Garay'
    WHEN address ILIKE '%San Agustín%'               THEN 'San Agustín'
    WHEN address ILIKE '%Villa Quillinzo%'           THEN 'Villa Quillinzo'
    ELSE NULL
  END
WHERE pueblo IS NULL AND address IS NOT NULL;
