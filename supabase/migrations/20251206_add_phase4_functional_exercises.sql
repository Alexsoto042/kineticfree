-- ============================================
-- FASE 4: EJERCICIOS FUNCIONALES (10 ejercicios)
-- ============================================

-- CALISTENIA AVANZADA (5 ejercicios)

-- 66. Muscle-up
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Muscle-up',
  'Ejercicio avanzado de calistenia que combina dominada y fondo.',
  ARRAY[
    'Cuelga de una barra con agarre pronado',
    'Realiza una dominada explosiva',
    'En la parte superior, transiciona empujando el cuerpo sobre la barra',
    'Extiende los brazos completamente',
    'Baja de forma controlada'
  ],
  'strength',
  ARRAY['espalda', 'pecho', 'brazos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 67. L-Sit
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'L-Sit',
  'Ejercicio isométrico avanzado para core y fuerza de empuje.',
  ARRAY[
    'Siéntate con las manos en el suelo o paralelas',
    'Empuja hacia abajo levantando el cuerpo del suelo',
    'Extiende las piernas al frente formando una L',
    'Mantén la posición el mayor tiempo posible'
  ],
  'strength',
  ARRAY['core', 'hombros', 'brazos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 68. Handstand Push-up
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Handstand Push-up (Flexión en Pino)',
  'Ejercicio avanzado de empuje vertical invertido.',
  ARRAY[
    'Colócate en posición de pino contra una pared',
    'Baja la cabeza hacia el suelo flexionando los codos',
    'Empuja hacia arriba hasta extender los brazos',
    'Mantén el core activado durante todo el movimiento'
  ],
  'strength',
  ARRAY['hombros', 'triceps', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 69. Dragon Flag
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Dragon Flag (Bandera del Dragón)',
  'Ejercicio avanzado de core popularizado por Bruce Lee.',
  ARRAY[
    'Acuéstate en un banco y agarra el borde detrás de la cabeza',
    'Levanta todo el cuerpo manteniendo solo los hombros en el banco',
    'Mantén el cuerpo recto como una tabla',
    'Baja de forma controlada sin tocar el banco'
  ],
  'strength',
  ARRAY['core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 70. Front Lever
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Front Lever',
  'Ejercicio isométrico avanzado de calistenia.',
  ARRAY[
    'Cuelga de una barra con agarre pronado',
    'Levanta el cuerpo hasta quedar horizontal al suelo',
    'Mantén el cuerpo completamente recto',
    'Sostén la posición el mayor tiempo posible'
  ],
  'strength',
  ARRAY['espalda', 'core', 'brazos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- FUNCIONAL / CROSSFIT (5 ejercicios)

-- 71. Wall Balls
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Wall Balls',
  'Ejercicio funcional que combina sentadilla y lanzamiento.',
  ARRAY[
    'Sostén un balón medicinal a la altura del pecho',
    'Realiza una sentadilla completa',
    'Al subir, lanza el balón hacia un objetivo en la pared',
    'Atrapa el balón y repite inmediatamente'
  ],
  'strength',
  ARRAY['piernas', 'hombros', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 72. Thruster
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Thruster',
  'Ejercicio compuesto que combina sentadilla frontal y press.',
  ARRAY[
    'Sostén una barra en posición de sentadilla frontal',
    'Realiza una sentadilla completa',
    'Al subir, usa el impulso para presionar la barra sobre la cabeza',
    'Baja la barra a los hombros y repite'
  ],
  'strength',
  ARRAY['piernas', 'hombros', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 73. Clean and Jerk
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Clean and Jerk (Cargada y Envión)',
  'Movimiento olímpico de levantamiento de pesas.',
  ARRAY[
    'Levanta la barra del suelo a los hombros (clean)',
    'Flexiona ligeramente las rodillas',
    'Empuja explosivamente la barra sobre la cabeza (jerk)',
    'Estabiliza con una pierna adelante y otra atrás',
    'Junta los pies y baja la barra de forma controlada'
  ],
  'strength',
  ARRAY['cuerpo-completo'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 74. Snatch
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Snatch (Arrancada)',
  'Movimiento olímpico que lleva la barra del suelo sobre la cabeza en un solo movimiento.',
  ARRAY[
    'Agarra la barra con un agarre amplio',
    'Levanta la barra explosivamente del suelo',
    'Tira de la barra hacia arriba mientras te metes debajo',
    'Atrapa la barra sobre la cabeza en sentadilla',
    'Levántate completamente con la barra arriba'
  ],
  'strength',
  ARRAY['cuerpo-completo'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 75. Turkish Get-up
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Turkish Get-up (Levantamiento Turco)',
  'Ejercicio funcional complejo que trabaja estabilidad y fuerza.',
  ARRAY[
    'Acuéstate con una pesa rusa en una mano extendida',
    'Levántate gradualmente pasando por varias posiciones',
    'Mantén la pesa arriba durante todo el movimiento',
    'Invierte el movimiento para volver al suelo',
    'Realiza todas las repeticiones de un lado antes de cambiar'
  ],
  'strength',
  ARRAY['cuerpo-completo', 'core', 'hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar ejercicios nuevos funcionales
SELECT COUNT(*) as nuevos_funcionales 
FROM exercises 
WHERE created_at > NOW() - INTERVAL '1 minute';

-- Ver total de ejercicios por categoría
SELECT category, COUNT(*) as total
FROM exercises
GROUP BY category
ORDER BY total DESC;

-- Total general
SELECT COUNT(*) as total_ejercicios FROM exercises;
