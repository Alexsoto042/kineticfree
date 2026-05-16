import type { RateLimitConfig } from './types';

/**
 * Configuración de Rate Limits por Endpoint
 * 
 * Define los límites de requests para cada operación crítica de la aplicación.
 * Los límites están diseñados para:
 * - Prevenir abuso y spam
 * - Proteger contra ataques de fuerza bruta
 * - No afectar usuarios legítimos
 */

/**
 * Límites de rate para autenticación
 */
export const AUTH_LIMITS = {
  /** Login: 5 intentos cada 15 minutos */
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },
  /** Registro: 3 intentos por hora */
  register: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  /** Reset de contraseña: 3 intentos por hora */
  resetPassword: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  /** Refresh token: 10 intentos por hora */
  refreshToken: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
} as const;

/**
 * Límites de rate para creación de contenido
 */
export const CONTENT_LIMITS = {
  /** Crear rutina: 10 por hora */
  createRoutine: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  /** Actualizar rutina: 20 por hora */
  updateRoutine: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  /** Crear objetivo: 20 por hora */
  createGoal: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  /** Crear comentario: 30 por hora */
  createComment: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  /** Crear post: 15 por hora */
  createPost: {
    maxRequests: 15,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  /** Registrar workout: 50 por día */
  logWorkout: {
    maxRequests: 50,
    windowMs: 24 * 60 * 60 * 1000, // 24 horas
  },
} as const;

/**
 * Límites de rate para búsquedas
 */
export const SEARCH_LIMITS = {
  /** Búsqueda de ejercicios: 60 por minuto */
  searchExercise: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minuto
  },
  /** Búsqueda de alimentos: 60 por minuto */
  searchFood: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minuto
  },
  /** Búsqueda de usuarios: 30 por minuto */
  searchUser: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minuto
  },
  /** Búsqueda de recetas: 40 por minuto */
  searchRecipe: {
    maxRequests: 40,
    windowMs: 60 * 1000, // 1 minuto
  },
} as const;

/**
 * Límites de rate para uploads
 */
export const UPLOAD_LIMITS = {
  /** Upload de imagen de perfil: 5 cada 15 minutos */
  uploadAvatar: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
  },
  /** Upload de imagen de post: 10 por hora */
  uploadPostImage: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
} as const;

/**
 * Límites de rate para interacciones sociales
 */
export const SOCIAL_LIMITS = {
  /** Dar like: 100 por hora */
  like: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  /** Seguir usuario: 50 por hora */
  follow: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
  /** Enviar mensaje: 30 por hora */
  sendMessage: {
    maxRequests: 30,
    windowMs: 60 * 60 * 1000, // 1 hora
  },
} as const;

/**
 * Configuración consolidada de todos los rate limits
 */
export const RATE_LIMITS = {
  // Autenticación
  'auth:login': AUTH_LIMITS.login,
  'auth:register': AUTH_LIMITS.register,
  'auth:reset-password': AUTH_LIMITS.resetPassword,
  'auth:refresh-token': AUTH_LIMITS.refreshToken,
  
  // Creación de contenido
  'routine:create': CONTENT_LIMITS.createRoutine,
  'routine:update': CONTENT_LIMITS.updateRoutine,
  'goal:create': CONTENT_LIMITS.createGoal,
  'comment:create': CONTENT_LIMITS.createComment,
  'post:create': CONTENT_LIMITS.createPost,
  'workout:log': CONTENT_LIMITS.logWorkout,
  
  // Búsquedas
  'search:exercise': SEARCH_LIMITS.searchExercise,
  'search:food': SEARCH_LIMITS.searchFood,
  'search:user': SEARCH_LIMITS.searchUser,
  'search:recipe': SEARCH_LIMITS.searchRecipe,
  
  // Uploads
  'upload:avatar': UPLOAD_LIMITS.uploadAvatar,
  'upload:post-image': UPLOAD_LIMITS.uploadPostImage,
  
  // Social
  'social:like': SOCIAL_LIMITS.like,
  'social:follow': SOCIAL_LIMITS.follow,
  'social:message': SOCIAL_LIMITS.sendMessage,
} as const;

/**
 * Tipo para las keys de rate limit
 */
export type RateLimitKey = keyof typeof RATE_LIMITS;

/**
 * Obtiene la configuración de rate limit para una key
 */
export function getRateLimitConfig(key: RateLimitKey): RateLimitConfig {
  return RATE_LIMITS[key];
}

/**
 * Verifica si una key de rate limit existe
 */
export function isValidRateLimitKey(key: string): key is RateLimitKey {
  return key in RATE_LIMITS;
}
