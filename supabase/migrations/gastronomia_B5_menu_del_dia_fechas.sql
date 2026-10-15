-- Gastronomía · GRUPO B (correr DESPUÉS del merge a main) · 5 de 5
-- Menú del día: corrige la fecha de los menús guardados con la fecha UTC.
--
-- Hasta esta rama, el panel guardaba daily_menus.date con la fecha UTC: un menú cargado entre
-- las 21 y las 24 h (hora de Argentina) quedaba con la fecha del día siguiente.
-- Desde la rama se usa hoyAR() (America/Argentina/Cordoba).
--
-- Al 7/10/2026 no había filas corridas. Se corre igual después del merge por si alguien carga
-- un menú de noche antes: si no hay nada que corregir, no cambia ninguna fila.
--
-- Solo mueve un día atrás los menús cuya fecha es posterior al día (en Argentina) en que se
-- crearon, y únicamente si ese local no tiene ya otro menú en la fecha corregida.
-- Los que chocan no se tocan: la consulta de verificación los lista.

BEGIN;

UPDATE public.daily_menus dm
   SET date = dm.date - 1
 WHERE dm.date = (dm.created_at AT TIME ZONE 'America/Argentina/Cordoba')::date + 1
   AND NOT EXISTS (
     SELECT 1 FROM public.daily_menus d2
      WHERE d2.business_id = dm.business_id
        AND d2.date = dm.date - 1
   );

COMMIT;

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN (solo lectura). Esperado: ninguna fila.
-- Si aparece alguna, es un menú corrido que choca con otro del mismo local: decidir a mano.
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT dm.id, b.name, dm.date,
--        (dm.created_at AT TIME ZONE 'America/Argentina/Cordoba') AS creado_hora_ar
--   FROM public.daily_menus dm
--   JOIN public.businesses b ON b.id = dm.business_id
--  WHERE dm.date > (dm.created_at AT TIME ZONE 'America/Argentina/Cordoba')::date
--  ORDER BY dm.created_at DESC;

-- ROLLBACK: no aplica (es una corrección de datos; si hiciera falta, la verificación previa
-- en el chat de la rama mostró 0 filas afectadas al 7/10/2026).
