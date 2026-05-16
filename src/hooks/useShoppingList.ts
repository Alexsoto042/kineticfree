// src/hooks/useShoppingList.ts
import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { RecipeIngredientItem } from '../types';

export interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

export interface ShoppingList {
  [key: string]: {
    quantity: number | string;
    unit: string;
  };
}

export const useShoppingList = (planId: string | undefined) => {
  const [shoppingList, setShoppingList] = useState<ShoppingList>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const generateShoppingList = useCallback(async () => {
    if (!planId) return;

    setLoading(true);
    setError(null);
    setShoppingList({});

    try {
      // 1. Get all recipe_ids for the given plan
      const { data: planRecipes, error: planRecipesError } = await supabase
        .from('plan_recipes')
        .select('recipe_id')
        .eq('plan_id', planId);

      if (planRecipesError) throw planRecipesError;
      if (!planRecipes || planRecipes.length === 0) {
        // No recipes for this plan, so the list is empty.
        setLoading(false);
        return;
      }

      const recipeIds = planRecipes.map((pr) => pr.recipe_id);

      // 2. Get all ingredients for those recipes
      const { data: recipeIngredientsData, error: recipeIngredientsError } =
        await supabase
          .from('recipe_ingredients')
          .select('quantity, unit, ingredients(name)')
          .in('recipe_id', recipeIds);

      if (recipeIngredientsError) throw recipeIngredientsError;

      const recipeIngredients = (recipeIngredientsData || []) as RecipeIngredientItem[];

      // 3. Consolidate the ingredients into a shopping list
      const consolidatedList: ShoppingList = {};

      recipeIngredients.forEach((item) => {
        const ingredientName = item.ingredients?.[0]?.name;
        if (!ingredientName) return;

        const name = ingredientName;
        if (consolidatedList[name]) {
          // Simple addition for now. A real-world app would need unit conversion.
          if (consolidatedList[name].unit === item.unit) {
            (consolidatedList[name].quantity as number) += item.quantity;
          } else {
            // If units are different, just append for now.
            // e.g., "100g, 1 unit"
            consolidatedList[name].quantity =
              `${consolidatedList[name].quantity}, ${item.quantity}`;
            consolidatedList[name].unit =
              `${consolidatedList[name].unit}, ${item.unit}`;
          }
        } else {
          consolidatedList[name] = {
            quantity: item.quantity,
            unit: item.unit,
          };
        }
      });

      setShoppingList(consolidatedList);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  return { shoppingList, loading, error, generateShoppingList };
};
