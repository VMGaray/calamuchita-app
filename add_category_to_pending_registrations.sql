-- Guarda la categoria que el gastronomico elige al registrarse, para precargarla en la aprobacion
ALTER TABLE pending_registrations
  ADD COLUMN IF NOT EXISTS category text;
