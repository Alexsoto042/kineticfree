import type { Exercise } from '../../types';
import { Button } from '../ui/Button/Button';
import './SelectedExercises.css';

interface SelectedExercisesProps {
  selectedExercises: Exercise[];
  onRemoveExercise: (exerciseId: number) => void;
  exercisesError: string | null;
}

export function SelectedExercises({
  selectedExercises,
  onRemoveExercise,
  exercisesError,
}: SelectedExercisesProps) {
  return (
    <div className="form-section">
      <h2>Ejercicios Seleccionados</h2>
      {exercisesError && <p className="error-message">{exercisesError}</p>}
      <div className="selected-exercises">
        {selectedExercises.length === 0 ? (
          <p>No hay ejercicios seleccionados.</p>
        ) : (
          <ul>
            {selectedExercises.map((ex) => (
              <li key={ex.id}>
                <span>{ex.name}</span>
                <Button
                  type="button"
                  onClick={() => onRemoveExercise(ex.id)}
                  variant="danger"
                >
                  Eliminar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
