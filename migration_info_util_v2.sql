-- Migración: agregar columnas faltantes a useful_contacts
-- Ejecutar en Supabase → SQL Editor

ALTER TABLE useful_contacts
  ADD COLUMN IF NOT EXISTS specialties text,
  ADD COLUMN IF NOT EXISTS has_guardia boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_on_duty  boolean NOT NULL DEFAULT false;
