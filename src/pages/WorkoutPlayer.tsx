import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useWorkoutPlayer } from '../hooks/useWorkoutPlayer';
import { SwipeableExerciseCard } from '../components/workout_player/SwipeableExerciseCard';
import { Button } from '../components/ui/Button/Button';
import './WorkoutPlayer.css';

const DEFAULT_REST_TIME = 90; // 90 seconds

function WorkoutPlayer() {
  const { routineId } = useParams<{ routineId: string }>();
  
  // Validar que routineId existe
  if (!routineId) {
    return (
      <div className="workout-player-error">
        <p>Error: No se proporcionó un ID de rutina válido.</p>
      </div>
    );
  }
  
  const {
    loading,
    error,
    routine,
    currentExercise,
    currentRoutineExercise,
    sessionLogs,
    isFirstExercise,
    isLastExercise,
    logSet,
    deleteSet,
    nextExercise,
    prevExercise,
    finishWorkout,
  } = useWorkoutPlayer(routineId);

  // Haptic feedback function
  const triggerHapticFeedback = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {
      // Haptics not supported on this device
    }
  };

  // Keep the screen awake while the workout is in progress
  useEffect(() => {
    const keepScreenAwake = async () => {
      try {
        await KeepAwake.keepAwake();
      } catch (e) {
        console.error('Failed to keep screen awake', e);
      }
    };

    keepScreenAwake();

    // Allow the screen to sleep when the component unmounts
    // Nota: allowScreenToSleep es fire-and-forget, no necesita await en cleanup
    return () => {
      KeepAwake.allowSleep().catch((e) => {
        console.error('Failed to allow screen to sleep', e);
      });
    };
  }, []);

  const handleSwipeLeft = () => {
    triggerHapticFeedback();
    nextExercise();
  };

  const handleSwipeRight = () => {
    triggerHapticFeedback();
    prevExercise();
  };

  const handleRegisterSet = async (data: { reps: number; weight: number }) => {
    triggerHapticFeedback();
    await logSet(data);
  };

  if (loading) {
    return (
      <div className="workout-player-loading">
        <div className="loading-spinner"></div>
        <p>Cargando entrenamiento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workout-player-error">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!routine || !currentExercise) {
    return (
      <div className="workout-player-error">
        <p>No se pudo cargar el entrenamiento.</p>
      </div>
    );
  }

  const currentExerciseIndex = routine.exercises.indexOf(currentExercise.id);
  const setsForCurrentExercise = sessionLogs.filter(
    (log) => log.exercise_id === currentExercise.id
  );
  const currentSet = setsForCurrentExercise.length;
  const totalSets = currentRoutineExercise?.sets || 3;

  return (
    <div className="workout-player-swipeable">
      <SwipeableExerciseCard
        exercise={currentExercise}
        currentSet={currentSet}
        totalSets={totalSets}
        suggestedReps={currentRoutineExercise?.reps}
        suggestedWeight={currentRoutineExercise?.weight}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onRegisterSet={handleRegisterSet}
        onDeleteSet={deleteSet}
        onFinishWorkout={() => {
          triggerHapticFeedback();
          finishWorkout();
        }}
        loggedSets={sessionLogs}
        showFinishButton={sessionLogs.length > 0}
        isFirst={isFirstExercise}
        isLast={isLastExercise}
        exerciseNumber={currentExerciseIndex + 1}
        totalExercises={routine.exercises.length}
      />
    </div>
  );
}

export default WorkoutPlayer;

