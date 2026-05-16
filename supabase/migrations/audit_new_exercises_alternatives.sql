-- ============================================
-- AUDITORÍA: ALTERNATIVAS PARA EJERCICIOS NUEVOS
-- ============================================

-- Ver cuántos ejercicios NO tienen alternativas
SELECT 
  COUNT(*) as ejercicios_sin_alternativas
FROM exercises e
LEFT JOIN exercise_alternatives ea ON e.id = ea.exercise_id
WHERE ea.exercise_id IS NULL;

-- Listar ejercicios sin alternativas por categoría
SELECT 
  e.id,
  e.name,
  e.category,
  e.body_zone
FROM exercises e
LEFT JOIN exercise_alternatives ea ON e.id = ea.exercise_id
WHERE ea.exercise_id IS NULL
ORDER BY e.category, e.name;

-- Contar por categoría
SELECT 
  e.category,
  COUNT(*) as sin_alternativas
FROM exercises e
LEFT JOIN exercise_alternatives ea ON e.id = ea.exercise_id
WHERE ea.exercise_id IS NULL
GROUP BY e.category
ORDER BY sin_alternativas DESC;

-- Ver ejercicios que SÍ tienen alternativas (para referencia)
SELECT 
  e.name,
  e.category,
  COUNT(ea.alternative_id) as num_alternativas
FROM exercises e
INNER JOIN exercise_alternatives ea ON e.id = ea.exercise_id
GROUP BY e.id, e.name, e.category
ORDER BY num_alternativas DESC, e.name
LIMIT 20;
