import type { Exercise, Routine } from './types';

export const exercises: Exercise[] = [
  {
    id: 1,
    name: 'Flexiones (Push-ups)',
    description:
      'Ejercicio clásico con peso corporal para pecho, hombros y tríceps.',
    instructions: [
      'Comienza en posición de plancha, baja el cuerpo hasta que el pecho casi toque el suelo y empuja hacia arriba.',
    ],
    category: 'strength',
    image: '/images/push-up.gif',
    body_zone: ['upper'],
    youtube_id: 'IODxDxX7oi4',
  },
  {
    id: 2,
    name: 'Sentadillas (Squats)',
    description:
      'Ejercicio fundamental del tren inferior que trabaja cuádriceps, isquiotibiales y glúteos.',
    instructions: [
      'Párate con los pies al ancho de los hombros, baja las caderas como si te sentaras en una silla, manteniendo el pecho erguido.',
    ],
    category: 'strength',
    image: '/images/squat.gif',
    body_zone: ['lower'],
    youtube_id: 'ultWZbZ7q20',
  },
  {
    id: 3,
    name: 'Plancha (Plank)',
    description:
      'Ejercicio de core que fortalece toda la sección media del cuerpo.',
    instructions: [
      'Mantén una posición de flexión, con el cuerpo en línea recta desde la cabeza hasta los talones.',
    ],
    category: 'strength',
    image: '/images/plank.gif',
    body_zone: ['core'],
    youtube_id: 'pSHjTRCQxIw',
  },
  {
    id: 4,
    name: 'Saltos de Tijera (Jumping Jacks)',
    description:
      'Ejercicio de cardio de cuerpo completo para calentar y elevar el ritmo cardíaco.',
    instructions: [
      'Salta mientras abres las piernas y llevas los brazos por encima de la cabeza, luego vuelve a la posición inicial.',
    ],
    category: 'cardio',
    image: '/images/jumping-jacks.gif',
    body_zone: ['full_body'],
    youtube_id: 'iSSAk4XCsRA',
  },
  {
    id: 5,
    name: 'Zancadas (Lunges)',
    description:
      'Excelente para trabajar la fuerza y el equilibrio de cada pierna de forma individual.',
    instructions: [
      'Da un paso hacia adelante con una pierna y baja las caderas hasta que ambas rodillas estén dobladas en un ángulo de 90 grados.',
    ],
    category: 'strength',
    image: '/images/lunges.gif',
    body_zone: ['lower'],
    youtube_id: 'QOVaHwm-Q6U',
  },
  {
    id: 6,
    name: 'Curl de Bíceps',
    description:
      'Ejercicio de aislamiento para los bíceps utilizando mancuernas.',
    instructions: [
      'De pie o sentado, sostén una mancuerna en cada mano con agarre supino. Flexiona los codos para levantar el peso hacia los hombros.',
    ],
    category: 'strength',
    image: '/images/bicep-curl.gif',
    body_zone: ['upper'],
    youtube_id: 'ykJmrZ5v0Oo',
  },
  {
    id: 7,
    name: 'Fondos de Tríceps (Tricep Dips)',
    description:
      'Ejercicio con peso corporal para tríceps, se puede hacer en un banco o silla.',
    instructions: [
      'Coloca las manos en un banco detrás de ti, baja el cuerpo y empuja hacia arriba usando los tríceps.',
    ],
    category: 'strength',
    image: '/images/tricep-dips.gif',
    body_zone: ['upper'],
    youtube_id: '0326dyf5J_4',
  },
  {
    id: 8,
    name: 'Peso Muerto (Deadlift)',
    description:
      'Movimiento compuesto para la cadena posterior: isquiotibiales, glúteos y espalda.',
    instructions: [
      'Levanta una barra o mancuernas del suelo extendiendo las caderas y las rodillas hasta ponerte de pie.',
    ],
    category: 'strength',
    image: '/images/deadlift.gif',
    body_zone: ['lower'],
    youtube_id: 'ytGaGIn3SjE',
  },
  {
    id: 9,
    name: 'Press Militar (Overhead Press)',
    description: 'Ejercicio de hombros para desarrollar fuerza y estabilidad.',
    instructions: [
      'Levanta una barra o mancuernas desde los hombros hasta por encima de la cabeza.',
    ],
    category: 'strength',
    image: '/images/overhead-press.gif',
    body_zone: ['upper'],
    youtube_id: '2yjwXTZQDDI',
  },
  {
    id: 10,
    name: 'Remo inclinado (Bent Over Row)',
    description:
      'Construye una espalda fuerte, trabajando los dorsales y romboides.',
    instructions: [
      'Con una barra o mancuernas, inclínate por la cintura y tira del peso hacia la parte baja del pecho.',
    ],
    category: 'strength',
    image: '/images/bent-over-row.gif',
    body_zone: ['upper'],
    youtube_id: 'vT2GjY_Umpw',
  },
  {
    id: 11,
    name: 'Prensa de Piernas (Leg Press)',
    description: 'Ejercicio de tren inferior realizado en máquina.',
    instructions: [
      'Siéntate en la máquina y empuja la plataforma con los pies.',
    ],
    category: 'strength',
    image: '/images/leg-press.jpg',
    body_zone: ['lower'],
    youtube_id: 'IZxyjW7MPJQ',
  },
  {
    id: 12,
    name: 'Elevación de Talones (Calf Raises)',
    description: 'Fortalece los músculos de las pantorrillas.',
    instructions: [
      'Ponte de pie y empuja con las puntas de los pies para elevar los talones.',
    ],
    category: 'strength',
    image: '/images/calf-raises.jpg',
    body_zone: ['lower'],
    youtube_id: 'JbyjN43haZE',
  },
  {
    id: 13,
    name: 'Giro Ruso (Russian Twist)',
    description: 'Ejercicio de core para los oblicuos.',
    instructions: [
      'Siéntate en el suelo, inclínate hacia atrás y gira el torso de lado a lado.',
    ],
    category: 'strength',
    image: '/images/russian-twist.jpg',
    body_zone: ['core'],
    youtube_id: 'wkD8rjkodUI',
  },
  {
    id: 14,
    name: 'Burpees',
    description: 'Ejercicio de alta intensidad para todo el cuerpo.',
    instructions: [
      'Desde una posición de pie, agáchate, patea hacia atrás a una plancha, haz una flexión, vuelve a la cuclilla y salta.',
    ],
    category: 'cardio',
    image: '/images/burpees.jpg',
    body_zone: ['full_body'],
    youtube_id: 'dZgVxmf6jkA',
  },
  {
    id: 15,
    name: 'Escaladores (Mountain Climbers)',
    description: 'Ejercicio de cardio y core que simula escalar.',
    instructions: [
      'En posición de plancha, lleva las rodillas al pecho de forma alterna.',
    ],
    category: 'cardio',
    image: '/images/mountain-climbers.jpg',
    body_zone: ['core'],
    youtube_id: 'cnyTQDSE884',
  },
  {
    id: 16,
    name: 'Dominadas (Pull-ups)',
    description:
      'Ejercicio del tren superior que trabaja la espalda y los bíceps.',
    instructions: [
      'Cuélgate de una barra y levanta el cuerpo hasta que la barbilla esté por encima de la barra.',
    ],
    category: 'strength',
    image: '/images/pull-up.jpg',
    body_zone: ['upper'],
    youtube_id: 'eGo4E9asPzU',
  },
  {
    id: 17,
    name: 'Puente de Glúteos (Glute Bridge)',
    description: 'Fortalece los glúteos y los isquiotibiales.',
    instructions: [
      'Acuéstate boca arriba con las rodillas dobladas y levanta las caderas del suelo.',
    ],
    category: 'strength',
    image: '/images/glute-bridge.jpg',
    body_zone: ['lower'],
    youtube_id: 'wPM8icPu6H8',
  },
  {
    id: 18,
    name: 'Estiramiento de Isquiotibiales',
    description: 'Estiramiento básico para la parte posterior de las piernas.',
    instructions: [
      'Siéntate en el suelo y estírate para tocarte los dedos de los pies.',
    ],
    category: 'flexibility',
    image: '/images/hamstring-stretch.jpg',
    body_zone: ['lower'],
    youtube_id: 'CoLp_l_i1vY',
  },
  {
    id: 19,
    name: 'Estiramiento de Cuádriceps',
    description: 'Estira la parte delantera de los muslos.',
    instructions: ['Ponte de pie y lleva un talón hacia el glúteo.'],
    category: 'flexibility',
    image: '/images/quad-stretch.jpg',
    body_zone: ['lower'],
    youtube_id: 'hP6CX_m9-uA',
  },
  {
    id: 20,
    name: 'Estiramiento de Pecho',
    description: 'Abre los músculos del pecho.',
    instructions: ['Junta las manos detrás de la espalda y estira los brazos.'],
    category: 'flexibility',
    image: '/images/chest-stretch.jpg',
    body_zone: ['upper'],
    youtube_id: 'NSaI3tMaxdM',
  },
  {
    id: 21,
    name: 'Rodillas Arriba (High Knees)',
    description: 'Ejercicio de cardio para aumentar la frecuencia cardíaca.',
    instructions: [
      'Corre en el sitio, levantando las rodillas lo más alto posible.',
    ],
    category: 'cardio',
    image: '/images/high-knees.jpg',
    body_zone: ['full_body'],
    youtube_id: 'QPfK5T-1ji4',
  },
  {
    id: 22,
    name: 'Plancha Lateral (Side Plank)',
    description: 'Ejercicio de core centrado en los oblicuos.',
    instructions: [
      'Apoya el cuerpo en un antebrazo, manteniendo el cuerpo en línea recta.',
    ],
    category: 'strength',
    image: '/images/side-plank.jpg',
    body_zone: ['core'],
    youtube_id: 'NXr4Fw8q60o',
  },
];

export const routines: Routine[] = [
  {
    id: 1,
    name: 'Fundamentos de Fuerza (Cuerpo Completo)',
    description:
      'Una rutina para principiantes para construir una base de fuerza sólida en todo el cuerpo.',
    category: 'strength',
    difficulty: 'principiante',
    goal: 'muscle_gain',
    body_zone_focus: ['full_body'],
    exercises: [2, 1, 10, 9, 3],
  },
  {
    id: 2,
    name: 'Potencia de Tren Superior',
    description:
      'Se enfoca en construir músculo y fuerza en pecho, espalda, hombros y brazos.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'muscle_gain',
    body_zone_focus: ['upper'],
    exercises: [16, 1, 9, 10, 6, 7],
  },
  {
    id: 3,
    name: 'Explosión de Tren Inferior',
    description:
      'Un entrenamiento completo para piernas y glúteos fuertes y definidos.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'muscle_gain',
    body_zone_focus: ['lower'],
    exercises: [2, 8, 5, 11, 17, 12],
  },
  {
    id: 4,
    name: 'Quema de Cardio de Alta Intensidad',
    description:
      'Una rutina para maximizar la quema de calorías y mejorar la resistencia cardiovascular.',
    category: 'cardio',
    difficulty: 'avanzado',
    goal: 'weight_loss',
    body_zone_focus: ['full_body'],
    exercises: [4, 14, 21, 15],
  },
  {
    id: 5,
    name: 'Enfriamiento de Core y Flexibilidad',
    description:
      'Una rutina ligera para fortalecer el core y enfriar con estiramientos esenciales.',
    category: 'hybrid',
    difficulty: 'principiante',
    goal: 'general_fitness',
    body_zone_focus: ['full_body'],
    exercises: [3, 13, 22, 18, 19, 20],
  },
  {
    id: 6,
    name: 'Circuito Quema-Grasa Rápido',
    description:
      'Un circuito de alta intensidad de 20 minutos para elevar tu metabolismo y quemar grasa.',
    category: 'hybrid',
    difficulty: 'intermedio',
    goal: 'weight_loss',
    body_zone_focus: ['full_body'],
    exercises: [14, 15, 21, 4, 3],
  },
  {
    id: 7,
    name: 'Cardio y Core Intenso',
    description:
      'Combina ejercicios de cardio con movimientos de core para un abdomen fuerte y mayor quema calórica.',
    category: 'hybrid',
    difficulty: 'intermedio',
    goal: 'weight_loss',
    body_zone_focus: ['core'],
    exercises: [15, 13, 22, 21, 3],
  },
  {
    id: 8,
    name: 'Fuerza para Perder Peso',
    description:
      'Levantar pesas también es clave para perder peso. Esta rutina construye músculo para aumentar tu metabolismo basal.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'weight_loss',
    body_zone_focus: ['full_body'],
    exercises: [2, 8, 10, 9, 5],
  },
  {
    id: 9,
    name: 'Intervalos de Alta Intensidad (HIIT)',
    description:
      'Alterna ráfagas cortas de ejercicio intenso con períodos de descanso o actividad de baja intensidad.',
    category: 'cardio',
    difficulty: 'avanzado',
    goal: 'weight_loss',
    body_zone_focus: ['full_body'],
    exercises: [14, 21, 4, 15],
  },
  {
    id: 10,
    name: 'Desafío de Resistencia de Tren Inferior',
    description:
      'Enfocado en piernas y glúteos con altas repeticiones para quemar calorías y tonificar.',
    category: 'hybrid',
    difficulty: 'intermedio',
    goal: 'endurance',
    body_zone_focus: ['lower'],
    exercises: [2, 5, 17, 12],
  },
  {
    id: 11,
    name: 'Cardio de Bajo Impacto',
    description:
      'Perfecto para proteger tus articulaciones mientras elevas tu ritmo cardíaco. Ideal para principiantes.',
    category: 'cardio',
    difficulty: 'principiante',
    goal: 'weight_loss',
    body_zone_focus: ['full_body'],
    exercises: [17, 21, 12, 19, 18],
  },
  {
    id: 12,
    name: 'MetCon (Acondicionamiento Metabólico)',
    description:
      'Una rutina corta y brutal para mejorar la capacidad cardiovascular y la quema de grasa post-entrenamiento.',
    category: 'hybrid',
    difficulty: 'avanzado',
    goal: 'weight_loss',
    body_zone_focus: ['full_body'],
    exercises: [8, 1, 14],
  },
  {
    id: 13,
    name: 'Activación de Cuerpo Completo',
    description:
      'Una rutina más ligera, ideal para días de recuperación activa o para empezar a moverse.',
    category: 'strength',
    difficulty: 'principiante',
    goal: 'general_fitness',
    body_zone_focus: ['full_body'],
    exercises: [1, 2, 17, 10, 20],
  },
  {
    id: 14,
    name: 'Enfoque en Abdominales y Cardio',
    description:
      'Quema grasa mientras esculpes tus abdominales con esta combinación de cardio y ejercicios de core.',
    category: 'hybrid',
    difficulty: 'intermedio',
    goal: 'weight_loss',
    body_zone_focus: ['core'],
    exercises: [21, 13, 15, 22],
  },
  {
    id: 15,
    name: 'Potencia y Cardio con Peso Corporal',
    description:
      'Desarrolla fuerza explosiva y resistencia cardiovascular sin necesidad de equipo.',
    category: 'hybrid',
    difficulty: 'avanzado',
    goal: 'endurance',
    body_zone_focus: ['full_body'],
    exercises: [2, 14, 5, 16],
  },
  {
    id: 16,
    name: 'Rutina de Flexibilidad para Perder Peso',
    description:
      'Mejora la recuperación y previene lesiones, un componente clave en cualquier plan de pérdida de peso.',
    category: 'flexibility',
    difficulty: 'principiante',
    goal: 'general_fitness',
    body_zone_focus: ['full_body'],
    exercises: [18, 19, 20],
  },
  {
    id: 17,
    name: 'Circuito de Fuerza y Resistencia',
    description:
      'Combina levantamiento de peso con menos descanso para mantener el ritmo cardíaco alto.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'weight_loss',
    body_zone_focus: ['full_body'],
    exercises: [9, 6, 7, 11],
  },
];
