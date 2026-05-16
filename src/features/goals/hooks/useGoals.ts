import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../supabaseClient';
import type { Goal, GoalCreation } from '../../../types';
import { Toast } from '@capacitor/toast';
import { requestCache } from '../../../lib/requestCache';
import { createError } from '../../../lib/errorHandler';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use request deduplication
      await requestCache.dedupe('goals-list', async () => {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw createError('SERVER_ERROR', error.message, 'medium');
        }
        
        setGoals(data || []);
      }, 8000); // 8 second TTL
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch goals';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (newGoal: GoalCreation) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([newGoal])
        .select();

      if (error) throw error;

      if (data) {
        setGoals((prevGoals) => [data[0], ...prevGoals]);
        await Toast.show({ text: '¡Meta creada!', duration: 'short' });
      }
      return data ? data[0] : null;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create goal';
      await Toast.show({ text: errorMessage, duration: 'long' });
      return null;
    }
  };

  const updateGoalProgress = async (goalId: number, newProgress: number) => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({ current_value: newProgress })
        .eq('id', goalId)
        .select();

      if (error) throw error;

      if (data) {
        setGoals((prevGoals) =>
          prevGoals.map((g) => (g.id === goalId ? data[0] : g))
        );
        await Toast.show({ text: '¡Progreso actualizado!', duration: 'short' });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update progress';
      await Toast.show({ text: errorMessage, duration: 'long' });
    }
  };

  const deleteGoal = async (goalId: number) => {
    try {
      const { error } = await supabase.from('goals').delete().eq('id', goalId);
      if (error) throw error;

      setGoals((prevGoals) => prevGoals.filter((g) => g.id !== goalId));
      await Toast.show({ text: 'Meta eliminada.', duration: 'short' });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete goal';
      await Toast.show({ text: errorMessage, duration: 'long' });
    }
  };

  return { goals, loading, error, addGoal, updateGoalProgress, deleteGoal };
}
