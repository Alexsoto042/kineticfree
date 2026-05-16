import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Exercise } from '../types';
import { ImageUploader } from '../components/ui/ImageUploader'; // Import ImageUploader
import { useToasts } from '../hooks/useToasts';

const ExerciseAdmin: React.FC = () => {
  const { showSuccessToast, showErrorToast } = useToasts();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<number | null>(
    null
  ); // State to track which exercise is being edited

  useEffect(() => {
    async function fetchExercises() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('exercises')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;
        setExercises(data || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch exercises'
        );
      } finally {
        setLoading(false);
      }
    }
    fetchExercises();
  }, []);

  const handleGifUpload = async (exerciseId: number, publicUrl: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .update({ image: publicUrl })
        .eq('id', exerciseId);

      if (error) throw error;

      // Update local state to reflect the new image
      setExercises((prevExercises) =>
        prevExercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, image: publicUrl } : ex
        )
      );
      showSuccessToast('Imagen del ejercicio actualizada!');
      setEditingExerciseId(null); // Close the uploader
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Error al actualizar la imagen del ejercicio';
      showErrorToast(errorMessage);
      console.error('Update exercise image error:', err);
    }
  };

  if (loading)
    return (
      <div className="exercise-admin-container">Cargando ejercicios...</div>
    );
  if (error)
    return (
      <div className="exercise-admin-container error-message">
        Error: {error}
      </div>
    );

  return (
    <div className="exercise-admin-container">
      <h1>Administrar Ejercicios</h1>
      <div className="exercise-list-admin">
        {exercises.length === 0 ? (
          <p>No se encontraron ejercicios.</p>
        ) : (
          exercises.map((exercise) => (
            <div key={exercise.id} className="exercise-admin-item">
              <img
                src={
                  exercise.image ||
                  'https://via.placeholder.com/100?text=No+Image'
                }
                alt={exercise.name}
                className="exercise-admin-image"
              />
              <div className="exercise-admin-details">
                <h3>{exercise.name}</h3>
                <p>
                  {exercise.category} - {exercise.body_zone.join(', ')}
                </p>
              </div>
              <div className="exercise-admin-actions">
                {editingExerciseId === exercise.id ? (
                      <ImageUploader
                        bucketName="exercise-gifs"
                        filePath={`${exercise.id}.gif`}
                        onUploadSuccess={(url) => handleGifUpload(exercise.id, url)}
                        onUploadError={(error) => showErrorToast(error.message)}
                      />
                ) : (
                  <button onClick={() => setEditingExerciseId(exercise.id)}>
                    Editar Imagen
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ExerciseAdmin;
