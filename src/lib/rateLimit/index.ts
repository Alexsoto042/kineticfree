/**
 * Rate Limiting Library
 * 
 * Sistema de rate limiting para prevenir abuso de API y spam.
 * Implementa límites en el cliente con persistencia cross-platform.
 */

export * from './types';
export * from './RateLimiter';
export * from './storage';
export * from './config';
export * from './helpers';

import { RateLimiter } from './RateLimiter';
import { RATE_LIMITS, type RateLimitKey } from './config';

/**
 * Instancias singleton de rate limiters para cada endpoint
 */
const rateLimiters = new Map<RateLimitKey, RateLimiter>();

/**
 * Obtiene o crea un rate limiter para un endpoint específico
 * 
 * @param key - Key del endpoint
 * @returns Instancia de RateLimiter configurada
 */
export function getRateLimiter(key: RateLimitKey): RateLimiter {
  let limiter = rateLimiters.get(key);
  
  if (!limiter) {
    const config = RATE_LIMITS[key];
    limiter = new RateLimiter({
      ...config,
      keyPrefix: `${key}:`,
    });
    rateLimiters.set(key, limiter);
  }
  
  return limiter;
}

/**
 * Verifica si un request está permitido para un endpoint
 * 
 * @param key - Key del endpoint
 * @param userId - ID del usuario (opcional, se añade a la key)
 * @returns Resultado del rate limit
 */
export async function checkRateLimit(
  key: RateLimitKey, 
  userId?: string
) {
  const limiter = getRateLimiter(key);
  const fullKey = userId ? `user:${userId}` : 'anonymous';
  return limiter.check(fullKey);
}

/**
 * Obtiene el estado actual del rate limit sin incrementar
 * 
 * @param key - Key del endpoint
 * @param userId - ID del usuario (opcional)
 * @returns Estado actual
 */
export async function getRateLimitStatus(
  key: RateLimitKey,
  userId?: string
) {
  const limiter = getRateLimiter(key);
  const fullKey = userId ? `user:${userId}` : 'anonymous';
  return limiter.getStatus(fullKey);
}

/**
 * Resetea el rate limit para un usuario en un endpoint
 * 
 * @param key - Key del endpoint
 * @param userId - ID del usuario (opcional)
 */
export async function resetRateLimit(
  key: RateLimitKey,
  userId?: string
) {
  const limiter = getRateLimiter(key);
  const fullKey = userId ? `user:${userId}` : 'anonymous';
  return limiter.reset(fullKey);
}

/**
 * Limpia todas las entradas expiradas de todos los rate limiters
 */
export async function cleanupRateLimits() {
  const promises = Array.from(rateLimiters.values()).map(
    limiter => limiter.cleanup()
  );
  await Promise.all(promises);
}
