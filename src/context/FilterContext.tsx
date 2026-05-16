import { createContext, useState, useContext, type ReactNode, useMemo } from 'react';
import type { RoutineGoal } from '../types';

// Tipos para los filtros
type FilterType = 'todos' | 'strength' | 'cardio' | 'flexibility';

interface FilterContextType {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  bodyZoneFilter: string;
  setBodyZoneFilter: (zone: string) => void;
  goalFilter: RoutineGoal | 'Todos';
  setGoalFilter: (goal: RoutineGoal | 'Todos') => void;
}

// Crear el contexto con un valor por defecto undefined
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Proveedor del contexto
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<FilterType>('todos');
  const [bodyZoneFilter, setBodyZoneFilter] = useState<string>('Todos');
  const [goalFilter, setGoalFilter] = useState<RoutineGoal | 'Todos'>('Todos');

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  // Solo incluir los valores de estado en las dependencias, no los setters
  const value = useMemo(() => ({
    filter,
    setFilter,
    bodyZoneFilter,
    setBodyZoneFilter,
    goalFilter,
    setGoalFilter,
  }), [filter, bodyZoneFilter, goalFilter]);

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
}

// Hooks selectores para acceder a valores específicos
export function useFilter() {
  const { filter } = useFilters();
  return filter;
}

export function useBodyZoneFilter() {
  const { bodyZoneFilter } = useFilters();
  return bodyZoneFilter;
}

export function useGoalFilter() {
  const { goalFilter } = useFilters();
  return goalFilter;
}

// Hook para acceder solo a las acciones (no causa re-render cuando cambia el estado)
export function useFilterActions() {
  const { setFilter, setBodyZoneFilter, setGoalFilter } = useFilters();
  return { setFilter, setBodyZoneFilter, setGoalFilter };
}
