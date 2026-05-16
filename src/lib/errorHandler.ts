/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public severity: 'low' | 'medium' | 'high' | 'critical'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Centralized error handler
 */
export const handleError = (
  error: unknown,
  context: string
): AppError => {
  console.error(`[${context}]`, error);
  
  if (error instanceof AppError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new AppError(
      error.message,
      'UNKNOWN_ERROR',
      'medium'
    );
  }
  
  return new AppError(
    'An unknown error occurred',
    'UNKNOWN_ERROR',
    'low'
  );
};

/**
 * Standardized error messages
 */
export const ErrorMessages = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet.',
  AUTH_ERROR: 'Error de autenticación. Inicia sesión nuevamente.',
  NOT_FOUND: 'Recurso no encontrado.',
  PERMISSION_DENIED: 'No tienes permisos para esta acción.',
  VALIDATION_ERROR: 'Los datos proporcionados no son válidos.',
  SERVER_ERROR: 'Error del servidor. Intenta de nuevo más tarde.',
  TIMEOUT_ERROR: 'La solicitud tardó demasiado. Intenta de nuevo.',
  UNKNOWN: 'Ocurrió un error inesperado.',
} as const;

/**
 * Error codes
 */
export const ErrorCodes = {
  NETWORK_ERROR: 'ERR_NETWORK',
  AUTH_ERROR: 'ERR_AUTH',
  NOT_FOUND: 'ERR_NOT_FOUND',
  PERMISSION_DENIED: 'ERR_PERMISSION',
  VALIDATION_ERROR: 'ERR_VALIDATION',
  SERVER_ERROR: 'ERR_SERVER',
  TIMEOUT_ERROR: 'ERR_TIMEOUT',
  UNKNOWN_ERROR: 'ERR_UNKNOWN',
} as const;

/**
 * Create a standardized error
 */
export const createError = (
  code: keyof typeof ErrorCodes,
  customMessage?: string,
  severity: AppError['severity'] = 'medium'
): AppError => {
  const messageKey = code as keyof typeof ErrorMessages;
  const message = customMessage || ErrorMessages[messageKey] || ErrorMessages.UNKNOWN;
  return new AppError(message, ErrorCodes[code], severity);
};

/**
 * Check if error is a specific type
 */
export const isErrorType = (error: unknown, code: string): boolean => {
  return error instanceof AppError && error.code === code;
};
