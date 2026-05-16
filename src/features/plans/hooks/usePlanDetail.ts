// src/hooks/usePlanDetail.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import type { Plan, Routine, Exercise, Recipe, PlanRecipe } from '../../../types';

export interface PlanRoutine extends Routine {
  day_of_week: number;
}

export const usePlanDetail = (planId: string | undefined) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [routines, setRoutines] = useState<PlanRoutine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }

    const fetchPlanDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch the plan itself
        const { data: planData, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('id', planId)
          .single();

        if (planError) throw planError;

        // Fetch recipes associated with the plan
        const { data: planRecipesData, error: planRecipesError } =
          await supabase
            .from('plan_recipes')
            .select('*, recipes!inner(*)')
            .eq('plan_id', planId);

        if (planRecipesError) throw planRecipesError;

        const recipes: PlanRecipe[] = planRecipesData.map((pr) => ({
          recipe: pr.recipes as Recipe,
          meal_type: pr.meal_type,
          day_of_week: pr.day_of_week,
        }));

        setPlan({ ...planData, recipes });

        // Fetch the routine IDs and day_of_week from the join table
        const { data: planRoutinesData, error: planRoutinesError } =
          await supabase
            .from('plan_routines')
            .select('routine_id, day_of_week')
            .eq('plan_id', planId);

        if (planRoutinesError) throw planRoutinesError;

        const routineIds = planRoutinesData.map((pr) => pr.routine_id);

        if (routineIds.length > 0) {
          // Fetch the actual routines
          const { data: routinesData, error: routinesError } = await supabase
            .from('routines')
            .select('*')
            .in('id', routineIds);

          if (routinesError) throw routinesError;

          // --- NEW LOGIC STARTS HERE ---

          // 1. Collect all unique exercise IDs from all routines
          const allExerciseIds: number[] = [];
          routinesData.forEach((routine) => {
            if (routine.exercises && Array.isArray(routine.exercises)) {
              routine.exercises.forEach((exerciseId: number) => {
                if (!allExerciseIds.includes(exerciseId)) {
                  allExerciseIds.push(exerciseId);
                }
              });
            }
          });

          let fullExercises: Exercise[] = [];
          if (allExerciseIds.length > 0) {
            // 2. Fetch full exercise objects
            const { data: exercisesData, error: exercisesError } =
              await supabase
                .from('exercises')
                .select('*')
                .in('id', allExerciseIds);

            if (exercisesError) throw exercisesError;
            fullExercises = exercisesData;
          }

          // 3. Map full exercise objects back to routines
          const routinesWithFullExercises = routinesData.map((routine) => {
            const exercisesForRoutine = (routine.exercises as number[])
              .map((exerciseId) =>
                fullExercises.find((ex) => ex.id === exerciseId)
              )
              .filter(Boolean) as Exercise[]; // Filter out any undefined if an exercise ID wasn't found

            return {
              ...routine,
              exercises: exercisesForRoutine, // Replace IDs with full objects
            };
          });

          // Combine routine data with day_of_week
          const combinedRoutines = planRoutinesData
            .map((pr) => {
              const routineDetail = routinesWithFullExercises.find(
                (r) => r.id === pr.routine_id
              );
              return {
                ...routineDetail,
                day_of_week: pr.day_of_week,
              };
            })
            .filter(Boolean) as PlanRoutine[];

          setRoutines(
            combinedRoutines.sort((a, b) => a.day_of_week - b.day_of_week)
          );
        }
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetail();
  }, [planId]);

  return { plan, routines, loading, error };
};
