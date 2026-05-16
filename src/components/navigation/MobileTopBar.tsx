import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCog } from 'react-icons/fa';
import { useUserStore } from '../../store/userStore';

const MobileTopBar: React.FC = () => {
  const { profile } = useUserStore();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="mobile-top-bar">
      <div className="mobile-user-info">
        <button 
          className="mobile-avatar-btn" 
          onClick={() => navigate('/profile')}
          aria-label="Ir al perfil"
        >
          <img
            src={profile?.avatar_url || '/images/default-avatar.svg'}
            alt="Avatar"
            className="mobile-avatar-img"
          />
        </button>
        <div className="mobile-greeting">
          <span>{getGreeting()},</span>
          <h1>{profile?.username || 'Atleta'}</h1>
        </div>
      </div>
      
      <div className="mobile-actions">
        <button 
          className="mobile-action-btn"
          onClick={() => navigate('/profile')} // Could be settings page later
          aria-label="Ajustes"
        >
          <FaCog size={20} />
        </button>
      </div>
    </div>
  );
};

export default MobileTopBar;
