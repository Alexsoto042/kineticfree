import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Exercise, Routine, RoutineGoal } from '../types';
import { Toast } from '@capacitor/toast';
import { supabase } from '../supabaseClient';
import { useExercises } from './useExercises';
import { useValidatedForm } from './useValidatedForm';
import { routineCreateSchema, type RoutineCreateInput } from '../lib/validation';
import { checkRateLimit, formatRetryTime } from '../lib/rateLimit';

export function useRoutineBuilder() {
  const navigate = useNavigate();
  
  // Selected exercises state (not part of form validation)
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [exercisesError, setExercisesError] = useState<string | null>(null);

  // Exercise Picker Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState<
    Exercise['category'] | 'todos'
  >('todos');
  const [exerciseBodyZoneFilter, setExerciseBodyZoneFilter] = useState<
    string | 'Todos'
  >('Todos');

  // Saving State
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form validation hook
  const {
    values,
    isSubmitting: isSavingRoutine,
    getFieldError,
    setFieldValue,
    handleSubmit: validateAndSubmit,
  } = useValidatedForm<RoutineCreateInput>({
    schema: routineCreateSchema,
    initialValues: {
      name: '',
      description: '',
      category: 'strength',
      difficulty: 'principiante',
      goal: 'muscle_gain',
      body_zone_focus: [],
      exercises: [],
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (data) => {
      // Check rate limit before proceeding
      const userId = (await supabase.auth.getSession()).data.session?.user?.id;
      const rateLimitResult = await checkRateLimit('routine:create', userId);
      
      if (!rateLimitResult.allowed) {
        const retryTime = formatRetryTime(rateLimitResult.retryAfter!);
        await Toast.show({
          text: `Límite alcanzado. Puedes crear más rutinas en ${retryTime}.`,
          duration: 'long',
        });
        throw new Error('Rate limit exceeded');
      }

      // Validate exercises separately
      if (selectedExercises.length === 0) {
        setExercisesError('Debes seleccionar al menos un ejercicio.');
        await Toast.show({ 
          text: 'Debes seleccionar al menos un ejercicio.', 
          duration: 'long' 
        });
        throw new Error('No exercises selected');
      }

      setSaveError(null);
      setExercisesError(null);

      const newRoutine = {
        ...data,
        exercises: selectedExercises.map((ex) => ex.id),
      };

      try {
        const { data: savedRoutine, error } = await supabase
          .from('routines')
          .insert([newRoutine])
          .select();
        
        if (error) throw error;
        
        await Toast.show({ 
          text: '¡Rutina guardada exitosamente!', 
          duration: 'short' 
        });
        
        navigate(`/routine/${savedRoutine[0].id}`);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setSaveError(errorMessage);
        console.error('Error saving routine:', err);
        await Toast.show({ 
          text: `Error al guardar la rutina: ${errorMessage}`, 
          duration: 'long' 
        });
        throw err; // Re-throw to prevent form reset
      }
    },
  });

  // Fetching available exercises using the powerful useExercises hook
  const {
    exercises: filteredExercises, // Already filtered by the hook!
    loading: loadingExercises,
    error: errorExercises,
  } = useExercises({
    category: exerciseCategoryFilter,
    bodyZone: exerciseBodyZoneFilter,
    searchTerm: searchTerm,
  });

  // State and fetch for unique body zones for the filter dropdown
  const [uniqueBodyZones, setUniqueBodyZones] = useState<string[]>([]);
  useEffect(() => {
    const fetchBodyZones = async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('body_zone');
      if (error) {
        console.error('Error fetching body zones:', error);
        return;
      }
      const zones = new Set<string>();
      data.forEach((item: { body_zone: string[] }) => {
        item.body_zone.forEach((zone) => zones.add(zone));
      });
      setUniqueBodyZones(Array.from(zones).sort());
    };
    fetchBodyZones();
  }, []);

  const handleAddExercise = (exercise: Exercise) => {
    if (!selectedExercises.some((ex) => ex.id === exercise.id)) {
      setSelectedExercises((prev) => [...prev, exercise]);
      setExercisesError(null); // Clear error when exercise is added
    }
  };

  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validateAndSubmit(e);
  };

  return {
    // Form values from validation hook
    routineName: values.name,
    setRoutineName: (value: string) => setFieldValue('name', value),
    description: values.description,
    setDescription: (value: string) => setFieldValue('description', value),
    category: values.category,
    setCategory: (value: Routine['category']) => setFieldValue('category', value),
    difficulty: values.difficulty,
    setDifficulty: (value: Routine['difficulty']) => setFieldValue('difficulty', value),
    goal: values.goal,
    setGoal: (value: RoutineGoal) => setFieldValue('goal', value),
    bodyZoneFocus: values.body_zone_focus,
    setBodyZoneFocus: (value: string[]) => setFieldValue('body_zone_focus', value),
    selectedExercises,
    // Errors from validation hook
    routineNameError: getFieldError('name'),
    setRoutineNameError: () => {}, // No-op, handled by validation hook
    descriptionError: getFieldError('description'),
    setDescriptionError: () => {}, // No-op, handled by validation hook
    exercisesError,
    // Exercise list state from useExercises
    loadingExercises,
    errorExercises,
    // Filtering and search
    searchTerm,
    setSearchTerm,
    exerciseCategoryFilter,
    setExerciseCategoryFilter,
    exerciseBodyZoneFilter,
    setExerciseBodyZoneFilter,
    // Derived data
    uniqueBodyZones,
    filteredExercises,
    // Actions
    handleAddExercise,
    handleRemoveExercise,
    handleSubmit,
    // Save status
    isSavingRoutine,
    saveError,
  };
}
