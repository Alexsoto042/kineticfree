import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { generatePlan } from './lib/planGenerator';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import Header from './components/navigation/Header';
import BottomNavBar from './components/navigation/BottomNavBar';
import NetworkStatus from './components/network/NetworkStatus';
import { FilterProvider } from './context/FilterContext';
import { scheduleDailyReminder } from './lib/reminderManager';
import { getLastSeenRoutineId } from './lib/cacheManager';
import { syncPendingWorkoutLogs } from './lib/offlineSync';
import { checkAndRestartNotifications } from './lib/notificationManager';
import { logger } from './lib/logger';

const appLogger = logger.createContext('App');
import { syncForRoute } from './lib/sync';
import { Network } from '@capacitor/network';
import { supabase } from './supabaseClient';

import { Toaster } from 'react-hot-toast';
import Onboarding from './pages/Onboarding/Onboarding';
import './App.css';
import { updateUserProfile } from './lib/userProfile';
import type { Answers, ProfileUpdate } from './types';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { ProtectedRoute, PublicRoute } from './components/auth/AuthGuard';
import { useUserStore } from './store/userStore';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded components
const LazyLanding = lazy(() => import('./pages/Landing'));
const LazyLogin = lazy(() => import('./pages/Login'));
const LazyDashboard = lazy(() => import('./pages/Dashboard'));
const LazyExerciseList = lazy(() => import('./components/exercises/ExerciseList'));
const LazyExerciseDetail = lazy(() => import('./components/exercises/ExerciseDetail'));
const LazyRoutineList = lazy(() => import('./components/routines/RoutineList'));
const LazyRoutineDetail = lazy(() => import('./components/routines/RoutineDetail'));
const LazyGoalFilter = lazy(() => import('./components/goals/GoalFilter'));
const LazyExerciseFilters = lazy(() => import('./components/exercises/ExerciseFilters'));
const LazyRoutineBuilder = lazy(() => import('./pages/RoutineBuilder'));
const LazyWorkoutHistory = lazy(() => import('./pages/WorkoutHistory'));
const LazyProfile = lazy(() => import('./pages/Profile'));
const LazyWorkoutPlayer = lazy(() => import('./pages/WorkoutPlayer'));
const LazyWorkoutSummary = lazy(() => import('./pages/WorkoutSummary'));
const LazyExerciseAdmin = lazy(() => import('./pages/ExerciseAdmin'));
const LazyWorkoutHistoryDetail = lazy(
  () => import('./pages/WorkoutHistoryDetail')
);
const LazyProfileSetup = lazy(() => import('./pages/ProfileSetup'));
const LazyFriends = lazy(() => import('./pages/Friends'));
const LazyExplorePlans = lazy(() => import('./pages/ExplorePlans'));
const LazyPlanDetail = lazy(() => import('./pages/PlanDetail'));
const LazyMotivationWall = lazy(() => import('./pages/MotivationWall'));
const LazyNotifications = lazy(() => import('./pages/Notifications'));
const LazyNutrition = lazy(() => import('./pages/Nutrition'));
const LazyFriendProfile = lazy(() => import('./pages/FriendProfile'));
const LazyTracking = lazy(() => import('./pages/Tracking'));
const LazyRecipeDetail = lazy(() => import('./pages/RecipeDetail'));
const LazyTrain = lazy(() => import('./pages/Train'));
const LazyGoals = lazy(() => import('./pages/Goals'));
const LazyPlanesHub = lazy(() => import('./pages/PlanesHub'));
const LazyExplore = lazy(() => import('./pages/Explore'));

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    session,
    loading,
    profileError,
    refetchProfile,
    updateProfileState,
  } = useAuth();
  
  // Get profile reactively for Header
  const { profile } = useUserStore();

  useEffect(() => {

    const configureStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        document.body.classList.add('native-app'); // Add class for native styling
        
        // Hide status bar completely for immersive experience
        await StatusBar.hide();
      }
    };

    configureStatusBar();
  }, []);

  // Listener para detectar cuando la app vuelve a foreground
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupAppStateListener = async () => {
      const { App: CapacitorApp } = await import('@capacitor/app');
      
      const listener = await CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
        if (isActive) {
          appLogger.info('App resumed to foreground');
          
          // Verificar si estamos atascados en loading
          const currentLoading = useUserStore.getState().loading;
          if (currentLoading) {
            appLogger.warn('App resumed with loading=true, forcing session refresh');
            
            // Intentar refrescar la sesión
            try {
              const { data: { session: currentSession } } = await supabase.auth.getSession();
              if (currentSession) {
                // La sesión es válida, forzar loading a false
                useUserStore.getState().setLoading(false);
              } else {
                // No hay sesión, limpiar estado
                useUserStore.getState().clearUser();
              }
            } catch (error) {
              appLogger.error('Error refreshing session on resume:', error);
              useUserStore.getState().setLoading(false);
            }
          }
        }
      });
      
      return listener;
    };

    const listenerPromise = setupAppStateListener();

    return () => {
      listenerPromise
        .then(listener => {
          if (listener) {
            listener.remove();
          }
        })
        .catch((error) => {
          console.error('Error removing appStateChange listener:', error);
        });
    };
  }, []);

  const handleFinishOnboarding = async (answers: Answers) => {
    const suggestedPlan = generatePlan(answers);

    if (session?.user.id) {
      const profileUpdateData: ProfileUpdate = {
        current_plan_id: suggestedPlan?.id,
        age: answers.age,
        gender: answers.gender,
        height_cm: answers.height_cm,
        weight_kg: answers.weight_kg,
        training_days: answers.trainingDays,
        onboarding_completed: true,
      };

      const updatedProfile = await updateUserProfile(
        session.user.id,
        profileUpdateData
      );

      if (updatedProfile) {
        updateProfileState(updatedProfile);
      } else {
        // Fallback to refetch if the update function fails to return data
        await refetchProfile();
      }

      if (suggestedPlan) {
        navigate(`/plan/${suggestedPlan.id}`);
      } else {
        navigate('/explore-plans');
      }
    } else {
      appLogger.info('No user session, navigating to explore page.');
      navigate('/explore-plans');
    }
  };

  useEffect(() => {
    scheduleDailyReminder();
  }, []);

  // Sincronización selectiva por ruta
  useEffect(() => {
    if (session) {
      syncForRoute(location.pathname);
    }
  }, [location.pathname, session]);

  useEffect(() => {
    const handleOffline = async () => {
      const status = await Network.getStatus();
      if (!status.connected) {
        const lastSeenRoutineId = await getLastSeenRoutineId();
        if (lastSeenRoutineId) {
          navigate(`/routine/${lastSeenRoutineId}`);
        }
      }
    };
    handleOffline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const setupNetworkListener = async () => {
      const handleNetworkStatusChange = async (status: { connected: boolean; connectionType: string; }) => {
        if (navigator.onLine) {
          appLogger.info('App is online, attempting to sync pending workout logs.');
          syncPendingWorkoutLogs();
        }
      };

      const listener = await Network.addListener('networkStatusChange', handleNetworkStatusChange);
      
      // Initial check for pending logs when the app starts
      syncPendingWorkoutLogs();

      return listener;
    };

    const listenerPromise = setupNetworkListener();

    return () => {
      listenerPromise.then(listener => listener.remove());
    };
  }, []);

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const pageTransition = {
    duration: 0.3,
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (profileError) {
    return (
      <div className="loading-container">
        <p>Error al cargar tu perfil.</p>
        <button onClick={() => refetchProfile()}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-center" reverseOrder={false} />
      <NetworkStatus />
      {session && <Header session={session} username={profile?.username || null} avatarUrl={profile?.avatar_url || null} />}
      {session && <BottomNavBar />}
      <main>
        <FilterProvider>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
              style={{ width: '100%' }}
            >
              <ErrorBoundary>
                <Suspense fallback={<LoadingSpinner size="large" />}>
                  <Routes location={location}>
                  {!session ? (
                    /* Public Routes */
                    <Route element={<PublicRoute />}>
                      <Route path="/" element={<LazyLanding />} />
                      <Route path="/login" element={<LazyLogin />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                  ) : (
                    /* Protected Routes */
                    <Route element={<ProtectedRoute />}>
                      {/* Routes that don't require onboarding/username are handled inside ProtectedRoute logic or by specific checks if needed, 
                          but here we rely on ProtectedRoute to redirect to onboarding/profilesetup if needed. 
                          However, ProtectedRoute redirects to /onboarding. We need to make sure /onboarding is accessible.
                      */}
                      
                      {/* We need to handle the "Require Auth Only" routes separately if we want to avoid the specific checks for them,
                          OR we can trust ProtectedRoute's internal logic.
                          ProtectedRoute redirects to /onboarding if not completed.
                          So we need to define /onboarding and /profilesetup inside the ProtectedRoute block, 
                          BUT ProtectedRoute itself might block access to them if we are not careful.
                          
                          Actually, ProtectedRoute implementation:
                          if (requireOnboarding && !completed) -> Navigate to /onboarding.
                          
                          So if we are AT /onboarding, we shouldn't redirect to /onboarding.
                          The current ProtectedRoute implementation doesn't seem to check if we are already at the target.
                          
                          Let's check AuthGuard.tsx again.
                          It says: if (requireOnboarding && ... && location.pathname !== '/onboarding') -> Navigate to /onboarding.
                          Wait, I need to verify AuthGuard.tsx has that check.
                          
                          In the previous step, I wrote AuthGuard.tsx.
                          Let's check the file content from memory or view it.
                          I viewed it in step 188.
                          Line 28: if (requireOnboarding && profile && !profile.onboarding_completed) { return <Navigate to="/onboarding" replace />; }
                          It DOES NOT check if pathname is /onboarding. This will cause a loop for /onboarding too!
                          
                          I need to fix AuthGuard.tsx as well.
                      */}
                      
                      <Route path="/" element={<LazyDashboard userId={session.user.id} />} />
                      <Route
                        path="/onboarding"
                        element={<Onboarding onFinish={handleFinishOnboarding} />}
                      />
                      <Route
                        path="/profilesetup"
                        element={<LazyProfileSetup />}
                      />
                      <Route
                        path="/exercises"
                        element={
                          <>
                            <LazyExerciseFilters />
                            <LazyExerciseList />
                          </>
                        }
                      />
                      <Route
                        path="/exercises/:exerciseId"
                        element={<LazyExerciseDetail />}
                      />
                      <Route path="/friends" element={<LazyFriends />} />
                      <Route path="/friends/:friendId" element={<LazyFriendProfile />} />
                      {/* Redirect old motivation route to community */}
                      <Route
                        path="/motivation"
                        element={<Navigate to="/community" replace />}
                      />
                      <Route
                        path="/community"
                        element={<LazyMotivationWall />}
                      />
                      <Route
                        path="/notifications"
                        element={<LazyNotifications />}
                      />
                      <Route path="/train" element={<LazyTrain />} />
                      <Route path="/goals" element={<LazyGoals />} />
                      <Route path="/planes" element={<LazyPlanesHub />} />
                      <Route path="/explore" element={<LazyExplore />} />
                      <Route path="/nutrition" element={<LazyNutrition />} />
                      <Route path="/tracking" element={<LazyTracking />} />
                      <Route
                        path="/explore-plans"
                        element={<LazyExplorePlans />}
                      />
                      <Route
                        path="/plan/:planId"
                        element={<LazyPlanDetail />}
                      />

                      <Route
                        path="/recipe/:recipeId"
                        element={<LazyRecipeDetail />}
                      />

                      <Route
                        path="/routines"
                        element={
                          <>
                            <LazyGoalFilter />
                            <LazyRoutineList />
                          </>
                        }
                      />
                      <Route
                        path="/exercise/:id"
                        element={<LazyExerciseDetail />}
                      />
                      <Route
                        path="/routine/:id"
                        element={<LazyRoutineDetail />}
                      />
                      <Route
                        path="/build-routine"
                        element={<LazyRoutineBuilder />} />
                      <Route
                        path="/workout-history"
                        element={<LazyWorkoutHistory />} />
                      <Route
                        path="/workout/history/:logId"
                        element={<LazyWorkoutHistoryDetail />} />
                      <Route path="/profile" element={<LazyProfile />} />

                      <Route
                        path="/workout/:routineId"
                        element={<LazyWorkoutPlayer />} />
                      <Route
                        path="/workout/summary"
                        element={<LazyWorkoutSummary />} />
                      <Route
                        path="/admin/exercises"
                        element={<LazyExerciseAdmin />} />
                      
                      {/* Catch all for authenticated users */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Route>
                  )}
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </FilterProvider>
      </main>
    </div>
  );
}


export default App;
