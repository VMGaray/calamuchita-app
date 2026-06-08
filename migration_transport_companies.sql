-- Migración: nueva tabla transport_companies
-- Ejecutar en Supabase → SQL Editor

CREATE TABLE IF NOT EXISTS transport_companies (
  id           uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text         NOT NULL,
  description  text,
  phone        text,
  website      text,
  address      text,
  coordinates  text,
  sort_order   integer      NOT NULL DEFAULT 0,
  is_active    boolean      NOT NULL DEFAULT true,
  created_at   timestamptz  DEFAULT now()
);

ALTER TABLE transport_companies DISABLE ROW LEVEL SECURITY;
