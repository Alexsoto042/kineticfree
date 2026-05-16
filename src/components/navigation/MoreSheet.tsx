import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChartLine, 
  FaHistory, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaBell
} from 'react-icons/fa';
import { BsSun, BsMoon } from 'react-icons/bs';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../supabaseClient';
import { useToasts } from '../../hooks/useToasts';
import './MoreSheet.css';

interface MoreSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const MoreSheet: React.FC<MoreSheetProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { showSuccessToast, showErrorToast } = useToasts();

  const handleNavigate = useCallback((path: string) => {
    onClose();
    navigate(path);
  }, [navigate, onClose]);

  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      showSuccessToast('Has cerrado sesión.');
      onClose();
      navigate('/login');
    } catch (error: any) {
      showErrorToast(`Error al cerrar sesión: ${error.message}`);
    }
  }, [navigate, onClose, showSuccessToast, showErrorToast]);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  if (!isOpen) return null;

  return (
    <>
      <div className="more-sheet-backdrop" onClick={onClose} />
      <div className={`more-sheet ${isOpen ? 'is-open' : ''}`}>
        <div className="more-sheet-header">
          <h2>Más Opciones</h2>
          <button className="more-sheet-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="more-sheet-content">
          <button 
            className="more-sheet-item" 
            onClick={() => handleNavigate('/notifications')}
          >
            <FaBell size={20} />
            <span>Notificaciones</span>
          </button>

          <button 
            className="more-sheet-item" 
            onClick={() => handleNavigate('/tracking')}
          >
            <FaChartLine size={20} />
            <span>Seguimiento y Progreso</span>
          </button>

          <button 
            className="more-sheet-item" 
            onClick={() => handleNavigate('/workout-history')}
          >
            <FaHistory size={20} />
            <span>Historial de Entrenamientos</span>
          </button>

          <button 
            className="more-sheet-item" 
            onClick={() => handleNavigate('/profile')}
          >
            <FaUser size={20} />
            <span>Mi Perfil</span>
          </button>

          <div className="more-sheet-divider" />

          <button 
            className="more-sheet-item" 
            onClick={() => handleNavigate('/profile')}
          >
            <FaCog size={20} />
            <span>Configuración</span>
          </button>

          <button 
            className="more-sheet-item" 
            onClick={handleThemeToggle}
          >
            {theme === 'dark' ? <BsSun size={20} /> : <BsMoon size={20} />}
            <span>Tema: {theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
          </button>

          <div className="more-sheet-divider" />

          <button 
            className="more-sheet-item more-sheet-item-danger" 
            onClick={handleLogout}
          >
            <FaSignOutAlt size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MoreSheet;
