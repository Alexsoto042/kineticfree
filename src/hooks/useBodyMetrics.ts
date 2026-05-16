// src/hooks/useBodyMetrics.ts
import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { BodyMetric, BodyMetricInsert, BodyMetricType } from '../types';

export const useBodyMetrics = (userId: string | undefined) => {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBodyMetrics = useCallback(
    async (metricType?: BodyMetricType) => {
      try {
        setLoading(true);
        setError(null);

        if (!userId) {
          setMetrics([]);
          return;
        }

        let query = supabase
          .from('body_metrics')
          .select('*')
          .eq('user_id', userId)
          .order('recorded_at', { ascending: true });

        if (metricType) {
          query = query.eq('metric_type', metricType);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setMetrics(data || []);
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('Error fetching body metrics:', error);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const addBodyMetric = useCallback(
    async (metric: BodyMetricInsert) => {
      if (!userId) {
        const err = new Error('User is not logged in.');
        setError(err);
        console.error(err);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('body_metrics')
          .insert({ ...metric, user_id: userId })
          .select();

        if (error) {
          throw error;
        }

        if (data) {
          await fetchBodyMetrics(); // Refetch to ensure data is in sync
          return data[0];
        }
        return null;
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('Error adding body metric:', error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchBodyMetrics]
  );

  return { metrics, loading, error, fetchBodyMetrics, addBodyMetric };
};
