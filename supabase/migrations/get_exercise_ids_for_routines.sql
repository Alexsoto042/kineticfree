-- ============================================
-- OBTENER IDS DE EJERCICIOS PARA RUTINAS
-- ============================================
-- Ejecuta esta consulta primero para obtener los IDs

SELECT id, name, category 
FROM exercises 
WHERE name IN (
  -- Cardio
  'Burpees',
  'Jumping Jacks (Saltos de Tijera)',
  'High Knees (Rodillas Altas)',
  'Mountain Climbers (Escaladores)',
  'Caminata Rápida (Brisk Walking)',
  
  -- Fuerza
  'Flexiones (Push-ups)',
  'Sentadillas (Squats)',
  'Plancha (Plank)',
  'Dominadas (Pull-ups)',
  
  -- Flexibilidad
  'Cat-Cow Stretch (Gato-Vaca)',
  'Downward Dog (Perro Boca Abajo)',
  'Child''s Pose (Postura del Niño)',
  'Estiramiento de Cuádriceps',
  'Estiramiento de Isquiotibiales'
)
ORDER BY category, name;
