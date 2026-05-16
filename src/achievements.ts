import type { Achievement } from './types';

export const achievements: Achievement[] = [
  {
    id: 'first_workout',
    name: 'Primer Entrenamiento',
    description: 'Completa tu primer entrenamiento.',
    goal: 1,
    check: (stats, _streak) => {
      if (!stats) return false;
      return stats.total_workouts >= 1;
    },
  },
  {
    id: 'three_day_streak',
    name: 'Racha de 3 Días',
    description: 'Entrena 3 días seguidos.',
    goal: 3,
    check: (_, streak) => streak >= 3,
  },
  {
    id: 'seven_day_streak',
    name: 'Racha de 7 Días',
    description: 'Entrena 7 días seguidos.',
    goal: 7,
    check: (_, streak) => streak >= 7,
  },
  {
    id: 'lift_1000kg',
    name: 'Levantador Principiante',
    description: 'Levanta un total de 1000 kg.',
    goal: 1000,
    check: (stats, _streak) => {
      if (!stats) return false;
      return stats.total_weight_lifted >= 1000;
    },
  },
  {
    id: 'lift_10000kg',
    name: 'Levantador Intermedio',
    description: 'Levanta un total de 10000 kg.',
    goal: 10000,
    check: (stats, _streak) => {
      if (!stats) return false;
      return stats.total_weight_lifted >= 10000;
    },
  },
  {
    id: 'workout_50',
    name: 'Adicto al Gimnasio',
    description: 'Completa 50 entrenamientos.',
    goal: 50,
    check: (stats, _streak) => {
      if (!stats) return false;
      return stats.total_workouts >= 50;
    },
  },
  {
    id: 'reps_5000',
    name: 'Máquina de Repeticiones',
    description: 'Completa 5,000 repeticiones totales.',
    goal: 5000,
    check: (stats, _streak) => {
      if (!stats) return false;
      return stats.total_reps >= 5000;
    },
  },
  {
    id: 'lift_50000kg',
    name: 'Hércules en Proceso',
    description: 'Levanta un total de 50,000 kg.',
    goal: 50000,
    check: (stats, _streak) => {
      if (!stats) return false;
      return stats.total_weight_lifted >= 50000;
    },
  },
];
