import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../../types';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Card } from '../ui/Card/Card';
import { Tag } from '../ui/Tag/Tag';
import { Button } from '../ui/Button/Button';
import { AdaptiveMedia } from '../common/AdaptiveMedia';
import './ExerciseCard.css';

interface ExerciseCardProps {
  exercise: Exercise;
  onAdd?: (exercise: Exercise) => void;
}

export const ExerciseCard = memo(({ exercise, onAdd }: ExerciseCardProps) => {
  const { t } = useTranslation();

  // Haptic feedback function
  const triggerHapticFeedback = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      // Haptics not available or failed, ignore
    }
  };

  const cardContent = (
    <Card className="exercise-card" interactive={!onAdd}>
      <div className="exercise-card__image-container">
        <AdaptiveMedia
          src={exercise.gif_url}
          fallbackSrc={exercise.image}
          alt={exercise.name}
          className="exercise-card__image"
        />
        {onAdd && (
          <div className="exercise-card__overlay">
            <Button
              variant="primary"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                triggerHapticFeedback();
                onAdd(exercise);
              }}
              className="add-btn"
              aria-label="Añadir a rutina"
            >
              <Plus size={20} />
            </Button>
          </div>
        )}
      </div>

      <div className="exercise-card__content">
        <div className="exercise-card__header">
          <h3 className="exercise-card__title">{exercise.name}</h3>
          <div className="exercise-card__badges">
            <Tag label={t(exercise.category)} type={exercise.category} />
            {exercise.body_zone.map((zone) => (
              <Tag key={zone} label={t(zone)} type={zone} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );

  // If no onAdd prop, wrap in Link for navigation
  if (!onAdd) {
    return (
      <Link to={`/exercises/${exercise.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        {cardContent}
      </Link>
    );
  }

  return cardContent;
});