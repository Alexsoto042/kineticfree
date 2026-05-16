import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import type { Routine, Exercise } from '../../../types';

interface ExerciseAlternative {
  exercise_id: number;
  alternative: Exercise;
}

export function useRoutineDetail(routineId: string | undefined) {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [routineExercises, setRoutineExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routineId) {
      setLoading(false);
      setError('No routine ID provided.');
      return;
    }

    async function fetchRoutineDetail() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch the routine itself
        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('*')
          .eq('id', routineId)
          .single();

        if (routineError)
          throw new Error(`Rutina no encontrada: ${routineError.message}`);
        setRoutine(routineData);

        // 2. Fetch the details for the exercises in the routine
        if (routineData?.exercises?.length > 0) {
          const exerciseIds = routineData.exercises;
          const { data: exercisesData, error: exercisesError } = await supabase
            .from('exercises')
            .select('id, name, description, instructions, category, image, gif_url, body_zone, youtube_id, calories_burned_per_minute, benefits, requires_machine')
            .in('id', exerciseIds);

          if (exercisesError)
            throw new Error(
              `Error al cargar los ejercicios: ${exercisesError.message}`
            );

          // 3. Fetch alternatives for all exercises in the routine in a single query
          const { data: alternativesData, error: alternativesError } =
            await supabase
              .from('exercise_alternatives')
              .select('exercise_id, alternative:alternative_id(id, name, description, instructions, category, image, gif_url, body_zone)') // Supabase can fetch the related record
              .in('exercise_id', exerciseIds);

          const typedAlternativesData = (alternativesData || []) as unknown as ExerciseAlternative[];

          if (alternativesError) {
            console.error(
              'Could not fetch alternatives, proceeding without them.',
              alternativesError
            );
          }

          // 4. Map alternatives to their parent exercises
          const exercisesWithAlternatives = (exercisesData || []).map(
            (exercise) => {
              const alternatives =
                typedAlternativesData
                  ?.filter((alt) => alt.exercise_id === exercise.id)
                  .map((alt) => alt.alternative)
                  .filter(Boolean) || [];
              return { ...exercise, alternatives };
            }
          );

          setRoutineExercises(exercisesWithAlternatives);
        } else {
          setRoutineExercises([]);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRoutineDetail();
  }, [routineId]);

  return { routine, routineExercises, setRoutineExercises, loading, error };
}
