import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaComment, FaUserPlus, FaBell, FaReply } from 'react-icons/fa';
import { useNotifications } from '../../hooks/useNotifications';
import type { Notification } from '../../types';
import './NotificationsList.css';

const NotificationsList: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <FaHeart className="notif-icon notif-icon-like" />;
      case 'comment':
        return <FaComment className="notif-icon notif-icon-comment" />;
      case 'comment_reply':
        return <FaReply className="notif-icon notif-icon-reply" />;
      case 'follow':
        return <FaUserPlus className="notif-icon notif-icon-follow" />;
      case 'new_post':
        return <FaBell className="notif-icon notif-icon-post" />;
      default:
        return <FaBell className="notif-icon" />;
    }
  };

  const getNotificationText = (notif: Notification) => {
    const username = notif.actor_profile?.username || 'Alguien';

    switch (notif.type) {
      case 'like':
        return `${username} le gustó tu publicación`;
      case 'comment':
        return `${username} comentó en tu publicación`;
      case 'comment_reply':
        return `${username} respondió a tu comentario`;
      case 'follow':
        return `${username} comenzó a seguirte`;
      case 'new_post':
        return `${username} publicó algo nuevo`;
      default:
        return notif.message || 'Nueva notificación';
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    // Mark as read
    if (!notif.read) {
      await markAsRead(notif.id);
    }

    // Navigate to related content
    if (notif.post_id) {
      navigate(`/community?post=${notif.post_id}`);
    } else if (notif.actor_id && notif.type === 'follow') {
      navigate(`/profile/${notif.actor_id}`);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `Hace ${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="notifications-list">
        <div className="notifications-loading">Cargando notificaciones...</div>
      </div>
    );
  }

  return (
    <div className="notifications-list">
      <div className="notifications-header">
        <h2>Notificaciones</h2>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAllAsRead} className="btn-mark-all-read">
            Marcar todas como leídas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notifications-empty">
          <FaBell size={48} />
          <p>No tienes notificaciones</p>
        </div>
      ) : (
        <div className="notifications-items">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`notification-item ${!notif.read ? 'notification-unread' : ''}`}
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notification-icon-wrapper">
                {getNotificationIcon(notif.type)}
              </div>

              <div className="notification-content">
                <div className="notification-text">
                  {getNotificationText(notif)}
                </div>
                <div className="notification-time">
                  {getTimeAgo(notif.created_at)}
                </div>
              </div>

              {notif.post?.media_url && (
                <div className="notification-thumbnail">
                  <img src={notif.post.media_url} alt="Post" />
                </div>
              )}

              {!notif.read && <div className="notification-unread-dot" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
