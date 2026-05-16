import React from 'react';
import { FaDumbbell, FaRunning, FaHistory, FaFire } from 'react-icons/fa';
import { StatCard } from './StatCard';
import type { DashboardStats } from '../../hooks/useDashboardData';

interface StatsGridProps {
  stats: DashboardStats | null;
  streak: number;
}

export const StatsGrid = React.memo(({ stats, streak }: StatsGridProps) => {
  return (
    <section className="stats-grid">
      <StatCard
        icon={<FaDumbbell size={24} className="stat-icon" />}
        value={stats?.exercise_count ?? 0}
        label="Ejercicios Totales"
      />
      <StatCard
        icon={<FaRunning size={24} className="stat-icon" />}
        value={stats?.routine_count ?? 0}
        label="Rutinas Totales"
      />
      <StatCard
        icon={<FaHistory size={24} className="stat-icon" />}
        value={stats?.recent_workout_count ?? 0}
        label="Entrenamientos"
      />
      <StatCard
        icon={<FaFire size={24} className="stat-icon" />}
        value={streak}
        label="Racha de Días"
      />
    </section>
  );
});

StatsGrid.displayName = 'StatsGrid';
