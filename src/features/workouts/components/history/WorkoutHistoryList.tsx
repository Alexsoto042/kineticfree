// src/components/workout_history/WorkoutHistoryList.tsx
import React from 'react';
import { Dumbbell } from 'lucide-react';
import type { WorkoutLog } from '../../../../types';
import { EmptyState } from '../../../../components/ui/EmptyState';

interface WorkoutLogDisplay extends WorkoutLog {
  exercise_name?: string;
  routine_name?: string;
}

interface WorkoutHistoryListProps {
  logs: WorkoutLogDisplay[];
}

const WorkoutHistoryList: React.FC<WorkoutHistoryListProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={<Dumbbell size={64} />}
        title="No hay entrenamientos registrados"
        description="Comienza a entrenar y tus sesiones aparecerán aquí. Podrás ver tu progreso y estadísticas."
      />
    );
  }

  return (
    <div className="workout-logs-list">
      {logs.map((log) => (
        <div key={log.id} className="workout-log-item">
          <h3>
            {log.exercise_name} en {log.routine_name}
          </h3>
          <p>Fecha: {new Date(log.created_at!).toLocaleDateString()}</p>
          {log.set_number && <p>Serie: {log.set_number}</p>}
          {log.reps && <p>Repeticiones: {log.reps}</p>}
          {log.weight && <p>Peso: {log.weight} kg</p>}
        </div>
      ))}
    </div>
  );
};

export default WorkoutHistoryList;
