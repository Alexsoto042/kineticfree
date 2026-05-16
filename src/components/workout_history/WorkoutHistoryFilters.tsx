// src/components/workout_history/WorkoutHistoryFilters.tsx
import React from 'react';

interface WorkoutHistoryFiltersProps {
  routinesData: { id: number; name: string }[];
  exercisesData: { id: number; name: string }[];
  selectedRoutineId: number | 'all';
  setSelectedRoutineId: (id: number | 'all') => void;
  selectedExerciseId: number | 'all';
  setSelectedExerciseId: (id: number | 'all') => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  sortBy: 'created_at' | 'exercise_name' | 'routine_name';
  setSortBy: (sort: 'created_at' | 'exercise_name' | 'routine_name') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

const WorkoutHistoryFilters: React.FC<WorkoutHistoryFiltersProps> = ({
  routinesData,
  exercisesData,
  selectedRoutineId,
  setSelectedRoutineId,
  selectedExerciseId,
  setSelectedExerciseId,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <div className="filters-sort-controls">
      <select
        value={selectedRoutineId}
        onChange={(e) =>
          setSelectedRoutineId(Number(e.target.value) || 'all')
        }
      >
        <option value="all">Todas las Rutinas</option>
        {routinesData.map((routine) => (
          <option key={routine.id} value={routine.id}>
            {routine.name}
          </option>
        ))}
      </select>

      <select
        value={selectedExerciseId}
        onChange={(e) =>
          setSelectedExerciseId(Number(e.target.value) || 'all')
        }
      >
        <option value="all">Todos los Ejercicios</option>
        {exercisesData.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
      >
        <option value="created_at">Ordenar por Fecha</option>
        <option value="exercise_name">Ordenar por Ejercicio</option>
        <option value="routine_name">Ordenar por Rutina</option>
      </select>

      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
      >
        <option value="desc">Descendente</option>
        <option value="asc">Ascendente</option>
      </select>
    </div>
  );
};

export default WorkoutHistoryFilters;
