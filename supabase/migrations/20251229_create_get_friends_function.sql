-- Eliminar la función existente primero
DROP FUNCTION IF EXISTS get_friends(uuid);

-- Función para obtener amigos con el estado correcto según la perspectiva del usuario
CREATE OR REPLACE FUNCTION get_friends(p_user_id UUID)
RETURNS TABLE (
  id TEXT,
  username TEXT,
  avatar_url TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Amigos donde el usuario es quien envió la solicitud
  SELECT 
    p.id::TEXT,
    p.username,
    p.avatar_url,
    f.status  -- 'pending' si aún no aceptan, 'accepted' si ya aceptaron
  FROM friends f
  JOIN profiles p ON p.id = f.friend_id
  WHERE f.user_id = p_user_id
  
  UNION
  
  -- Amigos donde el usuario recibió la solicitud
  SELECT 
    p.id::TEXT,
    p.username,
    p.avatar_url,
    CASE 
      WHEN f.status = 'pending' THEN 'requested'  -- Cambiar 'pending' a 'requested' para el receptor
      ELSE f.status
    END as status
  FROM friends f
  JOIN profiles p ON p.id = f.user_id
  WHERE f.friend_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_friends(UUID) TO authenticated;
