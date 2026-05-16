import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { FollowStats } from '../types';

export function useUserFollows(userId?: string) {
  const [followStats, setFollowStats] = useState<FollowStats>({
    followers_count: 0,
    following_count: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch follow stats for a user
  const fetchFollowStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase.rpc(
        'get_user_follow_stats',
        { p_user_id: userId }
      );

      if (fetchError) throw fetchError;

      if (data && data.length > 0) {
        setFollowStats({
          followers_count: Number(data[0].followers_count),
          following_count: Number(data[0].following_count),
        });
      }
    } catch (err) {
      console.error('Error fetching follow stats:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Check if current user is following the target user
  const checkIsFollowing = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.id === userId) {
        // Don't check if not logged in or if viewing own profile
        setIsFollowing(false);
        return;
      }

      const { data, error: checkError } = await supabase.rpc('is_following', {
        p_follower_id: user.id,
        p_following_id: userId,
      });

      if (checkError) throw checkError;

      setIsFollowing(data || false);
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowStats();
    checkIsFollowing();
  }, [fetchFollowStats, checkIsFollowing]);

  // Follow a user
  const followUser = async () => {
    if (!userId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error: insertError } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userId,
        });

      if (insertError) throw insertError;

      // Update local state
      setIsFollowing(true);
      setFollowStats((prev) => ({
        ...prev,
        followers_count: prev.followers_count + 1,
      }));
    } catch (err) {
      console.error('Error following user:', err);
      throw err;
    }
  };

  // Unfollow a user
  const unfollowUser = async () => {
    if (!userId) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { error: deleteError } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (deleteError) throw deleteError;

      // Update local state
      setIsFollowing(false);
      setFollowStats((prev) => ({
        ...prev,
        followers_count: Math.max(0, prev.followers_count - 1),
      }));
    } catch (err) {
      console.error('Error unfollowing user:', err);
      throw err;
    }
  };

  // Toggle follow status
  const toggleFollow = async () => {
    if (isFollowing) {
      await unfollowUser();
    } else {
      await followUser();
    }
  };

  return {
    followStats,
    isFollowing,
    loading,
    error,
    followUser,
    unfollowUser,
    toggleFollow,
    refreshStats: fetchFollowStats,
  };
}
