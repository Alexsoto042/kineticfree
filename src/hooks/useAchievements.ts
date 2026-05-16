import { useState, useEffect } from 'react';
import { achievements } from '../achievements';
import type { DashboardStats } from './useDashboardData';
import type { Achievement } from '../types';

export type UnlockedAchievement = Achievement & {
  unlocked: boolean;
  progress: number;
};

export const useAchievements = (
  stats: DashboardStats | null,
  streak: number
) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    UnlockedAchievement[]
  >([]);
  const [notifiedAchievements, setNotifiedAchievements] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stats) {
      setLoading(false);
      return;
    }

    // Set loading to true only when we start processing valid stats
    setLoading(true);

    const updatedAchievements = achievements.map((achievement) => {
      const unlocked = achievement.check(stats, streak);
      let progress = 0;

      switch (achievement.id) {
        case 'first_workout':
          progress = Math.min(
            (stats.total_workouts / achievement.goal) * 100,
            100
          );
          break;
        case 'three_day_streak':
        case 'seven_day_streak':
          progress = Math.min((streak / achievement.goal) * 100, 100);
          break;
        case 'lift_1000kg':
        case 'lift_10000kg':
          progress = Math.min(
            (stats.total_weight_lifted / achievement.goal) * 100,
            100
          );
          break;
        default:
          progress = unlocked ? 100 : 0;
      }

      if (unlocked && !notifiedAchievements.has(achievement.id)) {
        // Temporarily removed toast.custom due to persistent parsing error
        // toast.custom((t) => (...));
        setNotifiedAchievements((prev) => new Set(prev).add(achievement.id));
      }

      return {
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        goal: achievement.goal,
        check: achievement.check,
        unlocked,
        progress,
      };
    });

    setUnlockedAchievements(updatedAchievements);
    setLoading(false);
  }, [stats, streak, notifiedAchievements]);

  return { unlockedAchievements, loading };
};
