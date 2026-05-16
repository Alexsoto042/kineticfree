-- Función para calcular la racha de entrenamientos
-- Lógica:
-- 1. Obtiene todas las fechas únicas de entrenamiento
-- 2. Si el último entrenamiento fue hace más de 1 día (anteayer o antes), la racha es 0.
-- 3. Si el último entrenamiento fue hoy o ayer, cuenta los días consecutivos hacia atrás.

CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    streak INTEGER := 0;
    last_date DATE;
    check_date DATE;
    workout_dates DATE[];
BEGIN
    -- Obtener todas las fechas únicas de entrenamiento del usuario, ordenadas por fecha descendente
    -- Se asume que la tabla es 'workout_logs' y tiene 'created_at' y 'user_id'
    SELECT ARRAY(
        SELECT DISTINCT DATE(created_at)
        FROM workout_logs
        WHERE user_id = p_user_id
        ORDER BY DATE(created_at) DESC
    ) INTO workout_dates;

    -- Si no hay entrenamientos, retornar 0
    IF array_length(workout_dates, 1) IS NULL THEN
        RETURN 0;
    END IF;

    -- Verificar si el último entrenamiento fue hoy o ayer
    -- CURRENT_DATE es la fecha actual en UTC (o la zona horaria del servidor)
    -- Si last_date es menor que (hoy - 1 día), significa que ayer no entrenó
    last_date := workout_dates[1];
    
    IF last_date < (CURRENT_DATE - INTERVAL '1 day') THEN
        RETURN 0;
    END IF;

    -- Calcular racha
    streak := 1;
    check_date := last_date;

    -- Iterar sobre el resto de fechas para encontrar días consecutivos
    FOR i IN 2..array_length(workout_dates, 1) LOOP
        -- Si la siguiente fecha es exactamente un día antes que la fecha de chequeo
        IF workout_dates[i] = (check_date - INTERVAL '1 day') THEN
            streak := streak + 1;
            check_date := workout_dates[i];
        ELSE
            -- Si hay un hueco (no son consecutivos), terminamos
            EXIT;
        END IF;
    END LOOP;

    RETURN streak;
END;
$$;
