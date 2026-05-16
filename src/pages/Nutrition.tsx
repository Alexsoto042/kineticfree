import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { getNutritionalRecommendations } from '../lib/nutritionCalculator';
import { searchFoods, type Food } from '../lib/foodApi';
import { useDebounce } from '../hooks/useDebounce';
import type { Recipe, UserProfile, Answers } from '../types'; // Import Recipe, UserProfile and Answers types
import RecipeCard from '../components/recipes/RecipeCard'; // Import the RecipeCard component
import { Button } from '../components/ui/Button/Button';
import { EmptyState } from '../components/ui/EmptyState';
import './Nutrition.css';
import './Recipes.css'; // Import Recipes.css for recipe list styling

interface LoggedFood extends Food {
  quantity: number; // in grams
}

// RecipesList Component (moved from NutritionPage.tsx)
function RecipesList({ userFitnessGoal }: { userFitnessGoal: 'weight_loss' | 'muscle_gain' | 'maintenance' | null }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState(userFitnessGoal || 'all');

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      let query = supabase.from('recipes').select('*');

      if (filter !== 'all') {
        query = query.eq('goal', filter);
      }

      const { data, error } = await query;

      if (error) {
        setError('No se pudieron cargar las recetas.');
        console.error('Error fetching recipes:', error);
      } else {
        setRecipes(data as Recipe[]);
      }
      setLoading(false);
    };

    fetchRecipes();
  }, [filter]);

  return (
    <div className="recipes-section"> {/* Changed class name */}
      <header className="recipes-header">
        <h1>Recetas Saludables</h1>
        <p>Encuentra la comida perfecta para complementar tus objetivos.</p>
      </header>

      <div className="filter-container">
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>Todas</button>
        <button onClick={() => setFilter('weight_loss')} className={filter === 'weight_loss' ? 'active' : ''}>Perder Peso</button>
        <button onClick={() => setFilter('muscle_gain')} className={filter === 'muscle_gain' ? 'active' : ''}>Ganar Músculo</button>
        <button onClick={() => setFilter('maintenance')} className={filter === 'maintenance' ? 'active' : ''}>Mantener</button>
      </div>

      {loading && <p>Cargando recetas...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && recipes.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={64} />}
          title="No hay recetas disponibles"
          description="No se encontraron recetas para este filtro. Prueba con otra categoría o revisa más tarde."
        />
      ) : (
        <div className="recipe-list">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}


function Nutrition() {
  const { session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfileForNutrition | null>(null);
  const [recommendations, setRecommendations] = useState<ReturnType<typeof getNutritionalRecommendations> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Customization states
  const [customCalorieAdjustment, setCustomCalorieAdjustment] = useState<number | undefined>(undefined);
  const [customProteinPercentage, setCustomProteinPercentage] = useState<number | undefined>(undefined);
  const [customCarbsPercentage, setCustomCarbsPercentage] = useState<number | undefined>(undefined);
  const [customFatPercentage, setCustomFatPercentage] = useState<number | undefined>(undefined);

  // Food search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loggedFoods, setLoggedFoods] = useState<LoggedFood[]>([]);
  const [editingFoodQuantity, setEditingFoodQuantity] = useState<{ [key: string]: number }>({}); // State to manage quantity input for each logged food
  const [savedFoods, setSavedFoods] = useState<LoggedFood[]>([]);
  const [savedTotals, setSavedTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchFoods(query, 1, 20);
      setSearchResults(results);
    } catch (err) {
      console.error('Error during food search:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedPerformSearch = useDebounce(performSearch, 500);

  useEffect(() => {
    debouncedPerformSearch(searchTerm);
  }, [searchTerm, debouncedPerformSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchTerm);
  };

  const addFoodToLog = (food: Food) => {
    const quantity = 100; // Default quantity in grams
    const newLoggedFood: LoggedFood = { ...food, quantity };
    setLoggedFoods((prevFoods) => [...prevFoods, newLoggedFood]);
    setEditingFoodQuantity((prev) => ({ ...prev, [newLoggedFood.id]: quantity }));
  };

  const updateLoggedFoodQuantity = (foodId: string, newQuantity: number) => {
    setLoggedFoods((prevFoods) =>
      prevFoods.map((food) => (food.id === foodId ? { ...food, quantity: newQuantity } : food))
    );
    setEditingFoodQuantity((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[foodId];
      return newQuantities;
    });
  };

  const removeLoggedFood = (foodId: string) => {
    setLoggedFoods((prevFoods) => prevFoods.filter((food) => food.id !== foodId));
    setEditingFoodQuantity((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[foodId];
      return newQuantities;
    });
  };

  const calculateTotals = useCallback((foods: LoggedFood[]) => {
    return foods.reduce(
      (acc, food) => {
        const factor = food.quantity / 100;
        acc.calories += (food.nutriments['energy-kcal_100g'] || 0) * factor;
        acc.protein += (food.nutriments.proteins_100g || 0) * factor;
        acc.carbs += (food.nutriments.carbohydrates_100g || 0) * factor;
        acc.fat += (food.nutriments.fat_100g || 0) * factor;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, []);

  const currentLoggedTotals = useMemo(() => calculateTotals(loggedFoods), [loggedFoods, calculateTotals]);

  const fetchSavedFoods = useCallback(async () => {
    if (!session?.user) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const { data, error } = await supabase
        .from('logged_food_entries')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('entry_date', today);

      if (error) throw error;

      const fetchedFoods: LoggedFood[] = data.map(entry => ({
        id: entry.food_api_id,
        product_name: entry.product_name,
        nutriments: {
          'energy-kcal_100g': entry.calories_100g,
          proteins_100g: entry.proteins_100g,
          carbohydrates_100g: entry.carbohydrates_100g,
          fat_100g: entry.fat_100g,
        },
        quantity: entry.quantity_grams,
      }));
      setSavedFoods(fetchedFoods);
      setSavedTotals(calculateTotals(fetchedFoods));
    } catch (err: any) {
      console.error('Error fetching saved foods:', err.message);
      setError('Error cargando alimentos guardados.');
    } finally {
      setLoading(false);
    }
  }, [session, calculateTotals]);

  const handleSaveFoods = async () => {
    if (!session?.user || loggedFoods.length === 0) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const entriesToInsert = loggedFoods.map(food => ({
        user_id: session.user.id,
        entry_date: today,
        food_api_id: food.id,
        product_name: food.product_name,
        quantity_grams: food.quantity,
        calories_100g: food.nutriments['energy-kcal_100g'],
        proteins_100g: food.nutriments.proteins_100g,
        carbohydrates_100g: food.nutriments.carbohydrates_100g,
        fat_100g: food.nutriments.fat_100g,
      }));

      // Delete existing entries for today to avoid duplicates and simplify upsert logic
      const { error: deleteError } = await supabase
        .from('logged_food_entries')
        .delete()
        .eq('user_id', session.user.id)
        .eq('entry_date', today);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('logged_food_entries')
        .insert(entriesToInsert);

      if (insertError) throw insertError;

      setLoggedFoods([]); // Clear current logged foods after saving
      setEditingFoodQuantity({});
      await fetchSavedFoods(); // Refresh saved foods
      alert('Alimentos guardados exitosamente!');
    } catch (err: any) {
      console.error('Error saving foods:', err.message);
      setError('Error al guardar alimentos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfileAndRecommendations = async () => {
      if (!session?.user) {
        setError('Usuario no autenticado.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('age, gender, height_cm, weight_kg, current_plan_id, training_days, fitness_goal')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }
        if (!profileData) {
          console.error('No profile data found for user ID:', session.user.id);
          throw new Error('No se encontraron datos de perfil.');
        }

        const userProfile: UserProfileForNutrition = {
          weight_kg: profileData.weight_kg,
          height_cm: profileData.height_cm,
          age: profileData.age,
          gender: profileData.gender,
          trainingDays: profileData.training_days,
          goal: profileData.current_plan_id, // Assuming current_plan_id maps to goal
          fitness_goal: profileData.fitness_goal,
        };
        setProfile(userProfile);

        // Calculate recommendations
        const calculatedRecommendations = getNutritionalRecommendations(userProfile);
        setRecommendations(calculatedRecommendations);

      } catch (err: any) {
        console.error('Error fetching profile or calculating recommendations:', err.message);
        setError('No se pudieron cargar tus datos de perfil o calcular las recomendaciones.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && session) {
      fetchProfileAndRecommendations();
    } else if (!authLoading && !session) {
      setError('Por favor, inicia sesión para ver tus recomendaciones nutricionales.');
      setLoading(false);
    }
  }, [session, authLoading]); // Dependencias del useEffect

  if (loading || authLoading) {
    return <div className="nutrition-container">Cargando recomendaciones nutricionales...</div>;
  }

  if (error) {
    return <div className="nutrition-container error-message">Error: {error}</div>;
  }

  if (!profile || !recommendations) {
    return (
      <div className="nutrition-container">
        <h1>Nutrición</h1>
        <p>No se pudieron cargar tus datos de perfil o calcular las recomendaciones.</p>
        <p>Asegúrate de haber completado el cuestionario de onboarding.</p>
      </div>
    );
  }

  return (
    <div className="nutrition-container">
      <h1>Nutrición Diaria</h1>

      {/* Sección 1: Buscador de Alimentos y Registro */}
      <section className="food-tracker-section card-base">
        <h2>Buscador y Registro de Alimentos</h2>
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="search"
            className="form-control search-input"
            placeholder="Buscar alimentos (ej. 'manzana', 'pollo')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="submit" variant="primary" disabled={isSearching}>
            {isSearching ? 'Buscando...' : 'Buscar'}
          </Button>
        </form>

        <div className="food-content-grid">
          <div className="search-results-container">
            {searchResults.length > 0 && (
              <>
                <h3>Resultados de la Búsqueda</h3>
                <div className="results-list">
                  {searchResults.map((food) => (
                    <div key={food.id} className="food-search-result">
                      <div className="food-info">
                        <h4 className="card-title">{food.product_name}</h4>
                        <p className="card-text">{food.nutriments['energy-kcal_100g']?.toFixed(0) || 'N/A'} kcal | P: {food.nutriments.proteins_100g?.toFixed(1) || 'N/A'}g | C: {food.nutriments.carbohydrates_100g?.toFixed(1) || 'N/A'}g | G: {food.nutriments.fat_100g?.toFixed(1) || 'N/A'}g</p>
                      </div>
                      <Button onClick={() => addFoodToLog(food)} variant="primary">
                        Añadir (100g)
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="logged-foods-summary">
            {loggedFoods.length > 0 && (
              <>
                <h3>Alimentos Registrados Hoy</h3>
                <div className="totals-summary">
                  <p>Calorías: <strong>{currentLoggedTotals.calories.toFixed(0)}</strong> / {recommendations.targetCalories.toFixed(0)} kcal</p>
                  <p>Proteínas: <strong>{currentLoggedTotals.protein.toFixed(1)}</strong> / {recommendations.macros.protein.toFixed(1)} g</p>
                  <p>Carbohidratos: <strong>{currentLoggedTotals.carbs.toFixed(1)}</strong> / {recommendations.macros.carbs.toFixed(1)} g</p>
                  <p>Grasas: <strong>{currentLoggedTotals.fat.toFixed(1)}</strong> / {recommendations.macros.fat.toFixed(1)} g</p>
                </div>
                <Button onClick={handleSaveFoods} variant="primary" disabled={loggedFoods.length === 0 || loading}>
                  Guardar Alimentos
                </Button>
                <ul className="list-group">
                  {loggedFoods.map((food, index) => (
                    <li key={`${food.id}-${index}`} className="list-group-item">
                      <div className="food-item-details">
                        <strong>{food.product_name}</strong> ({food.nutriments['energy-kcal_100g']?.toFixed(0)} kcal/100g)
                        <small>P: {(food.nutriments.proteins_100g * (food.quantity / 100))?.toFixed(1)}g | C: {(food.nutriments.carbohydrates_100g * (food.quantity / 100))?.toFixed(1)}g | G: {(food.nutriments.fat_100g * (food.quantity / 100))?.toFixed(1)}g</small>
                      </div>
                      <div className="food-item-actions">
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={editingFoodQuantity[food.id] || food.quantity}
                          onChange={(e) => setEditingFoodQuantity((prev) => ({ ...prev, [food.id]: parseInt(e.target.value) || 0 }))}
                          onBlur={(e) => updateLoggedFoodQuantity(food.id, parseInt(e.target.value) || 0)}
                          min="0"
                        />
                        <span>g</span>
                        <Button onClick={() => removeLoggedFood(food.id)} variant="danger">
                          Eliminar
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Sección 2: Resumen Nutricional y Objetivos */}
      <section className="summary-section card-base">
        <h2>Tus Recomendaciones Diarias</h2>
        <p>Para tu objetivo de **{profile.goal === 'weight_loss' ? 'pérdida de peso' : profile.goal === 'gain_muscle' ? 'ganancia muscular' : 'mantenimiento'}**:</p>
        <p className="calorie-count">{recommendations.targetCalories} kcal</p>
        <p className="small-text">Calorías de mantenimiento: {recommendations.maintenanceCalories} kcal</p>

        <h3>Distribución de Macronutrientes</h3>
        <div className="macros-grid">
          <div className="macro-item">
            <h4>Proteínas</h4>
            <p>{recommendations.macros.protein} g</p>
          </div>
          <div className="macro-item">
            <h4>Carbohidratos</h4>
            <p>{recommendations.macros.carbs} g</p>
          </div>
          <div className="macro-item">
            <h4>Grasas</h4>
            <p>{recommendations.macros.fat} g</p>
          </div>
        </div>

        {savedFoods.length > 0 && (
          <div className="saved-macros-summary mt-4">
            <h4>Consumo Registrado Hoy</h4>
            <div className="macros-grid">
              <div className="macro-item">
                <h5>Calorías</h5>
                <p>{savedTotals.calories.toFixed(0)} kcal</p>
              </div>
              <div className="macro-item">
                <h5>Proteínas</h5>
                <p>{savedTotals.protein.toFixed(1)} g</p>
              </div>
              <div className="macro-item">
                <h5>Carbohidratos</h5>
                <p>{savedTotals.carbs.toFixed(1)} g</p>
              </div>
              <div className="macro-item">
                <h5>Grasas</h5>
                <p>{savedTotals.fat.toFixed(1)} g</p>
              </div>
            </div>
          </div>
        )}

        {/* Customization of Recommendations */}
        <div className="customization-section">
          <h3>Personalizar Recomendaciones</h3>
          <div className="form-group">
            <label htmlFor="calorieAdjustment" className="form-label">Ajuste de Calorías (ej. -200 para déficit, +100 para superávit)</label>
            <input
              id="calorieAdjustment"
              type="number"
              className="form-control"
              value={customCalorieAdjustment === undefined ? '' : customCalorieAdjustment}
              onChange={(e) => setCustomCalorieAdjustment(e.target.value === '' ? undefined : parseInt(e.target.value))}
              placeholder="Ej: -200 o 100"
            />
          </div>
          <div className="form-group">
            <label htmlFor="proteinPercentage" className="form-label">Proteínas (%)</label>
            <input
              id="proteinPercentage"
              type="number"
              className="form-control"
              value={customProteinPercentage === undefined ? '' : customProteinPercentage}
              onChange={(e) => setCustomProteinPercentage(e.target.value === '' ? undefined : parseInt(e.target.value))}
              placeholder="Ej: 30"
              min="0"
              max="100"
            />
          </div>
          <div className="form-group">
            <label htmlFor="carbsPercentage" className="form-label">Carbohidratos (%)</label>
            <input
              id="carbsPercentage"
              type="number"
              className="form-control"
              value={customCarbsPercentage === undefined ? '' : customCarbsPercentage}
              onChange={(e) => setCustomCarbsPercentage(e.target.value === '' ? undefined : parseInt(e.target.value))}
              placeholder="Ej: 40"
              min="0"
              max="100"
            />
          </div>
          <div className="form-group">
            <label htmlFor="fatPercentage" className="form-label">Grasas (%)</label>
            <input
              id="fatPercentage"
              type="number"
              className="form-control"
              value={customFatPercentage === undefined ? '' : customFatPercentage}
              onChange={(e) => setCustomFatPercentage(e.target.value === '' ? undefined : parseInt(e.target.value))}
              placeholder="Ej: 30"
              min="0"
              max="100"
            />
          </div>
        </div>
      </section>

      {/* Sección 3: Recetas Saludables */}
      <section className="recipes-section-wrapper">
        <RecipesList userFitnessGoal={profile?.fitness_goal || null} />
      </section>

      <p className="small-text mt-5">Estas son recomendaciones generales. Consulta a un profesional de la salud para un plan personalizado.</p>
    </div>
  );
}

export default Nutrition;