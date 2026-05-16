-- ============================================
-- AUDITORÍA COMPLETA: ALTERNATIVAS DE EJERCICIOS
-- ============================================

-- PASO 1: Ver estructura de la tabla exercise_alternatives
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'exercise_alternatives'
ORDER BY ordinal_position;

-- PASO 2: Ver ejemplos de alternativas existentes
SELECT * FROM exercise_alternatives LIMIT 10;

-- PASO 3: Contar total de alternativas registradas
SELECT COUNT(*) as total_alternatives FROM exercise_alternatives;

-- PASO 4: Ejercicios SIN alternativas
SELECT 
  e.id,
  e.name,
  e.category,
  e.body_zone
FROM exercises e
LEFT JOIN exercise_alternatives ea ON e.id = ea.exercise_id
WHERE ea.exercise_id IS NULL
ORDER BY e.category, e.name;

-- PASO 5: Contar ejercicios sin alternativas por categoría
SELECT 
  e.category,
  COUNT(*) as exercises_without_alternatives
FROM exercises e
LEFT JOIN exercise_alternatives ea ON e.id = ea.exercise_id
WHERE ea.exercise_id IS NULL
GROUP BY e.category
ORDER BY exercises_without_alternatives DESC;

-- PASO 6: Ejercicios CON alternativas (para ver cómo están estructuradas)
SELECT 
  e.id,
  e.name as exercise_name,
  e.category,
  ea.alternative_id,
  alt.name as alternative_name
FROM exercises e
INNER JOIN exercise_alternatives ea ON e.id = ea.exercise_id
INNER JOIN exercises alt ON ea.alternative_id = alt.id
ORDER BY e.name
LIMIT 20;

-- PASO 7: Contar cuántas alternativas tiene cada ejercicio
SELECT 
  e.id,
  e.name,
  e.category,
  COUNT(ea.alternative_id) as num_alternatives
FROM exercises e
LEFT JOIN exercise_alternatives ea ON e.id = ea.exercise_id
GROUP BY e.id, e.name, e.category
ORDER BY num_alternatives DESC, e.name;

-- PASO 8: Ejercicios en rutinas que NO tienen alternativas
SELECT DISTINCT
  e.id,
  e.name,
  e.category,
  COUNT(DISTINCT re.routine_id) as used_in_routines
FROM exercises e
INNER JOIN routine_exercises re ON e.id = re.exercise_id
LEFT JOIN exercise_alternatives ea ON e.id = ea.exercise_id
WHERE ea.exercise_id IS NULL
GROUP BY e.id, e.name, e.category
ORDER BY used_in_routines DESC, e.name;

-- PASO 9: Resumen general
SELECT 
  'Total Ejercicios' as metric,
  COUNT(*) as count
FROM exercises
UNION ALL
SELECT 
  'Ejercicios CON alternativas',
  COUNT(DISTINCT ea.exercise_id)
FROM exercise_alternatives ea
UNION ALL
SELECT 
  'Ejercicios SIN alternativas',
  COUNT(*)
FROM exercises e
LEFT JOIN exercise_alternatives ea ON e.id = ea.exercise_id
WHERE ea.exercise_id IS NULL
UNION ALL
SELECT 
  'Total de relaciones de alternativas',
  COUNT(*)
FROM exercise_alternatives;

