-- ============================================
-- FASE 5: EJERCICIOS ESPECIALIZADOS (5 ejercicios)
-- ============================================

-- POWERLIFTING (3 ejercicios)

-- 76. Peso Muerto Convencional
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Peso Muerto Convencional (Conventional Deadlift)',
  'Uno de los tres levantamientos principales del powerlifting.',
  ARRAY[
    'Coloca los pies al ancho de las caderas debajo de la barra',
    'Agarra la barra con las manos justo fuera de las piernas',
    'Mantén la espalda recta y el pecho hacia arriba',
    'Levanta la barra extendiendo caderas y rodillas simultáneamente',
    'Bloquea en la parte superior y baja de forma controlada'
  ],
  'strength',
  ARRAY['espalda', 'piernas', 'gluteos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 77. Sentadilla con Pausa
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Sentadilla con Pausa (Pause Squat)',
  'Variación de sentadilla que elimina el rebote y aumenta la dificultad.',
  ARRAY[
    'Coloca la barra en la espalda alta o baja',
    'Baja en sentadilla de forma controlada',
    'Mantén una pausa de 2-3 segundos en la posición más baja',
    'Explota hacia arriba sin usar rebote',
    'Mantén el core activado durante toda la pausa'
  ],
  'strength',
  ARRAY['piernas', 'gluteos', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 78. Press de Banca con Cadenas
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Press de Banca con Cadenas',
  'Variación de press de banca con resistencia variable para powerlifting.',
  ARRAY[
    'Cuelga cadenas en ambos extremos de la barra',
    'Realiza el press de banca con técnica estándar',
    'La resistencia aumenta a medida que subes la barra',
    'Controla el descenso mientras las cadenas se acumulan en el suelo',
    'Enfócate en velocidad explosiva en la fase concéntrica'
  ],
  'strength',
  ARRAY['pecho', 'triceps', 'hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- REHABILITACIÓN (2 ejercicios)

-- 79. Band Pull-aparts
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Band Pull-aparts',
  'Ejercicio de rehabilitación para fortalecer manguito rotador y postura.',
  ARRAY[
    'Sostén una banda elástica con ambas manos al frente',
    'Mantén los brazos extendidos a la altura del pecho',
    'Separa las manos estirando la banda hacia los lados',
    'Aprieta los omóplatos en la posición final',
    'Regresa de forma controlada y repite'
  ],
  'strength',
  ARRAY['hombros', 'espalda'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 80. Rotación Externa de Hombro
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Rotación Externa de Hombro',
  'Ejercicio de rehabilitación para fortalecer el manguito rotador.',
  ARRAY[
    'Acuéstate de lado con el codo del brazo superior flexionado a 90 grados',
    'Sostén una mancuerna ligera o banda elástica',
    'Mantén el codo pegado al cuerpo',
    'Rota el antebrazo hacia arriba',
    'Baja de forma controlada y repite'
  ],
  'strength',
  ARRAY['hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

-- Contar ejercicios nuevos especializados
SELECT COUNT(*) as nuevos_especializados 
FROM exercises 
WHERE created_at > NOW() - INTERVAL '1 minute';

-- Ver total de ejercicios por categoría
SELECT category, COUNT(*) as total
FROM exercises
GROUP BY category
ORDER BY total DESC;

-- Total general de ejercicios
SELECT COUNT(*) as total_ejercicios FROM exercises;

-- Resumen de todas las fases
SELECT 
  '🎉 EXPANSIÓN COMPLETADA' as status,
  'Fase 1: Fuerza (28)' as fase1,
  'Fase 2: Cardio (19)' as fase2,
  'Fase 3: Flexibilidad (15)' as fase3,
  'Fase 4: Funcionales (10)' as fase4,
  'Fase 5: Especializados (5)' as fase5,
  'Total agregado: ~77 ejercicios' as total_agregado;
