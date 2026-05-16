import localforage from 'localforage';

// Configura una instancia de localforage
const cache = localforage.createInstance({
  name: 'app_cache', // Nombre de la base de datos IndexedDB
  storeName: 'key_value_store', // Nombre del almacén de objetos
  description: 'Cache for application data'
});

/**
 * Guarda un valor en el caché.
 * @param key La clave bajo la cual guardar el valor.
 * @param value El valor a guardar.
 */
export async function setCache(key: string, value: any): Promise<void> {
  try {
    await cache.setItem(key, value);
  } catch (error) {
    console.error(`Error al guardar en caché la clave ${key}:`, error);
  }
}

/**
 * Recupera un valor del caché.
 * @param key La clave del valor a recuperar.
 * @returns El valor recuperado o null si no se encuentra o hay un error.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    return await cache.getItem<T>(key);
  } catch (error) {
    console.error(`Error al recuperar de caché la clave ${key}:`, error);
    return null;
  }
}

/**
 * Elimina un valor del caché.
 * @param key La clave del valor a eliminar.
 */
export async function removeCache(key: string): Promise<void> {
  try {
    await cache.removeItem(key);
  } catch (error) {
    console.error(`Error al eliminar de caché la clave ${key}:`, error);
  }
}

/**
 * Limpia todo el caché.
 */
export async function clearCache(): Promise<void> {
  try {
    await cache.clear();
  } catch (error) {
    console.error('Error al limpiar todo el caché:', error);
  }
}
