import { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { Exercise, WorkoutLog } from '../../types';
import { AdaptiveMedia } from '../common/AdaptiveMedia';
import { Button } from '../ui/Button/Button';
import './SwipeableExerciseCard.css';

interface SwipeableExerciseCardProps {
  exercise: Exercise;
  currentSet: number;
  totalSets: number;
  suggestedReps?: string;
  suggestedWeight?: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onRegisterSet: (data: { reps: number; weight: number }) => void;
  onDeleteSet?: (index: number) => void;
  onFinishWorkout?: () => void;
  loggedSets: Partial<WorkoutLog>[];
  showFinishButton: boolean;
  isFirst: boolean;
  isLast: boolean;
  exerciseNumber: number;
  totalExercises: number;
}

export function SwipeableExerciseCard({
  exercise,
  currentSet,
  totalSets,
  suggestedReps,
  suggestedWeight,
  onSwipeLeft,
  onSwipeRight,
  onRegisterSet,
  onDeleteSet,
  onFinishWorkout,
  loggedSets,
  showFinishButton,
  isFirst,
  isLast,
  exerciseNumber,
  totalExercises,
}: SwipeableExerciseCardProps) {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [entryAnimation, setEntryAnimation] = useState<'from-left' | 'from-right' | null>(null);
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  // Trigger entry animation when exercise changes
  useEffect(() => {
    setEntryAnimation(null);
    // Small delay to ensure the animation triggers
    const timer = setTimeout(() => {
      if (swipeDirection === 'left') {
        setEntryAnimation('from-left');
      } else if (swipeDirection === 'right') {
        setEntryAnimation('from-right');
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [exercise.id]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isLast) {
        setSwipeDirection('left');
        setTimeout(() => {
          onSwipeLeft();
          setSwipeDirection(null);
        }, 200);
      }
    },
    onSwipedRight: () => {
      if (!isFirst) {
        setSwipeDirection('right');
        setTimeout(() => {
          onSwipeRight();
          setSwipeDirection(null);
        }, 200);
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  const progressPercentage = totalSets > 0 ? (currentSet / totalSets) * 100 : 0;

  // Filter sets for this exercise
  const setsForThisExercise = loggedSets.filter(
    (log) => log.exercise_id === exercise.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const repsNum = Number(reps);
    const weightNum = Number(weight);

    if (repsNum > 0 && weightNum >= 0) {
      onRegisterSet({ reps: repsNum, weight: weightNum });
      setReps('');
      setWeight('');
    }
  };

  const handleDeleteSet = (setIndex: number) => {
    if (onDeleteSet) {
      // Find the global index of this set in the loggedSets array
      let globalIndex = -1;
      let currentExerciseSetCount = 0;

      for (let i = 0; i < loggedSets.length; i++) {
        if (loggedSets[i].exercise_id === exercise.id) {
          if (currentExerciseSetCount === setIndex) {
            globalIndex = i;
            break;
          }
          currentExerciseSetCount++;
        }
      }

      if (globalIndex !== -1) {
        onDeleteSet(globalIndex);
      }
    }
  };

  return (
    <div
      {...handlers}
      className={`swipeable-card ${swipeDirection ? `swipe-${swipeDirection}` : ''} ${entryAnimation ? `entry-${entryAnimation}` : ''}`}
    >
      {/* Header */}
      <div className="swipeable-card__header">
        <span className="swipeable-card__exercise-number">
          Ejercicio {exerciseNumber} de {totalExercises}
        </span>
      </div>

      {/* Swipe hint - Left */}
      {!isFirst && (
        <div className="swipeable-card__hint swipeable-card__hint--left">
          ← Anterior
        </div>
      )}

      {/* Swipe hint - Right */}
      {!isLast && (
        <div className="swipeable-card__hint swipeable-card__hint--right">
          Siguiente →
        </div>
      )}

      {/* Exercise Media */}
      <div className="swipeable-card__media">
        <AdaptiveMedia
          src={exercise.gif_url}
          fallbackSrc={exercise.image}
          alt={exercise.name}
          className="swipeable-card__image"
        />
      </div>

      {/* Exercise Info */}
      <div className="swipeable-card__info">
        <h2 className="swipeable-card__name">{exercise.name}</h2>
        <p className="swipeable-card__details">
          {totalSets}×{suggestedReps || '8-12'}
          {suggestedWeight && ` | ${suggestedWeight}kg sugerido`}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="swipeable-card__progress">
        <div className="swipeable-card__progress-label">
          Series: {currentSet}/{totalSets}
        </div>
        <div className="swipeable-card__progress-bar">
          <div
            className="swipeable-card__progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Set History */}
      {setsForThisExercise.length > 0 && (
        <div className="swipeable-card__history">
          <h3 className="swipeable-card__history-title">Series registradas:</h3>
          <ul className="swipeable-card__history-list">
            {setsForThisExercise.map((log, index) => (
              <li key={index} className="swipeable-card__history-item">
                <span className="swipeable-card__history-text">
                  Serie {index + 1}: {log.reps} reps @ {log.weight} kg
                </span>
                {onDeleteSet && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSet(index);
                    }}
                    className="swipeable-card__delete-btn"
                    aria-label="Eliminar serie"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="swipeable-card__form">
        <div className="swipeable-card__inputs">
          <div className="swipeable-card__input-group">
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="Reps"
              min="0"
              required
              className="swipeable-card__input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="swipeable-card__input-group">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Peso (kg)"
              min="0"
              step="0.5"
              required
              className="swipeable-card__input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
        <Button type="submit" variant="primary" className="swipeable-card__submit">
          Registrar Serie
        </Button>

        {/* Finish Workout Button */}
        {showFinishButton && onFinishWorkout && (
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFinishWorkout();
            }}
            variant="secondary"
            className="swipeable-card__finish"
          >
            Finalizar Entrenamiento
          </Button>
        )}
      </form>
    </div>
  );
}

