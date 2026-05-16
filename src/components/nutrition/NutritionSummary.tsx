import React from 'react';
import './NutritionSummary.css';

interface NutritionSummaryProps {
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
}

const NutritionSummary: React.FC<NutritionSummaryProps> = ({
  totalCalories,
  totalProteins,
  totalCarbs,
  totalFats,
}) => {
  return (
    <div className="nutrition-summary-container card-base">
      <h2>Resumen Diario</h2>
      <div className="summary-grid">
        <div className="summary-item">
          <span className="value">{totalCalories.toFixed(0)}</span>
          <span className="label">Calorías</span>
        </div>
        <div className="summary-item">
          <span className="value">{totalProteins.toFixed(1)}g</span>
          <span className="label">Proteínas</span>
        </div>
        <div className="summary-item">
          <span className="value">{totalCarbs.toFixed(1)}g</span>
          <span className="label">Carbs</span>
        </div>
        <div className="summary-item">
          <span className="value">{totalFats.toFixed(1)}g</span>
          <span className="label">Grasas</span>
        </div>
      </div>
    </div>
  );
};

export default NutritionSummary;
