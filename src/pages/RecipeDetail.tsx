// src/pages/RecipeDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import type { Recipe } from '../types';
import './RecipeDetail.css';

const RecipeDetail: React.FC = () => {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId) {
        setError('No se ha proporcionado un ID de receta.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (error) {
          throw error;
        }
        if (data) {
          // The 'ingredients' field is a JSON string, so we need to parse it.
          if (typeof data.ingredients === 'string') {
            data.ingredients = JSON.parse(data.ingredients);
          }
          setRecipe(data as Recipe);
        }
      } catch (err: any) {
        setError('No se pudo cargar la receta.');
        console.error('Error fetching recipe:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId]);

  if (loading) {
    return <div className="recipe-detail-container">Cargando receta...</div>;
  }

  if (error) {
    return <div className="recipe-detail-container error-message">{error}</div>;
  }

  if (!recipe) {
    return <div className="recipe-detail-container">Receta no encontrada.</div>;
  }

  return (
    <div className="recipe-detail-container">
      <header className="recipe-detail-header">
        <h1>{recipe.name}</h1>
        <img src={recipe.image_url} alt={recipe.name} className="recipe-detail-image" />
        <p className="recipe-description">{recipe.description}</p>
      </header>

      <div className="recipe-detail-body">
        <div className="recipe-ingredients-section">
          <h2>Ingredientes</h2>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                <strong>{ingredient.item}:</strong> {ingredient.quantity}
              </li>
            ))}
          </ul>
        </div>

        <div className="recipe-instructions-section">
          <h2>Instrucciones</h2>
          <ol>
            {recipe.instructions.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="recipe-meta-footer">
        <div className="meta-item">
          <span>Preparación</span>
          <p>{recipe.prep_time_minutes} min</p>
        </div>
        <div className="meta-item">
          <span>Cocción</span>
          <p>{recipe.cook_time_minutes} min</p>
        </div>
        <div className="meta-item">
          <span>Porciones</span>
          <p>{recipe.servings}</p>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;