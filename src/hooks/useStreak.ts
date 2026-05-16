import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { widgetService } from '../services/widgetService';

export function useStreak() {
  const [streak, setStreak] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    async function fetchStreak() {
      setLoading(true);
      setError(null);

      try {
        // 1. Get the current user from Supabase auth
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        if (user) {
          // 2. Call the RPC function with the user's ID
          const { data, error: rpcError } = await supabase.rpc(
            'calculate_streak',
            {
              p_user_id: user.id,
            }
          );

          if (cancelled) return;

          if (rpcError) {
            throw rpcError;
          }

          if (!cancelled) {
            setStreak(data);
          }
        } else {
          // If there is no user, streak is 0 or null
          if (!cancelled) {
            setStreak(0);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e as Error);
          setStreak(0); // Default to 0 on error
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchStreak();

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, []);

  // Update widget whenever streak changes
  useEffect(() => {
    if (streak !== null) {
      // Wrap in setTimeout to avoid blocking the main thread
      const timeoutId = setTimeout(() => {
        widgetService.updateStreakWidget(streak).catch(err => {
          console.error('Widget update failed silently:', err);
        });
      }, 100);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [streak]);

  return { streak, loading, error };
}
