import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import {
  FaChartBar,
  FaDumbbell,
  FaWeightHanging,
} from 'react-icons/fa';
import { AchievementList } from '../components/achievements/AchievementList';
import { achievements } from '../achievements';
import { EmptyState } from '../components/ui/EmptyState';
import UserPostsFeed from '../components/profile/UserPostsFeed';
import { Users } from 'lucide-react';
import type {
  DashboardStats,
  WorkoutLog,
  UnlockedAchievement,
} from '../types';
import './FriendProfile.css';

interface FriendProfileData {
  id: string;
  username: string;
  avatar_url: string;
}

interface PersonalRecord {
  exercise_id: number;
  exercise_name: string;
  max_weight: number;
}

const FriendProfile: React.FC = () => {
  const { friendId } = useParams<{ friendId: string }>();
  const [friendProfile, setFriendProfile] = useState<FriendProfileData | null>(null);
  const [friendStats, setFriendStats] = useState<DashboardStats | null>(null);
  const [friendPRs, setFriendPRs] = useState<PersonalRecord[]>([]);
  const [friendAchievements, setFriendAchievements] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAcceptedFriend, setIsAcceptedFriend] = useState(false);

  useEffect(() => {
    async function fetchFriendProfileData() {
      if (!friendId) {
        setError('No se proporcionó ID de amigo.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [{ data: profileData, error: profileError }, { data: prData, error: prError }, { data: workoutLogsData, error: logsError }] = await Promise.all([
          supabase.from('profiles').select('id, username, avatar_url').eq('id', friendId).single(),
          supabase.rpc('get_user_prs', { p_user_id: friendId }),
          supabase.from('workout_logs').select('reps, sets, weight').eq('user_id', friendId),
        ]);

        // Check if current user is friends with this user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: friendshipData } = await supabase
            .from('friends')
            .select('status')
            .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)
            .eq('status', 'accepted')
            .maybeSingle();
          
          setIsAcceptedFriend(!!friendshipData);
        }

        if (profileError) throw profileError;
        if (prError) throw prError;
        if (logsError) throw logsError;

        setFriendProfile(profileData);
        setFriendPRs(prData || []);

        // Calculate dashboard stats for the friend
        const total_reps = (workoutLogsData || []).reduce(
          (sum, log: WorkoutLog) => sum + (log.reps || 0) * (log.sets || 1),
          0
        );
        const total_weight_lifted = (workoutLogsData || []).reduce(
          (sum, log: WorkoutLog) =>
            sum + (log.weight || 0) * (log.reps || 0) * (log.sets || 1),
          0
        );
        const total_workouts = workoutLogsData?.length || 0;

        const stats: DashboardStats = {
          exercise_count: 0, // Not easily available here
          routine_count: 0, // Not easily available here
          recent_workout_count: 0, // Not easily available here
          total_reps: total_reps,
          total_weight_lifted: total_weight_lifted,
          total_workouts: total_workouts,
        };
        setFriendStats(stats);

        // Calculate achievements (assuming achievements check against DashboardStats and a dummy streak)
        const friendStreak = 0; // We don't fetch streak for friends for simplicity
        const unlockedFriendAchievements = achievements.map((achievement) => {
          const unlocked = achievement.check(stats, friendStreak);
          return { ...achievement, unlocked, progress: unlocked ? 100 : 0 };
        });
        setFriendAchievements(unlockedFriendAchievements);

      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar el perfil del amigo.');
        console.error('Error fetching friend profile:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFriendProfileData();
  }, [friendId]);

  if (loading) {
    return <LoadingOverlay message="Cargando perfil del amigo..." />;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  if (!friendProfile) {
    return <div className="error-message">Perfil de amigo no encontrado.</div>;
  }

  return (
    <div className="friend-profile-container">
      <header className="friend-profile-header">
        <div className="avatar-container">
          <img src={friendProfile.avatar_url || '/images/default-avatar.svg'} alt={friendProfile.username} className="user-avatar" />
        </div>
        <h1>{friendProfile.username}</h1>
      </header>

      {/* Estadísticas en horizontal */}
      <section className="card-base friend-stats-section">
        <h2>Estadísticas de {friendProfile.username}</h2>
        {friendStats ? (
          <div className="stats-grid-sidebar">
            <div className="stat-card-sidebar">
              <FaChartBar size={24} className="stat-icon" aria-hidden="true" />
              <div>
                <h3>{friendStats.total_workouts ?? 0}</h3>
                <p>Entrenamientos</p>
              </div>
            </div>
            <div className="stat-card-sidebar">
              <FaDumbbell size={24} className="stat-icon" aria-hidden="true" />
              <div>
                <h3>{friendStats.total_reps.toLocaleString() ?? 0}</h3>
                <p>Reps Totales</p>
              </div>
            </div>
            <div className="stat-card-sidebar">
              <FaWeightHanging size={24} className="stat-icon" aria-hidden="true" />
              <div>
                <h3>{friendStats.total_weight_lifted.toLocaleString() ?? 0} kg</h3>
                <p>Total Levantado</p>
              </div>
            </div>
          </div>
        ) : (
          <p>No hay estadísticas disponibles.</p>
        )}
      </section>

      {/* Récords Personales */}
      <section className="card-base friend-prs-section">
        <h2>Récords Personales (PRs)</h2>
        {friendPRs.length > 0 ? (
          <ul className="pr-list">
            {friendPRs.map((pr) => (
              <li key={pr.exercise_id} className="pr-item">
                <span className="pr-exercise-name">{pr.exercise_name}</span>
                <span className="pr-weight">{pr.max_weight} kg</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No se han registrado récords para {friendProfile.username}.</p>
        )}
      </section>

      {/* Publicaciones */}
      <section className="card-base friend-posts-section">
        <h2>Publicaciones de {friendProfile.username}</h2>
        {isAcceptedFriend ? (
          <UserPostsFeed userId={friendId!} />
        ) : (
          <EmptyState
            icon={<Users size={64} />}
            title="Contenido privado"
            description="Debes ser amigo aceptado para ver las publicaciones de este usuario."
          />
        )}
      </section>

      {/* Logros */}
      <section className="card-base friend-achievements-section">
        <h2>Logros de {friendProfile.username}</h2>
        <AchievementList achievements={friendAchievements} />
      </section>
    </div>
  );
};

export default FriendProfile;
