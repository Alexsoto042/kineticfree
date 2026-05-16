import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaYoutube,
  FaFire,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { Tag } from '../ui/Tag/Tag';
import { AdaptiveMedia } from '../common/AdaptiveMedia';
import { useExerciseDetail } from '../../hooks/useExerciseDetail';
import './ExerciseDetail.css';

const getYouTubeID = (id: string): string | null => {
  // Assuming the input 'id' is already the YouTube video ID
  return id && id.length === 11 ? id : null;
};

function ExerciseDetail() {
  const { exerciseId, id } = useParams<{ exerciseId?: string; id?: string }>();
  const finalId = exerciseId || id;
  
  const { exercise, loading, error } = useExerciseDetail(finalId);
  const [showVideo, setShowVideo] = useState(false);
  const { t } = useTranslation();

  if (loading) {
    return <div className="loading-container">Cargando ejercicio...</div>;
  }

  if (error || !exercise) {
    return (
      <div className="error-message">
        Error: {error || 'Ejercicio no encontrado.'}
      </div>
    );
  }

  const videoId = exercise.youtube_id
    ? getYouTubeID(exercise.youtube_id)
    : getYouTubeID('dQw4w9WgXcQ'); // Fallback video

  return (
    <div className="exercise-detail-container">
      <Link to="/exercises" className="back-link">
        &#8592; Volver a la lista
      </Link>
      <header className="exercise-detail-header">
        <h1>{exercise.name}</h1>
        <div className="exercise-header-badges" data-testid="header-badges">
          <Tag label={t(exercise.category)} type={exercise.category} className="category-badge" />
          {exercise.body_zone.map((zone: string) => (
            <Tag key={zone} label={t(zone)} type={zone} className="body-zone-badge" />
          ))}
        </div>
      </header>

      <div className="exercise-content">
        <div className="exercise-media card-base">
          {showVideo && videoId ? (
            <div className="video-responsive">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={exercise.name}
              ></iframe>
            </div>
          ) : (
            <div className="image-container">
              <AdaptiveMedia
                src={exercise.gif_url}
                fallbackSrc={exercise.image}
                alt={`Demostración de ${exercise.name}`}
                className="exercise-image"
              />
            </div>
          )}

          {videoId && !showVideo && (
            <button
              className="video-tutorial-button btn btn-primary"
              onClick={() => setShowVideo(true)}
            >
              <FaYoutube /> Ver Tutorial en Video
            </button>
          )}
        </div>
        <div className="exercise-instructions card-base">
          <h3>Descripción</h3>
          <p>{exercise.description}</p>

          {exercise.benefits && (
            <div className="exercise-benefits">
              <h3>Beneficios</h3>
              <p>{exercise.benefits}</p>
            </div>
          )}

          {exercise.calories_burned_per_minute && (
            <div className="exercise-calories">
              <h3>Calorías Quemadas</h3>
              <p>
                <FaFire size={16} /> Aproximadamente{' '}
                {exercise.calories_burned_per_minute} calorías por minuto
              </p>
            </div>
          )}

          <h3>Cómo se hace</h3>
          <ol>
            {exercise.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>

          <div className="exercise-equipment-info">
            <h3>Equipamiento Necesario</h3>
            <p
              className={
                exercise.requires_machine ? 'requires-machine' : 'no-machine'
              }
            >
              {exercise.requires_machine ? (
                <>
                  <FaCheckCircle /> Requiere máquina de gimnasio
                </>
              ) : (
                <>
                  <FaTimesCircle /> No requiere equipamiento específico
                </>
              )}
            </p>
          </div>

          {exercise.alternatives && exercise.alternatives.length > 0 && (
            <div className="exercise-alternatives card-base">
              <h3>Alternativas de Ejercicio</h3>
              <div className="alternatives-list">
                {exercise.alternatives.map((alt) => (
                  <Link
                    to={`/exercise/${alt.id}`}
                    key={alt.id}
                    className="alternative-card card-base"
                  >
                    <div className="alternative-media">
                         <AdaptiveMedia
                            src={alt.gif_url}
                            fallbackSrc={alt.image}
                            alt={alt.name}
                          />
                    </div>
                    <span>{alt.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetail;