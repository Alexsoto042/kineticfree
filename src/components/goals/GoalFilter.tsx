import { useFilters } from '../../context/FilterContext';
import type { RoutineGoal } from '../../types';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button/Button';
import './GoalFilter.css';

// Usa las llaves en inglés para la lógica, la UI se traducirá
const goals: (RoutineGoal | 'Todos')[] = [
  'Todos',
  'weight_loss',
  'muscle_gain',
  'endurance',
  'general_fitness',
];

function GoalFilter() {
  const { goalFilter, setGoalFilter } = useFilters();
  const { t } = useTranslation();

  return (
    <div className="goal-filter-container">
      <h4>Filtrar por Objetivo:</h4>
      <div className="goal-buttons">
        {goals.map((goal) => (
          <Button
            key={goal}
            onClick={() => setGoalFilter(goal)}
            variant={goalFilter === goal ? 'primary' : 'secondary'}
          >
            {t(goal)}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default GoalFilter;