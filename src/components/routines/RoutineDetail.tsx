import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useRoutineDetail } from '../../hooks/useRoutineDetail';
import { FaExchangeAlt, FaDownload } from 'react-icons/fa';
import { downloadRoutine } from '../../lib/sync';
import { toast } from 'react-hot-toast';
import './RoutineDetail.css';
import type { Exercise } from '../../types';
import { setLastSeenRoutineId } from '../../lib/cacheManager';

function RoutineDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    routine,
    routineExercises: initialExercises,
    setRoutineExercises,
    loading,
    error,
  } = useRoutineDetail(id);

  useEffect(() => {
    if (id) {
      setLastSeenRoutineId(id);
    }
  }, [id]);

  // Local state to manage the list of exercises, allowing for swapping
  const [currentExercises, setCurrentExercises] = useState<Exercise[]>([]);
  const [expandedExerciseId, setExpandedExerciseId] = useState<number | null>(
    null
  );

  useEffect(() => {
    setCurrentExercises(initialExercises);
  }, [initialExercises]);

  const handleToggleAlternatives = (exerciseId: number) => {
    setExpandedExerciseId((prevId) =>
      prevId === exerciseId ? null : exerciseId
    );
  };

  const handleSwapExercise = (
    originalExerciseId: number,
    newExercise: Exercise
  ) => {
    const updatedExercises = currentExercises.map((ex) =>
      ex.id === originalExerciseId ? newExercise : ex
    );
    setCurrentExercises(updatedExercises);
    setExpandedExerciseId(null); // Close the alternatives list
  };

  if (loading) {
    return <div className="loading-container">Cargando rutina...</div>;
  }

  if (error || !routine) {
    return (
      <div className="not-found-container">
        <h2>Error</h2>
        <p>{error || 'La rutina que buscas no existe.'}</p>
        <Link to="/routines" className="back-link">
          Volver a la lista
        </Link>
      </div>
    );
  }

  return (
    <div className="routine-detail-container">
      <header className="routine-detail-header">
        <h1>{routine.name}</h1>
        <p className="routine-description">{routine.description}</p>
        <div className="header-badges">{/* Badges remain the same */}</div>
        <button 
          className="download-routine-btn"
          onClick={async () => {
            if (!routine) return;
            const toastId = toast.loading('Descargando rutina...');
            try {
              await downloadRoutine(routine.id);
              toast.success('Rutina descargada para uso offline', { id: toastId });
            } catch (error) {
              console.error(error);
              toast.error('Error al descargar la rutina', { id: toastId });
            }
          }}
        >
          <FaDownload /> Descargar
        </button>
      </header>

      <div className="start-workout-container">
        <Link to={`/workout/${routine.id}`} className="start-workout-button">
          Iniciar Entrenamiento
        </Link>
      </div>

      <div className="routine-exercises-list">
        <h2>Ejercicios de la Rutina</h2>
        {currentExercises.map((exercise) => (
          <div key={exercise.id} className="exercise-item-wrapper">
            <div className="exercise-main-row">
              <Link
                to={`/exercise/${exercise.id}`}
                className="exercise-link-card"
              >
                <video
                  src={exercise.gif_url || exercise.image}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="exercise-thumbnail"
                />
                <div className="exercise-info">
                  <h3>{exercise.name}</h3>
                  <p className="exercise-target">
                    {(exercise.body_zone || []).join(', ')}
                  </p>
                </div>
              </Link>
              {exercise.alternatives && exercise.alternatives.length > 0 && (
                <button
                  onClick={() => handleToggleAlternatives(exercise.id)}
                  className="alternatives-toggle-btn"
                >
                  <FaExchangeAlt />
                  <span>Ver Alternativas</span>
                </button>
              )}
            </div>
            {expandedExerciseId === exercise.id && (
              <div className="alternatives-container">
                <h4>Alternativas para {exercise.name}</h4>
                {exercise.alternatives?.map((alt) => (
                  <div key={alt.id} className="alternative-exercise-item">
                    <video
                      src={alt.gif_url || alt.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="alternative-thumbnail"
                    />
                    <span>{alt.name}</span>
                    <button
                      onClick={() => handleSwapExercise(exercise.id, alt)}
                      className="swap-btn"
                    >
                      Sustituir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Link to="/routines" className="back-link">
        ‹ Volver a la lista de rutinas
      </Link>
    </div>
  );
}

export default RoutineDetail;
