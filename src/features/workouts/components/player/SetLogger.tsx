import React, { useState } from 'react';
import type { WorkoutLog } from '../../../../types';
import { Button } from '../../../../components/ui/Button/Button';
import './SetLogger.css';

interface SetLoggerProps {
  onLogSet: (data: { reps: number; weight: number }) => void;
  loggedSets: Partial<WorkoutLog>[];
  exerciseId: number | undefined;
}

export function SetLogger({
  onLogSet,
  loggedSets,
  exerciseId,
}: SetLoggerProps) {
  const [reps, setReps] = useState(8);
  const [weight, setWeight] = useState(20);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogSet({ reps, weight });
  };

  const setsForThisExercise = loggedSets.filter(
    (log) => log.exercise_id === exerciseId
  );

  return (
    <>
      <div className="set-history">
        <h4>Series Registradas</h4>
        {setsForThisExercise.length === 0 ? (
          <p>Aún no has registrado ninguna serie para este ejercicio.</p>
        ) : (
          <ul>
            {setsForThisExercise.map((log, index) => (
              <li key={index}>
                Serie {index + 1}: {log.reps} reps @ {log.weight} kg
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
              onChange={(e) => setReps(Number(e.target.value))}
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
              onChange={(e) => setWeight(Number(e.target.value))}
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
