import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { db } from '../db';
import { Toast } from '@capacitor/toast';
import type { Routine, Exercise, WorkoutLog } from '../types';

import { supabase } from '../supabaseClient'; // Import Supabase client

const WORKOUT_STATE_KEY = 'activeWorkoutState';

interface WorkoutState {
  routineId: string;
  currentExerciseIndex: number;
  sessionLogs: Partial<WorkoutLog>[];
  startTime: string;
}

export function useWorkoutPlayer(routineId: string | undefined) {
  const navigate = useNavigate();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [sessionLogs, setSessionLogs] = useState<Partial<WorkoutLog>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabaseWorkoutLogId, setSupabaseWorkoutLogId] = useState<string | null>(null); // State for Supabase workout log ID
  const [currentRoutineExercise, setCurrentRoutineExercise] = useState<any | null>(null); // State for current routine exercise details

  // Load routine data from Dexie and restore state
  useEffect(() => {
    if (!routineId) {
      setError('No se proporcionó ID de rutina.');
      setLoading(false);
      return;
    }

            const loadWorkout = async () => {
              try {
                setLoading(true);
                const routineNumId = parseInt(routineId, 10);

                // --- 1. Definir promesas en paralelo ---

                // Promesa A: Obtener datos de Rutina y Ejercicios (Red/Cache)
                const dataPromise = (async () => {
                  let routineData: Routine | undefined;
                  let exercisesData: Exercise[] = [];

                  try {
                    // 1. Try fetching from Supabase (Online)
                    const { data: onlineRoutine, error: routineError } = await supabase
                      .from('routines')
                      .select('*')
                      .eq('id', routineNumId)
                      .single();
                    if (routineError) throw routineError;
                    if (!onlineRoutine) throw new Error('Rutina no encontrada en Supabase.');
                    
                    routineData = onlineRoutine;

                    const { data: onlineExercises, error: exercisesError } = await supabase
                      .from('exercises')
                      .select('id, name, description, instructions, category, image, gif_url, body_zone')
                      .in('id', onlineRoutine.exercises);
                    if (exercisesError) throw exercisesError;
                    
                    exercisesData = onlineExercises || [];
                    
                  } catch (onlineError) {
                    console.warn('Failed to fetch from Supabase, trying local DB:', onlineError);
                    
                    // 2. Fallback to Dexie (Offline)
                    const localRoutine = await db.routines.get(routineNumId);
                    if (!localRoutine) {
                      throw new Error('Rutina no encontrada ni en línea ni localmente.');
                    }
                    
                    routineData = localRoutine;
                    exercisesData = await db.exercises.where('id').anyOf(localRoutine.exercises).toArray();
                    
                    if (exercisesData.length !== localRoutine.exercises.length) {
                       console.warn('Algunos ejercicios no se encontraron en la base de datos local.');
                    }
                  }

                  if (!routineData) throw new Error('No se pudo cargar la rutina.');
                  return { routineData, exercisesData };
                })();

                // Promesa B: Obtener Sesión de Usuario (Auth)
                const sessionPromise = (async () => {
                  let userId: string | undefined;
                  let retries = 3;
      
                  while (retries > 0 && !userId) {
                    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                    
                    if (sessionError) {
                      console.error('Error getting session:', sessionError);
                      retries--;
                      if (retries > 0) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        continue;
                      }
                    }
                    
                    userId = session?.user?.id;
                    if (!userId && retries > 0) {
                      // Intentar refrescar la sesión
                      console.log('Session not found, attempting refresh...');
                      const { error: refreshError } = await supabase.auth.refreshSession();
                      if (refreshError) {
                        console.error('Error refreshing session:', refreshError);
                      }
                      retries--;
                      await new Promise(resolve => setTimeout(resolve, 1000));
                    } else {
                      break;
                    }
                  }
      
                  if (!userId) {
                    throw new Error('No se pudo autenticar. Por favor, inicia sesión de nuevo.');
                  }
                  return userId;
                })();

                // --- 2. Esperar ambas promesas (Paralelo) ---
                const [{ routineData, exercisesData }, userId] = await Promise.all([
                  dataPromise,
                  sessionPromise
                ]);

                // --- 3. Procesar resultados ---
                setRoutine(routineData);

                const orderedExercises = routineData.exercises
                  .map(id => exercisesData.find(ex => ex.id === id))
                  .filter(Boolean) as Exercise[];
                setExercises(orderedExercises);
    
                // Create a new workout_logs entry in Supabase
                const { data: newWorkoutLog, error: workoutLogError } = await supabase
                  .from('workout_logs')
                  .insert({ user_id: userId, routine_id: routineNumId, start_time: new Date().toISOString() })
                  .select()
                  .single();
    
                if (workoutLogError || !newWorkoutLog) {
                  throw new Error('Error al crear el registro de entrenamiento en Supabase: ' + workoutLogError?.message);
                }
                setSupabaseWorkoutLogId(newWorkoutLog.id);
    
    
                // Restore state from Preferences
                const { value } = await Preferences.get({ key: WORKOUT_STATE_KEY });
                if (value) {
                  try {
                    const savedState: WorkoutState = JSON.parse(value);
                    if (savedState.routineId === routineId) {
                      setCurrentExerciseIndex(savedState.currentExerciseIndex);
                      setSessionLogs(savedState.sessionLogs);
                    }
                  } catch (error) {
                    console.error('Error parsing saved workout state:', error);
                    // Si el estado está corrupto, iniciar sesión nueva
                    const newState: WorkoutState = {
                      routineId,
                      currentExerciseIndex: 0,
                      sessionLogs: [],
                      startTime: new Date().toISOString(),
                    };
                    await Preferences.set({ key: WORKOUT_STATE_KEY, value: JSON.stringify(newState) });
                  }
                } else {
                  // If no saved state, start a new session
                  const newState: WorkoutState = {
                    routineId,
                    currentExerciseIndex: 0,
                    sessionLogs: [],
                    startTime: new Date().toISOString(),
                  };
                  await Preferences.set({ key: WORKOUT_STATE_KEY, value: JSON.stringify(newState) });
                }
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Error al cargar los datos del entrenamiento.');
              } finally {
                setLoading(false);
              }
            };
    loadWorkout();
  }, [routineId]);

  // Persist state whenever it changes
  useEffect(() => {
    const saveState = async () => {
      if (!routineId || loading) return;
      const state: WorkoutState = {
        routineId,
        currentExerciseIndex,
        sessionLogs,
        startTime: new Date().toISOString(),
      };
      await Preferences.set({ key: WORKOUT_STATE_KEY, value: JSON.stringify(state) });
    };
    saveState();
  }, [currentExerciseIndex, sessionLogs, routineId, loading]);

  const logSet = useCallback(
    async (setData: { reps: number; weight: number }) => { // Made async
      if (!routine || !exercises[currentExerciseIndex] || !supabaseWorkoutLogId) {
        console.error('Cannot log set: missing routine, exercise, or workout log ID.');
        return;
      }

      const currentExerciseId = exercises[currentExerciseIndex].id;
      const currentSetNumber = sessionLogs.filter(log => log.exercise_id === currentExerciseId).length + 1;

      const newWorkoutExerciseLog = {
        workout_log_id: supabaseWorkoutLogId,
        exercise_id: currentExerciseId,
        set_number: currentSetNumber,
        reps: setData.reps,
        weight: setData.weight,
        // rpe: setData.rpe, // Add RPE if you implement it in SetLogger
      };

      const { data, error: insertError } = await supabase
        .from('workout_exercise_logs')
        .insert(newWorkoutExerciseLog)
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting workout exercise log:', insertError);
        await Toast.show({ text: 'Error al registrar la serie en Supabase.', duration: 'long' });
        return;
      }

      // Update local sessionLogs state with the data from Supabase
      const newLog: Partial<WorkoutLog> = {
        id: data.id, // Use the ID from Supabase
        created_at: data.created_at,
        routine_id: routine.id,
        exercise_id: currentExerciseId,
        sets: currentSetNumber, // Use currentSetNumber for sets
        reps: setData.reps,
        weight: setData.weight,
        // volume: data.volume, // If volume is calculated by DB
        synced: true, // It's now synced
      };
      setSessionLogs(prev => [...prev, newLog]);
      await Toast.show({ text: 'Serie registrada con éxito.', duration: 'short' });
    },
    [currentExerciseIndex, exercises, routine, sessionLogs, supabaseWorkoutLogId] // Added sessionLogs and supabaseWorkoutLogId to dependencies
  );

  const deleteSet = useCallback(
    async (index: number) => {
      const logToDelete = sessionLogs[index];
      
      if (!logToDelete || !logToDelete.id) {
        console.error('Cannot delete set: missing log or log ID.');
        return;
      }

      try {
        // Delete from Supabase
        const { error: deleteError } = await supabase
          .from('workout_exercise_logs')
          .delete()
          .eq('id', logToDelete.id);

        if (deleteError) {
          console.error('Error deleting workout exercise log:', deleteError);
          await Toast.show({ text: 'Error al eliminar la serie.', duration: 'short' });
          return;
        }

        // Remove from local state
        setSessionLogs(prev => prev.filter((_, i) => i !== index));
        await Toast.show({ text: 'Serie eliminada.', duration: 'short' });
      } catch (error) {
        console.error('Failed to delete set:', error);
        await Toast.show({ text: 'Error al eliminar la serie.', duration: 'short' });
      }
    },
    [sessionLogs]
  );

  const nextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const prevExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  const finishWorkout = async () => {
    if (sessionLogs.length === 0) {
      await Toast.show({ text: 'No se ha registrado ninguna serie.', duration: 'short' });
      navigate(-1);
      return;
    }

    if (!supabaseWorkoutLogId) {
      console.error('Cannot finish workout: missing Supabase workout log ID.');
      await Toast.show({ text: 'Error: ID de registro de entrenamiento no encontrado.', duration: 'long' });
      return;
    }

    try {
      // Obtener estado guardado de forma segura
      const stateValue = (await Preferences.get({ key: WORKOUT_STATE_KEY })).value;
      if (!stateValue) {
        throw new Error('No saved workout state found');
      }
      
      let state: WorkoutState;
      try {
        state = JSON.parse(stateValue);
      } catch (parseError) {
        console.error('Error parsing workout state:', parseError);
        throw new Error('Invalid workout state data');
      }
      
      if (!state.startTime) {
        throw new Error('No startTime in workout state');
      }
      
      const startTime = new Date(state.startTime);
      if (isNaN(startTime.getTime())) {
        throw new Error('Invalid startTime in workout state');
      }
      
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Update the main workout_logs entry in Supabase
      const { error: updateError } = await supabase
        .from('workout_logs')
        .update({ end_time: endTime.toISOString(), duration_seconds: durationSeconds })
        .eq('id', supabaseWorkoutLogId);

      if (updateError) {
        console.error('Error updating workout log in Supabase:', updateError);
        await Toast.show({ text: 'Error al finalizar el entrenamiento en Supabase.', duration: 'long' });
        return;
      }

      await Toast.show({ text: 'Entrenamiento guardado en Supabase.', duration: 'long' });
    } catch (error) {
      console.error('Failed to save workout logs to Supabase:', error);
      await Toast.show({ text: 'Error al guardar el entrenamiento.', duration: 'long' });
    } finally {
      // Clean up and navigate
      await Preferences.remove({ key: WORKOUT_STATE_KEY });
      navigate('/workout-summary', {
        state: {
          logs: sessionLogs,
          routineName: routine?.name || 'Entrenamiento',
        },
      });
    }
  };

  const currentExercise = exercises[currentExerciseIndex] || null; // Moved this line up

  // Fetch current routine exercise details from Supabase
  useEffect(() => {
    const fetchRoutineExercise = async () => {
      if (!routine || !currentExercise) {
        setCurrentRoutineExercise(null);
        return;
      }

      const { data, error } = await supabase
        .from('routine_exercises')
        .select('*')
        .eq('routine_id', routine.id)
        .eq('exercise_id', currentExercise.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching routine exercise details:', error);
        setCurrentRoutineExercise(null);
        return;
      }
      setCurrentRoutineExercise(data);
    };

    fetchRoutineExercise();
  }, [routine, currentExercise]); // Re-run when routine or currentExercise changes


  return {
    loading,
    error,
    routine,
    currentExercise,
    currentRoutineExercise, // Expose currentRoutineExercise
    sessionLogs,
    isFirstExercise: currentExerciseIndex === 0,
    isLastExercise: currentExerciseIndex === exercises.length - 1,
    logSet,
    deleteSet,
    nextExercise,
    prevExercise,
    finishWorkout,
  };
}
