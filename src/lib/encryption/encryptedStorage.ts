import { encryptionService } from './EncryptionService';
import { openDB, type IDBPDatabase } from 'idb';

/**
 * Encrypted Storage
 * 
 * Wrapper para almacenar datos encriptados en IndexedDB.
 * Todos los datos se encriptan antes de guardar y se desencriptan al leer.
 */
export class EncryptedStorage {
  private dbName: string;
  private storeName: string;
  private db: IDBPDatabase | null = null;

  constructor(dbName: string = 'kinetic-encrypted', storeName: string = 'encrypted_data') {
    this.dbName = dbName;
    this.storeName = storeName;
  }

  /**
   * Inicializa la base de datos
   */
  private async initDB(): Promise<IDBPDatabase> {
    if (this.db) return this.db;

    this.db = await openDB(this.dbName, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('encrypted_data')) {
          const store = db.createObjectStore('encrypted_data', { keyPath: 'key' });
          store.createIndex('updatedAt', 'updatedAt');
        }
      },
    });

    return this.db;
  }

  /**
   * Guarda datos encriptados
   * 
   * @param key - Clave única para los datos
   * @param value - Datos a encriptar y guardar
   */
  async set(key: string, value: any): Promise<void> {
    if (!encryptionService.isInitialized()) {
      throw new Error('Encryption service not initialized');
    }

    try {
      // Encriptar datos
      const encrypted = await encryptionService.encrypt(value);

      // Guardar en IndexedDB
      const db = await this.initDB();
      await db.put(this.storeName, {
        key,
        data: encrypted,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error saving encrypted data:', error);
      throw new Error(`Failed to save encrypted data for key: ${key}`);
    }
  }

  /**
   * Obtiene y desencripta datos
   * 
   * @param key - Clave de los datos
   * @returns Datos desencriptados o null si no existen
   */
  async get<T = any>(key: string): Promise<T | null> {
    if (!encryptionService.isInitialized()) {
      throw new Error('Encryption service not initialized');
    }

    try {
      const db = await this.initDB();
      const record = await db.get(this.storeName, key);

      if (!record) return null;

      // Desencriptar datos
      const decrypted = await encryptionService.decrypt<T>(record.data);
      return decrypted;
    } catch (error) {
      console.error('Error getting encrypted data:', error);
      // Si falla la desencriptación, los datos pueden estar corruptos
      return null;
    }
  }

  /**
   * Elimina datos
   * 
   * @param key - Clave de los datos a eliminar
   */
  async delete(key: string): Promise<void> {
    try {
      const db = await this.initDB();
      await db.delete(this.storeName, key);
    } catch (error) {
      console.error('Error deleting encrypted data:', error);
      throw new Error(`Failed to delete data for key: ${key}`);
    }
  }

  /**
   * Obtiene todas las claves almacenadas
   */
  async keys(): Promise<string[]> {
    try {
      const db = await this.initDB();
      const allRecords = await db.getAll(this.storeName);
      return allRecords.map(record => record.key);
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }

  /**
   * Limpia todos los datos encriptados
   */
  async clear(): Promise<void> {
    try {
      const db = await this.initDB();
      await db.clear(this.storeName);
    } catch (error) {
      console.error('Error clearing encrypted storage:', error);
      throw new Error('Failed to clear encrypted storage');
    }
  }

  /**
   * Verifica si existe una clave
   */
  async has(key: string): Promise<boolean> {
    try {
      const db = await this.initDB();
      const record = await db.get(this.storeName, key);
      return record !== undefined;
    } catch (error) {
      console.error('Error checking key existence:', error);
      return false;
    }
  }
}

// Singleton para datos sensibles
export const encryptedStorage = new EncryptedStorage();
