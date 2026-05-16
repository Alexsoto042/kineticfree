import { useNavigate } from 'react-router-dom';
import { useGoals } from '../../hooks/useGoals';
import { FaBullseye } from 'react-icons/fa';
import './GoalWidget.css';

function GoalWidget() {
  const { goals, loading, error } = useGoals();
  const navigate = useNavigate();

  const activeGoals = goals
    .filter((g) => g.status === 'in_progress')
    .slice(0, 3); // Show top 3 active goals

  const handleCardClick = () => {
    navigate('/goals');
  };

  return (
    <div 
      className="goal-widget-container stat-card clickable-card" 
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <div className="widget-header">
        <FaBullseye className="widget-icon" />
        <h3>Metas Activas</h3>
      </div>
      {loading && <p>Cargando...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && (
        <div className="goal-widget-list">
          {activeGoals.length === 0 ? (
            <p className="empty-state">
              No hay metas activas. ¡Crea una!
            </p>
          ) : (
            activeGoals.map((goal) => (
              <div key={goal.id} className="goal-widget-item">
                <p className="goal-description">{goal.description}</p>
                <progress
                  value={goal.current_value}
                  max={goal.target_value}
                ></progress>
                <span className="goal-progress-text">
                  {goal.current_value} / {goal.target_value} {goal.unit}
                </span>
              </div>
            ))
          )}
          {goals.length > 3 && (
            <span className="view-all-link">
              Ver todas las metas &rarr;
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default GoalWidget;
