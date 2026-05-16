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

const BUCKET_NAME = 'images'; // Must match the bucket name used in upload_media_to_supabase.mjs

const RECIPES_DATA = [
  {
    name: 'Pechuga de Pollo a la Plancha con Quinoa y Brócoli',
    description: 'Una comida clásica, alta en proteínas y carbohidratos complejos, perfecta para la recuperación muscular.',
    ingredients: JSON.stringify([
      { item: 'Pechuga de pollo', quantity: '200g' },
      { item: 'Quinoa', quantity: '80g' },
      { item: 'Brócoli', quantity: '150g' },
      { item: 'Aceite de oliva', quantity: '1 cucharada' },
      { item: 'Limón, sal y pimienta', quantity: 'al gusto' },
    ]),
    instructions: [
      'Cocina la quinoa según las instrucciones del paquete.',
      'Mientras tanto, cocina el brócoli al vapor hasta que esté tierno pero crujiente.',
      'Sazona la pechuga de pollo con sal, pimienta y jugo de limón.',
      'Calienta el aceite de oliva en una sartén a fuego medio-alto y cocina el pollo durante 6-8 minutos por cada lado, o hasta que esté bien cocido.',
      'Sirve el pollo junto con la quinoa y el brócoli.'
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 1,
    image_url: 'recipe-chicken-quinoa.jpg', // This will be the filename, converted to full URL in insertData
    calories: 550,
    protein_grams: 50,
    carbs_grams: 45,
    fat_grams: 18,
    goal: 'muscle_gain',
  },
  {
    name: 'Ensalada de Lentejas y Vegetales Frescos',
    description: 'Una ensalada ligera, rica en fibra y proteínas vegetales, ideal para un almuerzo de pérdida de peso.',
    ingredients: JSON.stringify([
      { item: 'Lentejas cocidas', quantity: '1 taza' },
      { item: 'Pimiento rojo', quantity: '1/2, picado' },
      { item: 'Pepino', quantity: '1/2, picado' },
      { item: 'Cebolla morada', quantity: '1/4, picada fina' },
      { item: 'Perejil fresco', quantity: 'un manojo, picado' },
      { item: 'Jugo de limón', quantity: '2 cucharadas' },
      { item: 'Aceite de oliva', quantity: '1 cucharada' },
    ]),
    instructions: [
      'En un tazón grande, mezcla las lentejas cocidas, el pimiento rojo, el pepino, la cebolla morada y el perejil.',
      'En un tazón pequeño, bate el jugo de limón y el aceite de oliva. Sazona con sal y pimienta.',
      'Vierte el aderezo sobre la ensalada y mezcla bien.',
      'Deja reposar durante al menos 10 minutos para que los sabores se mezclen.'
    ],
    prep_time_minutes: 15,
    cook_time_minutes: 0,
    servings: 1,
    image_url: 'recipe-lentil-salad.jpg', // This will be the filename, converted to full URL in insertData
    calories: 400,
    protein_grams: 18,
    carbs_grams: 55,
    fat_grams: 12,
    goal: 'weight_loss',
  },
  {
    name: 'Salmón al Horno con Espárragos',
    description: 'Una cena elegante y saludable, rica en Omega-3 y nutrientes. Perfecta para mantener un estilo de vida saludable.',
    ingredients: JSON.stringify([
      { item: 'Filete de salmón', quantity: '180g' },
      { item: 'Espárragos', quantity: '1 manojo' },
      { item: 'Aceite de oliva', quantity: '1 cucharada' },
      { item: 'Diente de ajo', quantity: '1, picado' },
      { item: 'Rodajas de limón', quantity: '2-3' },
    ]),
    instructions: [
      'Precalienta el horno a 200°C (400°F).',
      'Coloca los espárragos en una bandeja para hornear, rocíalos con la mitad del aceite de oliva, sal y pimienta.',
      'Coloca el filete de salmón sobre los espárragos. Unta con el resto del aceite y el ajo picado.',
      'Sazona el salmón con sal, pimienta y coloca las rodajas de limón encima.',
      'Hornea durante 12-15 minutos, o hasta que el salmón se desmenuce fácilmente con un tenedor.',
    ],
    prep_time_minutes: 5,
    cook_time_minutes: 15,
    servings: 1,
    image_url: 'recipe-salmon-asparagus.jpg', // This will be the filename, converted to full URL in insertData
    calories: 480,
    protein_grams: 40,
    carbs_grams: 10,
    fat_grams: 30,
    goal: 'maintenance',
  },
  {
    name: 'Batido de Proteínas y Frutos Rojos',
    description: 'Un batido rápido y delicioso para después del entrenamiento, cargado de antioxidantes y proteínas para la recuperación.',
    ingredients: JSON.stringify([
      { item: 'Proteína en polvo (sabor vainilla o neutro)', quantity: '1 scoop' },
      { item: 'Frutos rojos congelados (fresas, arándanos)', quantity: '1 taza' },
      { item: 'Leche de almendras sin azúcar', quantity: '250ml' },
      { item: 'Semillas de chía', quantity: '1 cucharada' },
    ]),
    instructions: [
      'Coloca todos los ingredientes en una licuadora.',
      'Licúa a alta velocidad hasta que la mezcla esté suave y cremosa.',
      'Si prefieres una consistencia más líquida, añade un poco más de leche de almendras.',
      'Sirve inmediatamente y disfruta.'
    ],
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    servings: 1,
    image_url: 'recipe-protein-shake.jpg', // This will be the filename, converted to full URL in insertData
    calories: 350,
    protein_grams: 30,
    carbs_grams: 35,
    fat_grams: 10,
    goal: 'muscle_gain',
  },
  {
    name: 'Avena Proteica con Plátano',
    description: 'Un desayuno potente y económico para empezar el día con energía y construir músculo.',
    ingredients: JSON.stringify([
      { item: 'Avena en hojuelas', quantity: '80g' },
      { item: 'Agua o leche', quantity: '250ml' },
      { item: 'Proteína en polvo', quantity: '1 scoop' },
      { item: 'Plátano', quantity: '1, en rodajas' },
      { item: 'Canela', quantity: 'al gusto' },
    ]),
    instructions: [
      'En una olla pequeña, cocina la avena con el agua o la leche a fuego medio hasta que espese.',
      'Retira del fuego y añade la proteína en polvo, mezclando bien para que no queden grumos.',
      'Sirve en un tazón y cubre con las rodajas de plátano y una pizca de canela.'
    ],
    prep_time_minutes: 5,
    cook_time_minutes: 5,
    servings: 1,
    image_url: 'recipe-protein-oats.jpg', // This will be the filename, converted to full URL in insertData
    calories: 450,
    protein_grams: 35,
    carbs_grams: 60,
    fat_grams: 8,
    goal: 'muscle_gain',
  },
  {
    name: 'Revuelto de Claras con Espinaca',
    description: 'Una opción muy ligera, baja en calorías y alta en proteínas, ideal para una cena o desayuno de definición.',
    ingredients: JSON.stringify([
      { item: 'Claras de huevo', quantity: '4 unidades' },
      { item: 'Espinaca fresca', quantity: '2 tazas' },
      { item: 'Tomate cherry', quantity: '1/2 taza, cortados por la mitad' },
      { item: 'Sal y pimienta', quantity: 'al gusto' },
    ]),
    instructions: [
      'En una sartén antiadherente a fuego medio, saltea la espinaca hasta que se ablande.',
      'Añade los tomates cherry y cocina por un minuto más.',
      'Vierte las claras de huevo sobre las verduras y revuelve constantemente hasta que estén cocidas a tu gusto.',
      'Sazona con sal y pimienta antes de servir.'
    ],
    prep_time_minutes: 5,
    cook_time_minutes: 10,
    servings: 1,
    image_url: 'recipe-egg-scramble.jpg', // This will be the filename, converted to full URL in insertData
    calories: 200,
    protein_grams: 25,
    carbs_grams: 10,
    fat_grams: 5,
    goal: 'weight_loss',
  },
  {
    name: 'Arroz con Pollo y Vegetales',
    description: 'Un plato completo, balanceado y reconfortante, perfecto para el almuerzo de cualquier día.',
    ingredients: JSON.stringify([
      { item: 'Pechuga de pollo', quantity: '150g, en cubos' },
      { item: 'Arroz blanco', quantity: '70g' },
      { item: 'Guisantes y zanahorias congelados', quantity: '1 taza' },
      { item: 'Cebolla', quantity: '1/4, picada' },
      { item: 'Ajo', quantity: '1 diente, picado' },
    ]),
    instructions: [
      'Cocina el arroz según las instrucciones.',
      'Mientras, en una sartén grande, sofríe la cebolla y el ajo hasta que estén dorados.',
      'Añade el pollo y cocina hasta que esté bien hecho.',
      'Incorpora los guisantes y zanahorias y cocina por 5 minutos.',
      'Mezcla el arroz cocido con el pollo y los vegetales. Sazona al gusto y sirve.'
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 1,
    image_url: 'recipe-chicken-rice.jpg', // This will be the filename, converted to full URL in insertData
    calories: 500,
    protein_grams: 40,
    carbs_grams: 65,
    fat_grams: 8,
    goal: 'maintenance',
  },
  {
    name: 'Sándwich de Atún Integral',
    description: 'Una opción rápida, económica y saludable para un almuerzo o cena ligera.',
    ingredients: JSON.stringify([
      { item: 'Pan integral', quantity: '2 rebanadas' },
      { item: 'Atún en agua, escurrido', quantity: '1 lata' },
      { item: 'Yogur griego natural', quantity: '2 cucharadas' },
      { item: 'Cebolla morada picada', quantity: '1 cucharada' },
      { item: 'Hojas de lechuga', quantity: 'al gusto' },
    ]),
    instructions: [
      'En un tazón, mezcla el atún, el yogur griego y la cebolla morada. Sazona con sal y pimienta.',
      'Tuesta ligeramente las rebanadas de pan integral.',
      'Coloca las hojas de lechuga sobre una rebanada de pan, añade la mezcla de atún y cubre con la otra rebanada.'
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 1,
    image_url: 'recipe-tuna-sandwich.jpg', // This will be the filename, converted to full URL in insertData
    calories: 350,
    protein_grams: 30,
    carbs_grams: 35,
    fat_grams: 9,
    goal: 'weight_loss',
  },
  {
    name: 'Lentejas Guisadas con Arroz',
    description: 'Un plato de cuchara potente, lleno de proteína vegetal y carbohidratos de lenta absorción.',
    ingredients: JSON.stringify([
      { item: 'Lentejas secas', quantity: '100g' },
      { item: 'Arroz', quantity: '50g' },
      { item: 'Zanahoria', quantity: '1, en rodajas' },
      { item: 'Pimiento verde', quantity: '1/2, picado' },
      { item: 'Chorizo vegetal (opcional)', quantity: '25g' },
    ]),
    instructions: [
      'En una olla, pon a cocer las lentejas con abundante agua, la zanahoria y el pimiento.',
      'Cuando las lentejas estén a medio cocer (unos 20 min), añade el arroz y el chorizo (si usas).',
      'Cocina hasta que tanto las lentejas como el arroz estén tiernos.',
      'Sazona al gusto y deja reposar unos minutos antes de servir.'
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 40,
    servings: 1,
    image_url: 'recipe-stewed-lentils.jpg', // This will be the filename, converted to full URL in insertData
    calories: 550,
    protein_grams: 25,
    carbs_grams: 90,
    fat_grams: 10,
    goal: 'muscle_gain',
  },
  {
    name: 'Yogur Griego con Frutos Rojos',
    description: 'Un desayuno o snack rápido, rico en proteínas y antioxidantes.',
    ingredients: JSON.stringify([
      { item: 'Yogur griego natural', quantity: '200g' },
      { item: 'Frutos rojos mixtos', quantity: '1/2 taza' },
      { item: 'Granola casera o baja en azúcar', quantity: '2 cucharadas' },
      { item: 'Miel o sirope de arce (opcional)', quantity: '1 cucharadita' },
    ]),
    instructions: [
      'En un bol, sirve el yogur griego.',
      'Añade los frutos rojos y la granola por encima.',
      'Si deseas un toque extra de dulzura, añade la miel o el sirope.'
    ],
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    servings: 1,
    image_url: 'recipe-yogurt-bowl.jpg', // This will be the filename, converted to full URL in insertData
    calories: 380,
    protein_grams: 20,
    carbs_grams: 40,
    fat_grams: 15,
    goal: 'maintenance',
  },
  {
    name: 'Wrap de Pollo y Aguacate',
    description: 'Un almuerzo rápido, fácil de transportar y muy completo.',
    ingredients: JSON.stringify([
      { item: 'Tortilla de trigo integral', quantity: '1 grande' },
      { item: 'Pechuga de pollo cocida y desmenuzada', quantity: '100g' },
      { item: 'Aguacate', quantity: '1/2, en rodajas' },
      { item: 'Hojas de espinaca', quantity: 'un puñado' },
      { item: 'Tomate', quantity: '1/2, en rodajas' },
    ]),
    instructions: [
      'Calienta ligeramente la tortilla para que sea más flexible.',
      'En el centro de la tortilla, coloca las hojas de espinaca, el tomate, el aguacate y el pollo desmenuzado.',
      'Sazona con una pizca de sal y pimienta.',
      'Dobla los extremos y enrolla el wrap firmemente.'
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 1,
    servings: 1,
    image_url: 'recipe-chicken-wrap.jpg', // This will be the filename, converted to full URL in insertData
    calories: 450,
    protein_grams: 35,
    carbs_grams: 30,
    fat_grams: 20,
    goal: 'maintenance',
  },
  {
    name: 'Ternera con Brócoli',
    description: 'Un clásico de la comida asiática en su versión saludable, ideal para una cena post-entreno.',
    ingredients: JSON.stringify([
      { item: 'Filete de ternera magra', quantity: '150g, en tiras' },
      { item: 'Brócoli', quantity: '1 taza, en ramilletes' },
      { item: 'Salsa de soja baja en sodio', quantity: '2 cucharadas' },
      { item: 'Jengibre fresco', quantity: '1 cucharadita, rallado' },
      { item: 'Ajo', quantity: '1 diente, picado' },
    ]),
    instructions: [
      'En un bol, marina la ternera con la salsa de soja, el jengibre y el ajo durante al menos 10 minutos.',
      'Cocina el brócoli al vapor o en el microondas hasta que esté tierno.',
      'En una sartén tipo wok o grande a fuego alto, saltea la ternera hasta que esté dorada.',
      'Añade el brócoli a la sartén y saltea todo junto durante 2 minutos.',
      'Sirve inmediatamente, opcionalmente con una porción de arroz.'
    ],
    prep_time_minutes: 15,
    cook_time_minutes: 10,
    servings: 1,
    image_url: 'recipe-beef-broccoli.jpg', // This will be the filename, converted to full URL in insertData
    calories: 480,
    protein_grams: 45,
    carbs_grams: 15,
    fat_grams: 25,
    goal: 'muscle_gain',
  },
  {
    name: 'Hamburguesas de Frijoles Negros',
    description: 'Una alternativa vegetariana deliciosa, económica y llena de fibra.',
    ingredients: JSON.stringify([
      { item: 'Frijoles negros cocidos y escurridos', quantity: '1 lata (400g)' },
      { item: 'Pan rallado', quantity: '1/2 taza' },
      { item: 'Cebolla', quantity: '1/4, muy picada' },
      { item: 'Comino en polvo', quantity: '1 cucharadita' },
      { item: 'Pan de hamburguesa integral', quantity: '1' },
    ]),
    instructions: [
      'En un bol, machaca los frijoles negros con un tenedor hasta formar una pasta gruesa.',
      'Añade el pan rallado, la cebolla y el comino. Mezcla bien y forma una o dos hamburguesas.',
      'Cocina las hamburguesas en una sartén con un poco de aceite, 4-5 minutos por cada lado.',
      'Sirve en el pan integral con tus vegetales favoritos.'
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 10,
    servings: 1,
    image_url: 'recipe-black-bean-burger.jpg', // This will be the filename, converted to full URL in insertData
    calories: 420,
    protein_grams: 20,
    carbs_grams: 70,
    fat_grams: 8,
    goal: 'weight_loss',
  },
  {
    name: 'Ensalada de Quinoa con Garbanzos',
    description: 'Una ensalada vegana completa, llena de proteína y muy fácil de preparar.',
    ingredients: JSON.stringify([
      { item: 'Quinoa cocida', quantity: '1 taza' },
      { item: 'Garbanzos cocidos', quantity: '1/2 taza' },
      { item: 'Pepino', quantity: '1/2, en cubos' },
      { item: 'Tomates cherry', quantity: '1/2 taza, a la mitad' },
      { item: 'Aderezo de limón y tahini', quantity: '2 cucharadas' },
    ]),
    instructions: [
      'En un bol grande, combina la quinoa cocida, los garbanzos, el pepino y los tomates cherry.',
      'Vierte el aderezo por encima y mezcla suavemente para combinar todos los ingredientes.',
      'Sazona con sal y pimienta al gusto.',
      'Se puede servir fría o a temperatura ambiente.'
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 0,
    servings: 1,
    image_url: 'recipe-quinoa-chickpea-salad.jpg', // This will be the filename, converted to full URL in insertData
    calories: 450,
    protein_grams: 15,
    carbs_grams: 65,
    fat_grams: 15,
    goal: 'weight_loss',
  },
  {
    name: 'Tostada con Aguacate y Huevo',
    description: 'Un desayuno clásico, rápido y nutritivo, lleno de grasas saludables y proteína.',
    ingredients: JSON.stringify([
      { item: 'Pan integral', quantity: '1 rebanada grande' },
      { item: 'Aguacate', quantity: '1/2' },
      { item: 'Huevo', quantity: '1' },
      { item: 'Hojuelas de chile (opcional)', quantity: 'una pizca' },
    ]),
    instructions: [
      'Tuesta el pan hasta que esté dorado.',
      'Mientras tanto, cocina el huevo a tu gusto (pochado, frito o revuelto).',
      'Machaca el aguacate sobre la tostada y sazona con sal y pimienta.',
      'Coloca el huevo cocido sobre el aguacate y espolvorea con hojuelas de chile si lo deseas.'
    ],
    prep_time_minutes: 5,
    cook_time_minutes: 5,
    servings: 1,
    image_url: 'recipe-avocado-toast.jpg', // This will be the filename, converted to full URL in insertData
    calories: 350,
    protein_grams: 15,
    carbs_grams: 25,
    fat_grams: 20,
    goal: 'maintenance',
  },
  {
    name: 'Sopa de Pollo y Vegetales',
    description: 'Una sopa reconfortante y ligera, perfecta para los días fríos o cuando buscas una comida baja en calorías.',
    ingredients: JSON.stringify([
      { item: 'Caldo de pollo bajo en sodio', quantity: '2 tazas' },
      { item: 'Pechuga de pollo cocida y desmenuzada', quantity: '100g' },
      { item: 'Zanahoria', quantity: '1, en rodajas' },
      { item: 'Apio', quantity: '1 tallo, picado' },
      { item: 'Fideos pequeños o arroz', quantity: '1/4 taza' },
    ]),
    instructions: [
      'En una olla, lleva el caldo de pollo a ebullición.',
      'Añade la zanahoria, el apio y los fideos/arroz. Cocina a fuego lento hasta que las verduras y los fideos estén tiernos.',
      'Incorpora el pollo desmenuzado y calienta todo junto.',
      'Sazona con sal, pimienta y perejil fresco antes de servir.'
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 1,
    image_url: 'recipe-chicken-soup.jpg', // This will be the filename, converted to full URL in insertData
    calories: 300,
    protein_grams: 25,
    carbs_grams: 30,
    fat_grams: 8,
    goal: 'weight_loss',
  },
  {
    name: 'Pescado Blanco al Limón con Patatas',
    description: 'Una cena simple, saludable y llena de sabor, con carbohidratos de calidad y proteína magra.',
    ingredients: JSON.stringify([
      { item: 'Filete de pescado blanco (merluza, tilapia)', quantity: '180g' },
      { item: 'Patata pequeña', quantity: '1, en rodajas finas' },
      { item: 'Limón', quantity: '1/2, en rodajas' },
      { item: 'Aceite de oliva', quantity: '1 cucharada' },
      { item: 'Eneldo o perejil fresco', quantity: 'al gusto' },
    ]),
    instructions: [
      'Precalienta el horno a 200°C (400°F).',
      'En una bandeja para hornear, mezcla las rodajas de patata con la mitad del aceite, sal y pimienta.',
      'Hornea las patatas durante 15 minutos.',
      'Coloca el filete de pescado sobre las patatas, rocía con el resto del aceite, y cubre con las rodajas de limón y el eneldo.',
      'Hornea por 10-12 minutos más, o hasta que el pescado esté cocido.',
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 30,
    servings: 1,
    image_url: 'recipe-lemon-fish.jpg', // This will be the filename, converted to full URL in insertData
    calories: 450,
    protein_grams: 40,
    carbs_grams: 35,
    fat_grams: 18,
    goal: 'maintenance',
  },
  {
    name: 'Manzanas con Mantequilla de Maní',
    description: 'El snack perfecto: crujiente, dulce y salado, con un buen balance de carbohidratos, grasas saludables y proteína.',
    ingredients: JSON.stringify([
      { item: 'Manzana', quantity: '1 grande' },
      { item: 'Mantequilla de maní natural', quantity: '2 cucharadas' },
    ]),
    instructions: [
      'Corta la manzana en rodajas.',
      'Unta o sirve la mantequilla de maní junto a las rodajas de manzana para mojar.',
      'Para un extra, puedes espolvorear canela sobre la mantequilla de maní.'
    ],
    prep_time_minutes: 5,
    cook_time_minutes: 0,
    servings: 1,
    image_url: 'recipe-apple-peanut-butter.jpg', // This will be the filename, converted to full URL in insertData
    calories: 280,
    protein_grams: 8,
    carbs_grams: 30,
    fat_grams: 16,
    goal: 'maintenance',
  },
  {
    name: 'Ensalada César con Pollo a la Parrilla',
    description: 'Una ensalada clásica y completa, con pollo a la parrilla, lechuga romana, crutones y aderezo César ligero.',
    ingredients: JSON.stringify([
      { item: 'Pechuga de pollo', quantity: '150g, a la parrilla y en tiras' },
      { item: 'Lechuga romana', quantity: '2 tazas, picada' },
      { item: 'Crutones integrales', quantity: '1/2 taza' },
      { item: 'Aderezo César ligero', quantity: '3 cucharadas' },
      { item: 'Queso parmesano rallado', quantity: '1 cucharada' },
    ]),
    instructions: [
      'En un bol grande, combina la lechuga romana, el pollo a la parrilla y los crutones.',
      'Añade el aderezo César y mezcla bien.',
      'Espolvorea con queso parmesano rallado antes de servir.'
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 10,
    servings: 1,
    image_url: 'recipe-caesar-salad.jpg', // This will be the filename, converted to full URL in insertData
    calories: 400,
    protein_grams: 35,
    carbs_grams: 25,
    fat_grams: 18,
    goal: 'maintenance',
  },
  {
    name: 'Garbanzos al Curry con Arroz',
    description: 'Un plato vegetariano aromático y nutritivo, ideal para la pérdida de peso y rico en fibra.',
    ingredients: JSON.stringify([
      { item: 'Garbanzos cocidos', quantity: '1 taza' },
      { item: 'Arroz integral cocido', quantity: '1/2 taza' },
      { item: 'Leche de coco ligera', quantity: '1/2 taza' },
      { item: 'Pasta de curry rojo', quantity: '1 cucharada' },
      { item: 'Espinacas frescas', quantity: '2 tazas' },
      { item: 'Cebolla', quantity: '1/4, picada' },
      { item: 'Ajo', quantity: '1 diente, picado' },
    ]),
    instructions: [
      'En una sartén grande, sofríe la cebolla y el ajo hasta que estén transparentes.',
      'Añade la pasta de curry y cocina por 1 minuto, revolviendo constantemente.',
      'Incorpora la leche de coco y los garbanzos. Cocina a fuego lento durante 5-7 minutos.',
      'Añade las espinacas y cocina hasta que se ablanden.',
      'Sirve el curry de garbanzos sobre el arroz integral cocido.'
    ],
    prep_time_minutes: 10,
    cook_time_minutes: 20,
    servings: 1,
    image_url: 'recipe-curried-chickpeas.jpg', // This will be the filename, converted to full URL in insertData
    calories: 480,
    protein_grams: 18,
    carbs_grams: 70,
    fat_grams: 15,
    goal: 'weight_loss',
  },
];

async function insertData() {
  console.log('Inserting or updating recipes...');
  try {
    for (const recipe of RECIPES_DATA) {
      // Construct the Supabase Storage URL
      const fileName = recipe.image_url; // image_url now directly holds the filename
      recipe.image_url = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;

      // Check if recipe already exists by name
      const { data: existingRecipe, error: selectError } = await supabase
        .from('recipes')
        .select('id')
        .eq('name', recipe.name)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 means "no rows found"
        throw selectError;
      }

      if (existingRecipe) {
        // Recipe exists, update it
        const { error: updateError } = await supabase
          .from('recipes')
          .update(recipe) // Update all fields
          .eq('id', existingRecipe.id);

        if (updateError) {
          throw updateError;
        }
        console.log(`Updated recipe: ${recipe.name}`);
      } else {
        // Recipe does not exist, insert it
        const { error: insertError } = await supabase
          .from('recipes')
          .insert(recipe);

        if (insertError) {
          throw insertError;
        }
        console.log(`Inserted new recipe: ${recipe.name}`);
      }
    }
    console.log('Recipe insertion process finished.');
  } catch (e) {
    console.error('Error inserting recipes:', e.message);
  }
}

insertData();
