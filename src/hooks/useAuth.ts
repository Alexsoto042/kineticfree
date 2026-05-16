import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { PostgrestError } from '../lib/supabaseUtils';
import { type ProfileUpdate } from '../types';
import { useUserStore } from '../store/userStore';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { initializeEncryption, cleanupEncryption } from '../lib/encryption';

// Utility to add timeout to promises
const fetchWithTimeout = <T,>(promise: PromiseLike<T>, timeout = 10000): Promise<T> => {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

export function useAuth() {
  const {
    session,
    profile,
    loading,
    setSession,
    setProfile,
    setLoading,
    clearUser
  } = useUserStore();

  const [profileError, setProfileError] = useState<PostgrestError | null>(null);
  const lastFetch = useRef<number>(0);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derived state for backward compatibility
  const hasUsername = !!profile?.username;
  const username = profile?.username || null;
  const avatarUrl = profile?.avatar_url || session?.user?.user_metadata?.avatar_url || null;
  const onboardingCompleted = profile?.onboarding_completed || false;

  const updateProfileState = useCallback((profileData: Partial<ProfileUpdate> | null) => {
    if (!profileData) return;
    
    // Validación básica: asegurar que no se sobrescriba con datos vacíos
    const currentProfile = useUserStore.getState().profile;
    if (currentProfile) {
      // Filtrar valores undefined/null para no sobrescribir datos válidos
      const validUpdates = Object.entries(profileData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          (acc as any)[key] = value;
        }
        return acc;
      }, {} as Partial<ProfileUpdate>);
      
      setProfile({ ...currentProfile, ...validUpdates });
    }
  }, [setProfile]);

  const checkUserProfile = useCallback(async (user: Session['user'] | null | undefined, isBackgroundRefresh = false) => {
    if (!user) {
      clearUser();
      return;
    }

    if (isBackgroundRefresh && Date.now() - lastFetch.current < 1000 * 60 * 5) {
      return;
    }
    
    if (!isBackgroundRefresh) {
      setProfileError(null);
    }

    // Si está offline, intentar cargar desde IndexedDB
    if (!navigator.onLine) {
      try {
        const { db } = await import('../db');
        const cachedProfile = await db.profiles?.get(user.id);
        if (cachedProfile) {
          setProfile(cachedProfile);
          return; // Usar perfil cacheado
        }
      } catch (error) {
        console.error('Error loading cached profile:', error);
      }
      // Si no hay cache, continuar sin perfil pero asegurar que loading esté en false
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
      return;
    }

    try {
      // Agregar timeout a la petición de perfil
      const { data: profileData, error: profileError } = await fetchWithTimeout(
        supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single(),
        10000 // 10 segundos de timeout
      );

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }
      
      lastFetch.current = Date.now();
      
      if (profileData) {
        setProfile(profileData);
        // Guardar en IndexedDB para uso offline
        try {
          const { db } = await import('../db');
          await db.profiles?.put({ ...profileData, id: user.id });
        } catch (error) {
          console.error('Error caching profile:', error);
        }
      }

    } catch (err) {
      const error = err as PostgrestError | Error;
      console.error('Error fetching profile:', error);
      if (!isBackgroundRefresh) {
        setProfileError(error as PostgrestError);
        // Asegurar que loading se desactive incluso en caso de error
        setLoading(false);
      }
    }
  }, [clearUser, setProfile, setLoading]);

  useEffect(() => {
    // Intentar cargar sesión desde cache como fallback
    const loadCachedSession = async () => {
      try {
        // Usar Preferences en nativo, localStorage en web
        let cachedSession: string | null = null;
        
        if (Capacitor.isNativePlatform()) {
          const { value } = await Preferences.get({ key: 'supabase.auth.token' });
          cachedSession = value;
        } else {
          cachedSession = localStorage.getItem('supabase.auth.token');
        }
        
        if (cachedSession) {
          const parsed = JSON.parse(cachedSession);
          if (parsed?.currentSession) {
            // Solo usar cache si estamos offline o como fallback inicial
            if (!navigator.onLine) {
              setSession(parsed.currentSession);
              // Intentar cargar perfil desde IndexedDB si existe
              const { db } = await import('../db');
              const cachedProfile = await db.profiles?.get(parsed.currentSession.user.id);
              if (cachedProfile) {
                setProfile(cachedProfile);
              }
              setLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error loading cached session:', error);
      }
    };

    loadCachedSession();

    // Función para reiniciar el safety timeout
    const resetSafetyTimeout = () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      safetyTimeoutRef.current = setTimeout(() => {
        const currentLoading = useUserStore.getState().loading;
        if (currentLoading) {
          console.warn('Auth timeout - forcing loading to false');
          setLoading(false);
        }
      }, 15000);
    };

    // Iniciar el safety timeout
    resetSafetyTimeout();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'INITIAL_SESSION') {
          resetSafetyTimeout();
          setSession(session);
          if (session) {
            await checkUserProfile(session.user, false);
          }
          setLoading(false);
        } else if (event === 'SIGNED_IN') {
          resetSafetyTimeout();
          // Only set loading if we don't have a session yet (initial sign in)
          // If we already have a session, this might be a re-validation on focus
          const currentSession = useUserStore.getState().session;
          if (!currentSession || currentSession.user.id !== session?.user.id) {
               setLoading(true);
          }
          
          setSession(session);
          if (session) {
            // Ejecutar tareas en paralelo para optimizar tiempo de carga
            const initEncryptionPromise = (async () => {
              try {
                await initializeEncryption(session.user.id);
                // La migración puede correr después, no bloquea lo crítico
                import('../lib/encryption/migration').then(({ migrateToEncrypted }) => {
                   migrateToEncrypted(session.user.id).catch(console.error);
                });
              } catch (error) {
                console.error('Error initializing encryption:', error);
              }
            })();

            const userProfilePromise = checkUserProfile(session.user, false);

            // Esperar a que lo crítico (Perfil + Keys) esté listo
            // Usamos Promise.allSettled para que un fallo en uno no bloquee totalmente el otro si es posible recuperarse
            // Pero idealmente queremos las dos cosas.
            Promise.all([userProfilePromise, initEncryptionPromise])
              .then(() => {
                setLoading(false);
              })
              .catch((error) => {
                console.error('Error during initialization:', error);
                setLoading(false);
              });
          } else {
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          resetSafetyTimeout();
          clearUser();
          
          // Limpiar encriptación al cerrar sesión
          try {
            await cleanupEncryption();
          } catch (error) {
            console.error('Error cleaning up encryption:', error);
          }
        } else if (event === 'TOKEN_REFRESHED' && session) {
          resetSafetyTimeout();
          setSession(session);
          // Manejar errores en TOKEN_REFRESHED para evitar loading infinito
          checkUserProfile(session.user, true)
            .catch((error) => {
              console.error('Error in TOKEN_REFRESHED checkUserProfile:', error);
              // No llamar setLoading(false) aquí porque es background refresh
              // El estado de loading no debería estar activo durante un refresh de token
            });
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setLoading(false);
      }
    });

    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [checkUserProfile, setSession, setLoading, clearUser, setProfile]);

  const refetchProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setLoading(true);
        await checkUserProfile(session.user, false);
      }
    } catch (error) {
      console.error('Error in refetchProfile:', error);
    } finally {
      setLoading(false);
    }
  }, [checkUserProfile, setLoading]);

  return { 
    session, 
    loading, 
    hasUsername, 
    username, 
    avatarUrl, 
    onboardingCompleted, 
    refetchProfile, 
    profileError, 
    updateProfileState 
  };
}