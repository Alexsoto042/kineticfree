import { Preferences } from '@capacitor/preferences';
import type { IRateLimitStorage, RateLimitEntry } from './types';

/**
 * Storage Adapter para Rate Limiting
 * 
 * Usa una estrategia dual:
 * - Memoria (Map): Para lookups rápidos
 * - Capacitor Preferences: Para persistencia cross-platform
 */
export class RateLimitStorage implements IRateLimitStorage {
  private memoryCache: Map<string, RateLimitEntry> = new Map();
  private readonly STORAGE_PREFIX = 'rate_limit:';

  /**
   * Obtiene una entrada del storage
   */
  async get(key: string): Promise<RateLimitEntry | null> {
    // Primero intentar desde memoria
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry) {
      // Verificar si no ha expirado
      if (Date.now() < memoryEntry.resetAt) {
        return memoryEntry;
      } else {
        // Expirado, eliminar
        this.memoryCache.delete(key);
      }
    }

    // Si no está en memoria, intentar desde Preferences
    try {
      const { value } = await Preferences.get({ 
        key: this.STORAGE_PREFIX + key 
      });
      
      if (value) {
        const entry: RateLimitEntry = JSON.parse(value);
        
        // Verificar si no ha expirado
        if (Date.now() < entry.resetAt) {
          // Guardar en memoria para próximos accesos
          this.memoryCache.set(key, entry);
          return entry;
        } else {
          // Expirado, eliminar
          await this.delete(key);
        }
      }
    } catch (error) {
      console.error('Error reading from Preferences:', error);
    }

    return null;
  }

  /**
   * Guarda una entrada en el storage
   */
  async set(key: string, entry: RateLimitEntry): Promise<void> {
    // Guardar en memoria
    this.memoryCache.set(key, entry);

    // Guardar en Preferences para persistencia
    try {
      await Preferences.set({
        key: this.STORAGE_PREFIX + key,
        value: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Error writing to Preferences:', error);
    }
  }

  /**
   * Elimina una entrada del storage
   */
  async delete(key: string): Promise<void> {
    // Eliminar de memoria
    this.memoryCache.delete(key);

    // Eliminar de Preferences
    try {
      await Preferences.remove({ 
        key: this.STORAGE_PREFIX + key 
      });
    } catch (error) {
      console.error('Error removing from Preferences:', error);
    }
  }

  /**
   * Limpia todo el storage
   */
  async clear(): Promise<void> {
    // Limpiar memoria
    this.memoryCache.clear();

    // Limpiar Preferences (solo las keys de rate limit)
    try {
      const { keys } = await Preferences.keys();
      const rateLimitKeys = keys.filter(k => k.startsWith(this.STORAGE_PREFIX));
      
      await Promise.all(
        rateLimitKeys.map(key => Preferences.remove({ key }))
      );
    } catch (error) {
      console.error('Error clearing Preferences:', error);
    }
  }

  /**
   * Limpia entradas expiradas
   */
  async cleanup(): Promise<void> {
    const now = Date.now();

    // Limpiar memoria
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now >= entry.resetAt) {
        this.memoryCache.delete(key);
      }
    }

    // Limpiar Preferences
    try {
      const { keys } = await Preferences.keys();
      const rateLimitKeys = keys.filter(k => k.startsWith(this.STORAGE_PREFIX));
      
      for (const storageKey of rateLimitKeys) {
        const { value } = await Preferences.get({ key: storageKey });
        if (value) {
          const entry: RateLimitEntry = JSON.parse(value);
          if (now >= entry.resetAt) {
            await Preferences.remove({ key: storageKey });
          }
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Singleton instance
export const rateLimitStorage = new RateLimitStorage();
