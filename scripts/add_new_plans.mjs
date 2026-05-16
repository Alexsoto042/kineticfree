import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase credentials not found in .env file');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const NEW_PLANS = [
  {
    id: uuidv4(), // Generate UUID
    name: 'Dieta de Definición Muscular',
    description:
      'Un plan de 8 semanas alto en proteínas para construir y definir músculo.',
    goal_id: 'definition', // Asegúrate de que este goal_id exista en tu tabla plan_goals
    duration_weeks: 8,
    diet_recommendation:
      'Consume aproximadamente 1.8-2.2g de proteína por kg de peso corporal. Mantén un ligero déficit calórico (200-300 kcal por debajo de tu mantenimiento).',
    meal_plan_description:
      'Cinco comidas al día: 3 principales y 2 snacks. Prioriza proteínas magras y carbohidratos complejos alrededor de tus entrenamientos.',
    foods_to_eat: [
      'Pechuga de pollo',
      'Salmón',
      'Huevos',
      'Avena',
      'Arroz integral',
      'Brócoli',
      'Espinacas',
      'Aguacate',
      'Nueces',
      'Yogur griego',
    ],
    foods_to_avoid: [
      'Bebidas azucaradas',
      'Comida rápida',
      'Productos de bollería industrial',
      'Alcohol en exceso',
      'Salsas altas en grasa y azúcar',
    ],
  },
  {
    id: uuidv4(), // Generate UUID
    name: 'Plan de Alimentación para Pérdida de Grasa',
    description:
      'Un enfoque balanceado de 12 semanas para perder grasa de forma saludable y sostenible.',
    goal_id: 'fat_loss', // Asegúrate de que este goal_id exista en tu tabla plan_goals
    duration_weeks: 12,
    diet_recommendation:
      'Mantén un déficit calórico moderado (400-500 kcal). Asegura una alta ingesta de fibra a través de vegetales y granos integrales para la saciedad.',
    meal_plan_description:
      'Tres comidas principales y un snack opcional. Bebe abundante agua durante todo el día. Controla las porciones.',
    foods_to_eat: [
      'Verduras de hoja verde',
      'Pescado blanco',
      'Lentejas',
      'Quinoa',
      'Manzanas',
      'Bayas',
      'Pechuga de pavo',
      'Té verde',
      'Agua',
    ],
    foods_to_avoid: [
      'Refrescos y zumos industriales',
      'Frituras',
      'Pan blanco',
      'Galletas y pasteles',
      'Embutidos grasos',
    ],
  },
];

async function insertPlans() {
  console.log('Inserting new plans...');
  try {
    // Primero, asegúrate de que los goal_id existan en la tabla plan_goals
    // Si no existen, este insert fallará. Podrías insertarlos aquí si es necesario.
    // Ejemplo: await supabase.from('plan_goals').upsert([{id: 'definition', name: 'Definición Muscular'}, {id: 'fat_loss', name: 'Pérdida de Grasa'}], {onConflict: 'id'});

    const { data, error } = await supabase
      .from('plans')
      .upsert(NEW_PLANS, { onConflict: 'name' })
      .select();

    if (error) {
      throw error;
    }

    if (data) {
      console.log(`Successfully inserted or updated ${data.length} plans.`);
    }
    console.log('Plan insertion process finished.');
  } catch (e) {
    console.error('Error inserting plans:', e.message);
  }
}

insertPlans();
