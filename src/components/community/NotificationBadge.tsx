import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import './NotificationBadge.css';

interface NotificationBadgeProps {
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = '' }) => {
  const { unreadCount } = useNotifications();

  if (unreadCount === 0) return null;

  return (
    <div className={`notification-badge ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </div>
  );
};

export default NotificationBadge;
