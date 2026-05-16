-- Trigger para notificar cuando alguien da like a un post
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  -- Obtener el autor del post
  SELECT user_id INTO post_author_id
  FROM motivational_posts
  WHERE id = NEW.id;
  
  -- Solo crear notificación si:
  -- 1. El post tiene un autor (no es post del sistema)
  -- 2. El usuario que da like NO es el autor del post
  -- 3. El usuario está en el array liked_by (acaba de dar like, no quitar like)
  IF post_author_id IS NOT NULL THEN
    -- Verificar si el último cambio fue agregar un like
    IF array_length(NEW.liked_by, 1) > COALESCE(array_length(OLD.liked_by, 1), 0) THEN
      -- Encontrar el nuevo usuario que dio like
      DECLARE
        new_liker_id UUID;
      BEGIN
        SELECT unnest(NEW.liked_by)
        EXCEPT
        SELECT unnest(COALESCE(OLD.liked_by, ARRAY[]::UUID[]))
        INTO new_liker_id;
        
        -- Solo notificar si el que da like no es el autor
        IF new_liker_id != post_author_id THEN
          INSERT INTO notifications (recipient_id, actor_id, type, post_id)
          VALUES (post_author_id, new_liker_id, 'like', NEW.id);
        END IF;
      END;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_like
AFTER UPDATE OF liked_by ON motivational_posts
FOR EACH ROW
EXECUTE FUNCTION notify_post_like();

-- Trigger para notificar cuando alguien comenta en un post
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
  parent_comment_author_id UUID;
BEGIN
  -- Obtener el autor del post
  SELECT user_id INTO post_author_id
  FROM motivational_posts
  WHERE id = NEW.post_id;
  
  -- Si es una respuesta a otro comentario
  IF NEW.parent_comment_id IS NOT NULL THEN
    -- Obtener el autor del comentario padre
    SELECT user_id INTO parent_comment_author_id
    FROM post_comments
    WHERE id = NEW.parent_comment_id;
    
    -- Notificar al autor del comentario padre (si no es el mismo que responde)
    IF parent_comment_author_id IS NOT NULL AND parent_comment_author_id != NEW.user_id THEN
      INSERT INTO notifications (recipient_id, actor_id, type, post_id, comment_id)
      VALUES (parent_comment_author_id, NEW.user_id, 'comment_reply', NEW.post_id, NEW.id);
    END IF;
  END IF;
  
  -- Notificar al autor del post (si no es el mismo que comenta y no es una respuesta)
  IF post_author_id IS NOT NULL 
     AND post_author_id != NEW.user_id 
     AND (NEW.parent_comment_id IS NULL OR post_author_id != parent_comment_author_id) THEN
    INSERT INTO notifications (recipient_id, actor_id, type, post_id, comment_id)
    VALUES (post_author_id, NEW.user_id, 'comment', NEW.post_id, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_comment
AFTER INSERT ON post_comments
FOR EACH ROW
EXECUTE FUNCTION notify_post_comment();

-- Trigger para notificar cuando alguien te sigue
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_id, actor_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'follow');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_follow
AFTER INSERT ON user_follows
FOR EACH ROW
EXECUTE FUNCTION notify_new_follower();

-- Trigger para notificar a seguidores cuando creas un nuevo post
CREATE OR REPLACE FUNCTION notify_followers_new_post()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo notificar si el post tiene un autor (no es post del sistema)
  IF NEW.user_id IS NOT NULL THEN
    INSERT INTO notifications (recipient_id, actor_id, type, post_id)
    SELECT follower_id, NEW.user_id, 'new_post', NEW.id
    FROM user_follows
    WHERE following_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_new_post
AFTER INSERT ON motivational_posts
FOR EACH ROW
EXECUTE FUNCTION notify_followers_new_post();
