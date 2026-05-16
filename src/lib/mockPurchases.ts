/**
 * Sistema de Pagos Simulado (Mock)
 * Simula el comportamiento de RevenueCat sin necesidad de App Store/Google Play
 * Perfecto para desarrollo y testing
 */

export interface MockSubscription {
  tier: 'free' | 'premium' | 'pro';
  plan: 'monthly' | 'yearly' | null;
  status: 'active' | 'canceled' | 'expired';
  purchaseDate: string;
  expiryDate: string;
  autoRenew: boolean;
}

const MOCK_STORAGE_KEY = 'kinetic_mock_subscription';

/**
 * Obtiene la suscripción simulada actual
 */
export function getMockSubscription(): MockSubscription | null {
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (!stored) return null;

  const subscription: MockSubscription = JSON.parse(stored);
  
  // Verificar si expiró
  if (new Date(subscription.expiryDate) < new Date()) {
    subscription.status = 'expired';
    subscription.tier = 'free';
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(subscription));
  }

  return subscription;
}

/**
 * Simula una compra de suscripción
 * @param plan - Plan a comprar ('monthly' o 'yearly')
 * @returns Promise que resuelve después de simular el proceso
 */
export async function mockPurchase(
  plan: 'monthly' | 'yearly'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Simular delay de procesamiento (como una compra real)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular 10% de probabilidad de error (para testing)
    if (Math.random() < 0.1) {
      throw new Error('Pago rechazado (simulado)');
    }

    const now = new Date();
    const expiryDate = new Date(now);
    
    // Calcular fecha de expiración
    if (plan === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const subscription: MockSubscription = {
      tier: 'premium',
      plan: plan,
      status: 'active',
      purchaseDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      autoRenew: true,
    };

    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(subscription));

    console.log('✅ Mock Purchase successful:', subscription);
    return { success: true };
  } catch (error) {
    console.error('❌ Mock Purchase failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Simula la cancelación de una suscripción
 */
export async function mockCancelSubscription(): Promise<{ success: boolean }> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const subscription = getMockSubscription();
    if (!subscription) {
      throw new Error('No hay suscripción activa');
    }

    subscription.status = 'canceled';
    subscription.autoRenew = false;

    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(subscription));

    console.log('✅ Mock Cancellation successful');
    return { success: true };
  } catch (error) {
    console.error('❌ Mock Cancellation failed:', error);
    return { success: false };
  }
}

/**
 * Simula restaurar compras previas
 */
export async function mockRestorePurchases(): Promise<{
  success: boolean;
  subscription?: MockSubscription;
}> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const subscription = getMockSubscription();

    if (!subscription || subscription.tier === 'free') {
      console.log('ℹ️ No purchases to restore');
      return { success: true };
    }

    console.log('✅ Mock Restore successful:', subscription);
    return { success: true, subscription };
  } catch (error) {
    console.error('❌ Mock Restore failed:', error);
    return { success: false };
  }
}

/**
 * Limpia la suscripción simulada (útil para testing)
 */
export function clearMockSubscription(): void {
  localStorage.removeItem(MOCK_STORAGE_KEY);
  console.log('🗑️ Mock subscription cleared');
}

/**
 * Verifica si el usuario tiene suscripción premium activa
 */
export function isMockPremium(): boolean {
  const subscription = getMockSubscription();
  return (
    subscription !== null &&
    subscription.tier !== 'free' &&
    subscription.status === 'active' &&
    new Date(subscription.expiryDate) > new Date()
  );
}

/**
 * Obtiene el tier del usuario
 */
export function getMockUserTier(): 'free' | 'premium' | 'pro' {
  const subscription = getMockSubscription();
  if (!subscription || subscription.status !== 'active') {
    return 'free';
  }
  return subscription.tier;
}

/**
 * Simula obtener ofertas disponibles (productos)
 */
export async function getMockOfferings() {
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    current: {
      availablePackages: [
        {
          identifier: 'monthly',
          product: {
            identifier: 'kinetic_premium_monthly',
            title: 'Kinetic Premium Mensual',
            description: 'Acceso completo a todas las funciones premium',
            price: 9.99,
            priceString: '$9.99',
            currencyCode: 'USD',
          },
        },
        {
          identifier: 'yearly',
          product: {
            identifier: 'kinetic_premium_yearly',
            title: 'Kinetic Premium Anual',
            description: 'Acceso completo a todas las funciones premium por un año',
            price: 99.99,
            priceString: '$99.99',
            currencyCode: 'USD',
          },
        },
      ],
    },
  };
}
