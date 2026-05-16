-- Ver estructura completa de la tabla exercises
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exercises'
ORDER BY ordinal_position;

-- Ver un ejercicio de ejemplo para entender el formato
SELECT * FROM exercises WHERE id = 1;

-- Ver todos los valores únicos de cada campo
SELECT DISTINCT category FROM exercises;
SELECT DISTINCT difficulty FROM exercises;
SELECT DISTINCT equipment FROM exercises;
