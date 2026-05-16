import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Toast } from '@capacitor/toast';
import { requestCache } from '../lib/requestCache';
import { createError } from '../lib/errorHandler';

export type LeaderboardData = {
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string;
  value: number;
};

export const LeaderboardFilter = {
  TOTAL_WEIGHT_LIFTED: 'total_weight_lifted',
  TOTAL_WORKOUTS: 'total_workouts',
} as const;

export type LeaderboardFilter =
  (typeof LeaderboardFilter)[keyof typeof LeaderboardFilter];

interface LeaderboardItem {
  user_id: string;
  username: string;
  avatar_url: string;
  value: number;
}

export const useLeaderboard = (filter: LeaderboardFilter) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use request deduplication with filter-specific key
      await requestCache.dedupe(`leaderboard-${filter}`, async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.rpc('get_leaderboard', {
          p_user_id: user.id,
          p_filter: filter,
        });

        if (error) {
          throw createError('SERVER_ERROR', error.message, 'medium');
        }

        const rankedData = data.map((item: LeaderboardItem, index: number) => ({
          ...item,
          rank: index + 1,
        }));

        setLeaderboardData(rankedData || []);
      }, 8000); // 8 second TTL
    } catch (error) {
      await Toast.show({ text: 'Error al cargar la tabla de clasificación.', duration: 'long' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLeaderboardData();
  }, [fetchLeaderboardData]);

  return { leaderboardData, loading };
};
