-- Consulta para ver qué ejercicios tienen videos de YouTube
-- y cuáles no tienen

-- Ver todos los ejercicios con sus youtube_id
SELECT 
  id,
  name,
  youtube_id,
  CASE 
    WHEN youtube_id IS NOT NULL AND youtube_id != '' THEN '✅ Tiene video'
    ELSE '❌ Sin video'
  END as estado_video
FROM exercises
ORDER BY 
  CASE WHEN youtube_id IS NOT NULL AND youtube_id != '' THEN 0 ELSE 1 END,
  name;

-- Contar cuántos tienen y cuántos no tienen video
SELECT 
  COUNT(*) as total_ejercicios,
  COUNT(CASE WHEN youtube_id IS NOT NULL AND youtube_id != '' THEN 1 END) as con_video,
  COUNT(CASE WHEN youtube_id IS NULL OR youtube_id = '' THEN 1 END) as sin_video
FROM exercises;
