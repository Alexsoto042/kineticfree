import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useUserStore } from '../store/userStore';
import type { WeeklyActivityData } from '../components/charts/WeeklyActivityChart';
import { FaTrophy } from 'react-icons/fa';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { useToasts } from '../hooks/useToasts';
import { AchievementList } from '../components/achievements/AchievementList';
import BodyMetricsForm from '../components/body_metrics/BodyMetricsForm';
import BodyMetricsChart from '../components/body_metrics/BodyMetricsChart';
import ExerciseVolumeChart from '../components/charts/ExerciseVolumeChart';
import WeeklyActivityChart from '../components/charts/WeeklyActivityChart';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { achievements } from '../achievements';
import { Tabs, Tab } from '../components/ui/Tabs';
import { Button } from '../components/ui/Button/Button';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { useGoals } from '../hooks/useGoals';
import UserPostsFeed from '../components/profile/UserPostsFeed';
import type {
  BodyMetric,
  BodyMetricInsert,
  BodyMetricType,
  DashboardStats,
  UnlockedAchievement,
} from '../types';
import './Profile.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStreak } from '../hooks/useStreak';
import { useValidatedForm } from '../hooks/useValidatedForm';
import { usernameSchema } from '../lib/validation';
import { z } from 'zod';

interface PersonalRecord {
  exercise_id: number;
  exercise_name: string;
  max_weight: number;
}

const tabLabels = ['Progreso', 'Logros y Récords', 'Mis Publicaciones', 'Configuración', 'Métricas'];

// Schema de validación para edición de perfil
const profileEditSchema = z.object({
  username: usernameSchema,
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

function Profile() {
  const { profile, setProfile, session } = useUserStore();
  const { showSuccessToast, showErrorToast } = useToasts();
  const { streak } = useStreak();
  const { goals } = useGoals();
  const [activeTab, setActiveTab] = useState(0);
  const [weeklyActivity, setWeeklyActivity] = useState<WeeklyActivityData | null>(null);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Form validation hook para edición de perfil
  const {
    isSubmitting: isUpdatingProfile,
    getFieldProps,
    getFieldError,
    hasFieldError,
    handleSubmit: handleProfileUpdate,
    setValues,
  } = useValidatedForm<ProfileEditFormData>({
    schema: profileEditSchema,
    initialValues: {
      username: profile?.full_name || '',
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (data) => {
      if (!profile) return;

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({ id: profile.id, username: data.username });

      if (updateError) throw updateError;

      setProfile({ ...profile, full_name: data.username });
      showSuccessToast('Perfil actualizado con éxito!');
    },
  });

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    const tabName = tabLabels[index].toLowerCase().replace(/\s+/g, '-').replace(/ó/g, 'o').replace(/é/g, 'e');
    navigate(`#${tabName}`);
  };

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    const tabIndex = tabLabels.findIndex(label => {
      const normalizedLabel = label.toLowerCase().replace(/\s+/g, '-').replace(/ó/g, 'o').replace(/é/g, 'e');
      return normalizedLabel === hash;
    });
    if (tabIndex !== -1) {
      setActiveTab(tabIndex);
    } else if (hash === '') {
      setActiveTab(0);
    }
  }, [location]);

  const fetchBodyMetrics = useCallback(
    async (metricType?: BodyMetricType) => {
      if (!profile?.id) return;
      try {
        let query = supabase
          .from('body_metrics')
          .select('*')
          .eq('user_id', profile.id)
          .order('recorded_at', { ascending: true });

        if (metricType) {
          query = query.eq('metric_type', metricType);
        }
        const { data, error } = await query;
        if (error) throw error;
        setBodyMetrics(data || []);
      } catch (err) {
        console.error('Error fetching body metrics:', err);
      }
    },
    [profile?.id]
  );

  const addBodyMetric = useCallback(
    async (metric: BodyMetricInsert) => {
      if (!profile?.id) {
        showErrorToast('User not logged in.');
        return null;
      }
      try {
        const { data, error } = await supabase
          .from('body_metrics')
          .insert({ ...metric, user_id: profile.id })
          .select();
        if (error) throw error;
        if (data) {
          await fetchBodyMetrics();
          showSuccessToast('Métrica corporal añadida!');
          return data[0];
        }
        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Error al añadir métrica corporal';
        showErrorToast(`Error: ${errorMessage}`);
        console.error('Error adding body metric:', err);
        return null;
      }
    },
    [profile?.id, fetchBodyMetrics, showErrorToast, showSuccessToast]
  );

  // Effect to fetch additional data - only runs when user ID changes or explicitly requested via streak change
  useEffect(() => {
    async function fetchAdditionalProfileData() {
      if (!session?.user.id) return;
      
      setLoading(true);
      setError(null);

      try {
        const currentUserId = session.user.id;

        const fetchPRs = async () => {
          const { data, error } = await supabase.rpc('get_user_prs', { p_user_id: currentUserId });
          if (error) throw error;
          return data;
        };

        const fetchProfileStats = async () => {
          const { data, error } = await supabase.rpc('get_user_profile_stats', { p_user_id: currentUserId });
          if (error) throw error;
          return data;
        };

        const fetchBodyMetricsInitialData = async () => {
          const { data, error } = await supabase.from('body_metrics').select('*').eq('user_id', currentUserId).order('recorded_at', { ascending: true });
          if (error) throw error;
          return data || [];
        };

        const [prData, profileStatsResult, bodyMetricsResult] = await Promise.all([
          fetchPRs(),
          fetchProfileStats(),
          fetchBodyMetricsInitialData(),
        ]);

        // Process profileStatsResult for dashboardStats and weeklyActivity
        if (profileStatsResult) {
          const newDashboardStats = {
            exercise_count: profileStatsResult.exercise_count,
            routine_count: profileStatsResult.routine_count,
            recent_workout_count: profileStatsResult.recent_workout_count,
            total_reps: profileStatsResult.total_reps,
            total_weight_lifted: profileStatsResult.total_weight_lifted,
            total_workouts: profileStatsResult.total_workouts,
          };
          setDashboardStats(newDashboardStats);

          const weeklyActivityChartData: WeeklyActivityData = {
            labels: profileStatsResult.weekly_activity.map((item: { day_name: string }) => item.day_name),
            datasets: [
              {
                label: 'Entrenamientos',
                data: profileStatsResult.weekly_activity.map((item: { workout_count: number }) => item.workout_count),
                backgroundColor: 'rgba(0, 230, 118, 0.6)',
                borderColor: 'rgba(0, 230, 118, 1)',
                borderWidth: 1,
              },
            ],
          };
          setWeeklyActivity(weeklyActivityChartData);
          
          const unlockedAchievementsResult = achievements.map((achievement) => {
            const unlocked = achievement.check(newDashboardStats, streak || 0);
            return { ...achievement, unlocked, progress: unlocked ? 100 : 0 };
          });
          setUnlockedAchievements(unlockedAchievementsResult);
        }
        
        setPersonalRecords(prData || []);
        setBodyMetrics(bodyMetricsResult);

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdditionalProfileData();
  }, [session?.user.id, streak]); // Removed 'profile' dependency to prevent re-fetch on profile update

  // Sync form values when profile changes
  useEffect(() => {
    if (profile) {
      setValues({ username: profile.full_name || '' });
    }
  }, [profile, setValues]);

  const handleAvatarUploadSuccess = async (publicUrl: string) => {
    if (!profile) return;
    try {
      const { error: updateError } = await supabase.from('profiles').upsert({ id: profile.id, avatar_url: publicUrl });
      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      showSuccessToast('¡Foto de perfil actualizada!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar la foto';
      showErrorToast(`Error: ${errorMessage}`);
      console.error('Avatar update error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null); // Clear user profile from store
      navigate('/login');
      showSuccessToast('¡Sesión cerrada con éxito!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cerrar sesión';
      showErrorToast(`Error: ${errorMessage}`);
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return <LoadingOverlay message="Cargando perfil..." />;
  }

  if (error) {
    return <div className="profile-container error-message">Error: {error}</div>;
  }

  if (!profile) {
    return <LoadingOverlay message="Cargando perfil..." />;
  }

  const activeGoals = goals.filter((g) => g.status === 'in_progress').length;

  return (
    <div className="profile-container">
      <ProfileHeader
        profile={profile}
        stats={{
          totalWorkouts: dashboardStats?.total_workouts ?? 0,
          streak: streak || 0,
          activeGoals: activeGoals,
        }}
        onEditProfile={() => setActiveTab(3)}
        onNavigateToSettings={() => setActiveTab(3)}
        onLogout={handleLogout}
        onAvatarUpload={handleAvatarUploadSuccess}
        onAvatarError={(error) => showErrorToast(error.message)}
      />

      <Tabs activeTab={activeTab} onTabChange={handleTabChange}>
        <Tab label="Progreso">
          <div className="profile-content-single">
            <section className="card-base profile-section bg-1">
              <h2>Actividad Semanal</h2>
              <WeeklyActivityChart data={weeklyActivity} />
            </section>
            <section className="card-base profile-section bg-1">
              <h2>Volumen de Ejercicio</h2>
              {profile?.id && <ExerciseVolumeChart userId={profile.id} />}
            </section>
          </div>
        </Tab>
        <Tab label="Logros y Récords">
          <div className="profile-content-single">
            <section className="card-base profile-section bg-2">
              <h2><FaTrophy aria-hidden="true" /> Récords Personales</h2>
              {personalRecords.length > 0 ? (
                <ul className="pr-list">
                  {personalRecords.map((pr) => (
                    <li key={pr.exercise_id} className="pr-item">
                      <span className="pr-exercise-name">{pr.exercise_name}</span>
                      <span className="pr-weight">{pr.max_weight} kg</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No se han registrado récords. ¡A levantar peso!</p>
              )}
            </section>
            <section className="card-base profile-section bg-1 achievements-section">
              <AchievementList achievements={unlockedAchievements} />
            </section>
          </div>
        </Tab>
        <Tab label="Mis Publicaciones">
          <div className="profile-content-single">
            <section className="card-base profile-section bg-3">
              <h2>Mis Publicaciones</h2>
              {profile?.id && <UserPostsFeed userId={profile.id} showCreateButton={true} />}
            </section>
          </div>
        </Tab>
        <Tab label="Configuración">
          <div className="profile-content-single">
            <section className="card-base profile-section bg-4">
              <h2>Información Personal</h2>
              <form onSubmit={handleProfileUpdate} className="profile-edit-form">
                <div className="form-group">
                  <label htmlFor="username">Nombre de Usuario:</label>
                  <input
                    type="text"
                    id="username"
                    {...getFieldProps('username')}
                    className={hasFieldError('username') ? 'error' : ''}
                  />
                  {hasFieldError('username') && (
                    <span className="error-message">{getFieldError('username')}</span>
                  )}
                </div>
                <Button type="submit" variant="primary" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </form>
            </section>
            <section className="card-base profile-section bg-3">
              <h2>Notificaciones</h2>
              <NotificationSettings />
            </section>
          </div>
        </Tab>
        <Tab label="Métricas">
          <div className="profile-content-single">
            <section className="card-base profile-section bg-4">
              <h2>Progreso de Métricas Corporales</h2>
              <BodyMetricsChart metrics={bodyMetrics} fetchBodyMetrics={fetchBodyMetrics} isLoading={false} />
            </section>
            <section className="card-base profile-section bg-4">
              <h2>Registrar Métricas Corporales</h2>
              <BodyMetricsForm addBodyMetric={addBodyMetric} isLoading={false} />
            </section>
          </div>
        </Tab>
      </Tabs>

      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#888', fontSize: '0.8rem' }}>
        App Version: 1.1
      </div>
    </div>
  );
}

export default Profile;
