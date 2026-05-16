import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { 'Authorization': req.headers.get('Authorization')! },
        },
      }
    );

    const payload = await req.json();
    const newWorkoutExerciseLog = payload.record;

    if (!newWorkoutExerciseLog) {
      return new Response(JSON.stringify({ error: 'No se encontró registro en el payload' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { workout_log_id, exercise_id, reps, weight } = newWorkoutExerciseLog;

    const { data: routineExercise, error: routineExerciseError } = await supabaseClient
      .from('routine_exercises')
      .select('id, prescribed_sets, prescribed_reps, prescribed_weight, is_adaptive')
      .eq('exercise_id', exercise_id)
      .single();

    if (routineExerciseError) {
      console.error('Error al obtener el ejercicio de la rutina:', routineExerciseError);
      return new Response(JSON.stringify({ error: 'Error al obtener el ejercicio de la rutina' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    if (!routineExercise.is_adaptive) {
      return new Response(JSON.stringify({ message: 'El ejercicio no es adaptativo, se omite.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let newPrescribedWeight = parseFloat(routineExercise.prescribed_weight);
    let newPrescribedReps = routineExercise.prescribed_reps;
    let newPrescribedSets = routineExercise.prescribed_sets;

    if (reps >= routineExercise.prescribed_reps && weight >= routineExercise.prescribed_weight) {
      newPrescribedWeight += 2.5;
    }

    const { error: updateError } = await supabaseClient
      .from('routine_exercises')
      .update({
        prescribed_weight: newPrescribedWeight.toString(),
        prescribed_reps: newPrescribedReps,
        prescribed_sets: newPrescribedSets,
      })
      .eq('id', routineExercise.id);

    if (updateError) {
      console.error('Error al actualizar el ejercicio de la rutina:', updateError);
      return new Response(JSON.stringify({ error: 'Error al actualizar el ejercicio de la rutina' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: '¡Plan de entrenamiento adaptado con éxito!' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error en la Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});