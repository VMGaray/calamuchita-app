-- Migración: soporte para grupos de profesionales (espacios compartidos)
-- Ejecutar en Supabase → SQL Editor

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS group_name text,
  ADD COLUMN IF NOT EXISTS group_id uuid;
