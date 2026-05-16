import type { 
  RateLimiterOptions, 
  RateLimitResult, 
  RateLimitEntry,
  IRateLimitStorage 
} from './types';
import { rateLimitStorage } from './storage';

/**
 * Rate Limiter usando Sliding Window Counter Algorithm
 * 
 * Implementa rate limiting en el cliente para prevenir abuso de API
 * y proporcionar feedback inmediato al usuario.
 */
export class RateLimiter {
  private config: Required<RateLimiterOptions>;
  private storage: IRateLimitStorage;

  constructor(options: RateLimiterOptions) {
    this.config = {
      maxRequests: options.maxRequests,
      windowMs: options.windowMs,
      keyPrefix: options.keyPrefix || '',
      storage: options.storage || rateLimitStorage,
    };
    this.storage = this.config.storage;
  }

  /**
   * Verifica si un request está permitido
   * 
   * @param key - Identificador único para el rate limit (ej: 'user:123:login')
   * @returns Resultado con información del rate limit
   */
  async check(key: string): Promise<RateLimitResult> {
    const fullKey = this.config.keyPrefix + key;
    const now = Date.now();

    // Obtener entrada existente
    const entry = await this.storage.get(fullKey);

    // Si no existe o expiró, crear nueva ventana
    if (!entry || now >= entry.resetAt) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetAt: now + this.config.windowMs,
        firstRequest: now,
      };

      await this.storage.set(fullKey, newEntry);

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetAt: new Date(newEntry.resetAt),
      };
    }

    // Ventana activa - verificar límite
    if (entry.count >= this.config.maxRequests) {
      const retryAfterMs = entry.resetAt - now;
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(entry.resetAt),
        retryAfter: Math.ceil(retryAfterMs / 1000), // Convertir a segundos
      };
    }

    // Incrementar contador
    const updatedEntry: RateLimitEntry = {
      ...entry,
      count: entry.count + 1,
    };

    await this.storage.set(fullKey, updatedEntry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - updatedEntry.count,
      resetAt: new Date(entry.resetAt),
    };
  }

  /**
   * Obtiene el estado actual sin incrementar el contador
   * 
   * @param key - Identificador único
   * @returns Estado actual del rate limit
   */
  async getStatus(key: string): Promise<RateLimitResult> {
    const fullKey = this.config.keyPrefix + key;
    const now = Date.now();

    const entry = await this.storage.get(fullKey);

    if (!entry || now >= entry.resetAt) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetAt: new Date(now + this.config.windowMs),
      };
    }

    const retryAfterMs = entry.resetAt - now;

    return {
      allowed: entry.count < this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetAt: new Date(entry.resetAt),
      retryAfter: entry.count >= this.config.maxRequests 
        ? Math.ceil(retryAfterMs / 1000) 
        : undefined,
    };
  }

  /**
   * Resetea el rate limit para una key específica
   * 
   * @param key - Identificador único
   */
  async reset(key: string): Promise<void> {
    const fullKey = this.config.keyPrefix + key;
    await this.storage.delete(fullKey);
  }

  /**
   * Limpia todas las entradas expiradas
   */
  async cleanup(): Promise<void> {
    await this.storage.cleanup();
  }
}

/**
 * Formatea el tiempo de retry en un formato legible
 * 
 * @param seconds - Segundos hasta que se pueda reintentar
 * @returns String formateado (ej: "2 minutos", "30 segundos")
 */
export function formatRetryTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
}

/**
 * Formatea el tiempo restante hasta el reset
 * 
 * @param resetAt - Fecha de reset
 * @returns String formateado
 */
export function formatResetTime(resetAt: Date): string {
  const now = new Date();
  const diffMs = resetAt.getTime() - now.getTime();
  const diffSeconds = Math.ceil(diffMs / 1000);
  
  return formatRetryTime(diffSeconds);
}
