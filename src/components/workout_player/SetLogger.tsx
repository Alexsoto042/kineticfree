import React, { useState } from 'react';
import type { WorkoutLog } from '../../types';
import { Button } from '../ui/Button/Button';
import './SetLogger.css';

interface SetLoggerProps {
  onLogSet: (data: { reps: number; weight: number }) => void;
  loggedSets: Partial<WorkoutLog>[];
  exerciseId: number | undefined;
  onDeleteSet?: (index: number) => void;
}

export function SetLogger({
  onLogSet,
  loggedSets,
  exerciseId,
  onDeleteSet,
}: SetLoggerProps) {
  const [reps, setReps] = useState<string>('');
  const [weight, setWeight] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const repsNum = Number(reps);
    const weightNum = Number(weight);
    
    if (repsNum > 0 && weightNum >= 0) {
      await onLogSet({ reps: repsNum, weight: weightNum });
      // Reset to empty after logging
      setReps('');
      setWeight('');
    }
  };

  const setsForThisExercise = loggedSets.filter(
    (log) => log.exercise_id === exerciseId
  );

  const handleDeleteSet = (setIndex: number) => {
    if (onDeleteSet) {
      // Find the global index of this set in the loggedSets array
      let globalIndex = -1;
      let currentExerciseSetCount = 0;
      
      for (let i = 0; i < loggedSets.length; i++) {
        if (loggedSets[i].exercise_id === exerciseId) {
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
    <>
      <div className="set-history">
        <h4>Series Registradas</h4>
        {setsForThisExercise.length === 0 ? (
          <p>Aún no has registrado ninguna serie para este ejercicio.</p>
        ) : (
          <ul>
            {setsForThisExercise.map((log, index) => (
              <li key={index} className="set-history-item">
                <span>
                  Serie {index + 1}: {log.reps} reps @ {log.weight} kg
                </span>
                {onDeleteSet && (
                  <button
                    type="button"
                    onClick={() => handleDeleteSet(index)}
                    className="delete-set-btn"
                    aria-label="Eliminar serie"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={handleSubmit} className="set-log-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reps" className="form-label">
              Reps:
            </label>
            <input
              type="number"
              id="reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="0"
              min="0"
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="weight" className="form-label">
              Peso (kg):
            </label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              min="0"
              step="0.5"
              required
              className="form-control"
            />
          </div>
        </div>
        <Button type="submit" variant="primary">
          Registrar Serie
        </Button>
      </form>
    </>
  );
}
