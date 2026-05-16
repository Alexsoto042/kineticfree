import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { WorkoutLog } from '../types';
import { format } from 'date-fns'; // Assuming date-fns is installed or will be
import './WorkoutHistoryDetail.css'; // New CSS file for this page

interface WorkoutLogDisplay extends WorkoutLog {
  exercise_name?: string;
  routine_name?: string;
}

function WorkoutHistoryDetail() {
  const { logId } = useParams<{ logId: string }>();
  const navigate = useNavigate();
  const [workoutLog, setWorkoutLog] = useState<WorkoutLogDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWorkoutLog() {
      if (!logId) {
        setError('ID de registro de entrenamiento no proporcionado.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch the specific workout log
        const { data: logData, error: logError } = await supabase
          .from('workout_logs')
          .select('*')
          .eq('id', logId)
          .single();

        if (logError) throw logError;
        if (!logData) {
          setError('Registro de entrenamiento no encontrado.');
          setLoading(false);
          return;
        }

        // Fetch associated exercise and routine names
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('name')
          .eq('id', logData.exercise_id)
          .single();
        if (exerciseError) throw exerciseError;

        const { data: routineData, error: routineError } = await supabase
          .from('routines')
          .select('name')
          .eq('id', logData.routine_id)
          .single();
        if (routineError) throw routineError;

        setWorkoutLog({
          ...logData,
          exercise_name: exerciseData?.name || 'Desconocido',
          routine_name: routineData?.name || 'Desconocida',
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
        console.error('Error fetching workout log details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchWorkoutLog();
  }, [logId]);

  if (loading) {
    return (
      <div className="workout-history-detail-container">
        Cargando detalles del entrenamiento...
      </div>
    );
  }

  if (error) {
    return (
      <div className="workout-history-detail-container error-message">
        Error: {error}
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  if (!workoutLog) {
    return (
      <div className="workout-history-detail-container">
        No se pudo cargar el registro del entrenamiento.
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  return (
    <div className="workout-history-detail-container">
      <h1>Detalles del Entrenamiento</h1>
      <button onClick={() => navigate(-1)} className="back-button">
        Volver al Historial
      </button>

      <div className="detail-card">
        <h2>{workoutLog.exercise_name}</h2>
        <p>
          <strong>Rutina:</strong> {workoutLog.routine_name}
        </p>
        <p>
          <strong>Fecha:</strong>{' '}
          {format(new Date(workoutLog.created_at!), 'dd/MM/yyyy HH:mm')}
        </p>
        {workoutLog.sets && (
          <p>
            <strong>Series:</strong> {workoutLog.sets}
          </p>
        )}
        {workoutLog.reps && (
          <p>
            <strong>Repeticiones:</strong> {workoutLog.reps}
          </p>
        )}
        {workoutLog.weight && (
          <p>
            <strong>Peso:</strong> {workoutLog.weight} kg
          </p>
        )}
        {workoutLog.duration_seconds && (
          <p>
            <strong>Duración:</strong> {workoutLog.duration_seconds} segundos
          </p>
        )}
        {workoutLog.notes && (
          <p>
            <strong>Notas:</strong> {workoutLog.notes}
          </p>
        )}
      </div>
    </div>
  );
}

export default WorkoutHistoryDetail;
