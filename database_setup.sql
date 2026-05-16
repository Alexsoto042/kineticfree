-- Creación de la tabla 'plans'
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    goal_id TEXT,
    duration_weeks INTEGER,
    diet_recommendation TEXT,
    meal_plan_description TEXT,
    foods_to_eat TEXT[],
    foods_to_avoid TEXT[]
);

-- Inserción de datos de ejemplo en 'plans'
DELETE FROM public.plans;
INSERT INTO public.plans (id, name, description, goal_id, duration_weeks, diet_recommendation, meal_plan_description, foods_to_eat, foods_to_avoid)
VALUES
('plan_1', 'Plan de Fuerza para Principiantes', 'Un plan de 8 semanas enfocado en construir fuerza fundamental.', 'Strength', 8, 'Dieta alta en proteínas, baja en carbohidratos.', '3 comidas principales y 2 snacks ricos en proteínas.', ARRAY['Pollo', 'Pescado', 'Huevos', 'Verduras de hoja verde', 'Frutos secos'], ARRAY['Azúcares refinados', 'Pan blanco', 'Bebidas azucaradas']),
('plan_2', 'Plan de Pérdida de Peso Intermedio', 'Un programa de 12 semanas que combina cardio y entrenamiento de fuerza para la pérdida de peso.', 'Weight Loss', 12, 'Dieta balanceada con déficit calórico moderado.', 'Enfocarse en porciones controladas y alimentos integrales.', ARRAY['Carnes magras', 'Legumbres', 'Frutas', 'Verduras', 'Granos enteros'], ARRAY['Alimentos fritos', 'Comida rápida', 'Dulces']),
('plan_3', 'Plan de Flexibilidad y Movilidad', 'Un plan de 4 semanas para mejorar la flexibilidad y el rango de movimiento.', 'Flexibility', 4, 'Dieta antiinflamatoria, rica en omega-3.', 'Incluir muchas frutas, verduras y grasas saludables.', ARRAY['Salmón', 'Aguacate', 'Bayas', 'Jengibre', 'Cúrcuma'], ARRAY['Alimentos procesados', 'Grasas trans', 'Exceso de lácteos']);

-- Creación de la tabla 'plan_routines'
CREATE TABLE IF NOT EXISTS public.plan_routines (
    plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    routine_id INTEGER NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 1 for Monday, 7 for Sunday
    PRIMARY KEY (plan_id, routine_id, day_of_week)
);

-- Inserción de datos de ejemplo en 'plan_routines'
DELETE FROM public.plan_routines;
INSERT INTO public.plan_routines (plan_id, routine_id, day_of_week)
VALUES
('plan_1', 1, 1), -- Plan 1, Rutina 1 el Lunes
('plan_1', 2, 3), -- Plan 1, Rutina 2 el Miércoles
('plan_1', 3, 5), -- Plan 1, Rutina 3 el Viernes

('plan_2', 1, 2), -- Plan 2, Rutina 1 el Martes
('plan_2', 2, 4), -- Plan 2, Rutina 3 el Jueves
('plan_2', 3, 6), -- Plan 2, Rutina 3 el Sábado

('plan_3', 1, 1), -- Plan 3, Rutina 1 el Lunes
('plan_3', 2, 3), -- Plan 3, Rutina 2 el Miércoles
('plan_3', 3, 5); -- Plan 3, Rutina 3 el Viernes

-- Creación de la tabla 'ingredients'
CREATE TABLE IF NOT EXISTS public.ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Inserción de datos de ejemplo en 'ingredients'
DELETE FROM public.ingredients;
INSERT INTO public.ingredients (name)
VALUES
('Chicken Breast'),
('Rice'),
('Broccoli'),
('Olive Oil'),
('Salt'),
('Pepper'),
('Tomato'),
('Onion'),
('Garlic');

-- Creación de la tabla 'plan_recipes'
CREATE TABLE IF NOT EXISTS public.recipes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL
);

-- Inserción de datos de ejemplo en 'recipes'
DELETE FROM public.recipes;
INSERT INTO public.recipes (id, name)
VALUES
(1, 'Chicken & Rice'),
(2, 'Tomato Salad'),
(3, 'Garlic Chicken');

CREATE TABLE IF NOT EXISTS public.plan_recipes (
    plan_id TEXT NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, recipe_id)
);

-- Inserción de datos de ejemplo en 'plan_recipes'
DELETE FROM public.plan_recipes;
INSERT INTO public.plan_recipes (plan_id, recipe_id)
VALUES
('plan_1', 1), -- Plan 1 vinculado a Receta 1
('plan_1', 2), -- Plan 1 vinculado a Receta 2
('plan_2', 1), -- Plan 2 vinculado a Receta 1
('plan_2', 3), -- Plan 2 vinculado a Receta 3
('plan_3', 2); -- Plan 3 vinculado a Receta 2

-- Creación de la tabla 'recipe_ingredients'
CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    recipe_id INTEGER NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
    ingredient_id INTEGER NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    PRIMARY KEY (recipe_id, ingredient_id)
);

-- Inserción de datos de ejemplo en 'recipe_ingredients'
DELETE FROM public.recipe_ingredients;
-- Para Receta 1 (ej. Pollo y Arroz)
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
VALUES
(1, (SELECT id FROM public.ingredients WHERE name = 'Chicken Breast'), 200, 'g'),
(1, (SELECT id FROM public.ingredients WHERE name = 'Rice'), 150, 'g'),
(1, (SELECT id FROM public.ingredients WHERE name = 'Broccoli'), 100, 'g'),
(1, (SELECT id FROM public.ingredients WHERE name = 'Olive Oil'), 1, 'tbsp'),
(1, (SELECT id FROM public.ingredients WHERE name = 'Salt'), 0.5, 'tsp'),
(1, (SELECT id FROM public.ingredients WHERE name = 'Pepper'), 0.25, 'tsp');

-- Para Receta 2 (ej. Ensalada de Tomate)
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
VALUES
(2, (SELECT id FROM public.ingredients WHERE name = 'Tomato'), 2, 'unit'),
(2, (SELECT id FROM public.ingredients WHERE name = 'Onion'), 0.5, 'unit'),
(2, (SELECT id FROM public.ingredients WHERE name = 'Olive Oil'), 2, 'tbsp'),
(2, (SELECT id FROM public.ingredients WHERE name = 'Salt'), 0.5, 'tsp');

-- Para Receta 3 (ej. Pollo al Ajo)
INSERT INTO public.recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
VALUES
(3, (SELECT id FROM public.ingredients WHERE name = 'Chicken Breast'), 250, 'g'),
(3, (SELECT id FROM public.ingredients WHERE name = 'Garlic'), 3, 'cloves'),
(3, (SELECT id FROM public.ingredients WHERE name = 'Olive Oil'), 1, 'tbsp'),
(3, (SELECT id FROM public.ingredients WHERE name = 'Salt'), 0.5, 'tsp'),
(3, (SELECT id FROM public.ingredients WHERE name = 'Pepper'), 0.25, 'tsp');