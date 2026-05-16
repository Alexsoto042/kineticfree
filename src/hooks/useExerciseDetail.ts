import { useState, useEffect } from 'react';
import { db } from '../db';
import { supabase } from '../supabaseClient';
import type { Exercise } from '../types';

export function useExerciseDetail(exerciseId: string | undefined) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId) {
      setLoading(false);
      return;
    }

    const fetchExercise = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Try local DB first
        let data = await db.exercises.get(exerciseId);

        // 2. If not found locally, fetch from Supabase
        if (!data) {
          const { data: remoteData, error: remoteError } = await supabase
            .from('exercises')
            .select('*')
            .eq('id', exerciseId)
            .single();

          if (remoteError) {
            if (remoteError.code === 'PGRST116') {
              throw new Error('Ejercicio no encontrado.');
            }
            throw remoteError;
          }
          data = remoteData;
          
          // Save to local DB for future use
          if (data) {
             await db.exercises.put(data);
          }
        }

        if (!data) throw new Error('Ejercicio no encontrado');

        // 3. Fetch alternatives
        // We fetch alternative IDs first
        const { data: alternativeIds, error: alternativesError } = await supabase
            .from('exercise_alternatives')
            .select('alternative_id')
            .eq('exercise_id', data.id);

        if (alternativesError) {
             console.error('Error fetching alternatives:', alternativesError);
             // We continue without alternatives if this fails
             setExercise(data);
        } else {
            let alternatives: Exercise[] = [];
            if (alternativeIds && alternativeIds.length > 0) {
                const altIds = alternativeIds.map(a => a.alternative_id);
                
                // Try local for alternatives
                const localAlts = await db.exercises.bulkGet(altIds);
                
                // Identify missing ones
                // bulkGet returns undefined for missing keys
                const missingAltIds = altIds.filter((_, index) => !localAlts[index]);
                
                let remoteAlts: Exercise[] = [];
                if (missingAltIds.length > 0) {
                     const { data: fetchedAlts } = await supabase
                        .from('exercises')
                        .select('*')
                        .in('id', missingAltIds);
                     remoteAlts = fetchedAlts || [];
                     
                     // Save fetched alternatives to local DB
                     if (remoteAlts.length > 0) {
                         await db.exercises.bulkPut(remoteAlts);
                     }
                }
                
                // Combine: map original IDs to the found objects (local or remote)
                alternatives = altIds.map(id => {
                    const local = localAlts.find(a => a?.id === id);
                    if (local) return local;
                    return remoteAlts.find(a => a.id === id);
                }).filter(Boolean) as Exercise[];
            }
            
            setExercise({ ...data, alternatives });
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar ejercicio');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseId]);

  return { exercise, loading, error };
}
