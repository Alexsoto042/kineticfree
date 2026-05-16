CREATE OR REPLACE FUNCTION get_unique_body_zones()
RETURNS TABLE(body_zone TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT unnest(e.body_zone) as body_zone
  FROM exercises e
  ORDER BY body_zone;
END;
$$ LANGUAGE plpgsql;
