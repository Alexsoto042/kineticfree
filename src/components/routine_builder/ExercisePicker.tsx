import { ExerciseCard } from '../exercises/ExerciseCard';
import type { Exercise } from '../../types'; // Import Exercise type
import SkeletonCard from '../ui/SkeletonCard'; // Import SkeletonCard
import './ExercisePicker.css';

interface ExercisePickerProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  exerciseCategoryFilter: Exercise['category'] | 'todos';
  setExerciseCategoryFilter: (category: Exercise['category'] | 'todos') => void;
  exerciseBodyZoneFilter: string | 'Todos';
  setExerciseBodyZoneFilter: (zone: string | 'Todos') => void;
  uniqueBodyZones: string[];
  filteredExercises: Exercise[];
  loadingExercises: boolean;
  errorExercises: string | null;
  onAddExercise: (exercise: Exercise) => void;
}

export function ExercisePicker({
  searchTerm,
  setSearchTerm,
  exerciseCategoryFilter,
  setExerciseCategoryFilter,
  exerciseBodyZoneFilter,
  setExerciseBodyZoneFilter,
  uniqueBodyZones,
  filteredExercises,
  loadingExercises,
  errorExercises,
  onAddExercise,
}: ExercisePickerProps) {
  return (
    <div className="form-section">
      <h2>Añadir Ejercicios</h2>
      <div className="exercise-selection-controls">
        <input
          type="text"
          placeholder="Buscar ejercicio por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-control"
        />
        <select
          value={exerciseCategoryFilter}
          onChange={(e) =>
            setExerciseCategoryFilter(
              e.target.value as Exercise['category'] | 'todos'
            )
          }
          className="form-control"
        >
          <option value="todos">Todas las Categorías</option>
          <option value="strength">Fuerza</option>
          <option value="cardio">Cardio</option>
          <option value="flexibility">Flexibilidad</option>
        </select>
        <select
          value={exerciseBodyZoneFilter}
          onChange={(e) =>
            setExerciseBodyZoneFilter(e.target.value as string | 'Todos')
          }
          className="form-control"
        >
          <option value="Todos">Todas las Zonas Corporales</option>
          {uniqueBodyZones.map((zone: string) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>

      <div className="available-exercises">
        {loadingExercises && (
          <div className="exercise-list">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}
        {errorExercises && (
          <p className="error-message">Error: {errorExercises}</p>
        )}
        {!loadingExercises &&
          !errorExercises &&
          filteredExercises.length === 0 && (
            <p>No se encontraron ejercicios con los filtros aplicados.</p>
          )}
        {!loadingExercises &&
          !errorExercises &&
          filteredExercises.length > 0 && (
            <div className="exercise-list">
              {filteredExercises.map((exercise: Exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onAdd={() => onAddExercise(exercise)}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}
