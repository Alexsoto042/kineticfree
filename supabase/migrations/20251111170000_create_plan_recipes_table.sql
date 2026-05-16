CREATE TABLE plan_recipes (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    plan_id TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    -- Meal type can be 'breakfast', 'lunch', 'dinner', 'snack'
    meal_type TEXT NOT NULL,
    day_of_week INT -- Optional: to assign recipes to specific days of the week (1=Monday, 7=Sunday)
);

-- Add RLS to the plan_recipes table
ALTER TABLE plan_recipes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to plan_recipes
CREATE POLICY "Allow public read access to plan_recipes"
ON plan_recipes
FOR SELECT
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_plan_recipes_plan_id ON plan_recipes(plan_id);
CREATE INDEX idx_plan_recipes_recipe_id ON plan_recipes(recipe_id);
