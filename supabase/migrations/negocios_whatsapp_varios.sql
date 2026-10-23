-- Negocios · varios WhatsApp por negocio, cada uno con el nombre de la persona que atiende.
--b
-- whatsapp_contacts guarda la lista completa: [{"name": "Juan", "phone": "3546 123456"}, ...]
-- La columna whatsapp se sigue llenando con el primer número de la lista (la usan el buscador,
-- el carrito, las reservas y el export del admin), así que no hay que tocar nada más.
--
-- Negocios viejos sin lista: la app cae a la columna whatsapp. Igual se copian acá para que
-- queden parejos.
--
-- Sin cambios de RLS: las políticas de businesses ya cubren la columna nueva.

BEGIN;

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS whatsapp_contacts jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.businesses
   SET whatsapp_contacts = jsonb_build_array(jsonb_build_object('name', '', 'phone', whatsapp))
 WHERE coalesce(trim(whatsapp), '') <> ''
   AND whatsapp_contacts = '[]'::jsonb;

COMMIT;

-- VERIFICACIÓN (solo lectura). Esperado: 0
-- SELECT count(*) FROM public.businesses
--  WHERE coalesce(trim(whatsapp), '') <> '' AND whatsapp_contacts = '[]'::jsonb;
--
-- ROLLBACK
-- ALTER TABLE public.businesses DROP COLUMN IF EXISTS whatsapp_contacts;
