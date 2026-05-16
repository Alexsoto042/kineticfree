import { supabase } from '../src/supabaseClient.ts';
import { exercises, routines } from '../src/exercises.ts';

async function migrateData() {
  console.log('Iniciando migración de datos a Supabase...');

  try {
    // Limpiar datos existentes para asegurar una migración limpia
    console.log('Limpiando tablas existentes...');
    const { error: deleteRoutinesError } = await supabase
      .from('routines')
      .delete()
      .neq('id', -1);
    if (deleteRoutinesError)
      console.error('Error limpiando rutinas:', deleteRoutinesError);

    const { error: deleteExercisesError } = await supabase
      .from('exercises')
      .delete()
      .neq('id', -1);
    if (deleteExercisesError)
      console.error('Error limpiando ejercicios:', deleteExercisesError);

    // Mapear los datos de ejercicios a snake_case
    const exercisesToInsert = exercises.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      instructions: e.instructions, // El dato ya es un array
      category: e.category,
      image: e.image,
      body_zone: e.body_zone, // Propiedad correcta y el dato ya es un array
      youtube_id: e.youtube_id, // Propiedad correcta
    }));

    // Mapear los datos de rutinas a snake_case
    const routinesToInsert = routines.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      difficulty: r.difficulty, // New field
      goal: r.goal,
      body_zone_focus: r.body_zone_focus, // Propiedad correcta y el dato ya es un array
      exercises: r.exercises,
    }));

    // Migrar ejercicios
    console.log('Migrando ejercicios...');
    const { data: exercisesData, error: exercisesError } = await supabase
      .from('exercises')
      .insert(exercisesToInsert)
      .select();

    if (exercisesError) {
      console.error('Error migrando ejercicios:', exercisesError);
    } else {
      console.log(
        `Se migraron ${exercisesData.length} ejercicios exitosamente.`
      );
    }

    // Migrar rutinas
    console.log('Migrando rutinas...');
    const { data: routinesData, error: routinesError } = await supabase
      .from('routines')
      .insert(routinesToInsert)
      .select();

    if (routinesError) {
      console.error('Error migrando rutinas:', routinesError);
    } else {
      console.log(`Se migraron ${routinesData.length} rutinas exitosamente.`);
    }

    console.log('¡Migración de datos completada!');
  } catch (error) {
    console.error('Ocurrió un error inesperado durante la migración:', error);
  }
}

migrateData();
