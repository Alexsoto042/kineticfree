import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUserStore } from '../store/userStore';
import type { Plan } from '../types';
import { db } from '../db';

interface SavedPlan extends Plan {
  saved_at: string;
  is_downloaded: boolean;
}

export const useSavedPlans = () => {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserStore();

  const fetchSavedPlans = async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }

    try {
      // Si está offline, cargar desde IndexedDB
      if (!navigator.onLine) {
        try {
          const cachedSavedPlans = await db.user_saved_plans
            .where('user_id')
            .equals(profile.id)
            .toArray();

          if (cachedSavedPlans.length === 0) {
            setSavedPlans([]);
            setLoading(false);
            return;
          }

          // Obtener detalles de planes desde IndexedDB
          const planIds = cachedSavedPlans.map(sp => sp.plan_id);
          const cachedPlans = await db.plans
            .where('id')
            .anyOf(planIds)
            .toArray();

          // Merge plan data with saved metadata
          const mergedPlans: SavedPlan[] = cachedPlans.map(plan => {
            const savedMeta = cachedSavedPlans.find(sp => sp.plan_id === plan.id);
            return {
              ...plan,
              saved_at: savedMeta?.saved_at || new Date().toISOString(),
              is_downloaded: savedMeta?.is_downloaded || false,
            };
          });

          setSavedPlans(mergedPlans);
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error loading cached saved plans:', error);
          setSavedPlans([]);
          setLoading(false);
          return;
        }
      }

      // Online: Fetch from Supabase
      const { data: savedPlanData, error: savedError } = await supabase
        .from('user_saved_plans')
        .select('plan_id, saved_at, is_downloaded')
        .eq('user_id', profile.id)
        .order('saved_at', { ascending: false });

      if (savedError) throw savedError;

      if (!savedPlanData || savedPlanData.length === 0) {
        setSavedPlans([]);
        setLoading(false);
        return;
      }

      // Fetch full plan details for saved plans
      const planIds = savedPlanData.map(sp => sp.plan_id);
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .in('id', planIds);

      if (plansError) throw plansError;

      // Merge plan data with saved metadata
      const mergedPlans: SavedPlan[] = plansData.map(plan => {
        const savedMeta = savedPlanData.find(sp => sp.plan_id === plan.id);
        return {
          ...plan,
          saved_at: savedMeta?.saved_at || new Date().toISOString(),
          is_downloaded: savedMeta?.is_downloaded || false,
        };
      });

      setSavedPlans(mergedPlans);

      // Cache en IndexedDB para uso offline
      try {
        await db.user_saved_plans.bulkPut(
          savedPlanData.map(sp => ({
            ...sp,
            id: `${profile.id}_${sp.plan_id}`, // Composite key
            user_id: profile.id,
          }))
        );
        await db.plans.bulkPut(plansData);
      } catch (error) {
        console.error('Error caching saved plans:', error);
      }
    } catch (error) {
      console.error('Error fetching saved plans:', error);
      setSavedPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedPlans();
  }, [profile?.id]);

  const savePlan = async (planId: string): Promise<boolean> => {
    if (!profile?.id) {
      console.error('User not authenticated');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_saved_plans')
        .insert({
          user_id: profile.id,
          plan_id: planId,
        });

      if (error) throw error;

      // Refresh saved plans
      await fetchSavedPlans();
      return true;
    } catch (error: any) {
      console.error('Error saving plan:', error);
      return false;
    }
  };

  const unsavePlan = async (planId: string): Promise<boolean> => {
    if (!profile?.id) {
      console.error('User not authenticated');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_saved_plans')
        .delete()
        .eq('user_id', profile.id)
        .eq('plan_id', planId);

      if (error) throw error;

      // Refresh saved plans
      await fetchSavedPlans();
      return true;
    } catch (error: any) {
      console.error('Error unsaving plan:', error);
      return false;
    }
  };

  const isPlanSaved = (planId: string): boolean => {
    return savedPlans.some(plan => plan.id === planId);
  };

  return {
    savedPlans,
    loading,
    savePlan,
    unsavePlan,
    isPlanSaved,
    refetch: fetchSavedPlans,
  };
};
