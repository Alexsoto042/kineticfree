import { checkRateLimit, formatRetryTime } from './index';
import type { RateLimitKey } from './config';
import { Toast } from '@capacitor/toast';

/**
 * Helper para ejecutar búsquedas con rate limiting
 * 
 * Verifica el rate limit antes de ejecutar una búsqueda y muestra
 * un mensaje al usuario si se excede el límite.
 * 
 * @param key - Key del rate limit (ej: 'search:exercise')
 * @param searchFn - Función de búsqueda a ejecutar
 * @param userId - ID del usuario (opcional)
 * @returns Resultado de la búsqueda o null si se excede el límite
 * 
 * @example
 * ```typescript
 * const results = await withRateLimit(
 *   'search:exercise',
 *   () => searchExercises(term),
 *   userId
 * );
 * ```
 */
export async function withRateLimit<T>(
  key: RateLimitKey,
  searchFn: () => Promise<T>,
  userId?: string
): Promise<T | null> {
  const rateLimitResult = await checkRateLimit(key, userId);
  
  if (!rateLimitResult.allowed) {
    const retryTime = formatRetryTime(rateLimitResult.retryAfter!);
    await Toast.show({
      text: `Demasiadas búsquedas. Intenta de nuevo en ${retryTime}.`,
      duration: 'short',
    });
    return null;
  }
  
  return searchFn();
}

/**
 * Helper para ejecutar búsquedas con rate limiting (versión silenciosa)
 * 
 * Similar a withRateLimit pero no muestra toast, solo retorna null
 * si se excede el límite. Útil para búsquedas automáticas o en segundo plano.
 * 
 * @param key - Key del rate limit
 * @param searchFn - Función de búsqueda a ejecutar
 * @param userId - ID del usuario (opcional)
 * @returns Resultado de la búsqueda o null si se excede el límite
 */
export async function withRateLimitSilent<T>(
  key: RateLimitKey,
  searchFn: () => Promise<T>,
  userId?: string
): Promise<T | null> {
  const rateLimitResult = await checkRateLimit(key, userId);
  
  if (!rateLimitResult.allowed) {
    console.warn(`Rate limit exceeded for ${key}. Retry in ${rateLimitResult.retryAfter}s`);
    return null;
  }
  
  return searchFn();
}

/**
 * Debounce helper con rate limiting integrado
 * 
 * Combina debounce con rate limiting para búsquedas en tiempo real.
 * 
 * @param fn - Función a ejecutar
 * @param delay - Delay del debounce en ms
 * @param rateLimitKey - Key del rate limit
 * @returns Función debounced con rate limiting
 */
export function debounceWithRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number,
  rateLimitKey: RateLimitKey
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(async () => {
      await withRateLimitSilent(rateLimitKey, () => fn(...args));
    }, delay);
  };
}
