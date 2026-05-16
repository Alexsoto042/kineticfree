import { usePaginatedQuery } from './usePaginatedQuery';
import { useGoalFilter } from '../context/FilterContext';
import type { Routine } from '../types';
import { useMemo } from 'react';

interface UseRoutinesParams {
  infiniteScroll?: boolean;
}

export function useRoutines({ infiniteScroll = false }: UseRoutinesParams = {}) {
  // Usar hook selector específico para evitar re-renders innecesarios
  const goalFilter = useGoalFilter();

  const memoizedFilters = useMemo(() => ({
    goal: goalFilter,
  }), [goalFilter]);

  const { data: routines, ...rest } = usePaginatedQuery<Routine>({
    tableName: 'routines',
    filters: memoizedFilters,
    infiniteScroll,
  });

  return {
    routines,
    ...rest,
  };
}
