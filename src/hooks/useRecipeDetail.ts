// src/hooks/useRecipeDetail.ts
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Recipe } from '../types';

export const useRecipeDetail = (recipeId: string | undefined) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!recipeId) {
      setLoading(false);
      return;
    }

    const fetchRecipeDetail = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();

        if (error) throw error;
        setRecipe(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetail();
  }, [recipeId]);

  return { recipe, loading, error };
};
