import { Preferences } from '@capacitor/preferences';
import type { KeyDerivationOptions } from './types';

/**
 * Key Manager
 * 
 * Gestiona la generación, almacenamiento y derivación de claves de encriptación.
 * Usa PBKDF2 para derivar claves desde el user ID.
 */
export class KeyManager {
  private static readonly SALT_KEY = 'encryption_salt_v1';
  private static readonly KEY_ID_KEY = 'encryption_key_id_v1';
  private static readonly ITERATIONS = 100000; // OWASP recomienda 100k+
  
  private cachedKey: CryptoKey | null = null;
  private cachedUserId: string | null = null;

  /**
   * Genera una clave de encriptación desde el user ID
   * 
   * @param userId - ID único del usuario
   * @returns Clave de encriptación AES-GCM
   */
  async generateKey(userId: string): Promise<CryptoKey> {
    // Usar cache si es el mismo usuario
    if (this.cachedKey && this.cachedUserId === userId) {
      return this.cachedKey;
    }

    // Obtener o generar salt
    let salt = await this.getSalt();
    if (!salt) {
      salt = crypto.getRandomValues(new Uint8Array(16));
      await this.saveSalt(salt);
    }

    // Derivar clave usando PBKDF2
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(userId),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: KeyManager.ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true, // extractable (para debugging, cambiar a false en producción)
      ['encrypt', 'decrypt']
    );

    // Guardar key ID
    const keyId = await this.generateKeyId(userId, salt);
    await this.saveKeyId(keyId);

    // Cachear
    this.cachedKey = key;
    this.cachedUserId = userId;

    return key;
  }

  /**
   * Obtiene el salt almacenado
   */
  private async getSalt(): Promise<Uint8Array | null> {
    try {
      const { value } = await Preferences.get({ key: KeyManager.SALT_KEY });
      if (!value) return null;

      const buffer = Uint8Array.from(atob(value), c => c.charCodeAt(0));
      return buffer;
    } catch (error) {
      console.error('Error getting salt:', error);
      return null;
    }
  }

  /**
   * Guarda el salt de forma segura
   */
  private async saveSalt(salt: Uint8Array): Promise<void> {
    try {
      const base64 = btoa(String.fromCharCode(...salt));
      await Preferences.set({
        key: KeyManager.SALT_KEY,
        value: base64,
      });
    } catch (error) {
      console.error('Error saving salt:', error);
      throw new Error('Failed to save encryption salt');
    }
  }

  /**
   * Genera un ID único para la clave
   */
  private async generateKeyId(userId: string, salt: Uint8Array): Promise<string> {
    const data = new TextEncoder().encode(userId + btoa(String.fromCharCode(...salt)));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 16); // Primeros 16 caracteres
  }

  /**
   * Guarda el key ID
   */
  private async saveKeyId(keyId: string): Promise<void> {
    await Preferences.set({
      key: KeyManager.KEY_ID_KEY,
      value: keyId,
    });
  }

  /**
   * Obtiene el key ID actual
   */
  async getKeyId(): Promise<string | null> {
    const { value } = await Preferences.get({ key: KeyManager.KEY_ID_KEY });
    return value;
  }

  /**
   * Limpia las claves almacenadas (logout)
   */
  async clearKeys(): Promise<void> {
    await Preferences.remove({ key: KeyManager.SALT_KEY });
    await Preferences.remove({ key: KeyManager.KEY_ID_KEY });
    this.cachedKey = null;
    this.cachedUserId = null;
  }

  /**
   * Verifica si hay claves almacenadas
   */
  async hasKeys(): Promise<boolean> {
    const salt = await this.getSalt();
    const keyId = await this.getKeyId();
    return salt !== null && keyId !== null;
  }
}

// Singleton
export const keyManager = new KeyManager();
