import type { Exercise } from '../../../../types';
import { AdaptiveMedia } from '../../../../components/common/AdaptiveMedia';
import './CurrentExerciseDisplay.css';

interface CurrentExerciseDisplayProps {
  exercise: Exercise | null;
  routineExercise: any | null; // Add routineExercise prop
  loading: boolean;
}

export function CurrentExerciseDisplay({
  exercise,
  routineExercise, // Add routineExercise prop
  loading,
}: CurrentExerciseDisplayProps) {
  if (loading) {
    return <div>Cargando ejercicio...</div>;
  }

  if (!exercise) {
    return <div>No hay ejercicio para mostrar.</div>;
  }

  return (
    <>
      <h2>{exercise.name}</h2>
      {(exercise.gif_url || exercise.image) && (
        <div className="exercise-image-wrapper">
          <video
            key={exercise.id} // Force reload when exercise changes
            src={exercise.gif_url || exercise.image}
            autoPlay
            loop
            muted
            playsInline
            className="card-image" /* Re-using from index.css */
          />
        </div>
      )}
      <div className="exercise-details">
        <p>
          <strong>Categoría:</strong> {exercise.category}
        </p>
        <p>
          <strong>Zona Corporal:</strong> {exercise.body_zone.join(', ')}
        </p>
        {/* Temporarily removed conditional rendering to debug */}
        {/* {routineExercise && (
          <div className="prescribed-details">
            <h3>Prescripción:</h3>
            <p>
              <strong>Series:</strong> {routineExercise.prescribed_sets}
            </p>
            <p>
              <strong>Repeticiones:</strong> {routineExercise.prescribed_reps}
            </p>
            <p>
              <strong>Peso:</strong> {routineExercise.prescribed_weight} kg
            </p>
          </div>
        )} */}
      </div>
      <div className="exercise-instructions">
        <h3>Instrucciones:</h3>
        <ul>
          {exercise.instructions.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ul>
      </div>
    </>
  );
}
