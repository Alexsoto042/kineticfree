import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useUserStore } from '../store/userStore';

interface CurrentPlan {
  id: number;
  name: string;
  routine_ids: number[];
  current_day?: number;
}

export const useCurrentPlan = () => {
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserStore();

  const activePlanId = profile?.active_plan_id;

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        // Get user's active plan from profile

        if (!activePlanId) {
          setCurrentPlan(null);
          setLoading(false);
          return;
        }

        // Fetch plan details
        const { data: plan, error } = await supabase
          .from('plans')
          .select('id, name, routine_ids')
          .eq('id', activePlanId)
          .single();

        if (error) throw error;

        setCurrentPlan(plan);
      } catch (error) {
        console.error('Error fetching current plan:', error);
        setCurrentPlan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentPlan();
  }, [profile?.id, activePlanId]); // Extraer activePlanId como variable separada

  return { currentPlan, loading };
};
