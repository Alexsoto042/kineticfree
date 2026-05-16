import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { WorkoutLog } from '../types';
import { requestCache } from '../lib/requestCache';
import { createError } from '../lib/errorHandler';

export interface DashboardStats {
  exercise_count: number;
  routine_count: number;
  recent_workout_count: number;
  total_reps: number;
  total_weight_lifted: number;
  total_workouts: number;
}

export interface RecentWorkout extends WorkoutLog {
  routine_name: string;
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use request deduplication to prevent redundant calls
      await requestCache.dedupe('dashboard-data', async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch counts
        const { count: exercise_count } = await supabase
          .from('exercises')
          .select('* ', { count: 'exact', head: true });
        const { count: routine_count } = await supabase
          .from('routines')
          .select('* ', { count: 'exact', head: true });

        // Fetch recent workouts (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: recent_workout_count } = await supabase
          .from('workout_logs')
          .select('* ', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', sevenDaysAgo.toISOString());

        const { count: total_workouts } = await supabase
          .from('workout_logs')
          .select('* ', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch all workout logs for total reps and weight
        const { data: allWorkoutLogs, error: allLogsError } = await supabase
          .from('workout_logs')
          .select('reps, sets, weight')
          .eq('user_id', user.id);

        if (allLogsError) {
          throw createError('SERVER_ERROR', allLogsError.message, 'medium');
        }

        const total_reps = (allWorkoutLogs || []).reduce(
          (sum, log) => sum + (log.reps || 0) * (log.sets || 1),
          0
        );
        const total_weight_lifted = (allWorkoutLogs || []).reduce(
          (sum, log) =>
            sum + (log.weight || 0) * (log.reps || 0) * (log.sets || 1),
          0
        );

        setStats({
          exercise_count: exercise_count || 0,
          routine_count: routine_count || 0,
          recent_workout_count: recent_workout_count || 0,
          total_reps: total_reps,
          total_weight_lifted: total_weight_lifted,
          total_workouts: total_workouts || 0,
        });

        // Fetch last 5 workout logs with routine names
        const { data: recentWorkoutsData, error: recentWorkoutsError } =
          await supabase
            .from('workout_logs')
            .select(
              `
              id,
              created_at,
              routine_id,
              start_time,
              end_time,
              duration_seconds,
              routines (name)
            `
            )
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (recentWorkoutsError) {
          throw createError('SERVER_ERROR', recentWorkoutsError.message, 'medium');
        }

        const mappedWorkouts = (recentWorkoutsData || []).map(
          (log: any) => ({
            ...log,
            routine_name: log.routines?.name ?? 'Rutina no encontrada',
          })
        );

        setRecentWorkouts(mappedWorkouts);
      }, 10000); // 10 second TTL
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoizar valores derivados para evitar recalcular en cada render
  const hasData = useMemo(() => stats !== null, [stats]);
  const hasWorkouts = useMemo(() => recentWorkouts.length > 0, [recentWorkouts]);

  return { 
    stats, 
    recentWorkouts, 
    loading, 
    error,
    hasData,
    hasWorkouts,
    refetch: fetchDashboardData
  };
}
