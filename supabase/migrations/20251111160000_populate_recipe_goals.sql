-- Populate the goal column for existing recipes
UPDATE recipes
SET goal = 'muscle_gain'
WHERE name ILIKE '%Chicken%';

UPDATE recipes
SET goal = 'weight_loss'
WHERE name ILIKE '%Salad%';
