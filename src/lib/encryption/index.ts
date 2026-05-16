/**
 * Encryption Library
 * 
 * Sistema de encriptación para proteger datos sensibles en almacenamiento local.
 * Usa AES-GCM 256-bit con claves derivadas mediante PBKDF2.
 */

export * from './types';
export * from './EncryptionService';
export * from './keyManager';
export * from './encryptedStorage';

import { encryptionService } from './EncryptionService';
import { keyManager } from './keyManager';

/**
 * Inicializa el sistema de encriptación para un usuario
 * 
 * @param userId - ID único del usuario
 */
export async function initializeEncryption(userId: string): Promise<void> {
  await encryptionService.initialize(userId);
}

/**
 * Verifica si el sistema de encriptación está inicializado
 */
export function isEncryptionReady(): boolean {
  return encryptionService.isInitialized();
}

/**
 * Limpia todas las claves y datos de encriptación (logout)
 */
export async function cleanupEncryption(): Promise<void> {
  encryptionService.destroy();
  await keyManager.clearKeys();
}

/**
 * Verifica si hay claves almacenadas
 */
export async function hasEncryptionKeys(): Promise<boolean> {
  return keyManager.hasKeys();
}
