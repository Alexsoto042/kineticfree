/**
 * Rate Limiting Types
 * 
 * Tipos TypeScript para el sistema de rate limiting
 */

/**
 * Configuración de rate limit para un endpoint
 */
export interface RateLimitConfig {
  /** Número máximo de requests permitidos en la ventana */
  maxRequests: number;
  /** Duración de la ventana en milisegundos */
  windowMs: number;
  /** Prefijo opcional para la key de almacenamiento */
  keyPrefix?: string;
}

/**
 * Resultado de verificación de rate limit
 */
export interface RateLimitResult {
  /** Si el request está permitido */
  allowed: boolean;
  /** Número de requests restantes en la ventana actual */
  remaining: number;
  /** Timestamp cuando se resetea el límite */
  resetAt: Date;
  /** Segundos hasta que se pueda reintentar (solo si allowed=false) */
  retryAfter?: number;
}

/**
 * Entrada de rate limit en storage
 */
export interface RateLimitEntry {
  /** Número de requests realizados */
  count: number;
  /** Timestamp cuando expira la ventana (ms) */
  resetAt: number;
  /** Timestamp del primer request en la ventana (ms) */
  firstRequest: number;
}

/**
 * Interfaz para el storage adapter
 */
export interface IRateLimitStorage {
  get(key: string): Promise<RateLimitEntry | null>;
  set(key: string, entry: RateLimitEntry): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  cleanup(): Promise<void>;
}

/**
 * Opciones para el RateLimiter
 */
export interface RateLimiterOptions extends RateLimitConfig {
  /** Storage adapter personalizado (opcional) */
  storage?: IRateLimitStorage;
}
