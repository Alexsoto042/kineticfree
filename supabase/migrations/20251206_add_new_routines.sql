-- ============================================
-- RUTINAS NUEVAS (10 rutinas)
-- ============================================
-- Usando formato JSON correcto para el campo exercises

-- 1. HIIT PARA PRINCIPIANTES
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'HIIT para Principiantes',
  'Rutina de cardio de alta intensidad adaptada para principiantes. Intervalos cortos y ejercicios básicos.',
  'cardio',
  'weight_loss',
  ARRAY['cuerpo-completo'],
  '[163, 164, 159, 14]'::jsonb,  -- Jumping Jacks, High Knees, Mountain Climbers, Burpees
  'principiante'
);

-- 2. CARDIO DE RECUPERACIÓN
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'Cardio de Recuperación Activa',
  'Rutina de cardio de baja intensidad para días de recuperación. Mantiene el movimiento sin sobrecargar.',
  'cardio',
  'general_fitness',
  ARRAY['cuerpo-completo'],
  '[172]'::jsonb,  -- Caminata Rápida
  'principiante'
);

-- 3. FLEXIBILIDAD TOTAL
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'Flexibilidad Total - Yoga',
  'Rutina completa de estiramientos y movilidad para todo el cuerpo. Ideal para recuperación.',
  'flexibility',
  'flexibility',
  ARRAY['cuerpo-completo'],
  '[190, 191, 192, 19, 18]'::jsonb,  -- Cat-Cow, Child's Pose, Downward Dog, Cuádriceps, Isquios
  'principiante'
);

-- 4. CALISTENIA BÁSICA - CASA
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'Calistenia Básica - Full Body Casa',
  'Rutina de calistenia usando solo peso corporal. Perfecta para entrenar en casa sin equipo.',
  'strength',
  'muscle_gain',
  ARRAY['cuerpo-completo'],
  '[1, 2, 3, 159]'::jsonb,  -- Flexiones, Sentadillas, Plancha, Mountain Climbers
  'principiante'
);

-- 5. FUERZA BÁSICA
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'Fuerza Básica - Principiantes',
  'Rutina de fuerza fundamental para construir una base sólida.',
  'strength',
  'strength',
  ARRAY['cuerpo-completo'],
  '[1, 2, 16, 3]'::jsonb,  -- Flexiones, Sentadillas, Dominadas, Plancha
  'principiante'
);

-- 6. HIIT AVANZADO
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'HIIT Extremo',
  'Rutina de cardio de máxima intensidad para atletas avanzados. Ejercicios explosivos.',
  'cardio',
  'general_fitness',
  ARRAY['cuerpo-completo'],
  '[14, 164, 159, 163]'::jsonb,  -- Burpees, High Knees, Mountain Climbers, Jumping Jacks
  'avanzado'
);

-- 7. HÍBRIDO - FUERZA Y CARDIO
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'Fuerza y Cardio Combinado',
  'Rutina híbrida que combina ejercicios de fuerza con cardio de alta intensidad.',
  'hybrid',
  'general_fitness',
  ARRAY['cuerpo-completo'],
  '[1, 14, 2, 159, 3]'::jsonb,  -- Flexiones, Burpees, Sentadillas, Mountain Climbers, Plancha
  'intermedio'
);

-- 8. MOVILIDAD MATUTINA
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'Movilidad Matutina',
  'Rutina corta de movilidad y estiramientos para empezar el día con energía.',
  'flexibility',
  'flexibility',
  ARRAY['cuerpo-completo'],
  '[190, 192, 191]'::jsonb,  -- Cat-Cow, Downward Dog, Child's Pose
  'principiante'
);

-- 9. CORE Y ESTABILIDAD
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'Core y Estabilidad',
  'Rutina enfocada en fortalecer el core y mejorar la estabilidad.',
  'strength',
  'general_fitness',
  ARRAY['core'],
  '[3, 159]'::jsonb,  -- Plancha, Mountain Climbers
  'intermedio'
);

-- 10. ESTIRAMIENTOS POST-ENTRENAMIENTO
INSERT INTO routines (
  name, description, category, goal, body_zone_focus, exercises, difficulty
) VALUES (
  'Estiramientos Post-Entrenamiento',
  'Rutina de estiramientos estáticos para después del entrenamiento.',
  'flexibility',
  'flexibility',
  ARRAY['piernas', 'espalda'],
  '[19, 18, 191]'::jsonb,  -- Cuádriceps, Isquios, Child's Pose
  'principiante'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar rutinas nuevas
SELECT COUNT(*) as nuevas_rutinas 
FROM routines 
WHERE created_at > NOW() - INTERVAL '1 minute';

-- Ver total de rutinas por categoría
SELECT category, COUNT(*) as total
FROM routines
GROUP BY category
ORDER BY total DESC;

-- Total general
SELECT COUNT(*) as total_routines FROM routines;
