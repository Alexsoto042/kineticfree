import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials not found in .env file');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function linkRecipesToPlans() {
  console.log('Fetching plans and recipes to create links...');
  try {
    // 1. Fetch ALL Plans and ALL Recipes
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('id, name'); // Fetch all plans

    if (plansError) throw new Error(`Error fetching plans: ${plansError.message}`);

    const { data: recipes, error: recipesError } = await supabase
      .from('recipes')
      .select('id, name, goal'); // Fetch all recipes with their goal

    if (recipesError) throw new Error(`Error fetching recipes: ${recipesError.message}`);

    const planMap = new Map(plans.map(p => [p.name, p.id]));
    const recipeMap = new Map(recipes.map(r => [r.name, { id: r.id, goal: r.goal }]));

    // Helper to get recipe ID by name, checking goal compatibility
    const getRecipeId = (name, requiredGoal = null) => {
      const recipeInfo = recipeMap.get(name);
      if (!recipeInfo) {
        console.warn(`Recipe "${name}" not found.`);
        return null;
      }
      if (requiredGoal && recipeInfo.goal && recipeInfo.goal !== requiredGoal) {
        console.warn(`Recipe "${name}" goal (${recipeInfo.goal}) does not match required goal (${requiredGoal}).`);
        // return null; // Optionally, strictly enforce goal matching
      }
      return recipeInfo.id;
    };

    console.log('Preparing comprehensive links...');

    // 2. Define the comprehensive links for all plans (Monday-Friday)
    const links = [];

    // --- Plan: Plan de Fuerza para Principiantes (muscle_gain) ---
    const planFuerzaId = planMap.get('Plan de Fuerza para Principiantes');
    if (planFuerzaId) {
      // Lunes
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Avena Proteica con Plátano', 'muscle_gain'), day_of_week: 1, meal_type: 'breakfast' });
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Pechuga de Pollo a la Plancha con Quinoa y Brócoli', 'muscle_gain'), day_of_week: 1, meal_type: 'lunch' });
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Ternera con Brócoli', 'muscle_gain'), day_of_week: 1, meal_type: 'dinner' });
      // Martes
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Batido de Proteínas y Frutos Rojos', 'muscle_gain'), day_of_week: 2, meal_type: 'breakfast' });
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Arroz con Pollo y Vegetales', 'maintenance'), day_of_week: 2, meal_type: 'lunch' });
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Lentejas Guisadas con Arroz', 'muscle_gain'), day_of_week: 2, meal_type: 'dinner' });
      // Miércoles
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Yogur Griego con Frutos Rojos', 'maintenance'), day_of_week: 3, meal_type: 'breakfast' });
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Wrap de Pollo y Aguacate', 'maintenance'), day_of_week: 3, meal_type: 'lunch' });
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Pechuga de Pollo a la Plancha con Quinoa y Brócoli', 'muscle_gain'), day_of_week: 3, meal_type: 'dinner' });
      // Jueves
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Avena Proteica con Plátano', 'muscle_gain'), day_of_week: 4, meal_type: 'breakfast' });
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Ternera con Brócoli', 'muscle_gain'), day_of_week: 4, meal_type: 'lunch' });
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Arroz con Pollo y Vegetales', 'maintenance'), day_of_week: 4, meal_type: 'dinner' });
      // Viernes
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Batido de Proteínas y Frutos Rojos', 'muscle_gain'), day_of_week: 5, meal_type: 'breakfast' });
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Lentejas Guisadas con Arroz', 'muscle_gain'), day_of_week: 5, meal_type: 'lunch' });
      links.push({ plan_id: planFuerzaId, recipe_id: getRecipeId('Salmón al Horno con Espárragos', 'maintenance'), day_of_week: 5, meal_type: 'dinner' });
    }

    // --- Plan: Plan de Pérdida de Peso Intermedio (weight_loss) ---
    const planPerdidaPesoId = planMap.get('Plan de Pérdida de Peso Intermedio');
    if (planPerdidaPesoId) {
      // Lunes
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Revuelto de Claras con Espinaca', 'weight_loss'), day_of_week: 1, meal_type: 'breakfast' });
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Ensalada de Lentejas y Vegetales Frescos', 'weight_loss'), day_of_week: 1, meal_type: 'lunch' });
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Hamburguesas de Frijoles Negros', 'weight_loss'), day_of_week: 1, meal_type: 'dinner' });
      // Martes
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Yogur Griego con Frutos Rojos', 'maintenance'), day_of_week: 2, meal_type: 'breakfast' });
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Sándwich de Atún Integral', 'weight_loss'), day_of_week: 2, meal_type: 'lunch' });
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Revuelto de Claras con Espinaca', 'weight_loss'), day_of_week: 2, meal_type: 'dinner' });
      // Miércoles
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Avena Proteica con Plátano', 'muscle_gain'), day_of_week: 3, meal_type: 'breakfast' }); // Can be adapted for weight loss with smaller portion
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Ensalada de Quinoa con Garbanzos', 'weight_loss'), day_of_week: 3, meal_type: 'lunch' });
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Hamburguesas de Frijoles Negros', 'weight_loss'), day_of_week: 3, meal_type: 'dinner' });
      // Jueves
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Revuelto de Claras con Espinaca', 'weight_loss'), day_of_week: 4, meal_type: 'breakfast' });
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Ensalada de Lentejas y Vegetales Frescos', 'weight_loss'), day_of_week: 4, meal_type: 'lunch' });
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Sándwich de Atún Integral', 'weight_loss'), day_of_week: 4, meal_type: 'dinner' });
      // Viernes
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Yogur Griego con Frutos Rojos', 'maintenance'), day_of_week: 5, meal_type: 'breakfast' });
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Ensalada de Quinoa con Garbanzos', 'weight_loss'), day_of_week: 5, meal_type: 'lunch' });
      links.push({ plan_id: planPerdidaPesoId, recipe_id: getRecipeId('Salmón al Horno con Espárragos', 'maintenance'), day_of_week: 5, meal_type: 'dinner' }); // Good for healthy fats
    }

    // --- Plan: División de 4 Días para Hipertrofia (muscle_gain) ---
    const planHipertrofiaId = planMap.get('División de 4 Días para Hipertrofia');
    if (planHipertrofiaId) {
      // Lunes
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Avena Proteica con Plátano', 'muscle_gain'), day_of_week: 1, meal_type: 'breakfast' });
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Pechuga de Pollo a la Plancha con Quinoa y Brócoli', 'muscle_gain'), day_of_week: 1, meal_type: 'lunch' });
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Ternera con Brócoli', 'muscle_gain'), day_of_week: 1, meal_type: 'dinner' });
      // Martes
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Batido de Proteínas y Frutos Rojos', 'muscle_gain'), day_of_week: 2, meal_type: 'breakfast' });
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Arroz con Pollo y Vegetales', 'maintenance'), day_of_week: 2, meal_type: 'lunch' });
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Lentejas Guisadas con Arroz', 'muscle_gain'), day_of_week: 2, meal_type: 'dinner' });
      // Miércoles
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Yogur Griego con Frutos Rojos', 'maintenance'), day_of_week: 3, meal_type: 'breakfast' });
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Wrap de Pollo y Aguacate', 'maintenance'), day_of_week: 3, meal_type: 'lunch' });
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Pechuga de Pollo a la Plancha con Quinoa y Brócoli', 'muscle_gain'), day_of_week: 3, meal_type: 'dinner' });
      // Jueves
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Avena Proteica con Plátano', 'muscle_gain'), day_of_week: 4, meal_type: 'breakfast' });
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Ternera con Brócoli', 'muscle_gain'), day_of_week: 4, meal_type: 'lunch' });
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Arroz con Pollo y Vegetales', 'maintenance'), day_of_week: 4, meal_type: 'dinner' });
      // Viernes
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Batido de Proteínas y Frutos Rojos', 'muscle_gain'), day_of_week: 5, meal_type: 'breakfast' });
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Lentejas Guisadas con Arroz', 'muscle_gain'), day_of_week: 5, meal_type: 'lunch' });
      links.push({ plan_id: planHipertrofiaId, recipe_id: getRecipeId('Salmón al Horno con Espárragos', 'maintenance'), day_of_week: 5, meal_type: 'dinner' });
    }

    // --- Plan: Acondicionamiento Físico General (3 Días) (general_fitness) ---
    const planAcondicionamientoId = planMap.get('Acondicionamiento Físico General (3 Días)');
    if (planAcondicionamientoId) {
      // Lunes
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Yogur Griego con Frutos Rojos', 'maintenance'), day_of_week: 1, meal_type: 'breakfast' });
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Sándwich de Atún Integral', 'weight_loss'), day_of_week: 1, meal_type: 'lunch' });
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Salmón al Horno con Espárragos', 'maintenance'), day_of_week: 1, meal_type: 'dinner' });
      // Martes (Rest Day - lighter meals)
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Revuelto de Claras con Espinaca', 'weight_loss'), day_of_week: 2, meal_type: 'breakfast' });
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Ensalada de Lentejas y Vegetales Frescos', 'weight_loss'), day_of_week: 2, meal_type: 'lunch' });
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Hamburguesas de Frijoles Negros', 'weight_loss'), day_of_week: 2, meal_type: 'dinner' });
      // Miércoles
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Avena Proteica con Plátano', 'muscle_gain'), day_of_week: 3, meal_type: 'breakfast' });
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Ensalada de Quinoa con Garbanzos', 'weight_loss'), day_of_week: 3, meal_type: 'lunch' });
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Arroz con Pollo y Vegetales', 'maintenance'), day_of_week: 3, meal_type: 'dinner' });
      // Jueves (Rest Day - lighter meals)
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Yogur Griego con Frutos Rojos', 'maintenance'), day_of_week: 4, meal_type: 'breakfast' });
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Sándwich de Atún Integral', 'weight_loss'), day_of_week: 4, meal_type: 'lunch' });
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Revuelto de Claras con Espinaca', 'weight_loss'), day_of_week: 4, meal_type: 'dinner' });
      // Viernes
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Batido de Proteínas y Frutos Rojos', 'muscle_gain'), day_of_week: 5, meal_type: 'breakfast' });
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Wrap de Pollo y Aguacate', 'maintenance'), day_of_week: 5, meal_type: 'lunch' });
      links.push({ plan_id: planAcondicionamientoId, recipe_id: getRecipeId('Lentejas Guisadas con Arroz', 'muscle_gain'), day_of_week: 5, meal_type: 'dinner' });
    }

    // --- Plan: Entrenamiento de Cuerpo Completo para Principiantes (5 Días) (general_fitness) ---
    const planCuerpoCompleto5DiasId = planMap.get('Entrenamiento de Cuerpo Completo para Principiantes (5 Días)');
    if (planCuerpoCompleto5DiasId) {
      // Lunes
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Avena Proteica con Plátano', 'muscle_gain'), day_of_week: 1, meal_type: 'breakfast' });
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Ensalada de Lentejas y Vegetales Frescos', 'weight_loss'), day_of_week: 1, meal_type: 'lunch' });
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Pescado Blanco al Limón con Patatas', 'maintenance'), day_of_week: 1, meal_type: 'dinner' });
      // Martes
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Yogur Griego con Frutos Rojos', 'maintenance'), day_of_week: 2, meal_type: 'breakfast' });
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Sopa de Pollo y Vegetales', 'weight_loss'), day_of_week: 2, meal_type: 'lunch' });
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Hamburguesas de Frijoles Negros', 'weight_loss'), day_of_week: 2, meal_type: 'dinner' });
      // Miércoles
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Tostada con Aguacate y Huevo', 'maintenance'), day_of_week: 3, meal_type: 'breakfast' });
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Ensalada César con Pollo a la Parrilla', 'maintenance'), day_of_week: 3, meal_type: 'lunch' });
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Ternera con Brócoli', 'muscle_gain'), day_of_week: 3, meal_type: 'dinner' });
      // Jueves
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Batido de Proteínas y Frutos Rojos', 'muscle_gain'), day_of_week: 4, meal_type: 'breakfast' });
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Garbanzos al Curry con Arroz', 'weight_loss'), day_of_week: 4, meal_type: 'lunch' });
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Salmón al Horno con Espárragos', 'maintenance'), day_of_week: 4, meal_type: 'dinner' });
      // Viernes
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Manzanas con Mantequilla de Maní', 'maintenance'), day_of_week: 5, meal_type: 'breakfast' }); // Snack as breakfast
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Wrap de Pollo y Aguacate', 'maintenance'), day_of_week: 5, meal_type: 'lunch' });
      links.push({ plan_id: planCuerpoCompleto5DiasId, recipe_id: getRecipeId('Arroz con Pollo y Vegetales', 'maintenance'), day_of_week: 5, meal_type: 'dinner' });
    }

    // --- Plan: Volumen Alemán (GVT) - Pecho y Espalda (muscle_gain) ---
    const planGVTId = planMap.get('Volumen Alemán (GVT) - Pecho y Espalda');
    if (planGVTId) {
      // Lunes
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Avena Proteica con Plátano', 'muscle_gain'), day_of_week: 1, meal_type: 'breakfast' });
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Pechuga de Pollo a la Plancha con Quinoa y Brócoli', 'muscle_gain'), day_of_week: 1, meal_type: 'lunch' });
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Ternera con Brócoli', 'muscle_gain'), day_of_week: 1, meal_type: 'dinner' });
      // Martes (Rest Day)
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Yogur Griego con Frutos Rojos', 'maintenance'), day_of_week: 2, meal_type: 'breakfast' });
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Sándwich de Atún Integral', 'weight_loss'), day_of_week: 2, meal_type: 'lunch' });
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Pescado Blanco al Limón con Patatas', 'maintenance'), day_of_week: 2, meal_type: 'dinner' });
      // Miércoles (Rest Day)
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Tostada con Aguacate y Huevo', 'maintenance'), day_of_week: 3, meal_type: 'breakfast' });
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Ensalada de Lentejas y Vegetales Frescos', 'weight_loss'), day_of_week: 3, meal_type: 'lunch' });
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Sopa de Pollo y Vegetales', 'weight_loss'), day_of_week: 3, meal_type: 'dinner' });
      // Jueves
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Batido de Proteínas y Frutos Rojos', 'muscle_gain'), day_of_week: 4, meal_type: 'breakfast' });
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Arroz con Pollo y Vegetales', 'maintenance'), day_of_week: 4, meal_type: 'lunch' });
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Lentejas Guisadas con Arroz', 'muscle_gain'), day_of_week: 4, meal_type: 'dinner' });
      // Viernes (Rest Day)
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Manzanas con Mantequilla de Maní', 'maintenance'), day_of_week: 5, meal_type: 'breakfast' });
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Ensalada César con Pollo a la Parrilla', 'maintenance'), day_of_week: 5, meal_type: 'lunch' });
      links.push({ plan_id: planGVTId, recipe_id: getRecipeId('Wrap de Pollo y Aguacate', 'maintenance'), day_of_week: 5, meal_type: 'dinner' });
    }

    const filteredLinks = links.filter(link => link.plan_id && link.recipe_id); // Ensure we only use valid links

    if (filteredLinks.length === 0) {
      console.warn('No valid links to create. Check if plan and recipe names are correct.');
      return;
    }

    // 3. Upsert the links
    console.log(`Upserting ${filteredLinks.length} plan-recipe links...`);
    // To avoid primary key conflicts on plan_id, recipe_id, day_of_week, meal_type
    // we need to define a unique constraint on these columns in the database.
    // For now, upsert will try to insert, and if a conflict occurs, it will fail for that specific row.
    // A more robust solution would be to delete existing links for these plans first, or define a composite unique key.
    const { error: linkError } = await supabase.from('plan_recipes').upsert(filteredLinks, { onConflict: 'plan_id,recipe_id,day_of_week,meal_type' });

    if (linkError) {
      throw new Error(`Error linking recipes to plans: ${linkError.message}`);
    }

    console.log('✅ Successfully linked recipes to plans!');

  } catch (e) {
    console.error('❌ An error occurred:', e.message);
  }
}

linkRecipesToPlans();