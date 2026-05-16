import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

/**
 * Configuración de RevenueCat para Kinetic
 * Maneja las suscripciones y compras in-app
 */

// API Keys de RevenueCat (desde .env)
const REVENUECAT_API_KEY_IOS = import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY_IOS;
const REVENUECAT_API_KEY_ANDROID = import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY_ANDROID;

/**
 * Inicializa RevenueCat SDK
 * Debe llamarse al inicio de la app
 */
export async function initializeRevenueCat(): Promise<void> {
  try {
    const platform = Capacitor.getPlatform();
    
    // Seleccionar API key según la plataforma
    let apiKey: string;
    if (platform === 'ios') {
      apiKey = REVENUECAT_API_KEY_IOS;
    } else if (platform === 'android') {
      apiKey = REVENUECAT_API_KEY_ANDROID;
    } else {
      console.log('RevenueCat: Platform not supported for in-app purchases');
      return;
    }

    if (!apiKey) {
      console.error('RevenueCat: API key not found in environment variables');
      return;
    }

    // Configurar RevenueCat
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG }); // Cambiar a INFO en producción
    
    // Configurar SDK
    await Purchases.configure({
      apiKey,
      appUserID: undefined, // Se configurará después del login
    });

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Error initializing RevenueCat:', error);
  }
}

/**
 * Identifica al usuario en RevenueCat
 * @param userId - ID del usuario de Supabase
 */
export async function identifyUser(userId: string): Promise<void> {
  try {
    await Purchases.logIn({ appUserID: userId });
    console.log('RevenueCat: User identified:', userId);
  } catch (error) {
    console.error('Error identifying user in RevenueCat:', error);
  }
}

/**
 * Cierra sesión del usuario en RevenueCat
 */
export async function logoutUser(): Promise<void> {
  try {
    await Purchases.logOut();
    console.log('RevenueCat: User logged out');
  } catch (error) {
    console.error('Error logging out user in RevenueCat:', error);
  }
}

/**
 * Obtiene las ofertas disponibles
 */
export async function getOfferings() {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
}

/**
 * Obtiene información del cliente (suscripción actual)
 */
export async function getCustomerInfo() {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Error fetching customer info:', error);
    return null;
  }
}

/**
 * Realiza una compra
 * @param packageToPurchase - Paquete a comprar
 */
export async function purchasePackage(packageToPurchase: any) {
  try {
    const purchaseResult = await Purchases.purchasePackage({
      aPackage: packageToPurchase,
    });
    return purchaseResult;
  } catch (error) {
    console.error('Error purchasing package:', error);
    throw error;
  }
}

/**
 * Restaura compras previas
 */
export async function restorePurchases() {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
}

/**
 * Verifica si el usuario tiene una suscripción activa
 * @param customerInfo - Información del cliente
 * @returns true si tiene suscripción premium activa
 */
export function isPremiumUser(customerInfo: any): boolean {
  if (!customerInfo) return false;
  
  // Verificar si tiene acceso a entitlements premium
  const entitlements = customerInfo.customerInfo?.entitlements?.active;
  
  // Puedes definir un entitlement llamado "premium" en RevenueCat dashboard
  return entitlements?.premium !== undefined;
}

/**
 * Obtiene el tier del usuario basado en sus entitlements
 * @param customerInfo - Información del cliente
 * @returns 'free' | 'premium' | 'pro'
 */
export function getUserTier(customerInfo: any): 'free' | 'premium' | 'pro' {
  if (!customerInfo) return 'free';
  
  const entitlements = customerInfo.customerInfo?.entitlements?.active;
  
  if (entitlements?.pro) return 'pro';
  if (entitlements?.premium) return 'premium';
  
  return 'free';
}
