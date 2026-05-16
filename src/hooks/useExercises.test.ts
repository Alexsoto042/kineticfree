import { renderHook, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterAll } from 'vitest';
import { db } from '../db';
import { useExercises } from './useExercises';
import * as sync from '../lib/sync';
import type { Exercise } from '../types';
import { __setMockSelectData } from '../supabaseClient'; // Import the mock setter

const mockExercises: Exercise[] = [
  { id: 1, name: 'Push-up', category: 'strength', body_zone: ['chest', 'shoulders', 'triceps'], description: '', instructions: [], image: '' },
  { id: 2, name: 'Jumping Jacks', category: 'cardio', body_zone: ['full_body'], description: '', instructions: [], image: '' },
  { id: 3, name: 'Pull-up', category: 'strength', body_zone: ['back'], description: '', instructions: [], image: '' },
];

// Mock the sync module to return a resolved promise
vi.mock('../lib/sync', () => ({
  syncTable: vi.fn(() => Promise.resolve()),
}));

describe('useExercises', () => {
  let syncTableSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Clear and populate the mock DB before each test
    await db.exercises.clear();
    await db.exercises.bulkAdd(mockExercises);
    // Set mock data for Supabase select calls
    __setMockSelectData(mockExercises);
    // Re-spy on syncTable after mocks are cleared
    syncTableSpy = vi.spyOn(sync, 'syncTable');
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should fetch exercises from local DB and trigger sync', async () => {
    let result: any;
    act(() => {
      ({ result } = renderHook(() => useExercises()));
    });

    // Wait for the data to be loaded from Dexie
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.exercises).toEqual(mockExercises);
    });

    // Check that sync was triggered
    expect(syncTableSpy).toHaveBeenCalledWith('exercises');
  });

  it('should filter exercises by category', async () => {
    const { result } = renderHook(() => useExercises({ category: 'cardio' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.exercises).toEqual([
        { id: 2, name: 'Jumping Jacks', category: 'cardio', body_zone: ['full_body'], description: '', instructions: [], image: '' },
      ]);
    });
  });

  it('should filter exercises by search term', async () => {
    const { result } = renderHook(() => useExercises({ searchTerm: 'pull' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.exercises).toEqual([
        { id: 3, name: 'Pull-up', category: 'strength', body_zone: ['back'], description: '', instructions: [], image: '' },
      ]);
    });
  });

  it('should return an empty array if no exercises match', async () => {
    const { result } = renderHook(() => useExercises({ category: 'flexibility' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.exercises).toEqual([]);
    });
  });
});
