-- ============================================
-- FASE 3: EJERCICIOS DE FLEXIBILIDAD (15 ejercicios)
-- ============================================

-- ESTIRAMIENTOS ESTÁTICOS (8 ejercicios)

-- 51. Estiramiento de Hombros
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Estiramiento de Hombros',
  'Estiramiento para mejorar la flexibilidad de hombros y pecho.',
  ARRAY[
    'Lleva un brazo cruzado sobre el pecho',
    'Usa el otro brazo para presionar suavemente el codo',
    'Mantén la posición por 20-30 segundos',
    'Repite con el otro brazo'
  ],
  'flexibility',
  ARRAY['hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 52. Estiramiento de Tríceps
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Estiramiento de Tríceps',
  'Estiramiento para la parte posterior del brazo.',
  ARRAY[
    'Levanta un brazo sobre la cabeza',
    'Flexiona el codo llevando la mano hacia la espalda',
    'Con la otra mano, presiona suavemente el codo',
    'Mantén por 20-30 segundos y cambia de brazo'
  ],
  'flexibility',
  ARRAY['triceps', 'hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 53. Estiramiento de Espalda Baja
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Estiramiento de Espalda Baja',
  'Estiramiento para aliviar tensión en la zona lumbar.',
  ARRAY[
    'Acuéstate boca arriba con las rodillas flexionadas',
    'Lleva ambas rodillas hacia el pecho',
    'Abraza las rodillas con los brazos',
    'Mantén la posición por 30 segundos'
  ],
  'flexibility',
  ARRAY['espalda'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 54. Estiramiento de Glúteos
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Estiramiento de Glúteos',
  'Estiramiento para los músculos glúteos y cadera.',
  ARRAY[
    'Acuéstate boca arriba con las rodillas flexionadas',
    'Cruza un tobillo sobre la rodilla opuesta',
    'Lleva ambas piernas hacia el pecho',
    'Mantén por 30 segundos y cambia de lado'
  ],
  'flexibility',
  ARRAY['gluteos', 'cadera'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 55. Estiramiento de Pantorrillas
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Estiramiento de Pantorrillas',
  'Estiramiento para los músculos de la pantorrilla.',
  ARRAY[
    'Colócate frente a una pared con las manos apoyadas',
    'Extiende una pierna hacia atrás manteniendo el talón en el suelo',
    'Flexiona la rodilla delantera',
    'Mantén por 30 segundos y cambia de pierna'
  ],
  'flexibility',
  ARRAY['pantorrillas'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 56. Estiramiento de Aductores
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Estiramiento de Aductores (Mariposa)',
  'Estiramiento para la parte interna de los muslos.',
  ARRAY[
    'Siéntate con las plantas de los pies juntas',
    'Sujeta los pies con las manos',
    'Presiona suavemente las rodillas hacia el suelo con los codos',
    'Mantén la espalda recta por 30 segundos'
  ],
  'flexibility',
  ARRAY['aductores', 'cadera'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 57. Estiramiento de Psoas
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Estiramiento de Psoas (Hip Flexor Stretch)',
  'Estiramiento para los flexores de cadera.',
  ARRAY[
    'Arrodíllate con una pierna adelante en ángulo de 90 grados',
    'Mantén la otra rodilla en el suelo',
    'Empuja las caderas hacia adelante',
    'Mantén por 30 segundos y cambia de lado'
  ],
  'flexibility',
  ARRAY['cadera', 'psoas'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 58. Estiramiento de Dorsales
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Estiramiento de Dorsales',
  'Estiramiento para los músculos laterales de la espalda.',
  ARRAY[
    'De pie, levanta un brazo sobre la cabeza',
    'Inclínate hacia el lado opuesto',
    'Siente el estiramiento en el costado',
    'Mantén por 20-30 segundos y cambia de lado'
  ],
  'flexibility',
  ARRAY['espalda', 'oblicuos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- MOVILIDAD Y YOGA (7 ejercicios)

-- 59. Cat-Cow Stretch
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Cat-Cow Stretch (Gato-Vaca)',
  'Ejercicio de movilidad para la columna vertebral.',
  ARRAY[
    'Colócate en posición de cuatro patas',
    'Arquea la espalda hacia arriba (gato) mientras exhalas',
    'Arquea la espalda hacia abajo (vaca) mientras inhalas',
    'Alterna entre ambas posiciones de forma fluida'
  ],
  'flexibility',
  ARRAY['espalda', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 60. Child''s Pose
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Child''s Pose (Postura del Niño)',
  'Postura de yoga para relajación y estiramiento de espalda.',
  ARRAY[
    'Arrodíllate con los glúteos sobre los talones',
    'Inclínate hacia adelante extendiendo los brazos',
    'Apoya la frente en el suelo',
    'Respira profundamente y relájate'
  ],
  'flexibility',
  ARRAY['espalda', 'hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 61. Downward Dog
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Downward Dog (Perro Boca Abajo)',
  'Postura de yoga que estira todo el cuerpo.',
  ARRAY[
    'Comienza en posición de cuatro patas',
    'Levanta las caderas formando una V invertida',
    'Empuja los talones hacia el suelo',
    'Mantén los brazos y piernas rectos'
  ],
  'flexibility',
  ARRAY['espalda', 'piernas', 'hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 62. Pigeon Pose
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Pigeon Pose (Postura de la Paloma)',
  'Postura de yoga para estiramiento profundo de cadera.',
  ARRAY[
    'Desde posición de cuatro patas, lleva una rodilla hacia adelante',
    'Extiende la otra pierna hacia atrás',
    'Baja las caderas hacia el suelo',
    'Mantén la posición respirando profundamente'
  ],
  'flexibility',
  ARRAY['cadera', 'gluteos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 63. Cobra Stretch
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Cobra Stretch (Postura de la Cobra)',
  'Postura de yoga para estiramiento del abdomen y pecho.',
  ARRAY[
    'Acuéstate boca abajo con las manos bajo los hombros',
    'Empuja el torso hacia arriba manteniendo las caderas en el suelo',
    'Arquea la espalda suavemente',
    'Mantén por 20-30 segundos'
  ],
  'flexibility',
  ARRAY['core', 'pecho', 'espalda'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 64. Thread the Needle
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Thread the Needle (Enhebrar la Aguja)',
  'Ejercicio de movilidad para hombros y espalda superior.',
  ARRAY[
    'Comienza en posición de cuatro patas',
    'Pasa un brazo por debajo del cuerpo',
    'Apoya el hombro y la cabeza en el suelo',
    'Mantén por 20-30 segundos y cambia de lado'
  ],
  'flexibility',
  ARRAY['hombros', 'espalda'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 65. World''s Greatest Stretch
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'World''s Greatest Stretch',
  'Estiramiento dinámico que trabaja múltiples grupos musculares.',
  ARRAY[
    'Comienza en posición de estocada baja',
    'Coloca la mano del mismo lado en el suelo',
    'Rota el torso llevando el otro brazo hacia arriba',
    'Mantén por 5 segundos y repite del otro lado'
  ],
  'flexibility',
  ARRAY['cadera', 'espalda', 'hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar ejercicios nuevos de flexibilidad
SELECT COUNT(*) as nuevos_flexibilidad 
FROM exercises 
WHERE category = 'flexibility' AND created_at > NOW() - INTERVAL '1 minute';

-- Ver total de ejercicios por categoría
SELECT category, COUNT(*) as total
FROM exercises
GROUP BY category
ORDER BY total DESC;

-- Total general
SELECT COUNT(*) as total_ejercicios FROM exercises;
