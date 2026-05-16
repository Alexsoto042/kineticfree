import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';
import { logger } from '../lib/logger';

const networkLogger = logger.createContext('NetworkStatus');

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  connectionType: string;
  syncNow: () => Promise<void>;
}

/**
 * Hook para monitorear el estado de la red y sincronización
 * Funciona tanto en web como en móvil nativo
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [connectionType, setConnectionType] = useState('unknown');

  // Actualizar contador de operaciones pendientes
  const updatePendingCount = async () => {
    try {
      const { db } = await import('../db');
      const count = await db.workout_logs.where('synced').equals(0).count();
      setPendingCount(count);
    } catch (error) {
      networkLogger.error('Error counting pending operations:', error);
    }
  };

  // Función para sincronizar manualmente
  const syncNow = async () => {
    if (!isOnline) {
      networkLogger.warn('Cannot sync while offline');
      return;
    }

    setIsSyncing(true);
    try {
      const { syncPendingWorkoutLogs } = await import('../lib/offlineSync');
      await syncPendingWorkoutLogs();
      await updatePendingCount();
      networkLogger.info('Manual sync completed');
    } catch (error) {
      networkLogger.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    // Actualizar contador inicial
    updatePendingCount();

    // Listener para cambios de red en navegador
    const handleOnline = () => {
      networkLogger.info('Network status: Online');
      setIsOnline(true);
      syncNow();
    };

    const handleOffline = () => {
      networkLogger.info('Network status: Offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listener para Capacitor Network (móvil nativo)
    let networkListener: any;
    
    if (Capacitor.isNativePlatform()) {
      const setupNativeListener = async () => {
        try {
          const status = await Network.getStatus();
          setIsOnline(status.connected);
          setConnectionType(status.connectionType);

          networkListener = await Network.addListener('networkStatusChange', (status) => {
            networkLogger.info(`Network changed: ${status.connected ? 'Online' : 'Offline'} (${status.connectionType})`);
            setIsOnline(status.connected);
            setConnectionType(status.connectionType);
            
            if (status.connected) {
              syncNow();
            }
          });
        } catch (error) {
          networkLogger.error('Error setting up native network listener:', error);
        }
      };

      setupNativeListener();
    }

    // Actualizar contador periódicamente
    const interval = setInterval(updatePendingCount, 30000); // Cada 30 segundos

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (networkListener) {
        networkListener.remove();
      }
      clearInterval(interval);
    };
  }, [isOnline]);

  return {
    isOnline,
    isOffline: !isOnline,
    isSyncing,
    pendingCount,
    connectionType,
    syncNow,
  };
}
