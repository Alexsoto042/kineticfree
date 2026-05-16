import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

export function useExerciseMetadata() {
  const [bodyZones, setBodyZones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        setLoading(true);
        // Call the RPC function to get unique body zones directly from the DB
        const { data, error } = await supabase.rpc('get_unique_body_zones');

        if (error) throw error;

        // The result is an array of objects like [{ body_zone: 'abs' }, { body_zone: 'back' }]
        // We map it to a simple array of strings.
        const allZones = data.map((item) => item.body_zone);
        setBodyZones(allZones);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch metadata';
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMetadata();
  }, []);

  const uniqueBodyZones = useMemo(() => {
    // The RPC function already returns unique, sorted values. We just add "Todos".
    return ['Todos', ...bodyZones];
  }, [bodyZones]);

  return { uniqueBodyZones, loading, error };
}
