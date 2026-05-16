-- Función para limpieza automática de workout_logs antiguos
-- Mantiene solo los últimos 6 meses de datos para reducir el tamaño de la BD

-- Crear la función de limpieza
CREATE OR REPLACE FUNCTION cleanup_old_workout_logs()
RETURNS TABLE (deleted_count bigint) AS $$
DECLARE
  rows_deleted bigint;
BEGIN
  -- Eliminar workout_logs con más de 6 meses de antigüedad
  DELETE FROM workout_logs
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  GET DIAGNOSTICS rows_deleted = ROW_COUNT;
  
  RETURN QUERY SELECT rows_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario de la función
COMMENT ON FUNCTION cleanup_old_workout_logs() IS 
'Elimina workout_logs con más de 6 meses de antigüedad para mantener la base de datos pequeña';

-- ============================================
-- OPCIÓN 1: Programar con pg_cron (Recomendado)
-- ============================================
-- NOTA: Primero debes habilitar la extensión pg_cron en Supabase Dashboard
-- Dashboard > Database > Extensions > Buscar "pg_cron" > Enable

-- Descomentar las siguientes líneas después de habilitar pg_cron:
/*
-- Programar ejecución mensual (día 1 de cada mes a las 3 AM)
SELECT cron.schedule(
  'cleanup-old-workout-logs',
  '0 3 1 * *',
  'SELECT cleanup_old_workout_logs();'
);

-- Ver trabajos programados
SELECT * FROM cron.job;

-- Para eliminar el trabajo programado (si es necesario):
-- SELECT cron.unschedule('cleanup-old-workout-logs');
*/

-- ============================================
-- OPCIÓN 2: Ejecutar manualmente
-- ============================================
-- Puedes ejecutar esta función manualmente cuando lo necesites:
-- SELECT cleanup_old_workout_logs();

-- ============================================
-- OPCIÓN 3: Edge Function (Alternativa)
-- ============================================
-- Si no puedes usar pg_cron, crea una Edge Function en Supabase
-- y programa su ejecución con un servicio externo como cron-job.org
-- Ver documentación en: https://supabase.com/docs/guides/functions
