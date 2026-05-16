-- Script para diagnosticar y arreglar el problema de registro de usuarios

-- 1. Verificar la estructura de la tabla profiles
-- Ejecuta esto primero para ver qué columnas tiene la tabla:
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Verificar las políticas RLS en profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 3. Actualizar el trigger handle_new_user para incluir más campos
-- Este es el trigger mejorado que debería funcionar:
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email,
    username,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Evitar errores si el perfil ya existe
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log el error pero no fallar el registro
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verificar que el trigger esté activo
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- 5. Si necesitas recrear el trigger:
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
