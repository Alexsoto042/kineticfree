import React from 'react';
import { FaDumbbell, FaFire, FaBullseye, FaEdit, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { ImageUploader } from '../ui/ImageUploader';
import { Button } from '../ui/Button/Button';
import './ProfileHeader.css';

interface ProfileHeaderProps {
  profile: {
    id?: string;
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  };
  stats: {
    totalWorkouts: number;
    streak: number;
    activeGoals: number;
  };
  onEditProfile: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
  onAvatarUpload: (url: string) => void;
  onAvatarError: (error: Error) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  stats,
  onEditProfile,
  onNavigateToSettings,
  onLogout,
  onAvatarUpload,
  onAvatarError,
}) => {
  return (
    <div className="profile-header-new">
      <div className="profile-header-main">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="avatar-container-new">
            <img 
              src={profile?.avatar_url || '/images/default-avatar.svg'} 
              alt="User Avatar" 
              className="user-avatar-new" 
            />
            <ImageUploader
              aria-label="Cambiar foto de perfil"
              bucketName="avatars"
              filePath={`public/${profile?.full_name || 'user'}-${Date.now()}.jpg`}
              onUploadSuccess={onAvatarUpload}
              onUploadError={onAvatarError}
            />
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{profile?.full_name}</h1>
            <p className="profile-username">@{profile?.username || 'usuario'}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="profile-quick-stats">
          <div className="quick-stat-badge">
            <FaDumbbell className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{stats.totalWorkouts}</span>
              <span className="stat-label">Entrenamientos</span>
            </div>
          </div>
          <div className="quick-stat-badge">
            <FaFire className="stat-icon fire-icon" />
            <div className="stat-content">
              <span className="stat-value">{stats.streak}</span>
              <span className="stat-label">Racha</span>
            </div>
          </div>
          <div className="quick-stat-badge">
            <FaBullseye className="stat-icon" />
            <div className="stat-content">
              <span className="stat-value">{stats.activeGoals}</span>
              <span className="stat-label">Metas</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="profile-actions">
          <Button 
            variant="secondary" 
            size="small"
            onClick={(e) => {
              e.preventDefault();
              onEditProfile();
            }}
            className="action-btn"
          >
            <FaEdit />
            <span>Editar</span>
          </Button>
          <Button 
            variant="secondary" 
            size="small"
            onClick={(e) => {
              e.preventDefault();
              onNavigateToSettings();
            }}
            className="action-btn"
          >
            <FaCog />
            <span>Ajustes</span>
          </Button>
          <Button 
            variant="danger" 
            size="small"
            onClick={(e) => {
              e.preventDefault();
              onLogout();
            }}
            className="action-btn"
          >
            <FaSignOutAlt />
            <span>Salir</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
