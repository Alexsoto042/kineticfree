// src/pages/PlanDetail.tsx
import { useParams } from 'react-router-dom';
import { usePlanDetail } from '../hooks/usePlanDetail';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import RoutineCard from '../components/routines/RoutineCard';
import RecipeCard from '../components/recipes/RecipeCard';
import ShoppingList from '../components/nutrition/ShoppingList';
import './PlanDetail.css';

const daysOfWeek = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealTypeTranslations: { [key: string]: string } = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
  snack: 'Snack',
};

function PlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const { plan, routines, loading, error } = usePlanDetail(planId);

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="plan-detail-container error-message">
        Error: {error.message}
      </div>
    );
  }

  if (!plan) {
    return <div className="plan-detail-container">Plan no encontrado.</div>;
  }

  return (
    <div className="plan-detail-container">
      <header className="plan-detail-header">
        <h1>{plan.name}</h1>
        <p>{plan.description}</p>
        <div className="plan-meta">
          <span>
            <strong>Objetivo:</strong> {plan.goal_id.replace(/_/g, ' ')}
          </span>
          <span>
            <strong>Duración:</strong> {plan.duration_weeks} semanas
          </span>
        </div>

        {plan.diet_recommendation && (
          <div className="diet-recommendation">
            <h3>Recomendación de Dieta:</h3>
            <p>{plan.diet_recommendation}</p>
          </div>
        )}

        {plan.meal_plan_description && (
          <div className="meal-plan-description">
            <h3>Descripción del Plan de Comidas:</h3>
            <p>{plan.meal_plan_description}</p>
          </div>
        )}

        {plan.foods_to_eat && plan.foods_to_eat.length > 0 && (
          <div className="foods-recommendation">
            <h3>Alimentos Recomendados:</h3>
            <ul>
              {plan.foods_to_eat.map((food, index) => (
                <li key={index}>{food}</li>
              ))}
            </ul>
          </div>
        )}

        {plan.foods_to_avoid && plan.foods_to_avoid.length > 0 && (
          <div className="foods-avoid">
            <h3>Alimentos a Evitar:</h3>
            <ul>
              {plan.foods_to_avoid.map((food, index) => (
                <li key={index}>{food}</li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <div className="weekly-schedule">
        <h2>Plan Semanal de Entrenamiento</h2>
        <div className="days-grid">
          {daysOfWeek.map((day, index) => {
            const dayNumber = index + 1;
            const routineForDay = routines.find(
              (r) => r.day_of_week === dayNumber
            );
            return (
              <div key={day} className="day-column">
                <h3>{day}</h3>
                <div className="routine-slot">
                  {routineForDay ? (
                    <RoutineCard
                      routine={routineForDay}
                      to={`/routine/${routineForDay.id}`}
                    />
                  ) : (
                    <div className="rest-day-card">
                      <h4>Día de Descanso</h4>
                      <p>Recuperación y crecimiento.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="nutrition-schedule">
        <h2>Plan Semanal de Nutrición</h2>
        <div className="days-grid">
          {daysOfWeek.map((day, index) => {
            const dayNumber = index + 1;
            return (
              <div key={day} className="day-column">
                <h3>{day}</h3>
                {mealTypes.map((mealType) => {
                  const recipesForDayAndMeal = plan.recipes?.filter(
                    (r) =>
                      r.day_of_week === dayNumber && r.meal_type === mealType
                  );
                  return (
                    <div key={mealType} className="meal-slot">
                      <h4>{mealTypeTranslations[mealType]}</h4>
                      {recipesForDayAndMeal &&
                      recipesForDayAndMeal.length > 0 ? (
                        recipesForDayAndMeal.map((planRecipe) => (
                          <RecipeCard
                            key={planRecipe.recipe.id}
                            recipe={planRecipe.recipe}
                          />
                        ))
                      ) : (
                        <div className="no-recipe-card">
                          <p>Sin receta asignada.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="shopping-list-section">
        <h2>Lista de la Compra</h2>
        {planId && <ShoppingList planId={planId} />}
      </div>
    </div>
  );
}

export default PlanDetail;
