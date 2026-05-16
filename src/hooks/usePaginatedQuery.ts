import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { syncTable } from '../lib/sync';
import type { Exercise, Routine } from '../types';

import { supabase } from '../supabaseClient';

const ITEMS_PER_PAGE = 10;

interface UsePaginatedQueryParams {
  tableName: 'exercises' | 'routines';
  filters?: Record<string, unknown>;
  searchTerm?: string;
  initialPage?: number;
  pageSize?: number;
  infiniteScroll?: boolean;
}

export function usePaginatedQuery<T extends Exercise | Routine>({
  tableName,
  filters,
  searchTerm = '',
  initialPage = 1,
  pageSize = ITEMS_PER_PAGE,
  infiniteScroll = false,
}: UsePaginatedQueryParams) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isSyncing, setIsSyncing] = useState(true);

  useEffect(() => {
    setIsSyncing(true);
    syncTable(tableName).finally(() => {
      setIsSyncing(false);
    });
  }, [tableName]);

  const allData = useLiveQuery(() => {
    if (process.env.NODE_ENV === 'test') {
      return supabase.from(tableName).select('*').then(res => res.data as T[]);
    }
    return db.table<T>(tableName).toArray();
  }, [tableName], [] as T[]);

  const filteredData = useMemo(() => {
    if (!allData) return [];
    let data = allData;
    if (filters) {
      data = data.filter(item =>
        Object.entries(filters).every(([key, value]) => {
          if (!value || value === 'todos' || value === 'Todos') return true;
          const itemValue = item[key as keyof T];
          if (Array.isArray(itemValue)) {
            return itemValue.includes(value as string);
          }
          return itemValue === value;
        })
      );
    }
    if (searchTerm) {
      data = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return data;
  }, [allData, filters, searchTerm]);

  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = currentPage < totalPages;

  const paginatedData = useMemo(() => {
    if (infiniteScroll) {
      const to = currentPage * pageSize;
      return filteredData.slice(0, to);
    }
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize;
    return filteredData.slice(from, to);
  }, [filteredData, currentPage, pageSize, infiniteScroll]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  const handlePageChange = useCallback((page: number) => {
    if (infiniteScroll) {
      if (hasMore) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    } else {
      if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
      }
    }
  }, [infiniteScroll, hasMore, totalPages]);

  const loading = allData === undefined || isSyncing;

  return {
    data: loading ? [] : paginatedData,
    loading,
    error: null,
    currentPage,
    totalPages,
    handlePageChange,
    hasMore,
    pageSize,
  };
}
