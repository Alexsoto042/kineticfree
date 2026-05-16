import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials not found in .env file');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// --- 1. Define Data ---

const ALL_NEW_EXERCISES = [
  // Existing exercises from the script
  {
    name: 'Remo con Barra',
    description: 'Ejercicio fundamental para construir una espalda densa y fuerte, trabajando los dorsales, romboides y bíceps.',
    instructions: [
      'Inclina el torso hacia adelante manteniendo la espalda recta.',
      'Sujeta la barra con un agarre prono, un poco más ancho que los hombros.',
      'Tira de la barra hacia la parte baja de tu abdomen, apretando los músculos de la espalda.',
      'Baja la barra de forma controlada hasta la posición inicial.'
    ],
    category: 'strength',
    body_zone: ['espalda', 'biceps'],
    requires_machine: false,
    image: '/images/barbell-row.webm',
    alternative_names: ['Remo Sentado en Cable', 'Remo con Mancuerna (Serrucho)', 'Remo en Barra T'],
  },
  {
    name: 'Caminadora (Inclinación)',
    description: 'Cardio de baja intensidad para mejorar la resistencia y quemar calorías, con un enfoque en el trabajo de piernas y glúteos.',
    instructions: [
      'Selecciona una velocidad de caminata moderada (e.g., 5-6 km/h).',
      'Ajusta la inclinación a un nivel desafiante pero sostenible (e.g., 8-12%).',
      'Mantén una postura erguida y un ritmo constante durante el tiempo deseado.'
    ],
    category: 'cardio',
    body_zone: ['piernas', 'gluteos'],
    requires_machine: true,
    image: '/images/treadmill-incline.webm',
  },
  {
    name: 'Estiramientos Dinámicos',
    description: 'Una serie de movimientos fluidos para preparar los músculos y articulaciones para el ejercicio, mejorando la movilidad.',
    instructions: [
      'Realiza círculos con los brazos hacia adelante y hacia atrás.',
      'Haz balanceos de piernas hacia adelante y hacia los lados.',
      'Realiza rotaciones de torso de lado a lado.',
      'Completa con sentadillas sin peso para calentar las caderas y rodillas.'
    ],
    category: 'flexibility',
    body_zone: ['cuerpo-completo'],
    requires_machine: false,
    image: '/images/dynamic-stretches.webm',
  },
  {
    name: 'Press de Banca (10x10)',
    description: 'Versión de alto volumen del press de banca, diseñada para maximizar la hipertrofia en el pecho.',
    instructions: [
      'Usa un peso que puedas levantar 20 veces (aproximadamente el 60% de tu 1RM).',
      'Realiza 10 series de 10 repeticiones.',
      'Descansa exactamente 60 segundos entre cada serie.',
      'Si no completas las 10 repeticiones en una serie, mantén el peso para la siguiente. No bajes el peso.'
    ],
    category: 'strength',
    body_zone: ['pecho', 'triceps'],
    requires_machine: true,
    image: '/images/bench-press-gvt.png',
    alternative_names: ['Press Inclinado con Mancuernas', 'Aperturas en Máquina (Chest Fly)'],
  },
  // 20 New Exercises
  {
    name: 'Prensa de Piernas (Leg Press)',
    description: 'Un excelente ejercicio con máquina para desarrollar fuerza y volumen en cuádriceps, isquiotibiales y glúteos.',
    instructions: [
      'Siéntate en la máquina con la espalda y la cabeza apoyadas cómodamente.',
      'Coloca los pies en la plataforma a la anchura de los hombros.',
      'Baja la plataforma de forma controlada hasta que tus rodillas formen un ángulo de 90 grados.',
      'Empuja la plataforma con fuerza para volver a la posición inicial, sin bloquear las rodillas.'
    ],
    category: 'strength',
    body_zone: ['piernas', 'gluteos'],
    requires_machine: true,
    image: '/images/leg-press.gif',
    alternative_names: ['Sentadillas (Squats)', 'Zancada Búlgara'],
  },
  {
    name: 'Remo Sentado en Cable',
    description: 'Ejercicio de tracción con máquina de cable para fortalecer la espalda media y los dorsales.',
    instructions: [
      'Siéntate en la máquina con las rodillas ligeramente flexionadas y la espalda recta.',
      'Sujeta el agarre y tira de él hacia tu abdomen, apretando los omóplatos.',
      'Extiende los brazos de forma controlada para volver a la posición inicial.'
    ],
    category: 'strength',
    body_zone: ['espalda'],
    requires_machine: true,
    image: '/images/seated-cable-row.gif',
    alternative_names: ['Remo con Barra', 'Remo con Mancuerna (Serrucho)'],
  },
  {
    name: 'Aperturas en Máquina (Chest Fly)',
    description: 'Ejercicio de aislamiento con máquina para el pecho, enfocado en el pectoral mayor.',
    instructions: [
      'Ajusta el asiento para que los agarres queden a la altura del pecho.',
      'Sujeta los agarres y, con una ligera flexión de codos, junta los brazos frente a ti.',
      'Abre los brazos de forma controlada hasta sentir un estiramiento en el pecho.'
    ],
    category: 'strength',
    body_zone: ['pecho'],
    requires_machine: true,
    image: '/images/chest-fly-machine.gif',
    alternative_names: ['Aperturas con Mancuernas', 'Flexiones de Pecho'],
  },
  {
    name: 'Extensión de Cuádriceps (Leg Extension)',
    description: 'Ejercicio de aislamiento con máquina para los cuádriceps.',
    instructions: [
      'Siéntate en la máquina y ajusta el rodillo sobre tus tobillos.',
      'Extiende las piernas completamente, contrayendo los cuádriceps en la parte alta del movimiento.',
      'Baja el peso de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['piernas'],
    requires_machine: true,
    image: '/images/leg-extension.gif',
  },
  {
    name: 'Curl Femoral (Leg Curl)',
    description: 'Ejercicio de aislamiento con máquina para los isquiotibiales.',
    instructions: [
      'Acuéstate boca abajo en la máquina y ajusta el rodillo sobre tus tobillos.',
      'Flexiona las rodillas para llevar los talones hacia tus glúteos.',
      'Baja el peso de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['piernas'],
    requires_machine: true,
    image: '/images/leg-curl.gif',
    alternative_names: ['Peso Muerto Rumano'],
  },
  {
    name: 'Press de Hombros en Máquina',
    description: 'Ejercicio con máquina para desarrollar fuerza y tamaño en los deltoides.',
    instructions: [
      'Siéntate en la máquina y sujeta los agarres a la altura de los hombros.',
      'Empuja hacia arriba hasta extender los brazos casi por completo.',
      'Baja el peso de forma controlada a la posición inicial.'
    ],
    category: 'strength',
    body_zone: ['hombros'],
    requires_machine: true,
    image: '/images/shoulder-press-machine.gif',
    alternative_names: ['Press Militar (Overhead Press)', 'Press Inclinado con Mancuernas'],
  },
  {
    name: 'Curl de Bíceps en Máquina',
    description: 'Ejercicio de aislamiento con máquina para los bíceps.',
    instructions: [
      'Ajusta el asiento y sujeta los agarres con las palmas hacia arriba.',
      'Flexiona los codos para levantar el peso.',
      'Baja el peso de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['biceps'],
    requires_machine: true,
    image: '/images/bicep-curl-machine.gif',
    alternative_names: ['Curl de Bíceps con Barra'],
  },
  {
    name: 'Pushdown de Tríceps en Polea',
    description: 'Ejercicio de aislamiento con polea para los tríceps.',
    instructions: [
      'Sujeta una barra recta o una cuerda en la polea alta.',
      'Mantén los codos pegados al cuerpo y extiende los brazos hacia abajo.',
      'Vuelve a la posición inicial de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['triceps'],
    requires_machine: true,
    image: '/images/tricep-pushdown.gif',
    alternative_names: ['Fondos en Paralelas (Tricep Dips)'],
  },
  {
    name: 'Elevación de Gemelos en Máquina',
    description: 'Ejercicio de aislamiento con máquina para los gemelos.',
    instructions: [
      'Colócate en la máquina con las almohadillas sobre los hombros.',
      'Empuja hacia arriba con la punta de los pies, elevando los talones.',
      'Baja lentamente hasta sentir un estiramiento en los gemelos.'
    ],
    category: 'strength',
    body_zone: ['piernas'],
    requires_machine: true,
    image: '/images/calf-raises.gif',
  },
  {
    name: 'Press Inclinado con Mancuernas',
    description: 'Ejercicio con peso libre para enfocar el trabajo en la parte superior del pecho.',
    instructions: [
      'Acuéstate en un banco inclinado (30-45 grados) con una mancuerna en cada mano.',
      'Empuja las mancuernas hacia arriba hasta que los brazos estén extendidos.',
      'Baja las mancuernas de forma controlada a los lados del pecho.'
    ],
    category: 'strength',
    body_zone: ['pecho', 'hombros'],
    requires_machine: false,
    image: '/images/incline-dumbbell-press.gif',
    alternative_names: ['Press de Banca con Barra', 'Press de Hombros en Máquina'],
  },
  {
    name: 'Aperturas con Mancuernas',
    description: 'Ejercicio de aislamiento con peso libre para el pecho.',
    instructions: [
      'Acuéstate en un banco plano con una mancuerna en cada mano, brazos extendidos sobre el pecho.',
      'Con una ligera flexión de codos, abre los brazos hacia los lados.',
      'Vuelve a la posición inicial contrayendo el pecho.'
    ],
    category: 'strength',
    body_zone: ['pecho'],
    requires_machine: false,
    image: '/images/dumbbell-flyes.gif',
    alternative_names: ['Aperturas en Máquina (Chest Fly)'],
  },
  {
    name: 'Elevaciones Laterales con Mancuernas',
    description: 'Ejercicio de aislamiento con peso libre para los deltoides laterales.',
    instructions: [
      'De pie, con una mancuerna en cada mano a los lados.',
      'Eleva los brazos hacia los lados hasta que estén paralelos al suelo.',
      'Baja las mancuernas de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['hombros'],
    requires_machine: false,
    image: '/images/lateral-raises.gif',
  },
  {
    name: 'Remo con Mancuerna (Serrucho)',
    description: 'Ejercicio unilateral con peso libre para la espalda.',
    instructions: [
      'Apoya una rodilla y una mano en un banco plano.',
      'Con la otra mano, sujeta una mancuerna y tira de ella hacia tu cadera.',
      'Baja la mancuerna de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['espalda', 'biceps'],
    requires_machine: false,
    image: '/images/dumbbell-row.gif',
    alternative_names: ['Remo con Barra', 'Remo Sentado en Cable'],
  },
  {
    name: 'Peso Muerto Rumano',
    description: 'Ejercicio con peso libre enfocado en isquiotibiales y glúteos.',
    instructions: [
      'De pie, con una barra o mancuernas frente a tus muslos.',
      'Con las rodillas casi rectas, baja el torso manteniendo la espalda recta.',
      'Vuelve a la posición inicial contrayendo los glúteos e isquiotibiales.'
    ],
    category: 'strength',
    body_zone: ['piernas', 'gluteos'],
    requires_machine: false,
    image: '/images/romanian-deadlift.gif',
    alternative_names: ['Peso Muerto (Deadlift)', 'Curl Femoral (Leg Curl)'],
  },
  {
    name: 'Zancada Búlgara',
    description: 'Ejercicio unilateral para piernas y glúteos que desafía el equilibrio.',
    instructions: [
      'Coloca el empeine de un pie en un banco detrás de ti.',
      'Baja la cadera hasta que tu muslo delantero esté paralelo al suelo.',
      'Vuelve a la posición inicial empujando con el pie delantero.'
    ],
    category: 'strength',
    body_zone: ['piernas', 'gluteos'],
    requires_machine: false,
    image: '/images/bulgarian-split-squat.gif',
    alternative_names: ['Sentadillas (Squats)', 'Prensa de Piernas (Leg Press)'],
  },
  {
    name: 'Elevaciones de Piernas Colgado',
    description: 'Ejercicio avanzado de peso corporal para el abdomen inferior.',
    instructions: [
      'Cuélgate de una barra de dominadas.',
      'Eleva las piernas (rectas o flexionadas) lo más alto que puedas.',
      'Baja las piernas de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['core'],
    requires_machine: false,
    image: '/images/hanging-leg-raises.gif',
  },
  {
    name: 'Face Pulls',
    description: 'Ejercicio con polea para la salud de los hombros y la espalda alta.',
    instructions: [
      'Ajusta una polea con cuerda a la altura del pecho.',
      'Tira de la cuerda hacia tu cara, separando las manos al final del movimiento.',
      'Vuelve a la posición inicial de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['hombros', 'espalda'],
    requires_machine: true,
    image: '/images/face-pulls.gif',
  },
  {
    name: 'Hip Thrust',
    description: 'El mejor ejercicio para construir fuerza y tamaño en los glúteos.',
    instructions: [
      'Apoya la parte superior de la espalda en un banco.',
      'Con una barra sobre la cadera, empuja la cadera hacia arriba hasta que tu cuerpo forme una línea recta.',
      'Baja la cadera de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['gluteos', 'piernas'],
    requires_machine: false,
    image: '/images/hip-thrust.gif',
  },
  {
    name: 'Remo en Barra T',
    description: 'Ejercicio de remo pesado para construir una espalda densa.',
    instructions: [
      'Coloca un extremo de una barra en una esquina.',
      'Carga el otro extremo y, usando un agarre en V, tira del peso hacia tu pecho.',
      'Baja el peso de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['espalda'],
    requires_machine: false, // Can be done with machine or free weight
    image: '/images/t-bar-row.gif',
    alternative_names: ['Remo con Barra'],
  },
  {
    name: 'Dominadas (Pull-ups)',
    description: 'Ejercicio de peso corporal fundamental para una espalda ancha y brazos fuertes.',
    instructions: [
      'Sujeta una barra con las palmas mirando hacia afuera.',
      'Tira de tu cuerpo hacia arriba hasta que tu barbilla pase la barra.',
      'Baja de forma controlada.'
    ],
    category: 'strength',
    body_zone: ['espalda', 'biceps'],
    requires_machine: false,
    image: '/images/pull-up.gif',
    alternative_names: ['Jalón al Pecho (Lat Pulldown)'],
  },
];

// Define the new routines, referencing exercises by name
const ALL_NEW_ROUTINES = [
  {
    name: 'Tren Superior - Empuje (Intermedio)',
    description: 'Rutina enfocada en la fuerza y el tamaño de pecho, hombros y tríceps.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'muscle_gain',
    body_zone_focus: ['pecho', 'hombros', 'triceps'],
    exercises: ['Press de Banca con Barra', 'Press Inclinado con Mancuernas', 'Press de Hombros en Máquina', 'Elevaciones Laterales con Mancuernas', 'Pushdown de Tríceps en Polea'],
  },
  {
    name: 'Tren Inferior - Fuerza (Intermedio)',
    description: 'Rutina para construir una base sólida, enfocada en la fuerza de piernas y glúteos.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'muscle_gain',
    body_zone_focus: ['piernas', 'gluteos'],
    exercises: ['Sentadillas (Squats)', 'Peso Muerto Rumano', 'Prensa de Piernas (Leg Press)', 'Curl Femoral (Leg Curl)', 'Elevación de Gemelos en Máquina'],
  },
  {
    name: 'Tren Superior - Tracción (Intermedio)',
    description: 'Rutina para desarrollar una espalda ancha y brazos fuertes.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'muscle_gain',
    body_zone_focus: ['espalda', 'biceps'],
    exercises: ['Dominadas (Pull-ups)', 'Remo con Barra', 'Remo Sentado en Cable', 'Face Pulls', 'Curl de Bíceps con Barra'],
  },
  {
    name: 'Cardio y Core (Intermedio)',
    description: 'Sesión de alta intensidad para mejorar la resistencia cardiovascular y fortalecer el abdomen.',
    category: 'hybrid',
    difficulty: 'intermedio',
    goal: 'weight_loss',
    body_zone_focus: ['cuerpo-completo', 'core'],
    exercises: ['Burpees', 'Escaladores (Mountain Climbers)', 'Plancha', 'Elevaciones de Piernas Colgado'],
  },
  {
    name: 'Cuerpo Completo A (Principiante)',
    description: 'Primera sesión de la semana para acondicionamiento físico general.',
    category: 'strength',
    difficulty: 'principiante',
    goal: 'general_fitness',
    body_zone_focus: ['cuerpo-completo'],
    exercises: ['Sentadilla Goblet', 'Flexiones de Pecho', 'Remo con Mancuerna (Serrucho)', 'Plancha'],
  },
  {
    name: 'Cuerpo Completo B (Principiante)',
    description: 'Segunda sesión de la semana para acondicionamiento físico general.',
    category: 'strength',
    difficulty: 'principiante',
    goal: 'general_fitness',
    body_zone_focus: ['cuerpo-completo'],
    exercises: ['Prensa de Piernas (Leg Press)', 'Jalón al Pecho (Lat Pulldown)', 'Press de Hombros en Máquina', 'Escaladores (Mountain Climbers)'],
  },
  {
    name: 'Cuerpo Completo C (Principiante)',
    description: 'Tercera sesión de la semana para acondicionamiento físico general.',
    category: 'strength',
    difficulty: 'principiante',
    goal: 'general_fitness',
    body_zone_focus: ['cuerpo-completo'],
    exercises: ['Zancada Búlgara', 'Remo Sentado en Cable', 'Aperturas en Máquina (Chest Fly)', 'Burpees'],
  },
  {
    name: 'Cardio Ligero y Movilidad',
    description: 'Una sesión suave para recuperación activa, mejorando el flujo sanguíneo y la flexibilidad.',
    category: 'cardio',
    difficulty: 'principiante',
    goal: 'general_fitness',
    body_zone_focus: ['cuerpo-completo'],
    exercises: ['Caminadora (Inclinación)', 'Estiramientos Dinámicos'],
  },
  {
    name: 'GVT: Pecho y Tríceps',
    description: 'Rutina de alto volumen (10x10) para una hipertrofia máxima del pecho, con trabajo accesorio de tríceps.',
    category: 'strength',
    difficulty: 'avanzado',
    goal: 'muscle_gain',
    body_zone_focus: ['pecho', 'triceps'],
    exercises: ['Press de Banca (10x10)', 'Fondos en Paralelas (Tricep Dips)', 'Aperturas con Mancuernas'],
  },
  {
    name: 'GVT: Espalda y Bíceps',
    description: 'Rutina de alto volumen (10x10) para construir una espalda masiva, con trabajo accesorio de bíceps.',
    category: 'strength',
    difficulty: 'avanzado',
    goal: 'muscle_gain',
    body_zone_focus: ['espalda', 'biceps'],
    exercises: ['Remo con Barra', 'Dominadas (Pull-ups)', 'Curl de Bíceps en Máquina'],
  },
  {
    name: 'PPL - Empuje (Push)',
    description: 'Día de empuje del PPL, enfocado en pecho, hombros y tríceps.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'muscle_gain',
    body_zone_focus: ['pecho', 'hombros', 'triceps'],
    exercises: ['Press de Banca con Barra', 'Press de Hombros en Máquina', 'Press Inclinado con Mancuernas', 'Elevaciones Laterales con Mancuernas', 'Pushdown de Tríceps en Polea'],
  },
  {
    name: 'PPL - Tracción (Pull)',
    description: 'Día de tracción del PPL, enfocado en espalda y bíceps.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'muscle_gain',
    body_zone_focus: ['espalda', 'biceps'],
    exercises: ['Peso Muerto (Deadlift)', 'Dominadas (Pull-ups)', 'Remo con Barra', 'Face Pulls', 'Curl de Bíceps con Barra'],
  },
  {
    name: 'PPL - Pierna (Legs)',
    description: 'Día de pierna del PPL, enfocado en cuádriceps, isquiotibiales y glúteos.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'muscle_gain',
    body_zone_focus: ['piernas', 'gluteos'],
    exercises: ['Sentadillas (Squats)', 'Peso Muerto Rumano', 'Prensa de Piernas (Leg Press)', 'Zancada Búlgara', 'Elevación de Gemelos en Máquina'],
  },
];

// Define the new plans
const ALL_NEW_PLANS = [
  {
    name: 'Entrenamiento de Cuerpo Completo para Principiantes (3 Días)',
    description: 'Un plan de 3 días a la semana que combina entrenamiento de fuerza de cuerpo completo con cardio ligero para una base física sólida.',
    goal_id: 'general_fitness',
    duration_weeks: 4,
    difficulty: 'principiante',
  },
  {
    name: 'Volumen Alemán (GVT) - Pecho y Espalda',
    description: 'Un plan de entrenamiento de 2 días a la semana de alta intensidad y volumen, enfocado en la hipertrofia de pecho y espalda. Solo para avanzados.',
    goal_id: 'muscle_gain',
    duration_weeks: 4,
    difficulty: 'avanzado',
  },
  {
    name: 'Push/Pull/Legs (PPL) para Intermedios (6 Días)',
    description: 'Un plan de 6 días a la semana basado en la división Push/Pull/Legs, ideal para intermedios que buscan maximizar la hipertrofia.',
    goal_id: 'muscle_gain',
    duration_weeks: 8,
    difficulty: 'intermedio',
  },
];

// --- 2. Execution Logic ---

async function createAndLinkPlans() {
  try {
    // Step 1: Upsert exercises
    console.log('Upserting exercises...');
    // We need to remove alternative_names before upserting, as it's not a real column
    const exercisesToUpsert = ALL_NEW_EXERCISES.map(({ alternative_names, ...rest }) => rest);
    const { error: exerciseError } = await supabase.from('exercises').upsert(exercisesToUpsert, { onConflict: 'name' });
    if (exerciseError) throw new Error(`Error upserting exercises: ${exerciseError.message}`);
    console.log('Exercises upserted successfully.');

    // Step 2: Get all necessary exercise IDs
    const allExerciseNames = [...new Set(ALL_NEW_EXERCISES.map(e => e.name))];
    const { data: exercises, error: fetchExError } = await supabase.from('exercises').select('id, name').in('name', allExerciseNames);
    if (fetchExError) throw new Error(`Error fetching exercises: ${fetchExError.message}`);
    const exerciseMap = new Map(exercises.map(ex => [ex.name, ex.id]));
    console.log('Fetched all exercise IDs.');

    // Step 3: Prepare and upsert exercise alternatives
    console.log('Preparing exercise alternatives...');
    const alternativeLinks = [];
    for (const exercise of ALL_NEW_EXERCISES) {
      if (exercise.alternative_names && exercise.alternative_names.length > 0) {
        const exerciseId = exerciseMap.get(exercise.name);
        if (exerciseId) {
          for (const altName of exercise.alternative_names) {
            const alternativeId = exerciseMap.get(altName);
            if (alternativeId) {
              alternativeLinks.push({
                exercise_id: exerciseId,
                alternative_id: alternativeId,
              });
            }
          }
        }
      }
    }

    if (alternativeLinks.length > 0) {
      console.log('Upserting exercise alternatives...');
      const { error: altError } = await supabase.from('exercises_alternatives').upsert(alternativeLinks, { onConflict: 'exercise_id, alternative_id' });
      if (altError) throw new Error(`Error upserting exercise alternatives: ${altError.message}`);
      console.log('Exercise alternatives upserted successfully.');
    }

    // Step 4: Replace exercise names with IDs in routines
    const routinesWithIds = ALL_NEW_ROUTINES.map(routine => ({
      ...routine,
      exercises: routine.exercises.map(exName => exerciseMap.get(exName)).filter(Boolean),
    }));

    // Step 5: Upsert routines
    console.log('Upserting routines...');
    const { data: insertedRoutines, error: routineError } = await supabase.from('routines').upsert(routinesWithIds, { onConflict: 'name' }).select('id, name');
    if (routineError) throw new Error(`Error upserting routines: ${routineError.message}`);
    const routineMap = new Map(insertedRoutines.map(r => [r.name, r.id]));
    console.log('Routines upserted successfully.');

    // Step 6: Upsert plans
    console.log('Upserting plans...');

    // Fetch existing plans to determine if we need to generate new IDs or use existing ones
    const { data: existingPlans, error: fetchPlansError } = await supabase.from('plans').select('id, name');
    if (fetchPlansError) throw new Error(`Error fetching existing plans: ${fetchPlansError.message}`);
    const existingPlanMap = new Map(existingPlans.map(p => [p.name, p.id]));

    const plansToUpsert = ALL_NEW_PLANS.map(plan => {
      const existingId = existingPlanMap.get(plan.name);
      return {
        id: existingId || uuidv4(), // Use existing ID or generate a new one
        ...plan,
      };
    });

    const { data: insertedPlans, error: planError } = await supabase.from('plans').upsert(plansToUpsert, { onConflict: 'name' }).select('id, name');
    if (planError) throw new Error(`Error upserting plans: ${planError.message}`);
    const planMap = new Map(insertedPlans.map(p => [p.name, p.id]));
    console.log('Plans upserted successfully.');

    // Step 7: Prepare and upsert plan-routine links
    console.log('Preparing plan-routine links...');
    const planRoutinesLinks = [
      // Links for "Entrenamiento de Cuerpo Completo para Principiantes (3 Días)"
      { plan_id: planMap.get('Entrenamiento de Cuerpo Completo para Principiantes (3 Días)'), routine_id: routineMap.get('Cuerpo Completo A (Principiante)'), day_of_week: 1 },
      { plan_id: planMap.get('Entrenamiento de Cuerpo Completo para Principiantes (3 Días)'), routine_id: routineMap.get('Cardio Ligero y Movilidad'), day_of_week: 2 },
      { plan_id: planMap.get('Entrenamiento de Cuerpo Completo para Principiantes (3 Días)'), routine_id: routineMap.get('Cuerpo Completo B (Principiante)'), day_of_week: 3 },
      { plan_id: planMap.get('Entrenamiento de Cuerpo Completo para Principiantes (3 Días)'), routine_id: routineMap.get('Cardio Ligero y Movilidad'), day_of_week: 4 },
      { plan_id: planMap.get('Entrenamiento de Cuerpo Completo para Principiantes (3 Días)'), routine_id: routineMap.get('Cuerpo Completo C (Principiante)'), day_of_week: 5 },

      // Links for "Volumen Alemán (GVT) - Pecho y Espalda"
      { plan_id: planMap.get('Volumen Alemán (GVT) - Pecho y Espalda'), routine_id: routineMap.get('GVT: Pecho y Tríceps'), day_of_week: 1 },
      { plan_id: planMap.get('Volumen Alemán (GVT) - Pecho y Espalda'), routine_id: routineMap.get('GVT: Espalda y Bíceps'), day_of_week: 4 },

      // Links for "Push/Pull/Legs (PPL) para Intermedios (6 Días)"
      { plan_id: planMap.get('Push/Pull/Legs (PPL) para Intermedios (6 Días)'), routine_id: routineMap.get('PPL - Empuje (Push)'), day_of_week: 1 },
      { plan_id: planMap.get('Push/Pull/Legs (PPL) para Intermedios (6 Días)'), routine_id: routineMap.get('PPL - Tracción (Pull)'), day_of_week: 2 },
      { plan_id: planMap.get('Push/Pull/Legs (PPL) para Intermedios (6 Días)'), routine_id: routineMap.get('PPL - Pierna (Legs)'), day_of_week: 3 },
      { plan_id: planMap.get('Push/Pull/Legs (PPL) para Intermedios (6 Días)'), routine_id: routineMap.get('PPL - Empuje (Push)'), day_of_week: 4 },
      { plan_id: planMap.get('Push/Pull/Legs (PPL) para Intermedios (6 Días)'), routine_id: routineMap.get('PPL - Tracción (Pull)'), day_of_week: 5 },
      { plan_id: planMap.get('Push/Pull/Legs (PPL) para Intermedios (6 Días)'), routine_id: routineMap.get('PPL - Pierna (Legs)'), day_of_week: 6 },

    ].filter(link => link.plan_id && link.routine_id); // Filter out any potential undefined IDs

    console.log('Upserting plan-routine links...');
    const { error: linkError } = await supabase.from('plan_routines').upsert(planRoutinesLinks);
    if (linkError) throw new Error(`Error upserting plan_routines: ${linkError.message}`);
    console.log('Plan-routine links upserted successfully.');

    console.log('\n✅ Process finished successfully!');

  } catch (e) {
    console.error('❌ An error occurred:', e.message);
  }
}

createAndLinkPlans();
