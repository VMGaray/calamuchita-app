-- Migración: agregar columnas faltantes a utility_services
-- Ejecutar en Supabase SQL Editor

ALTER TABLE utility_services
  ADD COLUMN IF NOT EXISTS hours text,
  ADD COLUMN IF NOT EXISTS specialties text,
  ADD COLUMN IF NOT EXISTS has_guardia boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_on_duty boolean NOT NULL DEFAULT false;
