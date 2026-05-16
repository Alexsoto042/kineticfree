import React from 'react';
import { FaFire } from 'react-icons/fa';
import './StreakWidget.css';

interface StreakWidgetProps {
  streak: number;
}

const StreakWidget = React.memo(({ streak }: StreakWidgetProps) => {
  const message =
    streak > 0
      ? `¡Sigue así!`
      : 'Completa un entrenamiento para empezar tu racha.';

  return (
    <div
      className={`streak-widget-container card-base ${streak > 0 ? 'on-fire' : ''}`}
    >
      <div className="streak-icon">
        <FaFire />
      </div>
      <div className="streak-info">
        <h3>Racha de Entrenamiento</h3>
        <p className="streak-days">
          {streak} {streak === 1 ? 'día' : 'días'}
        </p>
        <p className="streak-message">{message}</p>
      </div>
    </div>
  );
});

StreakWidget.displayName = 'StreakWidget';

export default StreakWidget;
