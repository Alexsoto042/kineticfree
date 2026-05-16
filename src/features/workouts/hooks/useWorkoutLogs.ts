// src/features/workouts/hooks/useWorkoutLogs.ts
import { useState, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import type { WorkoutLog } from '../../../types';

export const useWorkoutLogs = () => {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWorkoutLogs = useCallback(
    async (userId: string, exerciseId: number) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId)
          .order('created_at', { ascending: true });
        if (error) throw error;
        setLogs(data || []);
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('Error fetching workout logs:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const saveWorkoutLogs = useCallback(
    async (sessionLogs: Partial<WorkoutLog>[]) => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const logsToInsert = sessionLogs.map((log) => ({
          ...log,
          user_id: user.id,
        }));

        const { error } = await supabase
          .from('workout_logs')
          .insert(logsToInsert);

        if (error) throw error;
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('Error saving workout logs:', error);
        // Re-throw the error to be caught by the caller
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { logs, loading, error, fetchWorkoutLogs, saveWorkoutLogs };
};
