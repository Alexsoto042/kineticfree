interface CacheEntry<T> {
  promise: Promise<T>;
  timestamp: number;
}

/**
 * Request cache for deduplicating concurrent requests
 */
class RequestCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5000; // 5 seconds

  /**
   * Deduplicate requests with the same key
   * If a request is already in progress, return the existing promise
   */
  async dedupe<T>(
    key: string,
    fn: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached promise if still valid
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      cacheLogger.debug(`[RequestCache] Using cached request: ${key}`);
      return cached.promise;
    }

    // Create new promise
    cacheLogger.debug(`[RequestCache] Creating new request: ${key}`);
    const promise = fn();
    this.cache.set(key, { promise, timestamp: now });

    try {
      const result = await promise;
      return result;
    } catch (error) {
      // Remove from cache on error
      this.cache.delete(key);
      throw error;
    } finally {
      // Clean up after TTL
      setTimeout(() => {
        const entry = this.cache.get(key);
        if (entry && now === entry.timestamp) {
          this.cache.delete(key);
        }
      }, ttl);
    }
  }

  /**
   * Clear all cached requests
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear a specific cached request
   */
  invalidate(key: string) {
    this.cache.delete(key);
  }

  /**
   * Check if a request is cached
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    return now - cached.timestamp < this.DEFAULT_TTL;
  }
}

export const requestCache = new RequestCache();

import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { logger } from './logger';

const cacheLogger = logger.createContext('RequestCache');
