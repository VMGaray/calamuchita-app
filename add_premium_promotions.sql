-- 1. Agregar columna is_premium a la tabla businesses
ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS is_premium boolean DEFAULT false NOT NULL;

-- 2. Crear tabla promotions
CREATE TABLE IF NOT EXISTS promotions (
  id              uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id     uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  title           text        NOT NULL,
  description     text,
  discount_percent integer,
  discount_label  text,           -- Ej: "2x1", "30% OFF", "Envío gratis"
  valid_until     date        NOT NULL,
  is_active       boolean     DEFAULT true NOT NULL,
  created_at      timestamptz DEFAULT now() NOT NULL
);

-- 3. Row Level Security
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo promos activas
CREATE POLICY "promotions_public_read" ON promotions
  FOR SELECT
  USING (is_active = true);

-- Los dueños del negocio pueden hacer todo
CREATE POLICY "promotions_owner_all" ON promotions
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- 4. Índices útiles
CREATE INDEX IF NOT EXISTS promotions_business_id_idx ON promotions (business_id);
CREATE INDEX IF NOT EXISTS promotions_valid_until_idx  ON promotions (valid_until);
CREATE INDEX IF NOT EXISTS promotions_is_active_idx    ON promotions (is_active);

-- 5. Para marcar negocios como premium, ejecutar algo como:
-- UPDATE businesses SET is_premium = true WHERE id = '<uuid del negocio>';
