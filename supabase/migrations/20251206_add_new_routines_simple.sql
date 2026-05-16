-- ============================================
-- RUTINAS NUEVAS - Versión Simplificada
-- ============================================
-- Usando IDs directos en lugar de subqueries para evitar errores

-- Primero, obtener los IDs de los ejercicios que vamos a usar
-- Ejecuta esta consulta primero para obtener los IDs:
/*
SELECT id, name FROM exercises WHERE name IN (
  'Jumping Jacks (Saltos de Tijera)',
  'High Knees (Rodillas Altas)',
  'Burpees',
  'Flexiones (Push-ups)',
  'Sentadillas (Squats)'
) ORDER BY name;
*/

-- Por ahora, voy a crear rutinas simples usando ejercicios que sabemos que existen
-- Ajusta los IDs según tu base de datos

-- 1. HIIT PARA PRINCIPIANTES
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'HIIT para Principiantes',
  'Rutina de cardio de alta intensidad adaptada para principiantes.',
  'cardio',
  'weight_loss',
  '["cuerpo-completo"]'::jsonb,
  '[32, 33, 49, 48, 28]'::jsonb,  -- IDs aproximados, ajustar según tu BD
  'principiante'
);

-- 2. FLEXIBILIDAD TOTAL
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'Flexibilidad Total - Yoga',
  'Rutina completa de estiramientos y movilidad para todo el cuerpo.',
  'flexibility',
  'flexibility',
  '["cuerpo-completo"]'::jsonb,
  '[59, 60, 61, 62, 63, 18, 19]'::jsonb,  -- IDs aproximados
  'principiante'
);

-- 3. CALISTENIA BÁSICA
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'Calistenia Básica - Casa',
  'Rutina de calistenia usando solo peso corporal, perfecta para casa.',
  'strength',
  'muscle_gain',
  '["cuerpo-completo"]'::jsonb,
  '[1, 2, 5, 15, 27]'::jsonb,  -- Flexiones, Sentadillas, Plancha, Fondos, Plancha Lateral
  'principiante'
);

-- Verificación
SELECT COUNT(*) as total_routines FROM routines;
