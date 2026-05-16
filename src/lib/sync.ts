import { supabase } from '../supabaseClient';
import { db } from '../db';
import type { Exercise, Routine } from '../types';
import { logger } from './logger';

const syncLogger = logger.createContext('Sync');

export const syncPlansAndGoals = async () => {
  // Removed sessionStorage check to force sync every time
  // This ensures mobile app gets latest data even if session persists
  
  if (!navigator.onLine) {
    syncLogger.info('Offline: Skipping plans and goals sync.');
    return;
  }

  try {
    syncLogger.info('Syncing plans and goals...');
    const [goalsResponse, plansResponse] = await Promise.all([
      supabase.from('goals').select('*'),
      supabase.from('plans').select('*'),
    ]);

    if (goalsResponse.error) throw goalsResponse.error;
    if (plansResponse.error) throw plansResponse.error;

    const goals = goalsResponse.data || [];
    const plans = plansResponse.data || [];

    await db.transaction('rw', db.goals, db.plans, async () => {
      // Clear old data to ensure local DB matches server exactly (removes deleted items)
      await db.goals.clear();
      await db.plans.clear();
      
      await db.goals.bulkPut(goals);
      await db.plans.bulkPut(plans);
    });

    syncLogger.info('Finished syncing plans and goals.');
  } catch (error) {
    syncLogger.error('Error syncing plans and goals:', error);
  }
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const shouldSync = (tableName: string): boolean => {
  const lastSync = localStorage.getItem(`lastSync_${tableName}`);
  if (!lastSync) return true;
  
  const timeSinceSync = Date.now() - parseInt(lastSync, 10);
  return timeSinceSync > CACHE_DURATION;
};

// Estrategias de sincronización por ruta
interface SyncStrategy {
  tables: Array<'exercises' | 'routines'>;
  frequency: number; // horas
}

const SYNC_STRATEGIES: Record<string, SyncStrategy> = {
  '/train': {
    tables: ['exercises', 'routines'],
    frequency: 12, // 2 veces al día
  },
  '/routine-builder': {
    tables: ['exercises', 'routines'],
    frequency: 12,
  },
  '/explore-plans': {
    tables: ['routines'],
    frequency: 24, // 1 vez al día
  },
  '/workout-player': {
    tables: ['exercises', 'routines'],
    frequency: 1, // Cada hora (datos críticos)
  },
};

/**
 * Sincroniza solo las tablas necesarias según la ruta actual
 * Reduce sincronizaciones innecesarias y mejora el rendimiento
 */
export async function syncForRoute(route: string): Promise<void> {
  const strategy = SYNC_STRATEGIES[route];
  if (!strategy) {
    // Si no hay estrategia definida, no sincronizar
    return;
  }

  const syncPromises = strategy.tables.map(async (table) => {
    const lastSync = localStorage.getItem(`lastSync_${table}`);
    const hoursSinceSync = lastSync 
      ? (Date.now() - parseInt(lastSync, 10)) / (1000 * 60 * 60)
      : Infinity;

    if (hoursSinceSync >= strategy.frequency) {
      return syncTable(table);
    }
  });

  await Promise.all(syncPromises);
}


export const syncTable = (tableName: 'exercises' | 'routines'): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (!shouldSync(tableName)) {
      syncLogger.debug(`${tableName} synced recently (within 24h). Skipping.`);
      resolve();
      return;
    }

    if (!navigator.onLine) {
      syncLogger.info(`Offline: Using cached ${tableName} data.`);
      // Cuando está offline, simplemente resolver sin error
      // Los datos se cargarán desde IndexedDB automáticamente
      resolve();
      return;
    }

    try {
      syncLogger.info(`Syncing ${tableName}...`);
      
      let query = supabase.from(tableName).select('*');
      
      // Optimization: Select only necessary fields based on table
      if (tableName === 'exercises') {
        query = supabase.from('exercises').select(`
          id, name, description, instructions, category, image, gif_url, 
          body_zone, youtube_id, calories_burned_per_minute, benefits, requires_machine
        `);
      } else if (tableName === 'routines') {
        query = supabase.from('routines').select(`
          id, name, description, category, difficulty, goal, body_zone_focus, exercises
        `);
      }

      const { data, error } = await query;

      if (error) throw error;

      const table = db.table(tableName);

      await db.transaction('rw', table, async () => {
        switch (tableName) {
          case 'exercises':
            await db.exercises.bulkPut(data as Exercise[]);
            break;
          case 'routines':
            await db.routines.bulkPut(data as Routine[]);
            break;
          default:
            syncLogger.warn(`Sync not implemented for table: ${tableName}`);
            return;
        }
      });

      syncLogger.info(`Finished syncing ${tableName}.`);
      localStorage.setItem(`lastSync_${tableName}`, Date.now().toString());
      resolve();
    } catch (error) {
      syncLogger.error(`Error syncing ${tableName}:`, error);
      reject(error);
    }
  });
};

export const downloadRoutine = async (routineId: number): Promise<void> => {
  if (!navigator.onLine) {
    throw new Error('No hay conexión a internet para descargar la rutina.');
  }

  try {
    syncLogger.info(`Downloading routine ${routineId}...`);
    
    // 1. Fetch routine from Supabase
    const { data: routine, error: routineError } = await supabase
      .from('routines')
      .select('*')
      .eq('id', routineId)
      .single();

    if (routineError) throw routineError;
    if (!routine) throw new Error('Rutina no encontrada.');

    // 2. Fetch exercises from Supabase
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .in('id', routine.exercises);

    if (exercisesError) throw exercisesError;

    // 3. Save to local DB (Dexie)
    await db.transaction('rw', db.routines, db.exercises, async () => {
      await db.routines.put(routine as Routine);
      if (exercises && exercises.length > 0) {
        await db.exercises.bulkPut(exercises as Exercise[]);
      }
    });

    syncLogger.info(`Routine ${routineId} downloaded successfully.`);
  } catch (error) {
    syncLogger.error(`Error downloading routine ${routineId}:`, error);
    throw error;
  }
};
