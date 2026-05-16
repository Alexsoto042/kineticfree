import { AlertTriangle, Clock } from 'lucide-react';
import type { RateLimitResult } from '../../lib/rateLimit/types';
import { formatRetryTime } from '../../lib/rateLimit';
import './RateLimitWarning.css';

interface RateLimitWarningProps {
  /** Estado del rate limit */
  status: RateLimitResult;
  /** Nombre de la acción (ej: "crear rutinas", "iniciar sesión") */
  action: string;
  /** Variante del mensaje */
  variant?: 'warning' | 'error';
}

/**
 * Componente para mostrar advertencias de rate limit
 * 
 * Muestra un mensaje claro cuando el usuario ha alcanzado un límite
 * e indica cuándo podrá intentar de nuevo.
 */
export function RateLimitWarning({ 
  status, 
  action,
  variant = 'warning' 
}: RateLimitWarningProps) {
  // No mostrar si está permitido
  if (status.allowed) return null;

  const retryTime = status.retryAfter 
    ? formatRetryTime(status.retryAfter)
    : 'unos momentos';

  return (
    <div className={`rate-limit-warning rate-limit-warning--${variant}`}>
      <div className="rate-limit-warning__icon">
        <AlertTriangle size={20} />
      </div>
      <div className="rate-limit-warning__content">
        <p className="rate-limit-warning__title">
          Límite alcanzado
        </p>
        <p className="rate-limit-warning__message">
          Has alcanzado el límite de {action}. 
          Podrás intentar de nuevo en <strong>{retryTime}</strong>.
        </p>
        <div className="rate-limit-warning__footer">
          <Clock size={14} />
          <span className="rate-limit-warning__reset">
            Se resetea: {status.resetAt.toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente compacto para mostrar requests restantes
 */
interface RateLimitBadgeProps {
  status: RateLimitResult;
  showWhenUnlimited?: boolean;
}

export function RateLimitBadge({ 
  status, 
  showWhenUnlimited = false 
}: RateLimitBadgeProps) {
  if (status.allowed && !showWhenUnlimited) return null;

  const percentage = (status.remaining / (status.remaining + 1)) * 100;
  const isLow = percentage < 30;
  const isVeryLow = percentage < 10;

  return (
    <div className={`rate-limit-badge ${isVeryLow ? 'rate-limit-badge--danger' : isLow ? 'rate-limit-badge--warning' : ''}`}>
      <span className="rate-limit-badge__count">
        {status.remaining}
      </span>
      <span className="rate-limit-badge__label">
        restante{status.remaining !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
