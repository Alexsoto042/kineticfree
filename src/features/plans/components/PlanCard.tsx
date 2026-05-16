// src/components/PlanCard.tsx
import React from 'react';
import type { Plan } from '../../../types'; // Import global Plan interface
import './PlanCard.css';

interface PlanCardProps {
  plan: Plan;
  goalName: string;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, goalName }) => {
  return (
    <div className="plan-card">
      <div className="plan-card__header">
        <span className="plan-card__goal">{goalName}</span>
        <h3 className="plan-card__title">{plan.name}</h3>
      </div>
      <p className="plan-card__description">{plan.description}</p>
      {plan.diet_recommendation && (
        <p className="plan-card__diet-recommendation">
          **Dieta:** {plan.diet_recommendation}
        </p>
      )}
      {plan.meal_plan_description && (
        <p className="plan-card__meal-plan-description">
          **Comidas:** {plan.meal_plan_description}
        </p>
      )}
      <div className="plan-card__footer">
        <span className="plan-card__duration">
          {plan.duration_weeks} semanas
        </span>
      </div>
    </div>
  );
};

export default PlanCard;
