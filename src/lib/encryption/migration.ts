import { Preferences } from '@capacitor/preferences';
import { encryptionService } from './EncryptionService';
import { encryptedStorage } from './encryptedStorage';
import { db } from '../../db';

/**
 * Migration Service
 * 
 * Migra datos existentes sin encriptar al nuevo formato encriptado.
 * Solo se ejecuta una vez por usuario.
 */

const MIGRATION_KEY = 'encryption_migrated_v1';

/**
 * Verifica si ya se realizó la migración
 */
async function isMigrated(): Promise<boolean> {
  const { value } = await Preferences.get({ key: MIGRATION_KEY });
  return value === 'true';
}

/**
 * Marca la migración como completada
 */
async function markAsMigrated(): Promise<void> {
  await Preferences.set({ key: MIGRATION_KEY, value: 'true' });
}

/**
 * Migra datos de una tabla específica
 */
async function migrateTable(
  tableName: string,
  keyPrefix: string,
  userId: string
): Promise<number> {
  let migratedCount = 0;

  try {
    // Obtener todos los datos de la tabla
    const table = (db as any)[tableName];
    if (!table) {
      console.log(`Table ${tableName} does not exist, skipping...`);
      return 0;
    }
    
    const allData = await table.toArray();
    
    if (!allData || allData.length === 0) {
      console.log(`No data to migrate in table: ${tableName}`);
      return 0;
    }

    // Migrar cada registro
    for (const record of allData) {
      try {
        // Generar key para el nuevo storage
        const key = `${keyPrefix}_${userId}_${record.id || Date.now()}`;
        
        // Guardar en formato encriptado
        await encryptedStorage.set(key, record);
        
        // Eliminar del storage antiguo (opcional, comentado por seguridad)
        // await db[tableName]?.delete(record.id);
        
        migratedCount++;
      } catch (error) {
        console.error(`Error migrating record from ${tableName}:`, error);
      }
    }

    console.log(`Migrated ${migratedCount} records from ${tableName}`);
  } catch (error) {
    console.error(`Error accessing table ${tableName}:`, error);
  }

  return migratedCount;
}

/**
 * Migra todos los datos sensibles al formato encriptado
 * 
 * @param userId - ID del usuario
 * @returns Número total de registros migrados
 */
export async function migrateToEncrypted(userId: string): Promise<number> {
  // Verificar si ya se migró
  if (await isMigrated()) {
    console.log('Data already migrated, skipping...');
    return 0;
  }

  // Verificar que la encriptación esté inicializada
  if (!encryptionService.isInitialized()) {
    console.error('Encryption service not initialized');
    throw new Error('Cannot migrate: encryption not initialized');
  }

  console.log('Starting data migration to encrypted format...');
  let totalMigrated = 0;

  try {
    // Migrar métricas corporales (si existen)
    // Nota: Ajustar según las tablas reales de tu app
    const tables = [
      { name: 'body_metrics', prefix: 'metrics' },
      { name: 'health_data', prefix: 'health' },
      { name: 'wearable_data', prefix: 'wearable' },
    ];

    for (const table of tables) {
      try {
        const count = await migrateTable(table.name, table.prefix, userId);
        totalMigrated += count;
      } catch (error) {
        console.error(`Error migrating ${table.name}:`, error);
        // Continuar con las demás tablas
      }
    }

    // Marcar como migrado
    await markAsMigrated();
    
    console.log(`Migration completed! Total records migrated: ${totalMigrated}`);
    return totalMigrated;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Resetea el estado de migración (solo para testing/debugging)
 */
export async function resetMigrationStatus(): Promise<void> {
  await Preferences.remove({ key: MIGRATION_KEY });
  console.log('Migration status reset');
}

/**
 * Verifica el estado de la migración
 */
export async function getMigrationStatus(): Promise<{
  migrated: boolean;
  timestamp?: number;
}> {
  const migrated = await isMigrated();
  return { migrated };
}
