import type { Plan } from '../types';

export const plans: Plan[] = [
  {
    id: 'plan_1',
    name: 'Plan de Fuerza para Principiantes',
    description: 'Un plan de 8 semanas enfocado en construir fuerza fundamental.',
    goal_id: 'gain_muscle', // Corresponds to 'gain_muscle' goal
    difficulty: 'principiante',
    duration_weeks: 8,
  },
  {
    id: 'plan_2',
    name: 'Plan de Pérdida de Peso Intermedio',
    description: 'Un programa de 12 semanas que combina cardio y entrenamiento de fuerza.',
    goal_id: 'weight_loss', // Corresponds to 'weight_loss' goal
    difficulty: 'intermedio',
    duration_weeks: 12,
  },
  {
    id: 'plan_3',
    name: 'Plan de Acondicionamiento General',
    description: 'Un plan de 4 semanas para mejorar la condición física general y la salud.',
    goal_id: 'general_fitness', // Corresponds to 'get_fit' goal
    difficulty: 'principiante',
    duration_weeks: 4,
  },
  {
    id: 'plan_4', // Added a new plan for more variety
    name: 'Esculpir y Tonificar (Avanzado)',
    description: 'Un plan de alta intensidad para usuarios avanzados que buscan definición muscular.',
    goal_id: 'gain_muscle',
    difficulty: 'avanzado',
    duration_weeks: 6,
  },
];
