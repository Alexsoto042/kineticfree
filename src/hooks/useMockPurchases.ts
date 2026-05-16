import { useState, useEffect } from 'react';
import {
  mockPurchase,
  mockCancelSubscription,
  mockRestorePurchases,
  getMockOfferings,
  getMockSubscription,
  isMockPremium,
  getMockUserTier,
} from '../lib/mockPurchases';

/**
 * Hook para manejar compras simuladas
 * Simula el comportamiento de RevenueCat sin necesidad de tiendas
 */
export const useMockPurchases = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offerings, setOfferings] = useState<any>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [userTier, setUserTier] = useState<'free' | 'premium' | 'pro'>('free');

  // Cargar estado inicial
  useEffect(() => {
    loadSubscriptionStatus();
    loadOfferings();
  }, []);

  const loadSubscriptionStatus = () => {
    setIsPremium(isMockPremium());
    setUserTier(getMockUserTier());
  };

  const loadOfferings = async () => {
    try {
      const mockOfferings = await getMockOfferings();
      setOfferings(mockOfferings);
    } catch (err) {
      console.error('Error loading offerings:', err);
    }
  };

  /**
   * Realiza una compra simulada
   */
  const purchase = async (plan: 'monthly' | 'yearly') => {
    setLoading(true);
    setError(null);

    try {
      const result = await mockPurchase(plan);

      if (result.success) {
        loadSubscriptionStatus();
        return { success: true };
      } else {
        setError(result.error || 'Error en la compra');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancela la suscripción
   */
  const cancelSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await mockCancelSubscription();

      if (result.success) {
        loadSubscriptionStatus();
        return { success: true };
      } else {
        setError('Error al cancelar suscripción');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Restaura compras previas
   */
  const restorePurchases = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await mockRestorePurchases();

      if (result.success) {
        loadSubscriptionStatus();
        return { success: true, subscription: result.subscription };
      } else {
        setError('Error al restaurar compras');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene información de la suscripción actual
   */
  const getSubscriptionInfo = () => {
    return getMockSubscription();
  };

  return {
    loading,
    error,
    offerings,
    isPremium,
    userTier,
    purchase,
    cancelSubscription,
    restorePurchases,
    getSubscriptionInfo,
    refreshStatus: loadSubscriptionStatus,
  };
};
