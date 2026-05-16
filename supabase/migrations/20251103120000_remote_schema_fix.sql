-- 1. Añadir la columna 'end_time' a 'workout_logs' si no existe.
ALTER TABLE public.workout_logs
ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- 2. Habilitar RLS en la tabla 'profiles' y añadir políticas.
-- Esto permite a los usuarios leer y actualizar su propio perfil.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existen, para evitar errores.
DROP POLICY IF EXISTS "Allow users to read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.profiles;

CREATE POLICY "Allow users to read their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Habilitar RLS en la tabla 'workout_logs' y añadir políticas.
-- Esto permite a los usuarios gestionar sus propios registros de entrenamiento.
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas si existen, para evitar errores.
DROP POLICY IF EXISTS "Allow users to manage their own workout logs" ON public.workout_logs;

CREATE POLICY "Allow users to manage their own workout logs"
  ON public.workout_logs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);