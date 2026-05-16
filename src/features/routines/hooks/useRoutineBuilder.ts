import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Exercise, Routine, RoutineGoal } from '../../../types';
import { Toast } from '@capacitor/toast';
import { supabase } from '../../../supabaseClient';
import { useExercises } from '../../exercises/hooks/useExercises';

export function useRoutineBuilder() {
  const navigate = useNavigate();
  // Routine Details State
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Routine['category']>('strength');
  const [difficulty, setDifficulty] =
    useState<Routine['difficulty']>('principiante');
  const [goal, setGoal] = useState<RoutineGoal>('muscle_gain');
  const [bodyZoneFocus, setBodyZoneFocus] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  // Error State
  const [routineNameError, setRoutineNameError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
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
  const [isSavingRoutine, setIsSavingRoutine] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Fetching available exercises using the powerful useExercises hook
  const {
    exercises: filteredExercises, // Already filtered by the hook!
    loading: loadingExercises,
    error: errorExercises,
    // totalPages, handlePageChange, etc. can be used for pagination in ExercisePicker
  } = useExercises({
    category: exerciseCategoryFilter,
    bodyZone: exerciseBodyZoneFilter,
    searchTerm: searchTerm,
  });

  // State and fetch for unique body zones for the filter dropdown
  const [uniqueBodyZones, setUniqueBodyZones] = useState<string[]>([]);
  useEffect(() => {
    const fetchBodyZones = async () => {
      // This is a workaround. Ideally, you'd have a separate table or a function
      // to get all unique body zones without fetching all exercises.
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
    }
  };

  const handleRemoveExercise = (exerciseId: number) => {
    setSelectedExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setRoutineNameError(null);
    setDescriptionError(null);
    setExercisesError(null);
    setSaveError(null);

    let isValid = true;
    if (!routineName.trim()) {
      setRoutineNameError('El nombre de la rutina es obligatorio.');
      isValid = false;
    }
    if (!description.trim()) {
      setDescriptionError('La descripción es obligatoria.');
      isValid = false;
    }
    if (selectedExercises.length === 0) {
      setExercisesError('Debes seleccionar al menos un ejercicio.');
      isValid = false;
    }

    if (!isValid) {
      await Toast.show({ text: 'Por favor, corrige los errores antes de guardar.', duration: 'long' });
      return;
    }

    setIsSavingRoutine(true);
    const newRoutine = {
      name: routineName,
      description,
      category,
      difficulty,
      goal,
      body_zone_focus: bodyZoneFocus,
      exercises: selectedExercises.map((ex) => ex.id),
    };

    try {
      const { data, error } = await supabase
        .from('routines')
        .insert([newRoutine])
        .select();
      if (error) throw error;
      await Toast.show({ text: '¡Rutina guardada exitosamente!', duration: 'short' });
      navigate(`/routine/${data[0].id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setSaveError(errorMessage);
      console.error('Error saving routine:', err);
      await Toast.show({ text: `Error al guardar la rutina: ${errorMessage}`, duration: 'long' });
    } finally {
      setIsSavingRoutine(false);
    }
  };

  return {
    // State and setters for routine details
    routineName,
    setRoutineName,
    description,
    setDescription,
    category,
    setCategory,
    difficulty,
    setDifficulty,
    goal,
    setGoal,
    bodyZoneFocus,
    setBodyZoneFocus,
    selectedExercises,
    // Errors
    routineNameError,
    setRoutineNameError,
    descriptionError,
    setDescriptionError,
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
    filteredExercises, // This is now the correctly filtered and paginated list
    // Actions
    handleAddExercise,
    handleRemoveExercise,
    handleSubmit,
    // Save status
    isSavingRoutine,
    saveError,
  };
}
