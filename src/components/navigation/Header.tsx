import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToasts } from '../../hooks/useToasts';
import { FiX } from 'react-icons/fi';
import { BsSun, BsMoon } from 'react-icons/bs';
import {
  FaFire,
  FaHome,
  FaDumbbell,
  FaListAlt,
  FaHistory,
  FaUserCircle,
  FaPlus,
  FaSignOutAlt,
  FaUserFriends,
  FaMapSigns,
  FaFilm,
  FaCompass,
  FaUsers,
  FaUtensils,
  FaChartLine,
} from 'react-icons/fa';
import { supabase } from '../../supabaseClient';
import type { Session } from '@supabase/supabase-js';
import { useTheme } from '../../context/ThemeContext';
import { useStreak } from '../../hooks/useStreak';
import { Menu } from '../ui/Menu'; // Use the new unified Menu component
import './Header.css';
import logoLight from '../../assets/logo/logo_light_bg.svg';
import logoDark from '../../assets/logo/logo_dark_bg.svg';

interface HeaderProps {
  session: Session;
  username: string | null;
  avatarUrl: string | null;
}

const Header: React.FC<HeaderProps> = ({ session, username, avatarUrl }) => {
  const { showSuccessToast, showErrorToast } = useToasts(); // Destructure showErrorToast
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New state for logout loading
  const { theme, toggleTheme } = useTheme();
  const { streak } = useStreak();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({}); // State to manage open/closed status of collapsible menus

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768); // Use the same breakpoint as CSS
    };

    checkIsMobile(); // Set initial value
    window.addEventListener('resize', checkIsMobile); // Listen for resize events

    return () => {
      window.removeEventListener('resize', checkIsMobile); // Clean up
    };
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
    setOpenMenus({}); // Close all collapsible menus when main mobile menu closes
  }, []);

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true); // Start loading
    closeMenu();
    try {
      const { error } = await supabase.auth.signOut();
      
      // Ignore "Auth session missing" error - session already cleared
      if (error && error.message !== 'Auth session missing!') {
        throw error;
      }
      
      showSuccessToast('Has cerrado sesión.');
      navigate('/login');
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error);
      
      // Even if there's an error, navigate to login to clear the UI
      showErrorToast(
        `Error al cerrar sesión: ${error.message || 'Inténtalo de nuevo.'}`
      );
      navigate('/login');
    } finally {
      setIsLoggingOut(false); // End loading
    }
  }, [closeMenu, showSuccessToast, showErrorToast, navigate]);

  const handleToggleMenu = useCallback((title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }, []);

  const menuStructure = [
    {
      title: 'Explorar',
      icon: <FaCompass size={20} />,
      items: [
        {
          to: '/exercises',
          label: 'Ejercicios',
          icon: <FaDumbbell size={20} />,
        },
        {
          to: '/explore-plans',
          label: 'Planes',
          icon: <FaMapSigns size={20} />,
        },
        {
          to: '/nutrition',
          label: 'Nutrición',
          icon: <FaUtensils size={20} />,
        },
      ],
    },
    {
      title: 'Rutinas',
      icon: <FaListAlt size={20} />,
      items: [
        {
          to: '/routines',
          label: 'Mis Rutinas',
          icon: <FaListAlt size={20} />,
        },
        {
          to: '/build-routine',
          label: 'Crear Rutina',
          icon: <FaPlus size={20} />,
        },
      ],
    },
    {
      title: 'Comunidad',
      icon: <FaUsers size={20} />,
      items: [
        { to: '/friends', label: 'Amigos', icon: <FaUserFriends size={20} /> },
        { to: '/motivation', label: 'Motivación', icon: <FaFilm size={20} /> },
      ],
    },
  ];

  // For mobile, combine 'Explorar' and 'Rutinas'
  const exploreItemsMobile = [
    {
      to: '/exercises',
      label: 'Ejercicios',
      icon: <FaDumbbell size={20} />,
    },
    {
      to: '/explore-plans',
      label: 'Planes',
      icon: <FaMapSigns size={20} />,
    },
    {
      to: '/nutrition',
      label: 'Nutrición',
      icon: <FaUtensils size={20} />,
    },
    // Add Rutinas items here
    { to: '/routines', label: 'Mis Rutinas', icon: <FaListAlt size={20} /> },
    {
      to: '/build-routine',
      label: 'Crear Rutina',
      icon: <FaPlus size={20} />,
    },
  ];

  const menuStructureMobile = [
    {
      title: 'Explorar',
      icon: <FaCompass size={20} />,
      items: exploreItemsMobile,
    },
    // Exclude 'Rutinas' section for mobile
    {
      title: 'Comunidad',
      icon: <FaUsers size={20} />,
      items: [
        { to: '/friends', label: 'Amigos', icon: <FaUserFriends size={20} /> },
        { to: '/motivation', label: 'Motivación', icon: <FaFilm size={20} /> },
      ],
    },
  ];

  const userMenu = {
    title: 'Perfil',
    icon: <FaUserCircle size={20} />,
    items: [
      { to: '/', label: 'Dashboard', icon: <FaHome size={20} /> },
      { to: '/profile', label: 'Mi Perfil', icon: <FaUserCircle size={20} /> },
      {
        to: '/tracking',
        label: 'Seguimiento',
        icon: <FaChartLine size={20} />,
      },
      {
        to: '/workout-history',
        label: 'Historial',
        icon: <FaHistory size={20} />,
      },
    ],
  };

  return (
    <>
      <header className="app-header">
        <Link to="/" className="logo-container" onClick={closeMenu}>
          <img
            src={theme === 'dark' ? logoDark : logoLight}
            alt="Kinetic Logo"
            className="app-logo"
          />
          <div className="title-container">
            <h1>Kinetic</h1>
            <span className="app-version">1.1.6</span>
          </div>
        </Link>

        <div className="right-side-group">
          {/* --- Desktop Navigation --- */}
          <nav className="desktop-nav" data-testid="desktop-nav">
            {menuStructure.map((menu) => (
              <Menu
                key={menu.title}
                variant="dropdown"
                trigger={
                  <div className="nav-link">
                    {menu.icon}
                    <span>{menu.title}</span>
                  </div>
                }
                items={menu.items}
              />
            ))}
            {streak != null && streak > 0 && (
              <div
                className="nav-link streak-display"
                title={`Tu racha actual es de ${streak} días`}
              >
                <FaFire color="#FF7A00" />
                <span>{streak}</span>
              </div>
            )}
            {!isMobile && (
              <Menu
                variant="dropdown"
                trigger={
                  <div className="nav-link profile-trigger">
                    <div className="desktop-avatar-container">
                      <img
                        src={avatarUrl || '/images/default-avatar.svg'}
                        alt="User Avatar"
                        className="desktop-avatar"
                      />
                    </div>
                    <span>{username || session.user.email || 'Usuario'}</span>
                  </div>
                }
                items={[
                  ...userMenu.items,
                  { isSeparator: true },
                  {
                    label: 'Cerrar Sesión',
                    icon: <FaSignOutAlt size={20} />,
                    onClick: handleLogout,
                    disabled: isLoggingOut, // Disable when logging out
                  },
                ]}
              />
            )}
          </nav>

          {/* --- Header Actions --- */}
          <div className="header-actions">
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <BsSun size={24} /> : <BsMoon size={24} />}
            </button>
            {isMobile && (
              <Link to="/profile" className="mobile-profile-link">
                <img
                    src={avatarUrl || '/images/default-avatar.svg'}
                    alt="User Avatar"
                    className="mobile-avatar"
                  />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* --- Mobile Navigation Panel (now unused, but keeping for reference) --- */}
      <div
        className={`nav-backdrop ${isMenuOpen ? 'is-open' : ''}`}
        onClick={closeMenu}
      />
      <nav
        className={`mobile-nav-panel ${isMenuOpen ? 'is-open' : ''}`}
        data-testid="mobile-nav"
      >
        <div className="mobile-nav-header">
          <h2>{username || session.user.email || 'Usuario'}</h2>
          <button className="mobile-menu-toggle" onClick={closeMenu}>
            <FiX size={28} />
          </button>
        </div>
        <div className="mobile-nav-links">
          {[...menuStructureMobile, userMenu].map((menu) => (
            <Menu
              key={menu.title}
              variant="collapsible"
              collapsibleTitle={menu.title}
              collapsibleIcon={menu.icon}
              items={menu.items.map((item) => ({
                ...item,
                onClick: closeMenu,
              }))}
              isOpen={openMenus[menu.title] || false}
              onToggle={() => handleToggleMenu(menu.title)}
            />
          ))}
          <div className="collapsible-menu">
            <button
              className="collapsible-trigger"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <div className="trigger-content">
                <FaSignOutAlt size={20} />
                <span>Cerrar Sesión</span>
              </div>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default React.memo(Header);
