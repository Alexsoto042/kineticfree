import { supabase } from '../supabaseClient';

interface NextRoutine {
  id: number;
  name: string;
  dayNumber: number;
}

/**
 * Get the next routine in the user's plan sequence
 */
export const getNextRoutine = async (
  userId: string,
  planRoutineIds: number[]
): Promise<NextRoutine | null> => {
  try {
    if (!planRoutineIds || planRoutineIds.length === 0) {
      return null;
    }

    // Get user's recent workout logs for this plan
    const { data: recentLogs, error: logsError } = await supabase
      .from('workout_logs')
      .select('routine_id, created_at')
      .eq('user_id', userId)
      .in('routine_id', planRoutineIds)
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) throw logsError;

    // Determine next routine in sequence
    let nextRoutineId: number;
    let dayNumber: number;

    if (!recentLogs || recentLogs.length === 0) {
      // No workouts yet, start with first routine
      nextRoutineId = planRoutineIds[0];
      dayNumber = 1;
    } else {
      // Find last completed routine
      const lastRoutineId = recentLogs[0].routine_id;
      const lastIndex = planRoutineIds.indexOf(lastRoutineId);

      if (lastIndex === -1) {
        // Last routine not in current plan, start from beginning
        nextRoutineId = planRoutineIds[0];
        dayNumber = 1;
      } else {
        // Get next routine in sequence (cycle back to start if at end)
        const nextIndex = (lastIndex + 1) % planRoutineIds.length;
        nextRoutineId = planRoutineIds[nextIndex];
        dayNumber = nextIndex + 1;
      }
    }

    // Fetch routine details
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .select('id, name')
      .eq('id', nextRoutineId)
      .single();

    if (routineError) throw routineError;

    return {
      id: routine.id,
      name: routine.name,
      dayNumber,
    };
  } catch (error) {
    console.error('Error getting next routine:', error);
    return null;
  }
};

/**
 * Get user's last used routine (regardless of plan)
 */
export const getLastUsedRoutine = async (
  userId: string
): Promise<{ id: number; name: string } | null> => {
  try {
    const { data: lastLog, error } = await supabase
      .from('workout_logs')
      .select('routine_id, routines(id, name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !lastLog) return null;

    const routine = (lastLog as any).routines;
    if (!routine) return null;
    
    return {
      id: routine.id,
      name: routine.name,
    };
  } catch (error) {
    console.error('Error getting last used routine:', error);
    return null;
  }
};
