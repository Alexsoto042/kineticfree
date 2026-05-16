import { useState, useEffect, useCallback } from 'react';
import { checkRateLimit, getRateLimitStatus, type RateLimitKey } from '../lib/rateLimit';
import type { RateLimitResult } from '../lib/rateLimit/types';
import { useAuth } from './useAuth';

/**
 * Hook de React para manejar rate limiting
 * 
 * Proporciona una interfaz fácil para verificar límites y mostrar
 * feedback al usuario.
 * 
 * @param key - Key del endpoint a limitar
 * @returns Objeto con estado y funciones de rate limit
 * 
 * @example
 * ```tsx
 * function CreateRoutineForm() {
 *   const { status, checkLimit, isLimited } = useRateLimit('routine:create');
 *   
 *   const handleSubmit = async () => {
 *     const result = await checkLimit();
 *     if (!result.allowed) {
 *       alert(`Límite alcanzado. Intenta en ${formatRetryTime(result.retryAfter!)}`);
 *       return;
 *     }
 *     // Proceder con la creación...
 *   };
 * }
 * ```
 */
export function useRateLimit(key: RateLimitKey) {
  const { session } = useAuth();
  const [status, setStatus] = useState<RateLimitResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userId = session?.user?.id;

  /**
   * Verifica el rate limit e incrementa el contador
   */
  const checkLimit = useCallback(async (): Promise<RateLimitResult> => {
    setIsLoading(true);
    try {
      const result = await checkRateLimit(key, userId);
      setStatus(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [key, userId]);

  /**
   * Obtiene el estado actual sin incrementar
   */
  const getStatus = useCallback(async (): Promise<RateLimitResult> => {
    setIsLoading(true);
    try {
      const result = await getRateLimitStatus(key, userId);
      setStatus(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [key, userId]);

  /**
   * Carga el estado inicial al montar
   */
  useEffect(() => {
    getStatus();
  }, [getStatus]);

  return {
    /** Estado actual del rate limit */
    status,
    /** Si está cargando */
    isLoading,
    /** Si el usuario está limitado actualmente */
    isLimited: status ? !status.allowed : false,
    /** Requests restantes */
    remaining: status?.remaining ?? 0,
    /** Fecha de reset */
    resetAt: status?.resetAt,
    /** Segundos hasta poder reintentar */
    retryAfter: status?.retryAfter,
    /** Verifica el límite (incrementa contador) */
    checkLimit,
    /** Obtiene estado sin incrementar */
    getStatus,
  };
}

/**
 * Hook simplificado para verificar límite antes de una acción
 * 
 * @param key - Key del endpoint
 * @returns Función para verificar antes de ejecutar una acción
 * 
 * @example
 * ```tsx
 * function CreateGoalButton() {
 *   const checkBeforeCreate = useRateLimitGuard('goal:create');
 *   
 *   const handleClick = async () => {
 *     const canProceed = await checkBeforeCreate(
 *       () => alert('Límite alcanzado!')
 *     );
 *     
 *     if (canProceed) {
 *       // Crear objetivo...
 *     }
 *   };
 * }
 * ```
 */
export function useRateLimitGuard(key: RateLimitKey) {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useCallback(
    async (onLimited?: (result: RateLimitResult) => void): Promise<boolean> => {
      const result = await checkRateLimit(key, userId);
      
      if (!result.allowed && onLimited) {
        onLimited(result);
      }
      
      return result.allowed;
    },
    [key, userId]
  );
}
