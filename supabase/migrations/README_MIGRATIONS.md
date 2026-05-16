# Instrucciones para Ejecutar Migraciones SQL

## ⚠️ IMPORTANTE: Orden de Ejecución

Debes ejecutar las migraciones en este orden exacto (las dependencias están en orden):

### 1️⃣ Comentarios
```
20251206_create_comments_table.sql
```
**Qué hace:**
- Crea tabla `post_comments` con soporte para respuestas anidadas
- Agrega índices para performance
- Configura RLS (Row Level Security)
- Límite de 500 caracteres por comentario

---

### 2️⃣ Sistema de Seguir Usuarios
```
20251206_create_user_follows_table.sql
```
**Qué hace:**
- Crea tabla `user_follows`
- Evita que usuarios se sigan a sí mismos
- Funciones auxiliares:
  - `get_user_follow_stats(user_id)` - Obtiene conteo de seguidores/siguiendo
  - `is_following(follower_id, following_id)` - Verifica si un usuario sigue a otro

---

### 3️⃣ Notificaciones
```
20251206_create_notifications_table.sql
```
**Qué hace:**
- Crea tabla `notifications`
- Tipos: `like`, `comment`, `follow`, `new_post`, `comment_reply`
- Funciones auxiliares:
  - `mark_all_notifications_read(user_id)` - Marca todas como leídas
  - `get_unread_notifications_count(user_id)` - Obtiene conteo de no leídas

---

### 4️⃣ Triggers Automáticos
```
20251206_create_notification_triggers.sql
```
**Qué hace:**
- Trigger para notificar likes en posts
- Trigger para notificar comentarios en posts
- Trigger para notificar respuestas a comentarios
- Trigger para notificar nuevos seguidores
- Trigger para notificar a seguidores cuando creas un post

---

## 📋 Cómo Ejecutar

### Opción A: Supabase Dashboard (Recomendado)
1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de cada archivo **en orden**
5. Ejecuta cada query
6. Verifica que no haya errores

### Opción B: CLI de Supabase
```bash
cd /Users/alex/Documents/gemini

# Ejecutar en orden
supabase db push --file supabase/migrations/20251206_create_comments_table.sql
supabase db push --file supabase/migrations/20251206_create_user_follows_table.sql
supabase db push --file supabase/migrations/20251206_create_notifications_table.sql
supabase db push --file supabase/migrations/20251206_create_notification_triggers.sql
```

---

## ✅ Verificación

Después de ejecutar todas las migraciones, verifica que se crearon correctamente:

```sql
-- Verificar tablas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('post_comments', 'user_follows', 'notifications');

-- Verificar triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Verificar funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'get_user_follow_stats',
  'is_following',
  'mark_all_notifications_read',
  'get_unread_notifications_count'
);
```

Deberías ver:
- ✅ 3 tablas nuevas
- ✅ 4 triggers nuevos
- ✅ 4 funciones nuevas

---

## 🔄 Rollback (Si algo sale mal)

Si necesitas revertir los cambios:

```sql
-- Eliminar en orden inverso
DROP TRIGGER IF EXISTS trigger_notify_new_post ON motivational_posts;
DROP TRIGGER IF EXISTS trigger_notify_follow ON user_follows;
DROP TRIGGER IF EXISTS trigger_notify_comment ON post_comments;
DROP TRIGGER IF EXISTS trigger_notify_like ON motivational_posts;

DROP FUNCTION IF EXISTS notify_followers_new_post();
DROP FUNCTION IF EXISTS notify_new_follower();
DROP FUNCTION IF EXISTS notify_post_comment();
DROP FUNCTION IF EXISTS notify_post_like();
DROP FUNCTION IF EXISTS get_unread_notifications_count(UUID);
DROP FUNCTION IF EXISTS mark_all_notifications_read(UUID);
DROP FUNCTION IF EXISTS is_following(UUID, UUID);
DROP FUNCTION IF EXISTS get_user_follow_stats(UUID);

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_follows;
DROP TABLE IF EXISTS post_comments;
```

---

## 📝 Próximos Pasos

Una vez ejecutadas las migraciones:
1. ✅ Avísame para continuar con los hooks de React
2. ✅ Implementaré los componentes UI
3. ✅ Actualizaré el FAB con comportamiento contextual
4. ✅ Probaremos todo el sistema

---

**¿Listo para ejecutar?** Avísame cuando hayas ejecutado las migraciones y te diré si hubo algún error.
