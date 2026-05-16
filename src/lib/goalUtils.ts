import { supabase } from '../supabaseClient';
import type { WorkoutLog } from '../types';
import { Toast } from '@capacitor/toast';

/**
 * Checks completed workout logs against weightlifting goals and updates them if a new PR is set.
 * @param logs The workout logs that were just saved.
 */
export async function checkAndUpdateWeightGoals(logs: Partial<WorkoutLog>[]) {
  try {
    // 1. Get all 'in_progress' goals for weightlifting
    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('*')
      .eq('type', 'weight_lift')
      .eq('status', 'in_progress');

    if (goalsError) throw goalsError;
    if (!goals || goals.length === 0) return; // No relevant goals to check

    let updatedGoalsCount = 0;

    // 2. For each log, check if it sets a new record for a linked goal
    for (const log of logs) {
      if (!log.exercise_id || !log.weight) continue; // Skip logs without exercise or weight

      // Find the goal for this specific exercise
      const relevantGoal = goals.find((g) => g.exercise_id === log.exercise_id);

      if (relevantGoal && log.weight > relevantGoal.current_value) {
        // 3. If new PR for the goal, update the goal's current_value
        const { error: updateError } = await supabase
          .from('goals')
          .update({ current_value: log.weight })
          .eq('id', relevantGoal.id);

        if (updateError) {
          console.error(
            `Failed to update goal ${relevantGoal.id}:`,
            updateError
          );
          // Continue to the next log even if one update fails
        } else {
          updatedGoalsCount++;
          // Check if the goal is now completed
          if (log.weight >= relevantGoal.target_value) {
            await supabase
              .from('goals')
              .update({ status: 'completed' })
              .eq('id', relevantGoal.id);
            await Toast.show({ text: `¡Meta completada: ${relevantGoal.description}!`, duration: 'short' });
          }
        }
      }
    }

    if (updatedGoalsCount > 0) {
      await Toast.show({ text: `${updatedGoalsCount} meta(s) de progreso actualizadas.`, duration: 'short' });
    }
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : 'Failed to check/update goals';
    console.error(errorMessage);
    // We don't show a toast here to not bother the user with background task errors
  }
}
