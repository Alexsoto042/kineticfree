import { supabase } from '../supabaseClient';
import { db } from '../db';
import { Toast } from '@capacitor/toast';
import { logger } from './logger';

const offlineSyncLogger = logger.createContext('OfflineSync');

interface SyncQueueItem {
  id: number;
  type: 'workout_log' | 'goal' | 'body_metric';
  data: any;
  retryCount: number;
  lastAttempt?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
let isSyncing = false;

/**
 * Sincroniza todos los workout logs pendientes
 * Incluye retry logic y manejo robusto de errores
 */
export async function syncPendingWorkoutLogs() {
  if (!navigator.onLine) {
    offlineSyncLogger.info('Offline: Skipping workout log sync.');
    return;
  }

  if (isSyncing) {
    offlineSyncLogger.info('Sync already in progress, skipping.');
    return;
  }

  try {
    isSyncing = true;  // Mover dentro del try para evitar lock permanente
    
    const pendingLogs = await db.workout_logs.where('synced').equals(0).toArray();

    if (pendingLogs.length === 0) {
      offlineSyncLogger.debug('No pending workout logs to sync.');
      return;
    }

    offlineSyncLogger.info(`Attempting to sync ${pendingLogs.length} pending workout logs.`);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      offlineSyncLogger.error('User not authenticated, cannot sync pending workouts.');
      return;
    }

    let successfulSyncs = 0;
    let failedSyncs = 0;

    for (const log of pendingLogs) {
      try {
        const success = await syncWorkoutLog(log, user.id);
        if (success) {
          successfulSyncs++;
        } else {
          failedSyncs++;
        }
      } catch (e) {
        offlineSyncLogger.error(`Failed to sync workout log for exercise ${log.exercise_id}:`, e);
        failedSyncs++;
      }
    }

    // Mostrar resultado de sincronización
    if (successfulSyncs > 0) {
      await Toast.show({ 
        text: `✅ Sincronizados ${successfulSyncs} registros de entrenamiento.`, 
        duration: 'short' 
      });
      offlineSyncLogger.info(`Successfully synced ${successfulSyncs} workout logs.`);
    }

    if (failedSyncs > 0) {
      await Toast.show({ 
        text: `⚠️ ${failedSyncs} registros no se pudieron sincronizar. Se reintentará más tarde.`, 
        duration: 'long' 
      });
      offlineSyncLogger.warn(`Failed to sync ${failedSyncs} workout logs.`);
    }
  } finally {
    isSyncing = false;
  }
}

/**
 * Sincroniza un workout log individual con retry logic
 */
async function syncWorkoutLog(log: any, userId: string, retryCount = 0): Promise<boolean> {
  try {
    // Preparar datos para upload
    const logToUpload = { ...log, user_id: userId };
    delete logToUpload.id;
    delete logToUpload.synced;

    const { error } = await supabase.from('workout_logs').insert(logToUpload);

    if (error) {
      // Si es error de red, reintentar
      if (error.message.includes('network') || error.message.includes('fetch')) {
        if (retryCount < MAX_RETRIES) {
          offlineSyncLogger.info(`Retrying sync for log ${log.id} (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await sleep(RETRY_DELAY * (retryCount + 1)); // Exponential backoff
          return syncWorkoutLog(log, userId, retryCount + 1);
        }
      }
      throw error;
    }

    // Marcar como sincronizado
    await db.workout_logs.update(log.id!, { synced: true });
    return true;
  } catch (error) {
    offlineSyncLogger.error(`Failed to sync workout log ${log.id}:`, error);
    return false;
  }
}

/**
 * Obtiene el número de operaciones pendientes de sincronización
 */
export async function getPendingSyncCount(): Promise<number> {
  try {
    const count = await db.workout_logs.where('synced').equals(0).count();
    return count;
  } catch (error) {
    offlineSyncLogger.error('Error getting pending sync count:', error);
    return 0;
  }
}

/**
 * Utility para esperar (usado en retry logic)
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
