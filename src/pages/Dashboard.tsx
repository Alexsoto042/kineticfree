import { useState, useEffect } from 'react';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { supabase } from '../supabaseClient';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import GoalWidget from '../components/dashboard/GoalWidget';
import StreakWidget from '../components/dashboard/StreakWidget';
import './Dashboard.css';
import type { RecentWorkout } from '../hooks/useDashboardData'; // Import RecentWorkout
import type { WorkoutLog, DashboardStats } from '../types'; // Import global types
import { withTimeout } from '../lib/supabaseUtils';
import { Capacitor } from '@capacitor/core';
import MobileTopBar from '../components/navigation/MobileTopBar';

import { useStreak } from '../hooks/useStreak';

interface DashboardProps {
  userId: string;
}

function Dashboard({ userId }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const { streak } = useStreak();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllDashboardData() {
      setLoading(true);
      setError(null);

      try {
        if (!userId) {
          setError('User not authenticated.');
          setLoading(false);
          return;
        }

        // --- Use the efficient RPC function for stats ---
        const fetchDashboardStats = async () => {
          const { data, error } = await withTimeout(
            supabase.rpc('get_user_profile_stats', { p_user_id: userId }),
            15000
          );
          if (error) throw error;
          return data;
        };

        // --- Recent Workouts Fetching (this is fine) ---
        const fetchRecentWorkouts = async () => {
          const { data: recentWorkoutsData, error: recentWorkoutsError } =
            await withTimeout(
              supabase
                .from('workout_logs')
                .select(
                  `
                *,
                routines (name)
              `
                )
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5),
              15000
            );

          if (recentWorkoutsError) throw recentWorkoutsError;

          return (recentWorkoutsData || []).map(
            (log: WorkoutLog & { routines: { name: string } | null }) => ({
              ...log,
              routine_name: log.routines?.name ?? 'Rutina no encontrada',
            })
          );
        };

        // --- Execute all fetches concurrently ---
        const [dashboardStats, recentWorkoutsData] =
          await Promise.all([
            fetchDashboardStats(),
            fetchRecentWorkouts(),
          ]);

        // --- Update all states at once ---
        setStats(dashboardStats);
        setRecentWorkouts(recentWorkoutsData);
      } catch (err: unknown) {
        const error = err as { message: string };
        setError(error.message || 'Failed to load dashboard data.');
      }
      finally {
        setLoading(false);
      }
    }

    fetchAllDashboardData();
  }, [userId]); // Only depend on userId

  if (loading) {
    return <LoadingOverlay message="Cargando panel..." />;
  }

  if (error) {
    return (
      <div className="error-message">Error loading dashboard: {error}</div>
    );
  }

  return (
    <div className="dashboard-container">
      {Capacitor.isNativePlatform() ? (
        <MobileTopBar />
      ) : (
        <header className="dashboard-header">
          <h1>Tu Panel</h1>
          <p>¡Bienvenido de nuevo! Aquí tienes un resumen de tu progreso.</p>
        </header>
      )}

      <StatsGrid stats={stats} streak={streak || 0} />

      <div className="dashboard-main-content">
        <div className="dashboard-left-column">
          <div className="card-base recent-activity">
            <h2>Actividad Reciente</h2>
            <RecentActivity workouts={recentWorkouts} />
          </div>
        </div>
        <div className="dashboard-right-column">
          <StreakWidget streak={streak || 0} />
          <div className="card-base goal-widget-container">
            <GoalWidget />
          </div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;