import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkoutLogs } from '../hooks/useWorkoutLogs';
import type { WorkoutLog } from '../types';
import ShareButtons from '../components/social/ShareButtons';
import './WorkoutSummary.css';

function WorkoutSummary() {
  const location = useLocation();
  const navigate = useNavigate();
  const { saveWorkoutLogs, error: saveError } = useWorkoutLogs();

  const [routineName, setRoutineName] = useState('Entrenamiento');
  const [summaryStats, setSummaryStats] = useState({
    totalReps: 0,
    totalSets: 0,
    totalVolume: 0,
  });
  const [status, setStatus] = useState('loading'); // loading, success, error

  const handleSaveWorkout = useCallback(
    async (sessionLogs: Partial<WorkoutLog>[]) => {
      try {
        await saveWorkoutLogs(sessionLogs);
        setStatus('success');
      } catch {
        setStatus('error');
      }
    },
    [saveWorkoutLogs]
  );

  useEffect(() => {
    if (
      location.state &&
      location.state.logs &&
      location.state.logs.length > 0
    ) {
      const sessionLogs = location.state.logs as Partial<WorkoutLog>[];
      setRoutineName(location.state.routineName || 'Entrenamiento');

      const reps = sessionLogs.reduce((sum, log) => sum + (log.reps || 0), 0);
      const sets = sessionLogs.length;
      const volume = sessionLogs.reduce(
        (sum, log) => sum + (log.reps || 0) * (log.weight || 0),
        0
      );
      setSummaryStats({
        totalReps: reps,
        totalSets: sets,
        totalVolume: volume,
      });

      // Automatically save the workout
      handleSaveWorkout(sessionLogs);
    } else {
      setStatus('error');
    }
  }, [location.state, handleSaveWorkout]);

  const handleDone = () => {
    navigate('/'); // Navigate to the main dashboard
  };

  const handleDiscard = () => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres descartar este entrenamiento?'
      )
    ) {
      navigate('/');
    }
  };

  const shareText = `¡He completado mi entrenamiento "${routineName}" en Kinetic! He levantado un total de ${summaryStats.totalVolume.toLocaleString()} kg.`;

  return (
    <div className="workout-summary-container">
      <h1>¡Entrenamiento Completado!</h1>

      {status === 'loading' && <p>Guardando tu progreso...</p>}
      {status === 'success' && (
        <p className="success-message">
          ¡Tu entrenamiento ha sido guardado con éxito!
        </p>
      )}
      {status === 'error' && (
        <p className="error-message">
          No se pudo guardar el entrenamiento. {saveError?.message}
        </p>
      )}

      <h2>Resumen de "{routineName}"</h2>

      <div className="summary-stats-grid">
        <div className="summary-stat-card">
          <h3>{summaryStats.totalSets}</h3>
          <p>Series Totales</p>
        </div>
        <div className="summary-stat-card">
          <h3>{summaryStats.totalReps.toLocaleString()}</h3>
          <p>Reps Totales</p>
        </div>
        <div className="summary-stat-card">
          <h3>{summaryStats.totalVolume.toLocaleString()} kg</h3>
          <p>Volumen Total</p>
        </div>
      </div>

      <div className="share-section">
        <h3>¡Comparte tu progreso!</h3>
        <ShareButtons text={shareText} />
      </div>

      <div className="summary-actions">
        <button onClick={handleDone} className="control-button">
          Hecho
        </button>
        <button onClick={handleDiscard} className="control-button secondary">
          Descartar
        </button>
      </div>
    </div>
  );
}

export default WorkoutSummary;
