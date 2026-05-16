import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaMapSigns, FaCompass, FaEllipsisH } from 'react-icons/fa';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import FAB from './FAB';
import MoreSheet from './MoreSheet';
import './BottomNavBar.css';

const BottomNavBar = () => {
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);
  const { pendingCount, isOffline } = useNetworkStatus();

  return (
    <>
      <nav className="bottom-nav-bar">
        <NavLink to="/" className="bottom-nav-link" end>
          <FaHome size={24} />
          <span>Inicio</span>
        </NavLink>
        
        <NavLink to="/planes" className="bottom-nav-link">
          <FaMapSigns size={24} />
          <span>Planes</span>
        </NavLink>
        
        <FAB />
        
        <NavLink to="/explore" className="bottom-nav-link">
          <FaCompass size={24} />
          <span>Explorar</span>
        </NavLink>
        
        <button 
          onClick={() => setIsMoreSheetOpen(true)} 
          className="bottom-nav-link bottom-nav-button"
        >
          <div className="nav-icon-wrapper">
            <FaEllipsisH size={24} />
            {(pendingCount > 0 || isOffline) && (
              <span className="sync-badge" title={isOffline ? 'Offline' : `${pendingCount} pendientes`}>
                {isOffline ? '📡' : pendingCount}
              </span>
            )}
          </div>
          <span>Más</span>
        </button>
      </nav>

      <MoreSheet 
        isOpen={isMoreSheetOpen} 
        onClose={() => setIsMoreSheetOpen(false)} 
      />
    </>
  );
};

export default React.memo(BottomNavBar);