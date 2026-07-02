-- Migración: los profesionales embebidos en clínicas/consultorios (columna
-- `professionals` jsonb) pasan a ser fichas propias en `businesses`, vinculadas
-- a la clínica y entre sí mediante group_id/group_name (misma lógica que ya
-- se usa en Servicios — ver migration_professional_groups.sql).
--
-- Ejecutar en Supabase → SQL Editor. Recomendado: hacer un backup/export de la
-- tabla `businesses` antes de correrlo, ya que vacía el array `professionals`
-- de cada clínica después de crear las fichas nuevas.
--
-- Es re-ejecutable sin duplicar datos: sólo procesa clínicas cuyo array
-- `professionals` todavía tiene elementos.

DO $$
DECLARE
  clinic RECORD;
  pro JSONB;
  base_slug TEXT;
  final_slug TEXT;
  counter INT;
  clinic_group_id UUID;
  clinic_group_name TEXT;
  pro_contact TEXT;
  mapped_subcategory TEXT;
BEGIN
  FOR clinic IN
    SELECT id, name, address, pueblo, latitude, longitude, group_id, group_name, professionals
    FROM businesses
    WHERE section = 'health'
      AND professionals IS NOT NULL
      AND jsonb_typeof(professionals) = 'array'
      AND jsonb_array_length(professionals) > 0
  LOOP
    -- Asegura que la clínica tenga group_id/group_name para vincular a sus profesionales
    clinic_group_id := clinic.group_id;
    clinic_group_name := clinic.group_name;
    IF clinic_group_id IS NULL THEN
      clinic_group_id := gen_random_uuid();
      clinic_group_name := COALESCE(clinic_group_name, clinic.name);
      UPDATE businesses SET group_id = clinic_group_id, group_name = clinic_group_name WHERE id = clinic.id;
    END IF;

    FOR pro IN SELECT * FROM jsonb_array_elements(clinic.professionals)
    LOOP
      CONTINUE WHEN COALESCE(TRIM(pro->>'name'), '') = '';

      -- Slug a partir del nombre, mismo criterio que generateUniqueSlug() del admin (JS)
      base_slug := lower(
        regexp_replace(
          translate(pro->>'name', 'áéíóúÁÉÍÓÚñÑüÜ', 'aeiouAEIOUnNuU'),
          '[^a-zA-Z0-9]+', '-', 'g'
        )
      );
      base_slug := trim(both '-' from base_slug);
      final_slug := base_slug;
      counter := 1;
      WHILE EXISTS (SELECT 1 FROM businesses WHERE slug = final_slug) LOOP
        final_slug := base_slug || '-' || counter;
        counter := counter + 1;
      END LOOP;

      pro_contact := NULLIF(TRIM(pro->>'contact'), '');

      -- Traduce el "área" fina del profesional (specialty_group) al rubro grueso
      -- que usa el filtro de categorías del directorio de salud (MASTER_CATEGORIES.health).
      mapped_subcategory := CASE pro->>'specialty_group'
        WHEN 'Medicina'    THEN 'Especialidades'
        WHEN 'Pediatría'   THEN 'Especialidades'
        WHEN 'Odontología' THEN 'Especialidades'
        WHEN 'Nutrición'   THEN 'Especialidades'
        WHEN 'Otros'       THEN 'Especialidades'
        WHEN 'Psicología'  THEN 'Psicología'
        WHEN 'Kinesiología / Fisioterapia' THEN 'Terapias alternativas'
        WHEN 'Cosmiatría'      THEN 'Terapias alternativas'
        WHEN 'Reflexología'    THEN 'Terapias alternativas'
        WHEN 'Fonoaudiología'  THEN 'Terapias alternativas'
        WHEN 'Laboratorio' THEN 'Laboratorios'
        WHEN 'Farmacia'    THEN 'Laboratorios'
        WHEN 'Osteopatía'  THEN 'Osteopatía'
        ELSE NULL
      END;

      INSERT INTO businesses (
        name, slug, description, section, type, subcategory, categories,
        address, pueblo, latitude, longitude,
        phone, menu_link, logo_url, status, is_open, owner_id,
        offers_delivery, offers_takeaway, offers_dine_in, accepts_reservations,
        doctor_name, medical_specialties, group_id, group_name
      ) VALUES (
        pro->>'name',
        final_slug,
        NULLIF(TRIM(BOTH FROM concat_ws(' — ', NULLIF(pro->>'description', ''), NULLIF(pro->>'schedule', ''))), ''),
        'health',
        'directory',
        mapped_subcategory,
        CASE WHEN mapped_subcategory IS NOT NULL THEN ARRAY[mapped_subcategory] ELSE ARRAY[]::text[] END,
        clinic.address,
        clinic.pueblo,
        clinic.latitude,
        clinic.longitude,
        CASE WHEN pro_contact IS NOT NULL AND pro_contact NOT ILIKE 'http%' THEN pro_contact ELSE NULL END,
        CASE WHEN pro_contact IS NOT NULL AND pro_contact ILIKE 'http%' THEN pro_contact ELSE NULL END,
        NULLIF(pro->>'photo_url', ''),
        'active',
        false,
        NULL,
        false, false, false, false,
        pro->>'name',
        -- Incluye el área (specialty_group) además de la especialidad puntual:
        -- el área es lo que usa la búsqueda global para matchear sinónimos
        -- como "nutricionista" u "odontólogo".
        ARRAY(SELECT DISTINCT v FROM unnest(ARRAY[
          NULLIF(pro->>'specialty_group', ''),
          NULLIF(pro->>'specialty', '')
        ]) AS v WHERE v IS NOT NULL),
        clinic_group_id,
        clinic_group_name
      );
    END LOOP;

    -- Vacía el array embebido: los profesionales ya existen como fichas propias
    UPDATE businesses SET professionals = '[]'::jsonb WHERE id = clinic.id;
  END LOOP;
END $$;
