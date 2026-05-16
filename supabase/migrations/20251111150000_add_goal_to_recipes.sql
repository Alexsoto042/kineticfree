ALTER TABLE recipes
ADD COLUMN goal TEXT;

-- Now, let's update the existing recipes with a goal based on their content
UPDATE recipes
SET goal = 'muscle_gain'
WHERE name ILIKE '%Chicken%';

UPDATE recipes
SET goal = 'weight_loss'
WHERE name ILIKE '%Salad%';
