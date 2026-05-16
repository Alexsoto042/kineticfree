-- ============================================
-- FASE 2: EJERCICIOS DE CARDIO (20 ejercicios)
-- ============================================

-- HIIT / ALTA INTENSIDAD (10 ejercicios)

-- 31. Burpees
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Burpees',
  'Ejercicio de cuerpo completo que combina fuerza y cardio de alta intensidad.',
  ARRAY[
    'Comienza de pie, luego baja a posición de sentadilla',
    'Coloca las manos en el suelo y salta con los pies hacia atrás a posición de plancha',
    'Haz una flexión (opcional)',
    'Salta con los pies hacia las manos',
    'Salta explosivamente hacia arriba con los brazos extendidos'
  ],
  'cardio',
  ARRAY['cuerpo-completo'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 32. Jumping Jacks
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Jumping Jacks (Saltos de Tijera)',
  'Ejercicio cardiovascular clásico para calentamiento y acondicionamiento.',
  ARRAY[
    'Comienza de pie con los pies juntos y los brazos a los lados',
    'Salta abriendo las piernas y levantando los brazos sobre la cabeza',
    'Salta de nuevo juntando los pies y bajando los brazos',
    'Mantén un ritmo constante y rápido'
  ],
  'cardio',
  ARRAY['cuerpo-completo'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 33. High Knees
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'High Knees (Rodillas Altas)',
  'Ejercicio de cardio que eleva la frecuencia cardíaca rápidamente.',
  ARRAY[
    'Corre en el lugar levantando las rodillas lo más alto posible',
    'Alterna las piernas rápidamente',
    'Mantén el core activado y los brazos en movimiento',
    'Intenta tocar el pecho con las rodillas'
  ],
  'cardio',
  ARRAY['piernas', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 34. Skaters
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Skaters (Patinadores)',
  'Ejercicio lateral de alta intensidad que mejora agilidad y potencia.',
  ARRAY[
    'Salta lateralmente de un pie al otro',
    'Lleva la pierna trasera detrás de la pierna de apoyo',
    'Toca el suelo con la mano opuesta',
    'Mantén el movimiento fluido y explosivo'
  ],
  'cardio',
  ARRAY['piernas', 'gluteos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 35. Tuck Jumps
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Tuck Jumps (Saltos con Rodillas al Pecho)',
  'Ejercicio pliométrico avanzado para potencia explosiva.',
  ARRAY[
    'Comienza de pie con los pies al ancho de los hombros',
    'Salta explosivamente llevando las rodillas hacia el pecho',
    'Abraza las rodillas en el aire',
    'Aterriza suavemente y repite inmediatamente'
  ],
  'cardio',
  ARRAY['piernas', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 36. Box Jumps
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Box Jumps (Saltos al Cajón)',
  'Ejercicio pliométrico para desarrollar potencia en las piernas.',
  ARRAY[
    'Colócate frente a un cajón o plataforma estable',
    'Salta explosivamente sobre el cajón',
    'Aterriza suavemente con ambos pies',
    'Baja de forma controlada y repite'
  ],
  'cardio',
  ARRAY['piernas', 'gluteos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 37. Battle Ropes
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Battle Ropes (Cuerdas de Batalla)',
  'Ejercicio de alta intensidad para fuerza y resistencia cardiovascular.',
  ARRAY[
    'Agarra una cuerda en cada mano',
    'Mantén una posición atlética con las rodillas ligeramente flexionadas',
    'Mueve las cuerdas arriba y abajo alternando los brazos',
    'Mantén un ritmo rápido y constante'
  ],
  'cardio',
  ARRAY['brazos', 'hombros', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 38. Sled Push
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Sled Push (Empuje de Trineo)',
  'Ejercicio de potencia que combina fuerza y cardio intenso.',
  ARRAY[
    'Coloca las manos en el trineo con los brazos extendidos',
    'Inclínate hacia adelante con el cuerpo en ángulo',
    'Empuja el trineo con pasos cortos y rápidos',
    'Mantén el core activado y la espalda recta'
  ],
  'cardio',
  ARRAY['piernas', 'core', 'cuerpo-completo'],
  true
) ON CONFLICT (name) DO NOTHING;

-- 39. Rowing Machine
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Rowing Machine (Máquina de Remo)',
  'Ejercicio cardiovascular de bajo impacto que trabaja todo el cuerpo.',
  ARRAY[
    'Siéntate en la máquina con los pies asegurados',
    'Agarra el manubrio con ambas manos',
    'Empuja con las piernas mientras tiras del manubrio hacia el pecho',
    'Extiende los brazos y flexiona las rodillas para regresar',
    'Mantén un ritmo constante'
  ],
  'cardio',
  ARRAY['cuerpo-completo', 'espalda', 'piernas'],
  true
) ON CONFLICT (name) DO NOTHING;

-- 40. Assault Bike
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Assault Bike (Bicicleta de Asalto)',
  'Ejercicio cardiovascular de alta intensidad con brazos y piernas.',
  ARRAY[
    'Siéntate en la bicicleta con las manos en los manubrios móviles',
    'Pedalea mientras empujas y jalas los manubrios',
    'Mantén un ritmo rápido para máxima intensidad',
    'Coordina el movimiento de brazos y piernas'
  ],
  'cardio',
  ARRAY['cuerpo-completo'],
  true
) ON CONFLICT (name) DO NOTHING;

-- CARDIO MODERADO (10 ejercicios)

-- 41. Caminata Rápida
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Caminata Rápida (Brisk Walking)',
  'Ejercicio cardiovascular de bajo impacto ideal para principiantes.',
  ARRAY[
    'Camina a un ritmo rápido manteniendo buena postura',
    'Balancea los brazos naturalmente',
    'Mantén un paso constante y enérgico',
    'Respira profundamente de forma rítmica'
  ],
  'cardio',
  ARRAY['piernas'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 42. Trote Ligero
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Trote Ligero (Light Jogging)',
  'Ejercicio cardiovascular de intensidad moderada.',
  ARRAY[
    'Corre a un ritmo cómodo y sostenible',
    'Mantén los hombros relajados',
    'Aterriza suavemente en la parte media del pie',
    'Respira de forma rítmica y controlada'
  ],
  'cardio',
  ARRAY['piernas', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 43. Bicicleta Estática
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Bicicleta Estática (Stationary Bike)',
  'Ejercicio cardiovascular de bajo impacto para las articulaciones.',
  ARRAY[
    'Ajusta el asiento a la altura adecuada',
    'Pedalea manteniendo un ritmo constante',
    'Mantén la espalda recta y el core activado',
    'Ajusta la resistencia según tu nivel'
  ],
  'cardio',
  ARRAY['piernas'],
  true
) ON CONFLICT (name) DO NOTHING;

-- 44. Elíptica
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Elíptica (Elliptical)',
  'Ejercicio cardiovascular de bajo impacto que trabaja todo el cuerpo.',
  ARRAY[
    'Coloca los pies en los pedales y las manos en los manubrios',
    'Mueve las piernas en un movimiento elíptico',
    'Empuja y jala los manubrios para trabajar los brazos',
    'Mantén una postura erguida'
  ],
  'cardio',
  ARRAY['cuerpo-completo'],
  true
) ON CONFLICT (name) DO NOTHING;

-- 45. Escaladora (StairMaster)
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Escaladora (StairMaster)',
  'Ejercicio cardiovascular que simula subir escaleras.',
  ARRAY[
    'Coloca los pies en los escalones',
    'Sube manteniendo una postura erguida',
    'Evita apoyarte demasiado en los pasamanos',
    'Mantén un ritmo constante'
  ],
  'cardio',
  ARRAY['piernas', 'gluteos'],
  true
) ON CONFLICT (name) DO NOTHING;

-- 46. Natación
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Natación (Swimming)',
  'Ejercicio cardiovascular de cuerpo completo y bajo impacto.',
  ARRAY[
    'Elige un estilo de natación (crol, pecho, espalda)',
    'Mantén una técnica adecuada',
    'Respira de forma rítmica',
    'Alterna entre diferentes estilos para variedad'
  ],
  'cardio',
  ARRAY['cuerpo-completo'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 47. Saltar la Cuerda
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Saltar la Cuerda (Jump Rope)',
  'Ejercicio cardiovascular que mejora coordinación y resistencia.',
  ARRAY[
    'Sostén la cuerda con las manos a los lados',
    'Gira la cuerda con las muñecas',
    'Salta con ambos pies juntos',
    'Mantén los saltos bajos y el ritmo constante'
  ],
  'cardio',
  ARRAY['piernas', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 48. Step-ups
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Step-ups (Subidas al Banco)',
  'Ejercicio cardiovascular que fortalece piernas y glúteos.',
  ARRAY[
    'Colócate frente a un banco o escalón',
    'Sube con un pie y lleva el otro pie arriba',
    'Baja de forma controlada',
    'Alterna la pierna de inicio'
  ],
  'cardio',
  ARRAY['piernas', 'gluteos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 49. Marcha en Sitio
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Marcha en Sitio (Marching in Place)',
  'Ejercicio cardiovascular suave ideal para calentamiento.',
  ARRAY[
    'Marcha en el lugar levantando las rodillas',
    'Balancea los brazos opuestos a las piernas',
    'Mantén la espalda recta',
    'Aumenta gradualmente la intensidad'
  ],
  'cardio',
  ARRAY['piernas'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 50. Shadowboxing
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Shadowboxing (Boxeo de Sombra)',
  'Ejercicio cardiovascular que combina cardio con técnica de boxeo.',
  ARRAY[
    'Adopta una postura de boxeo con los puños arriba',
    'Lanza combinaciones de golpes al aire',
    'Muévete constantemente sobre los pies',
    'Mantén las manos arriba y el core activado'
  ],
  'cardio',
  ARRAY['brazos', 'core', 'cuerpo-completo'],
  false
) ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar ejercicios nuevos de cardio
SELECT COUNT(*) as nuevos_cardio 
FROM exercises 
WHERE category = 'cardio' AND created_at > NOW() - INTERVAL '1 minute';

-- Ver total de ejercicios por categoría
SELECT category, COUNT(*) as total
FROM exercises
GROUP BY category
ORDER BY total DESC;

-- Total general
SELECT COUNT(*) as total_ejercicios FROM exercises;
