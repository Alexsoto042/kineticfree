import React from 'react';
import { Link } from 'react-router-dom';
import type { Routine } from '../../../types';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui/Card/Card';
import { Tag } from '../../../components/ui/Tag/Tag';
import './RoutineCard.css';

interface RoutineCardProps {
  routine: Routine;
  to: string;
  className?: string;
}

const RoutineCard: React.FC<RoutineCardProps> = ({ routine, to, className }) => {
  const { t } = useTranslation();
  return (
    <Link to={to} className={`routine-card-link ${className || ''}`}>
      <Card className="routine-card" interactive>
        <div className="routine-card__header">
          <h3 className="routine-card__title">{routine.name}</h3>
        </div>
        {routine.description && (
          <p className="routine-card__description">{routine.description}</p>
        )}
        <div className="routine-card__meta">
          <Tag label={t(routine.category)} type={routine.category} className="routine-card__meta-item" />
          <Tag label={t(routine.difficulty)} type={routine.difficulty} className="routine-card__meta-item" />
          <Tag label={t(routine.goal)} type={routine.goal} className="routine-card__meta-item" />
        </div>
      </Card>
    </Link>
  );
};

export default React.memo(RoutineCard);
