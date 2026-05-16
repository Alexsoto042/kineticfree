import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase URL and anon key are required. Make sure you have a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Custom storage for Capacitor to use @capacitor/preferences
const AsyncStorage = {
  async getItem(key: string) {
    const ret = await Preferences.get({ key });
    return ret.value;
  },
  async setItem(key: string, value: string) {
    await Preferences.set({ key, value });
  },
  async removeItem(key: string) {
    await Preferences.remove({ key });
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'Accept-Encoding': 'gzip, deflate, br',
    },
  },
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    storage: Capacitor.isNativePlatform() ? AsyncStorage : undefined, // Use custom storage for native platforms
    storageKey: 'supabase.auth.token', // Ensure a consistent storage key
  },
});
