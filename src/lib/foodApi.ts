// src/lib/foodApi.ts
import { logger } from './logger';

const foodApiLogger = logger.createContext('FoodAPI');

const BASE_URL = 'https://world.openfoodfacts.org/cgi/search.pl';

// Adaptar la interfaz de nutrientes para Open Food Facts
interface Nutrients {
  'energy-kcal_100g'?: number;
  proteins_100g?: number;
  fat_100g?: number;
  carbohydrates_100g?: number;
}

// Adaptar la interfaz de alimentos para Open Food Facts
export interface Food {
  id: string;
  product_name: string;
  nutriments: Nutrients;
  categories?: string;
  image_url?: string;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hora en milisegundos

export async function searchFoods(query: string, page: number = 1, pageSize: number = 20): Promise<Food[]> {
  const cacheKey = `food_search_${query}_${page}_${pageSize}`;
  const cachedData = localStorage.getItem(cacheKey);

  if (cachedData) {
    const { timestamp, data } = JSON.parse(cachedData);
    if (Date.now() - timestamp < CACHE_DURATION) {
      foodApiLogger.debug('Returning cached data for:', query);
      return data;
    } else {
      foodApiLogger.debug('Cached data expired for:', query);
      localStorage.removeItem(cacheKey); // Eliminar datos expirados
    }
  }

  try {
    const response = await fetch(
      `${BASE_URL}?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page=${page}&page_size=${pageSize}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      foodApiLogger.error('Error searching foods:', response.status, errorData);
      throw new Error(`Error searching foods: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Open Food Facts devuelve los productos en 'products'
    const foods: Food[] = data.products
      .filter((product: any) => product.product_name && product.nutriments) // Filtrar productos válidos
      .map((product: any) => ({
        id: product.id,
        product_name: product.product_name,
        nutriments: {
          'energy-kcal_100g': product.nutriments['energy-kcal_100g'] || 0,
          proteins_100g: product.nutriments.proteins_100g || 0,
          fat_100g: product.nutriments.fat_100g || 0,
          carbohydrates_100g: product.nutriments.carbohydrates_100g || 0,
        },
        categories: product.categories,
        image_url: product.image_url,
      }));

    // Almacenar en caché
    localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: foods }));
    foodApiLogger.debug('Data fetched and cached for:', query);

    return foods;

  } catch (error) {
    foodApiLogger.error('Failed to fetch foods from Open Food Facts API:', error);
    return [];
  }
}
