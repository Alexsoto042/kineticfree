import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

// Basado en los scripts de la base de datos y el uso en useAuth
export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  onboarding_completed?: boolean;
  target_calories?: number;
  training_days_per_week?: number;
  current_plan_id?: string;
  // Añadir otros campos según sea necesario
}

interface UserState {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  clearUser: () => void;
}

/**
 * Hook de Zustand para gestionar el estado global del usuario (sesión y perfil).
 */
export const useUserStore = create<UserState>((set) => ({
  session: null,
  profile: null,
  loading: true, // Inicialmente true hasta que se verifique la sesión
  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  clearUser: () => set({ session: null, profile: null, loading: false }),
}));

