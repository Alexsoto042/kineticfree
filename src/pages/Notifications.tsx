import React from 'react';
import NotificationsList from '../components/community/NotificationsList';
import './Notifications.css';

const Notifications: React.FC = () => {
  return (
    <div className="notifications-page">
      <NotificationsList />
    </div>
  );
};

export default Notifications;
