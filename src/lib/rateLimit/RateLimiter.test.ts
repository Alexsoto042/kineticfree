import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from './RateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 1000, // 1 segundo para tests rápidos
    });
  });

  it('should allow requests within limit', async () => {
    const result1 = await rateLimiter.check('test-key');
    const result2 = await rateLimiter.check('test-key');
    const result3 = await rateLimiter.check('test-key');

    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);
    
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);
    
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('should block requests after limit', async () => {
    // Usar el límite
    await rateLimiter.check('test-key');
    await rateLimiter.check('test-key');
    await rateLimiter.check('test-key');

    // Este debería ser bloqueado
    const result = await rateLimiter.check('test-key');

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it('should reset after window expires', async () => {
    // Usar el límite
    await rateLimiter.check('test-key');
    await rateLimiter.check('test-key');
    await rateLimiter.check('test-key');

    // Esperar que expire la ventana
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Debería permitir de nuevo
    const result = await rateLimiter.check('test-key');
    expect(result.allowed).toBe(true);
  });

  it('should handle multiple keys independently', async () => {
    await rateLimiter.check('key1');
    await rateLimiter.check('key1');
    await rateLimiter.check('key1');

    // key1 está en el límite, pero key2 debería funcionar
    const result = await rateLimiter.check('key2');
    expect(result.allowed).toBe(true);
  });

  it('should get status without incrementing', async () => {
    await rateLimiter.check('test-key');
    
    const status = await rateLimiter.getStatus('test-key');
    expect(status.remaining).toBe(1); // Después de 1 check, quedan 2 de 3

    // Verificar que no incrementó
    const status2 = await rateLimiter.getStatus('test-key');
    expect(status2.remaining).toBe(1);
  });

  it('should reset a specific key', async () => {
    await rateLimiter.check('test-key');
    await rateLimiter.check('test-key');

    await rateLimiter.reset('test-key');

    const result = await rateLimiter.check('test-key');
    expect(result.remaining).toBe(2); // Reseteo exitoso
  });
});
