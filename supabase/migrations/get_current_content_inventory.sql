-- PASO 1: Ver estructura de tabla routines
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'routines'
ORDER BY ordinal_position;

-- PASO 2: Ver estructura de tabla plans
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'plans'
ORDER BY ordinal_position;

-- PASO 3: Lista completa de ejercicios actuales
SELECT 
  id,
  name,
  category,
  body_zone,
  difficulty,
  equipment
FROM exercises
ORDER BY category, name;

-- PASO 4: Contar ejercicios por categoría
SELECT 
  category,
  COUNT(*) as total
FROM exercises
GROUP BY category
ORDER BY total DESC;

-- PASO 5: Ver todas las rutinas (sin especificar columnas que no existen)
SELECT * FROM routines LIMIT 5;

-- PASO 6: Ver todos los planes (sin especificar columnas que no existen)
SELECT * FROM plans LIMIT 5;

-- PASO 7: Contar rutinas y planes
SELECT 
  'Total Rutinas' as metric,
  COUNT(*) as count
FROM routines
UNION ALL
SELECT 
  'Total Planes',
  COUNT(*)
FROM plans;

