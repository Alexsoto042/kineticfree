import React from 'react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import './NetworkStatus.css';

/**
 * Componente que muestra el estado de conexión y sincronización
 * Se muestra como banner flotante cuando está offline o sincronizando
 */
export const NetworkStatus: React.FC = () => {
  const { isOffline, isSyncing, pendingCount, syncNow } = useNetworkStatus();

  // No mostrar nada si está online y no hay sincronización
  if (!isOffline && !isSyncing && pendingCount === 0) {
    return null;
  }

  return (
    <div className={`network-status ${isOffline ? 'offline' : 'syncing'}`}>
      <div className="network-status-content">
        {isOffline && (
          <>
            <span className="network-icon">📡</span>
            <span className="network-text">
              Sin conexión - Trabajando offline
              {pendingCount > 0 && ` (${pendingCount} pendientes)`}
            </span>
          </>
        )}
        
        {isSyncing && (
          <>
            <span className="network-icon spinning">🔄</span>
            <span className="network-text">
              Sincronizando{pendingCount > 0 ? ` ${pendingCount} elementos...` : '...'}
            </span>
          </>
        )}

        {!isOffline && !isSyncing && pendingCount > 0 && (
          <>
            <span className="network-icon">⏳</span>
            <span className="network-text">
              {pendingCount} elementos pendientes
            </span>
            <button 
              className="sync-now-btn"
              onClick={syncNow}
              aria-label="Sincronizar ahora"
            >
              Sincronizar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NetworkStatus;
