-- Eliminar solicitudes duplicadas, manteniendo solo la más antigua
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY 
        LEAST(user_id, friend_id),
        GREATEST(user_id, friend_id)
      ORDER BY created_at ASC
    ) as rn
  FROM friends
)
DELETE FROM friends
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verificar que no queden duplicados
SELECT 
  LEAST(user_id::text, friend_id::text) as pair_1,
  GREATEST(user_id::text, friend_id::text) as pair_2,
  COUNT(*) as count
FROM friends
GROUP BY pair_1, pair_2
HAVING COUNT(*) > 1;
