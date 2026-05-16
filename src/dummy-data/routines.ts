import type { Routine } from '../types';

export const routines: Routine[] = [
  {
    id: 1,
    name: 'Fundamentos de Fuerza (Principiante)',
    description: 'Una rutina para construir una base sólida de fuerza.',
    category: 'strength',
    difficulty: 'principiante',
    goal: 'gain_muscle',
    body_zone_focus: ['full_body'],
    exercises: [1, 2, 3, 4, 5], // IDs de ejercicios de ejemplo
  },
  {
    id: 2,
    name: 'Quema de Grasa Inicial',
    description: 'Rutina de cardio y fuerza para empezar a perder peso.',
    category: 'hybrid',
    difficulty: 'principiante',
    goal: 'weight_loss',
    body_zone_focus: ['full_body'],
    exercises: [6, 7, 8, 9, 10],
  },
  {
    id: 3,
    name: 'Culturismo Clásico (Intermedio)',
    description: 'Rutina dividida para hipertrofia muscular.',
    category: 'strength',
    difficulty: 'intermedio',
    goal: 'gain_muscle',
    body_zone_focus: ['upper', 'lower'],
    exercises: [11, 12, 13, 14, 15],
  },
  {
    id: 4,
    name: 'Cardio Intenso (Intermedio)',
    description: 'Maximiza la quema de calorías con esta rutina de alta intensidad.',
    category: 'cardio',
    difficulty: 'intermedio',
    goal: 'weight_loss',
    body_zone_focus: ['full_body'],
    exercises: [16, 17, 18, 19, 20],
  },
    {
    id: 5,
    name: 'Acondicionamiento General',
    description: 'Una rutina balanceada para mantenerse en forma y saludable.',
    category: 'hybrid',
    difficulty: 'principiante',
    goal: 'general_fitness',
    body_zone_focus: ['full_body'],
    exercises: [1, 5, 8, 10, 12],
  },
];
