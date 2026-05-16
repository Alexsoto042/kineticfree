/**
 * Encryption Types
 * 
 * Tipos TypeScript para el sistema de encriptación de datos sensibles
 */

/**
 * Datos encriptados
 */
export interface EncryptedData {
  /** Datos encriptados en base64 */
  ciphertext: string;
  /** Vector de inicialización en base64 */
  iv: string;
  /** Timestamp de encriptación */
  timestamp: number;
  /** Versión del algoritmo (para futuras migraciones) */
  version: number;
}

/**
 * Clave de encriptación
 */
export interface EncryptionKey {
  /** Clave de encriptación (CryptoKey) */
  key: CryptoKey;
  /** ID único de la clave */
  keyId: string;
  /** Timestamp de creación */
  createdAt: number;
}

/**
 * Opciones para derivación de claves
 */
export interface KeyDerivationOptions {
  /** Salt para PBKDF2 */
  salt: Uint8Array;
  /** Número de iteraciones PBKDF2 */
  iterations: number;
  /** Algoritmo hash */
  hash: 'SHA-256' | 'SHA-512';
}

/**
 * Configuración del servicio de encriptación
 */
export interface EncryptionConfig {
  /** Algoritmo de encriptación */
  algorithm: 'AES-GCM';
  /** Longitud de la clave en bits */
  keyLength: 128 | 192 | 256;
  /** Longitud del IV en bytes */
  ivLength: 12 | 16;
  /** Iteraciones PBKDF2 */
  pbkdf2Iterations: number;
}

/**
 * Resultado de operación de encriptación
 */
export interface EncryptionResult {
  /** Si la operación fue exitosa */
  success: boolean;
  /** Datos encriptados (si success = true) */
  data?: EncryptedData;
  /** Error (si success = false) */
  error?: string;
}

/**
 * Resultado de operación de desencriptación
 */
export interface DecryptionResult<T = any> {
  /** Si la operación fue exitosa */
  success: boolean;
  /** Datos desencriptados (si success = true) */
  data?: T;
  /** Error (si success = false) */
  error?: string;
}
