import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EncryptionService } from './EncryptionService';
import { webcrypto } from 'node:crypto';

// Polyfill Web Crypto API para JSDOM usando Vitest stub
vi.stubGlobal('crypto', webcrypto);
vi.stubGlobal('CryptoKey', webcrypto.CryptoKey);

// Mock de Capacitor Preferences
vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn().mockResolvedValue({ value: null }),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('EncryptionService', () => {
  let encryptionService: EncryptionService;
  const testUserId = 'test-user-123';

  beforeEach(async () => {
    encryptionService = new EncryptionService();
    await encryptionService.initialize(testUserId);
  });

  it('should encrypt and decrypt data correctly', async () => {
    const originalData = {
      name: 'Test User',
      weight: 75,
      height: 180,
    };

    const encrypted = await encryptionService.encrypt(originalData);
    expect(encrypted.ciphertext).toBeDefined();
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.version).toBe(1);

    const decrypted = await encryptionService.decrypt(encrypted);
    expect(decrypted).toEqual(originalData);
  });

  it('should encrypt different data differently', async () => {
    const data1 = { value: 'test1' };
    const data2 = { value: 'test2' };

    const encrypted1 = await encryptionService.encrypt(data1);
    const encrypted2 = await encryptionService.encrypt(data2);

    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    expect(encrypted1.iv).not.toBe(encrypted2.iv);
  });

  it('should use different IV for same data', async () => {
    const data = { value: 'test' };

    const encrypted1 = await encryptionService.encrypt(data);
    const encrypted2 = await encryptionService.encrypt(data);

    // Mismo dato pero diferentes IVs
    expect(encrypted1.iv).not.toBe(encrypted2.iv);
    expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
  });

  it('should handle complex objects', async () => {
    const complexData = {
      user: {
        name: 'Test',
        metrics: {
          weight: 75,
          height: 180,
          measurements: [90, 70, 95],
        },
      },
      timestamp: Date.now(),
    };

    const encrypted = await encryptionService.encrypt(complexData);
    const decrypted = await encryptionService.decrypt(encrypted);

    expect(decrypted).toEqual(complexData);
  });

  it('should report initialization status', () => {
    expect(encryptionService.isInitialized()).toBe(true);
    expect(encryptionService.getUserId()).toBe(testUserId);
  });

  it('should destroy service correctly', () => {
    encryptionService.destroy();
    expect(encryptionService.isInitialized()).toBe(false);
    expect(encryptionService.getUserId()).toBe(null);
  });
});
