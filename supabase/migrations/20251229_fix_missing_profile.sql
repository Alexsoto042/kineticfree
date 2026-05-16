-- Paso 1: Crear el perfil faltante para el usuario nuevo (solo columnas básicas)
INSERT INTO public.profiles (id, username)
SELECT 
  id,
  COALESCE(
    raw_user_meta_data->>'name', 
    raw_user_meta_data->>'full_name', 
    SPLIT_PART(email, '@', 1)
  ) as username
FROM auth.users
WHERE id = '32c139ab-426c-40d2-ab0c-d093841b1f85'
ON CONFLICT (id) DO NOTHING;

-- Paso 2: Actualizar la función handle_new_user para que NO use la columna email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username
  )
  VALUES (
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'username', 
      SPLIT_PART(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 3: Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

