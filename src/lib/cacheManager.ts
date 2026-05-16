import { Preferences } from '@capacitor/preferences';
import type { Routine, Exercise } from '../types';

const ROUTINES_CACHE_KEY = 'cachedRoutines';
const EXERCISES_CACHE_KEY = 'cachedExercises';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

interface Cache<T> {
  timestamp: number;
  data: T;
}

const set = async <T>(key: string, data: T) => {
  const cache: Cache<T> = {
    timestamp: Date.now(),
    data,
  };
  await Preferences.set({ key, value: JSON.stringify(cache) });
};

const get = async <T>(key: string): Promise<T | null> => {
  const ret = await Preferences.get({ key });
  if (!ret.value) {
    return null;
  }
  const cache: Cache<T> = JSON.parse(ret.value);
  if (Date.now() - cache.timestamp > CACHE_TTL) {
    await Preferences.remove({ key });
    return null;
  }
  return cache.data;
};

export const cacheRoutines = (routines: Routine[]) => set(ROUTINES_CACHE_KEY, routines);
export const getCachedRoutines = () => get<Routine[]>(ROUTINES_CACHE_KEY);

export const cacheExercises = (exercises: Exercise[]) => set(EXERCISES_CACHE_KEY, exercises);
export const getCachedExercises = () => get<Exercise[]>(EXERCISES_CACHE_KEY);

export const invalidateCache = async () => {
  await Preferences.remove({ key: ROUTINES_CACHE_KEY });
  await Preferences.remove({ key: EXERCISES_CACHE_KEY });
};

const LAST_SEEN_ROUTINE_ID_KEY = 'lastSeenRoutineId';

export const setLastSeenRoutineId = (id: string) => Preferences.set({ key: LAST_SEEN_ROUTINE_ID_KEY, value: id });
export const getLastSeenRoutineId = async () => {
  const { value } = await Preferences.get({ key: LAST_SEEN_ROUTINE_ID_KEY });
  return value;
};
