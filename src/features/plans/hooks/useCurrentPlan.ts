import { useState, useEffect } from 'react';
import { supabase } from '../../../supabaseClient';
import { useUserStore } from '../../../store/userStore';
import { db } from '../../../db';

interface CurrentPlan {
  id: string;
  name: string;
  routine_ids: number[];
  current_day?: number;
}

export const useCurrentPlan = () => {
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserStore();

  useEffect(() => {
    const fetchCurrentPlan = async () => {
      if (!profile?.id) {
        setLoading(false);
        return;
      }

      try {
        const activePlanId = profile.current_plan_id;

        if (!activePlanId) {
          setCurrentPlan(null);
          setLoading(false);
          return;
        }

        // Si está offline, cargar desde IndexedDB
        if (!navigator.onLine) {
          try {
            const cachedPlan = await db.plans.get(activePlanId);
            
            if (!cachedPlan) {
              setCurrentPlan(null);
              setLoading(false);
              return;
            }

            // Cargar routine_ids desde plan_routines en IndexedDB
            const planRoutines = await db.plan_routines
              .where('plan_id')
              .equals(activePlanId)
              .toArray();

            const routineIds = planRoutines.map(pr => pr.routine_id);

            setCurrentPlan({
              id: cachedPlan.id,
              name: cachedPlan.name,
              routine_ids: routineIds,
            });
            
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error loading cached plan:', error);
            setCurrentPlan(null);
            setLoading(false);
            return;
          }
        }

        // Online: Fetch from Supabase
        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('id, name')
          .eq('id', activePlanId)
          .single();

        if (planError) throw planError;

        // Fetch routines for this plan from plan_routines table
        const { data: planRoutines, error: routinesError } = await supabase
          .from('plan_routines')
          .select('routine_id')
          .eq('plan_id', activePlanId);

        if (routinesError) throw routinesError;

        // Extract routine IDs
        const routineIds = planRoutines?.map(pr => pr.routine_id) || [];

        const currentPlanData = {
          id: plan.id,
          name: plan.name,
          routine_ids: routineIds,
        };

        setCurrentPlan(currentPlanData);

        // Cache en IndexedDB para uso offline
        try {
          await db.plans.put({
            ...plan,
            routine_id: routineIds[0] || null,
          });
          
          // Guardar plan_routines en IndexedDB
          const planRoutinesToCache = planRoutines?.map(pr => ({
            id: `${activePlanId}_${pr.routine_id}`,
            plan_id: activePlanId,
            routine_id: pr.routine_id,
          })) || [];

          if (planRoutinesToCache.length > 0) {
            await db.plan_routines.bulkPut(planRoutinesToCache);
          }
        } catch (error) {
          console.error('Error caching plan:', error);
        }
      } catch (error) {
        console.error('Error fetching current plan:', error);
        setCurrentPlan(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentPlan();
  }, [profile?.id, profile?.current_plan_id]);

  return { currentPlan, loading };
};
