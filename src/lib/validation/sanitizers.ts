/**
 * Utilidades de sanitización para prevenir XSS y otros ataques
 */

/**
 * Sanitiza un string eliminando caracteres peligrosos HTML/JS
 */
export function sanitizeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Sanitiza un string para uso en URLs
 */
export function sanitizeUrl(input: string): string {
  try {
    const url = new URL(input);
    // Solo permitir protocolos seguros
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '';
    }
    return url.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitiza un nombre de usuario
 */
export function sanitizeUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');
}

/**
 * Sanitiza texto libre eliminando espacios extras y caracteres de control
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ') // Múltiples espacios a uno solo
    .replace(/[\x00-\x1F\x7F]/g, ''); // Eliminar caracteres de control
}

/**
 * Sanitiza un número asegurando que sea finito y válido
 */
export function sanitizeNumber(input: number): number | null {
  if (!Number.isFinite(input) || Number.isNaN(input)) {
    return null;
  }
  return input;
}

/**
 * Sanitiza un array eliminando elementos vacíos o inválidos
 */
export function sanitizeArray<T>(
  input: T[],
  validator?: (item: T) => boolean
): T[] {
  const filtered = input.filter((item) => {
    if (item === null || item === undefined) return false;
    if (typeof item === 'string' && item.trim() === '') return false;
    if (validator) return validator(item);
    return true;
  });

  return filtered;
}

/**
 * Sanitiza un objeto eliminando propiedades con valores inválidos
 */
export function sanitizeObject<T extends Record<string, any>>(
  input: T
): Partial<T> {
  const sanitized: Partial<T> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') {
        sanitized[key as keyof T] = trimmed as T[keyof T];
      }
    } else if (typeof value === 'number') {
      const sanitizedNum = sanitizeNumber(value);
      if (sanitizedNum !== null) {
        sanitized[key as keyof T] = sanitizedNum as T[keyof T];
      }
    } else if (Array.isArray(value)) {
      const sanitizedArr = sanitizeArray(value);
      if (sanitizedArr.length > 0) {
        sanitized[key as keyof T] = sanitizedArr as T[keyof T];
      }
    } else {
      sanitized[key as keyof T] = value;
    }
  }

  return sanitized;
}

/**
 * Limita la longitud de un string
 */
export function truncateString(input: string, maxLength: number): string {
  if (input.length <= maxLength) return input;
  return input.slice(0, maxLength);
}

/**
 * Sanitiza input de búsqueda eliminando caracteres especiales peligrosos
 */
export function sanitizeSearchQuery(input: string): string {
  return input
    .trim()
    .replace(/[<>{}[\]\\]/g, '') // Eliminar caracteres peligrosos
    .slice(0, 100); // Limitar longitud
}

/**
 * Sanitiza un email
 */
export function sanitizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/**
 * Previene SQL injection básico (aunque Supabase ya lo maneja)
 */
export function sanitizeSql(input: string): string {
  return input
    .replace(/['";]/g, '') // Eliminar comillas y punto y coma
    .replace(/--/g, '') // Eliminar comentarios SQL
    .replace(/\/\*/g, '') // Eliminar comentarios de bloque
    .trim();
}

/**
 * Sanitiza nombres de archivos
 */
export function sanitizeFilename(input: string): string {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Reemplazar caracteres especiales
    .replace(/\.{2,}/g, '.') // Prevenir path traversal
    .slice(0, 255); // Limitar longitud
}

/**
 * Valida y sanitiza un JSON string
 */
export function sanitizeJson(input: string): string | null {
  try {
    const parsed = JSON.parse(input);
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
}
