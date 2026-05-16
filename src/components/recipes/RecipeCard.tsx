// src/components/recipes/RecipeCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import type { Recipe } from '../../types';
import { LazyImage } from '../ui/LazyImage';
import './RecipeCard.css';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
      <LazyImage 
        src={recipe.image_url} 
        alt={recipe.name} 
        className="recipe-image"
      />
      <div className="recipe-card-content">
        <div>
          <h3>{recipe.name}</h3>
          <p>{recipe.description}</p>
        </div>
        <div className="recipe-macros">
          <span>🔥 {recipe.calories} kcal</span>
          <span>💪 {recipe.protein_grams}g P</span>
          <span>🍞 {recipe.carbs_grams}g C</span>
          <span>🥑 {recipe.fat_grams}g G</span>
        </div>
      </div>
    </Link>
  );
};

export default React.memo(RecipeCard);
