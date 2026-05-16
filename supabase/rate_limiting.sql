-- =====================================================
-- Rate Limiting en Servidor - Supabase SQL (ADAPTADO)
-- Fase 2 - Sprint 3
-- =====================================================

-- Solo incluye policies para tablas que existen:
-- - routines
-- - goals
-- - workout_logs
-- - posts (si existe)

-- =====================================================
-- 1. TABLA DE TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS rate_limit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint VARCHAR(100) NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice compuesto para queries rápidas
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_endpoint 
  ON rate_limit_log(user_id, endpoint, window_end);

-- Índice para cleanup automático
CREATE INDEX IF NOT EXISTS idx_rate_limit_cleanup 
  ON rate_limit_log(window_end);

-- Habilitar RLS
ALTER TABLE rate_limit_log ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios solo pueden ver sus propios logs
CREATE POLICY "Users can view own rate limit logs"
  ON rate_limit_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. FUNCIÓN DE VERIFICACIÓN DE RATE LIMIT
-- =====================================================

CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint VARCHAR,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
  v_window_end TIMESTAMPTZ;
  v_existing_log RECORD;
BEGIN
  -- Calcular ventana de tiempo
  v_window_end := NOW();
  v_window_start := v_window_end - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Contar requests en la ventana actual
  SELECT COALESCE(SUM(request_count), 0)
  INTO v_count
  FROM rate_limit_log
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_end > v_window_start;
  
  -- Si excede el límite, retornar FALSE
  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar log existente para esta ventana
  SELECT *
  INTO v_existing_log
  FROM rate_limit_log
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_end > v_window_start
  ORDER BY window_end DESC
  LIMIT 1;
  
  -- Si existe, incrementar contador
  IF FOUND THEN
    UPDATE rate_limit_log
    SET request_count = request_count + 1,
        updated_at = NOW()
    WHERE id = v_existing_log.id;
  ELSE
    -- Si no existe, crear nuevo log
    INSERT INTO rate_limit_log (
      user_id,
      endpoint,
      request_count,
      window_start,
      window_end
    ) VALUES (
      p_user_id,
      p_endpoint,
      1,
      v_window_start,
      v_window_end + (p_window_minutes || ' minutes')::INTERVAL
    );
  END IF;
  
  RETURN TRUE;
END;
$$;

-- =====================================================
-- 3. FUNCIÓN DE LIMPIEZA AUTOMÁTICA
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_rate_limit_log()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rate_limit_log
  WHERE window_end < NOW() - INTERVAL '24 hours';
  
  RAISE NOTICE 'Rate limit log cleanup completed at %', NOW();
END;
$$;

-- =====================================================
-- 4. RLS POLICIES PARA TABLAS EXISTENTES
-- =====================================================

-- -----------------------------------------------
-- RUTINAS (routines) - SOLO SI EXISTE
-- -----------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'routines') THEN
    -- Eliminar policy si existe
    DROP POLICY IF EXISTS "rate_limit_routine_creation" ON routines;
    
    -- Crear policy
    EXECUTE 'CREATE POLICY "rate_limit_routine_creation"
      ON routines
      FOR INSERT
      TO authenticated
      WITH CHECK (
        check_rate_limit(
          auth.uid(),
          ''routine:create'',
          10,
          60
        )
      )';
    RAISE NOTICE 'Policy created for routines';
  ELSE
    RAISE NOTICE 'Table routines does not exist, skipping policy';
  END IF;
END $$;

-- -----------------------------------------------
-- OBJETIVOS (goals) - SOLO SI EXISTE
-- -----------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'goals') THEN
    DROP POLICY IF EXISTS "rate_limit_goal_creation" ON goals;
    
    EXECUTE 'CREATE POLICY "rate_limit_goal_creation"
      ON goals
      FOR INSERT
      TO authenticated
      WITH CHECK (
        check_rate_limit(
          auth.uid(),
          ''goal:create'',
          20,
          60
        )
      )';
    RAISE NOTICE 'Policy created for goals';
  ELSE
    RAISE NOTICE 'Table goals does not exist, skipping policy';
  END IF;
END $$;

-- -----------------------------------------------
-- WORKOUT LOGS (workout_logs) - SOLO SI EXISTE
-- -----------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'workout_logs') THEN
    DROP POLICY IF EXISTS "rate_limit_workout_logging" ON workout_logs;
    
    EXECUTE 'CREATE POLICY "rate_limit_workout_logging"
      ON workout_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (
        check_rate_limit(
          auth.uid(),
          ''workout:log'',
          50,
          1440
        )
      )';
    RAISE NOTICE 'Policy created for workout_logs';
  ELSE
    RAISE NOTICE 'Table workout_logs does not exist, skipping policy';
  END IF;
END $$;

-- -----------------------------------------------
-- POSTS (posts) - SOLO SI EXISTE
-- -----------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'posts') THEN
    DROP POLICY IF EXISTS "rate_limit_post_creation" ON posts;
    
    EXECUTE 'CREATE POLICY "rate_limit_post_creation"
      ON posts
      FOR INSERT
      TO authenticated
      WITH CHECK (
        check_rate_limit(
          auth.uid(),
          ''post:create'',
          15,
          60
        )
      )';
    RAISE NOTICE 'Policy created for posts';
  ELSE
    RAISE NOTICE 'Table posts does not exist, skipping policy';
  END IF;
END $$;

-- =====================================================
-- 5. FUNCIONES DE UTILIDAD
-- =====================================================

-- Función para obtener el estado actual de rate limit
CREATE OR REPLACE FUNCTION get_rate_limit_status(
  p_user_id UUID,
  p_endpoint VARCHAR,
  p_max_requests INTEGER,
  p_window_minutes INTEGER
)
RETURNS TABLE (
  current_count INTEGER,
  max_requests INTEGER,
  remaining INTEGER,
  window_end TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMPTZ;
  v_latest_window TIMESTAMPTZ;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  SELECT COALESCE(SUM(request_count), 0)
  INTO v_count
  FROM rate_limit_log
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_end > v_window_start;
  
  SELECT MAX(window_end)
  INTO v_latest_window
  FROM rate_limit_log
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_end > v_window_start;
  
  IF v_latest_window IS NULL THEN
    v_latest_window := NOW() + (p_window_minutes || ' minutes')::INTERVAL;
  END IF;
  
  RETURN QUERY
  SELECT 
    v_count::INTEGER,
    p_max_requests,
    GREATEST(0, p_max_requests - v_count)::INTEGER,
    v_latest_window;
END;
$$;

-- =====================================================
-- 6. GRANTS Y PERMISOS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_rate_limit TO authenticated;
GRANT EXECUTE ON FUNCTION get_rate_limit_status TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_rate_limit_log TO service_role;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver qué se creó
SELECT 'rate_limit_log table created' as status
WHERE EXISTS (SELECT FROM pg_tables WHERE tablename = 'rate_limit_log');

SELECT 'Functions created: ' || COUNT(*)::text as status
FROM pg_proc WHERE proname LIKE '%rate_limit%';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
