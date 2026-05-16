-- Script para deshabilitar temporalmente los triggers de notificaciones
-- Ejecuta esto si tienes problemas al registrar nuevos usuarios

-- Deshabilitar triggers
ALTER TABLE motivational_posts DISABLE TRIGGER trigger_notify_like;
ALTER TABLE motivational_posts DISABLE TRIGGER trigger_notify_new_post;
ALTER TABLE post_comments DISABLE TRIGGER trigger_notify_comment;
ALTER TABLE user_follows DISABLE TRIGGER trigger_notify_follow;

-- Para volver a habilitarlos después:
-- ALTER TABLE motivational_posts ENABLE TRIGGER trigger_notify_like;
-- ALTER TABLE motivational_posts ENABLE TRIGGER trigger_notify_new_post;
-- ALTER TABLE post_comments ENABLE TRIGGER trigger_notify_comment;
-- ALTER TABLE user_follows ENABLE TRIGGER trigger_notify_follow;
