-- ============================================
-- FASE 1: EJERCICIOS DE FUERZA (30 ejercicios)
-- ============================================

-- PECHO (5 ejercicios)

-- 1. Flexiones Diamante
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Flexiones Diamante (Diamond Push-ups)',
  'Variación avanzada de flexiones que enfatiza los tríceps y el pecho interno.',
  ARRAY[
    'Coloca las manos juntas formando un diamante con los dedos índices y pulgares',
    'Mantén el cuerpo recto desde la cabeza hasta los talones',
    'Baja el pecho hacia las manos manteniendo los codos cerca del cuerpo',
    'Empuja hacia arriba hasta la posición inicial'
  ],
  'strength',
  ARRAY['pecho', 'triceps'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 2. Flexiones Declinadas
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Flexiones Declinadas (Decline Push-ups)',
  'Flexiones con los pies elevados para mayor énfasis en el pecho superior.',
  ARRAY[
    'Coloca los pies sobre un banco o superficie elevada',
    'Manos al ancho de los hombros en el suelo',
    'Baja el pecho hacia el suelo manteniendo el cuerpo recto',
    'Empuja hacia arriba hasta la posición inicial'
  ],
  'strength',
  ARRAY['pecho', 'hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 3. Flexiones con Palmada
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Flexiones con Palmada (Clap Push-ups)',
  'Ejercicio pliométrico avanzado para desarrollar potencia explosiva.',
  ARRAY[
    'Comienza en posición de flexión estándar',
    'Baja el cuerpo y empuja explosivamente hacia arriba',
    'Da una palmada en el aire mientras estás suspendido',
    'Aterriza suavemente y repite'
  ],
  'strength',
  ARRAY['pecho', 'triceps', 'hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 4. Press de Banca Declinado
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Press de Banca Declinado',
  'Variación del press de banca que enfatiza el pecho inferior.',
  ARRAY[
    'Acuéstate en un banco declinado con los pies asegurados',
    'Agarra la barra con las manos ligeramente más anchas que los hombros',
    'Baja la barra hacia el pecho inferior de forma controlada',
    'Empuja la barra hacia arriba hasta extender los brazos'
  ],
  'strength',
  ARRAY['pecho', 'triceps'],
  true
) ON CONFLICT (name) DO NOTHING;

-- 5. Pullover con Mancuerna
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Pullover con Mancuerna',
  'Ejercicio que trabaja el pecho y los dorsales simultáneamente.',
  ARRAY[
    'Acuéstate perpendicular en un banco con solo los hombros apoyados',
    'Sostén una mancuerna con ambas manos sobre el pecho',
    'Baja la mancuerna detrás de la cabeza manteniendo los brazos ligeramente flexionados',
    'Regresa a la posición inicial contrayendo el pecho'
  ],
  'strength',
  ARRAY['pecho', 'espalda'],
  false
) ON CONFLICT (name) DO NOTHING;

-- ESPALDA (5 ejercicios)

-- 6. Dominadas Australianas
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Dominadas Australianas (Australian Pull-ups)',
  'Variación de dominadas para principiantes con el cuerpo inclinado.',
  ARRAY[
    'Coloca una barra a la altura de la cintura',
    'Agarra la barra con las manos al ancho de los hombros',
    'Cuelga debajo de la barra con el cuerpo recto y los talones en el suelo',
    'Tira del pecho hacia la barra y baja de forma controlada'
  ],
  'strength',
  ARRAY['espalda', 'biceps'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 7. Superman
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Superman',
  'Ejercicio de peso corporal para fortalecer la espalda baja.',
  ARRAY[
    'Acuéstate boca abajo con los brazos extendidos hacia adelante',
    'Levanta simultáneamente los brazos, pecho y piernas del suelo',
    'Mantén la posición por 2-3 segundos',
    'Baja de forma controlada y repite'
  ],
  'strength',
  ARRAY['espalda', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 8. Remo Invertido
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Remo Invertido (Inverted Row)',
  'Ejercicio de tracción horizontal con peso corporal.',
  ARRAY[
    'Coloca una barra a la altura del pecho',
    'Agarra la barra con las manos al ancho de los hombros',
    'Cuelga debajo con el cuerpo recto y los talones en el suelo',
    'Tira del pecho hacia la barra apretando los omóplatos',
    'Baja de forma controlada'
  ],
  'strength',
  ARRAY['espalda', 'biceps'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 9. Pulldown con Agarre Cerrado
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Pulldown con Agarre Cerrado',
  'Variación del jalón al pecho que enfatiza los dorsales inferiores.',
  ARRAY[
    'Siéntate en la máquina de jalón con las rodillas aseguradas',
    'Agarra la barra con las manos juntas (agarre cerrado)',
    'Tira de la barra hacia el pecho superior',
    'Extiende los brazos de forma controlada y repite'
  ],
  'strength',
  ARRAY['espalda', 'biceps'],
  true
) ON CONFLICT (name) DO NOTHING;

-- 10. Peso Muerto Sumo
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Peso Muerto Sumo',
  'Variación del peso muerto con stance amplio que enfatiza los aductores.',
  ARRAY[
    'Coloca los pies más anchos que los hombros con los dedos apuntando hacia afuera',
    'Agarra la barra entre las piernas con las manos al ancho de los hombros',
    'Mantén la espalda recta y el pecho hacia arriba',
    'Levanta la barra extendiendo las caderas y rodillas',
    'Baja de forma controlada'
  ],
  'strength',
  ARRAY['espalda', 'piernas', 'gluteos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- HOMBROS (4 ejercicios)

-- 11. Pike Push-ups
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Pike Push-ups',
  'Ejercicio de peso corporal que simula el press militar.',
  ARRAY[
    'Comienza en posición de perro boca abajo (V invertida)',
    'Mantén las piernas rectas y las caderas elevadas',
    'Baja la cabeza hacia el suelo flexionando los codos',
    'Empuja hacia arriba hasta la posición inicial'
  ],
  'strength',
  ARRAY['hombros', 'triceps'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 12. Elevaciones Frontales con Mancuernas
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Elevaciones Frontales con Mancuernas',
  'Ejercicio de aislamiento para el deltoides anterior.',
  ARRAY[
    'De pie con una mancuerna en cada mano frente a los muslos',
    'Mantén los brazos ligeramente flexionados',
    'Levanta las mancuernas al frente hasta la altura de los hombros',
    'Baja de forma controlada y repite'
  ],
  'strength',
  ARRAY['hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 13. Pájaros (Rear Delt Fly)
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Pájaros (Rear Delt Fly)',
  'Ejercicio para desarrollar el deltoides posterior.',
  ARRAY[
    'Inclínate hacia adelante con la espalda recta',
    'Sostén mancuernas con los brazos colgando',
    'Levanta las mancuernas hacia los lados apretando los omóplatos',
    'Baja de forma controlada y repite'
  ],
  'strength',
  ARRAY['hombros', 'espalda'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 14. Arnold Press
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Arnold Press',
  'Variación avanzada del press de hombros con rotación.',
  ARRAY[
    'Siéntate con mancuernas a la altura de los hombros, palmas hacia ti',
    'Presiona las mancuernas hacia arriba mientras rotas las palmas hacia afuera',
    'Extiende completamente los brazos en la parte superior',
    'Invierte el movimiento bajando de forma controlada'
  ],
  'strength',
  ARRAY['hombros', 'triceps'],
  false
) ON CONFLICT (name) DO NOTHING;

-- BRAZOS (6 ejercicios)

-- 15. Fondos en Banco
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Fondos en Banco (Bench Dips)',
  'Ejercicio de peso corporal para tríceps.',
  ARRAY[
    'Coloca las manos en el borde de un banco detrás de ti',
    'Extiende las piernas al frente con los talones en el suelo',
    'Baja el cuerpo flexionando los codos hasta 90 grados',
    'Empuja hacia arriba hasta extender los brazos'
  ],
  'strength',
  ARRAY['triceps', 'hombros'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 16. Curl Martillo
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Curl Martillo (Hammer Curl)',
  'Variación del curl de bíceps que también trabaja el braquial.',
  ARRAY[
    'De pie con mancuernas a los lados, palmas enfrentadas',
    'Mantén los codos pegados al cuerpo',
    'Levanta las mancuernas hacia los hombros sin rotar las muñecas',
    'Baja de forma controlada y repite'
  ],
  'strength',
  ARRAY['biceps', 'antebrazos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 17. Curl Concentrado
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Curl Concentrado (Concentration Curl)',
  'Ejercicio de aislamiento para el pico del bíceps.',
  ARRAY[
    'Siéntate con las piernas abiertas',
    'Apoya el codo en el interior del muslo',
    'Levanta la mancuerna hacia el hombro con movimiento controlado',
    'Baja completamente y repite'
  ],
  'strength',
  ARRAY['biceps'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 18. Curl 21s
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Curl 21s',
  'Técnica avanzada de curl de bíceps con tres rangos de movimiento.',
  ARRAY[
    '7 repeticiones de la mitad inferior (desde abajo hasta 90 grados)',
    '7 repeticiones de la mitad superior (desde 90 grados hasta arriba)',
    '7 repeticiones de rango completo',
    'Completa las 21 repeticiones sin descanso'
  ],
  'strength',
  ARRAY['biceps'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 19. Extensión de Tríceps Acostado
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Extensión de Tríceps Acostado (Skull Crushers)',
  'Ejercicio de aislamiento para los tríceps.',
  ARRAY[
    'Acuéstate en un banco con una barra sobre el pecho',
    'Extiende los brazos hacia arriba perpendiculares al cuerpo',
    'Baja la barra hacia la frente flexionando solo los codos',
    'Extiende los brazos de vuelta a la posición inicial'
  ],
  'strength',
  ARRAY['triceps'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 20. Tríceps Kickback
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Tríceps Kickback',
  'Ejercicio de aislamiento para tríceps con mancuernas.',
  ARRAY[
    'Inclínate hacia adelante con la espalda recta',
    'Mantén el codo pegado al cuerpo y flexionado a 90 grados',
    'Extiende el brazo hacia atrás hasta que esté recto',
    'Regresa a la posición inicial de forma controlada'
  ],
  'strength',
  ARRAY['triceps'],
  false
) ON CONFLICT (name) DO NOTHING;

-- PIERNAS (6 ejercicios)

-- 21. Sentadilla Búlgara con Salto
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Sentadilla Búlgara con Salto',
  'Variación pliométrica de la sentadilla búlgara para potencia.',
  ARRAY[
    'Coloca un pie en un banco detrás de ti',
    'Baja en sentadilla con la pierna delantera',
    'Explota hacia arriba saltando con la pierna delantera',
    'Aterriza suavemente y repite'
  ],
  'strength',
  ARRAY['piernas', 'gluteos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 22. Pistol Squat
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Pistol Squat (Sentadilla a Una Pierna)',
  'Ejercicio avanzado de fuerza y equilibrio con una sola pierna.',
  ARRAY[
    'De pie sobre una pierna, extiende la otra al frente',
    'Baja lentamente manteniendo la pierna extendida elevada',
    'Desciende hasta que el glúteo casi toque el talón',
    'Empuja hacia arriba hasta la posición inicial'
  ],
  'strength',
  ARRAY['piernas', 'gluteos', 'core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 23. Sentadilla Frontal
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Sentadilla Frontal (Front Squat)',
  'Variación de sentadilla con la barra al frente que enfatiza los cuádriceps.',
  ARRAY[
    'Coloca la barra sobre los hombros frontales con los codos elevados',
    'Mantén el torso erguido y el core activado',
    'Baja en sentadilla manteniendo el pecho hacia arriba',
    'Empuja hacia arriba hasta la posición inicial'
  ],
  'strength',
  ARRAY['piernas', 'core'],
  true
) ON CONFLICT (name) DO NOTHING;

-- 24. Hack Squat
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Hack Squat',
  'Ejercicio en máquina para cuádriceps con soporte de espalda.',
  ARRAY[
    'Colócate en la máquina hack squat con la espalda contra el respaldo',
    'Pies al ancho de los hombros en la plataforma',
    'Baja flexionando las rodillas hasta 90 grados',
    'Empuja hacia arriba extendiendo las piernas'
  ],
  'strength',
  ARRAY['piernas'],
  true
) ON CONFLICT (name) DO NOTHING;

-- 25. Prensa de Piernas
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Prensa de Piernas (Leg Press)',
  'Ejercicio en máquina para desarrollo general de piernas.',
  ARRAY[
    'Siéntate en la máquina con la espalda firmemente apoyada',
    'Coloca los pies al ancho de los hombros en la plataforma',
    'Baja la plataforma flexionando las rodillas hasta 90 grados',
    'Empuja la plataforma hacia arriba sin bloquear las rodillas'
  ],
  'strength',
  ARRAY['piernas', 'gluteos'],
  true
) ON CONFLICT (name) DO NOTHING;

-- 26. Zancadas con Mancuernas
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Zancadas con Mancuernas (Dumbbell Lunges)',
  'Ejercicio unilateral para piernas con mancuernas.',
  ARRAY[
    'De pie con una mancuerna en cada mano a los lados',
    'Da un paso largo hacia adelante',
    'Baja hasta que ambas rodillas estén a 90 grados',
    'Empuja con la pierna delantera para volver a la posición inicial',
    'Alterna las piernas'
  ],
  'strength',
  ARRAY['piernas', 'gluteos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- CORE (4 ejercicios)

-- 27. Plancha Lateral
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Plancha Lateral (Side Plank)',
  'Ejercicio isométrico para los oblicuos y estabilidad del core.',
  ARRAY[
    'Acuéstate de lado apoyado en el antebrazo',
    'Eleva las caderas formando una línea recta del hombro al tobillo',
    'Mantén la posición sin dejar caer las caderas',
    'Repite del otro lado'
  ],
  'strength',
  ARRAY['core', 'oblicuos'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 28. Mountain Climbers
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Mountain Climbers (Escaladores)',
  'Ejercicio dinámico que combina core y cardio.',
  ARRAY[
    'Comienza en posición de plancha alta',
    'Lleva una rodilla hacia el pecho rápidamente',
    'Alterna las piernas en un movimiento de carrera',
    'Mantén el core activado y las caderas bajas'
  ],
  'strength',
  ARRAY['core', 'cuerpo-completo'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 29. Ab Wheel Rollout
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Ab Wheel Rollout (Rueda Abdominal)',
  'Ejercicio avanzado para el core con rueda abdominal.',
  ARRAY[
    'Arrodíllate con las manos en la rueda abdominal',
    'Rueda hacia adelante extendiendo el cuerpo',
    'Mantén el core activado para evitar arquear la espalda',
    'Regresa a la posición inicial usando los abdominales'
  ],
  'strength',
  ARRAY['core'],
  false
) ON CONFLICT (name) DO NOTHING;

-- 30. Cable Crunch
INSERT INTO exercises (
  name, description, instructions, category, body_zone, requires_machine
) VALUES (
  'Cable Crunch (Abdominales en Polea)',
  'Ejercicio de abdominales con resistencia constante.',
  ARRAY[
    'Arrodíllate frente a una polea alta con una cuerda',
    'Sostén la cuerda a los lados de la cabeza',
    'Flexiona el torso hacia abajo contrayendo los abdominales',
    'Regresa de forma controlada sin perder la tensión'
  ],
  'strength',
  ARRAY['core'],
  true
) ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Contar ejercicios nuevos
SELECT COUNT(*) as nuevos_ejercicios 
FROM exercises 
WHERE created_at > NOW() - INTERVAL '1 minute';

-- Ver total de ejercicios
SELECT COUNT(*) as total_ejercicios FROM exercises;
