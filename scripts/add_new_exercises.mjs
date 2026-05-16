import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials not found in .env file');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const NEW_EXERCISES = [
  {
    name: 'Press de Banca con Barra',
    description:
      'Ejercicio fundamental para el desarrollo del pecho, hombros y tríceps.',
    instructions: [
      'Acuéstate en un banco plano, agarra la barra con las manos un poco más anchas que los hombros.',
      'Baja la barra de forma controlada hasta que toque tu pecho.',
      'Empuja la barra hacia arriba con fuerza hasta que tus brazos estén completamente extendidos.',
    ],
    category: 'strength',
    body_zone: ['pecho', 'hombros', 'triceps'],
    requires_machine: true,
    image: '/images/barbell-bench-press.gif',
  },
  {
    name: 'Sentadilla Goblet',
    description:
      'Una variante de la sentadilla que es excelente para aprender la forma correcta y fortalecer el core.',
    instructions: [
      'Sostén una mancuerna o kettlebell verticalmente contra tu pecho.',
      'Baja tu cadera hacia atrás y hacia abajo, manteniendo la espalda recta y el pecho erguido.',
      'Sube a la posición inicial, empujando a través de tus talones.',
    ],
    category: 'strength',
    body_zone: ['piernas', 'gluteos', 'core'],
    requires_machine: false,
    image: '/images/goblet-squat.gif',
  },
  {
    name: 'Hip Thrust con Barra',
    description: 'El mejor ejercicio para aislar y fortalecer los glúteos.',
    instructions: [
      'Siéntate en el suelo con la parte superior de la espalda apoyada en un banco.',
      'Coloca una barra sobre tus caderas y rueda la barra hacia ti.',
      'Eleva tus caderas hacia el techo hasta que tu cuerpo forme una línea recta desde los hombros hasta las rodillas, apretando los glúteos.',
      'Baja las caderas de forma controlada.',
    ],
    category: 'strength',
    body_zone: ['gluteos', 'isquiotibiales'],
    requires_machine: true,
    image: '/images/hip-thrust.gif',
  },
  {
    name: 'Jalón al Pecho (Lat Pulldown)',
    description: 'Ejercicio clave para desarrollar una espalda ancha y fuerte.',
    instructions: [
      'Siéntate en la máquina de jalón al pecho y ajusta el soporte de las rodillas.',
      'Agarra la barra con un agarre ancho.',
      'Tira de la barra hacia abajo hasta la parte superior de tu pecho, apretando los músculos de la espalda.',
      'Regresa la barra a la posición inicial de forma controlada.',
    ],
    category: 'strength',
    body_zone: ['espalda', 'biceps'],
    requires_machine: true,
    image: '/images/lat-pulldown.gif',
  },
  {
    name: 'Swing con Kettlebell',
    description:
      'Un ejercicio explosivo de cuerpo completo, excelente para cardio y potencia.',
    instructions: [
      'Párate con los pies un poco más anchos que los hombros, sosteniendo una kettlebell con ambas manos.',
      'Dobla las caderas hacia atrás, permitiendo que la kettlebell se balancee entre tus piernas.',
      'Empuja las caderas hacia adelante con fuerza para levantar la kettlebell a la altura del pecho.',
      'Deja que la gravedad la baje y repite el movimiento de cadera.',
    ],
    category: 'cardio',
    body_zone: ['cuerpo-completo', 'isquiotibiales', 'gluteos'],
    requires_machine: false,
    image: '/images/kettlebell-swing.gif',
  },
];

async function insertData() {
  console.log('Inserting new exercises...');
  try {
    // Usamos `upsert` que es una forma más idiomática de manejar conflictos con Supabase
    const { data, error } = await supabase
      .from('exercises')
      .upsert(NEW_EXERCISES, { onConflict: 'name' })
      .select();

    if (error) {
      throw error;
    }

    if (data) {
      console.log(`Successfully inserted or updated ${data.length} exercises.`);
    }
    console.log('Exercise insertion process finished.');
  } catch (e) {
    console.error('Error inserting exercises:', e.message);
  }
}

insertData();
