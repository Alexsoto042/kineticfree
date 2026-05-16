-- ============================================
-- SCRIPT PARA ACTUALIZAR GIF_URL DE EJERCICIOS
-- ============================================

-- PASO 1: Ver ejercicios sin gif_url
SELECT id, name
FROM exercises
WHERE gif_url IS NULL
ORDER BY name;

-- PASO 2: Actualizar gif_url para ejercicios específicos
-- Reemplaza 'NOMBRE_EJERCICIO' y 'URL_DEL_GIF' con los valores correctos

-- Ejemplo de cómo actualizar:
-- UPDATE exercises
-- SET gif_url = 'https://owijgknqpifasqmvccpj.supabase.co/storage/v1/object/public/exercise_images/nombre-archivo.webm'
-- WHERE name = 'Nombre del Ejercicio';

-- PASO 3: Verificar actualizaciones
SELECT id, name, gif_url
FROM exercises
WHERE gif_url IS NOT NULL
ORDER BY created_at DESC
LIMIT 20;
