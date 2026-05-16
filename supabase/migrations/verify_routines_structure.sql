-- Ver estructura de la tabla routines
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'routines'
ORDER BY ordinal_position;

-- Ver ejemplos de rutinas existentes
SELECT * FROM routines LIMIT 3;

-- Contar rutinas por categoría y dificultad
SELECT category, difficulty, COUNT(*) as total
FROM routines
GROUP BY category, difficulty
ORDER BY category, difficulty;

-- Ver total de rutinas
SELECT COUNT(*) as total_routines FROM routines;
