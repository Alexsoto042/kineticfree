-- Lista simple de ejercicios sin GIF
SELECT name
FROM exercises
WHERE gif_url IS NULL
ORDER BY name;
