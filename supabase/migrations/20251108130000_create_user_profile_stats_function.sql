CREATE TYPE weekly_activity_day AS (day_name TEXT, workout_count INT);

CREATE OR REPLACE FUNCTION get_user_profile_stats(p_user_id UUID)
RETURNS json AS $$
DECLARE
  total_workouts INT;
  total_reps BIGINT;
  total_weight_lifted NUMERIC;
  recent_workout_count INT;
  exercise_count INT;
  routine_count INT;
  weekly_activity weekly_activity_day[];
BEGIN
  -- Calculate aggregate stats
  SELECT
    count(*),
    sum(COALESCE(t.reps, 0) * COALESCE(t.sets, 1)),
    sum(COALESCE(t.weight, 0) * COALESCE(t.reps, 0) * COALESCE(t.sets, 1))
  INTO
    total_workouts,
    total_reps,
    total_weight_lifted
  FROM workout_logs t
  WHERE t.user_id = p_user_id;

  -- Calculate recent workouts
  SELECT count(*)
  INTO recent_workout_count
  FROM workout_logs
  WHERE user_id = p_user_id AND created_at >= (now() - interval '7 days');

  -- Calculate total exercise and routine counts
  SELECT count(*) INTO exercise_count FROM exercises;
  SELECT count(*) INTO routine_count FROM routines;

  -- Calculate weekly activity chart data
  WITH days AS (
    SELECT generate_series(
      date_trunc('day', now()) - interval '6 days',
      date_trunc('day', now()),
      '1 day'::interval
    ) as day
  ),
  daily_workouts AS (
    SELECT
      date_trunc('day', created_at) as workout_day,
      count(*) as workout_count
    FROM workout_logs
    WHERE user_id = p_user_id AND created_at >= (now() - interval '6 days')
    GROUP BY 1
  )
  SELECT array_agg(ROW(
    to_char(days.day, 'Dy'),
    COALESCE(dw.workout_count, 0)
  )::weekly_activity_day)
  INTO weekly_activity
  FROM days
  LEFT JOIN daily_workouts dw ON days.day = dw.workout_day;

  -- Return all stats as a single JSON object
  RETURN json_build_object(
    'total_workouts', COALESCE(total_workouts, 0),
    'total_reps', COALESCE(total_reps, 0),
    'total_weight_lifted', COALESCE(total_weight_lifted, 0),
    'recent_workout_count', COALESCE(recent_workout_count, 0),
    'exercise_count', COALESCE(exercise_count, 0),
    'routine_count', COALESCE(routine_count, 0),
    'weekly_activity', weekly_activity
  );
END;
$$ LANGUAGE plpgsql;