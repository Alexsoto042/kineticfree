import type { EncryptedData, EncryptionConfig, EncryptionResult, DecryptionResult } from './types';
import { keyManager } from './keyManager';

/**
 * Encryption Service
 * 
 * Servicio principal para encriptar y desencriptar datos sensibles.
 * Usa AES-GCM 256-bit con IV aleatorio por cada encriptación.
 */
export class EncryptionService {
  private key: CryptoKey | null = null;
  private userId: string | null = null;
  
  private readonly config: EncryptionConfig = {
    algorithm: 'AES-GCM',
    keyLength: 256,
    ivLength: 12, // 96 bits recomendado para AES-GCM
    pbkdf2Iterations: 100000,
  };
  
  private readonly VERSION = 1;

  /**
   * Inicializa el servicio con la clave del usuario
   * 
   * @param userId - ID único del usuario
   */
  async initialize(userId: string): Promise<void> {
    if (this.userId === userId && this.key) {
      // Ya inicializado para este usuario
      return;
    }

    try {
      this.key = await keyManager.generateKey(userId);
      this.userId = userId;
      console.log('Encryption service initialized for user:', userId.substring(0, 8) + '...');
    } catch (error) {
      console.error('Failed to initialize encryption service:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Encripta datos
   * 
   * @param data - Datos a encriptar (cualquier tipo serializable)
   * @returns Datos encriptados con IV
   */
  async encrypt(data: any): Promise<EncryptedData> {
    if (!this.key) {
      throw new Error('Encryption service not initialized. Call initialize() first.');
    }

    try {
      // Serializar datos a JSON
      const plaintext = JSON.stringify(data);
      const plaintextBuffer = new TextEncoder().encode(plaintext);

      // Generar IV aleatorio (CRÍTICO: debe ser único por cada encriptación)
      const iv = crypto.getRandomValues(new Uint8Array(this.config.ivLength));

      // Encriptar usando AES-GCM
      const ciphertextBuffer = await crypto.subtle.encrypt(
        {
          name: this.config.algorithm,
          iv: iv,
        },
        this.key,
        plaintextBuffer
      );

      // Convertir a base64 para almacenamiento
      const ciphertext = this.arrayBufferToBase64(ciphertextBuffer);
      const ivBase64 = this.uint8ArrayToBase64(iv);

      return {
        ciphertext,
        iv: ivBase64,
        timestamp: Date.now(),
        version: this.VERSION,
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Desencripta datos
   * 
   * @param encryptedData - Datos encriptados
   * @returns Datos originales desencriptados
   */
  async decrypt<T = any>(encryptedData: EncryptedData): Promise<T> {
    if (!this.key) {
      throw new Error('Encryption service not initialized. Call initialize() first.');
    }

    try {
      // Convertir de base64
      const ciphertextBuffer = this.base64ToUint8Array(encryptedData.ciphertext);
      const iv = this.base64ToUint8Array(encryptedData.iv);

      // Desencriptar usando AES-GCM
      const plaintextBuffer = await crypto.subtle.decrypt(
        {
          name: this.config.algorithm,
          iv: iv,
        },
        this.key,
        ciphertextBuffer
      );

      // Deserializar JSON
      const plaintext = new TextDecoder().decode(plaintextBuffer);
      return JSON.parse(plaintext) as T;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data. Data may be corrupted or key is incorrect.');
    }
  }

  /**
   * Encripta datos con manejo de errores (versión segura)
   */
  async encryptSafe(data: any): Promise<EncryptionResult> {
    try {
      const encrypted = await this.encrypt(data);
      return {
        success: true,
        data: encrypted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Desencripta datos con manejo de errores (versión segura)
   */
  async decryptSafe<T = any>(encryptedData: EncryptedData): Promise<DecryptionResult<T>> {
    try {
      const decrypted = await this.decrypt<T>(encryptedData);
      return {
        success: true,
        data: decrypted,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verifica si el servicio está inicializado
   */
  isInitialized(): boolean {
    return this.key !== null && this.userId !== null;
  }

  /**
   * Obtiene el user ID actual
   */
  getUserId(): string | null {
    return this.userId;
  }

  /**
   * Destruye el servicio y limpia las claves de memoria
   */
  destroy(): void {
    this.key = null;
    this.userId = null;
    console.log('Encryption service destroyed');
  }

  // Utilidades de conversión

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return btoa(String.fromCharCode(...bytes));
  }

  private uint8ArrayToBase64(array: Uint8Array): string {
    return btoa(String.fromCharCode(...array));
  }



  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}

// Singleton
export const encryptionService = new EncryptionService();
