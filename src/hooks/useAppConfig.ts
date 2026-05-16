import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { db } from '../db'; // Assuming we might want to cache this later, but for now direct fetch is fine

interface AppConfig {
  key: string;
  value: string;
  description?: string;
}

export const useAppConfig = () => {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('app_config')
          .select('key, value');

        if (error) throw error;

        if (data) {
          const configMap = data.reduce((acc, item) => {
            acc[item.key] = item.value;
            return acc;
          }, {} as Record<string, string>);
          setConfig(configMap);
        }
      } catch (err) {
        console.error('Error fetching app config:', err);
        setError(err as Error);
        // Fallback or cached values could go here
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  const get = (key: string, defaultValue: string = '') => {
    return config[key] || defaultValue;
  };

  return { config, get, loading, error };
};
