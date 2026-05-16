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

async function insertRoutines() {
  console.log('Inserting new routines...');
  try {
    const newExercises = [
      { name: 'Press de Banca con Barra', description: '...', instructions: [], category: 'strength', body_zone: ['pecho'] },
      { name: 'Sentadillas (Squats)', description: '...', instructions: [], category: 'strength', body_zone: ['piernas'] },
      { name: 'Peso Muerto (Deadlift)', description: '...', instructions: [], category: 'strength', body_zone: ['piernas'] },
      { name: 'Jalón al Pecho (Lat Pulldown)', description: '...', instructions: [], category: 'strength', body_zone: ['espalda'] },
      { name: 'Press Militar (Overhead Press)', description: '...', instructions: [], category: 'strength', body_zone: ['hombros'] },
      { name: 'Burpees', description: '...', instructions: [], category: 'cardio', body_zone: ['cuerpo-completo'] },
      { name: 'Swing con Kettlebell', description: '...', instructions: [], category: 'strength', body_zone: ['cuerpo-completo'] },
      { name: 'Saltos de Tijera (Jumping Jacks)', description: '...', instructions: [], category: 'cardio', body_zone: ['cuerpo-completo'] },
      { name: 'Escaladores (Mountain Climbers)', description: '...', instructions: [], category: 'cardio', body_zone: ['cuerpo-completo'] },
      { name: 'Sentadilla Goblet', description: '...', instructions: [], category: 'strength', body_zone: ['piernas'] },
    ];

    const { error: exerciseError } = await supabase.from('exercises').upsert(newExercises, { onConflict: 'name' });
    if (exerciseError) throw exerciseError;

    // Fetch IDs for exercises needed in routines
    const { data: exercises, error: fetchError } = await supabase
      .from('exercises')
      .select('id, name')
      .in('name', [
        'Press de Banca con Barra',
        'Sentadillas (Squats)',
        'Peso Muerto (Deadlift)',
        'Jalón al Pecho (Lat Pulldown)',
        'Press Militar (Overhead Press)',
        'Burpees',
        'Swing con Kettlebell',
        'Saltos de Tijera (Jumping Jacks)',
        'Escaladores (Mountain Climbers)',
        'Sentadilla Goblet',
      ]);

    if (fetchError) throw fetchError;

    const exerciseMap = new Map(exercises.map((ex) => [ex.name, ex.id]));

    const newRoutines = [
      {
        name: 'Fuerza Total',
        description:
          'Una rutina de 3 días para estimular el crecimiento muscular en todo el cuerpo.',
        category: 'strength',
        difficulty: 'intermedio',
        goal: 'muscle_gain',
        body_zone_focus: ['cuerpo-completo'],
        exercises: [
          exerciseMap.get('Press de Banca con Barra'),
          exerciseMap.get('Sentadillas (Squats)'),
          exerciseMap.get('Peso Muerto (Deadlift)'),
          exerciseMap.get('Jalón al Pecho (Lat Pulldown)'),
          exerciseMap.get('Press Militar (Overhead Press)'),
        ].filter(Boolean),
      },
      {
        name: 'Circuito Quema Grasa',
        description:
          'Un circuito de alta intensidad para maximizar la quema de calorías y mejorar la resistencia.',
        category: 'hybrid',
        difficulty: 'intermedio',
        goal: 'weight_loss',
        body_zone_focus: ['cuerpo-completo'],
        exercises: [
          exerciseMap.get('Burpees'),
          exerciseMap.get('Swing con Kettlebell'),
          exerciseMap.get('Saltos de Tijera (Jumping Jacks)'),
          exerciseMap.get('Escaladores (Mountain Climbers)'),
          exerciseMap.get('Sentadilla Goblet'),
        ].filter(Boolean),
      },
    ];

    const { data, error } = await supabase
      .from('routines')
      .upsert(newRoutines, { onConflict: 'name' })
      .select();

    if (error) {
      throw error;
    }

    if (data) {
      console.log(`Successfully inserted or updated ${data.length} routines.`);
    }
    console.log('Routine insertion process finished.');
  } catch (e) {
    console.error('Error inserting routines:', e.message);
  }
}

insertRoutines();
