import { usePaginatedQuery } from '../../../hooks/usePaginatedQuery';
import type { Exercise } from '../../../types';
import { useMemo } from 'react';

interface UseExercisesParams {
  category?: Exercise['category'] | 'todos';
  bodyZone?: string | 'Todos';
  searchTerm?: string;
  infiniteScroll?: boolean;
  pageSize?: number;
}

export function useExercises({
  category = 'todos',
  bodyZone = 'Todos',
  searchTerm = '',
  infiniteScroll = false,
  pageSize = 20,
}: UseExercisesParams = {}) {
  const memoizedFilters = useMemo(() => ({
    category,
    body_zone: bodyZone,
  }), [category, bodyZone]);

  const { data: exercises, ...rest } = usePaginatedQuery<Exercise>({
    tableName: 'exercises',
    filters: memoizedFilters,
    searchTerm,
    infiniteScroll,
    pageSize,
  });

  return {
    exercises,
    ...rest,
  };
}
