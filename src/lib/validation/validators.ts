import { z } from 'zod';

/**
 * Validadores comunes reutilizables
 */

// Email
export const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Email inválido')
  .toLowerCase()
  .trim();

// Password
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'La contraseña es demasiado larga')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
  );

// Username
export const usernameSchema = z
  .string()
  .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
  .max(30, 'El nombre de usuario es demasiado largo')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos'
  )
  .trim();

// URL
export const urlSchema = z
  .string()
  .url('URL inválida')
  .or(z.literal(''));

// Números positivos
export const positiveNumberSchema = z
  .number()
  .positive('Debe ser un número positivo')
  .finite('Número inválido');

// Números enteros positivos
export const positiveIntegerSchema = z
  .number()
  .int('Debe ser un número entero')
  .positive('Debe ser un número positivo');

// Peso (kg)
export const weightSchema = z
  .number()
  .min(30, 'El peso debe ser al menos 30 kg')
  .max(300, 'El peso debe ser menor a 300 kg')
  .finite('Peso inválido');

// Altura (cm)
export const heightSchema = z
  .number()
  .int('La altura debe ser un número entero')
  .min(100, 'La altura debe ser al menos 100 cm')
  .max(250, 'La altura debe ser menor a 250 cm');

// Edad
export const ageSchema = z
  .number()
  .int('La edad debe ser un número entero')
  .min(13, 'Debes tener al menos 13 años')
  .max(120, 'Edad inválida');

// Porcentaje (0-100)
export const percentageSchema = z
  .number()
  .min(0, 'El porcentaje debe ser al menos 0')
  .max(100, 'El porcentaje debe ser máximo 100')
  .finite('Porcentaje inválido');

// Fecha
export const dateSchema = z
  .string()
  .datetime({ message: 'Fecha inválida' })
  .or(z.date());

// UUID
export const uuidSchema = z
  .string()
  .uuid('ID inválido');

// Texto no vacío
export const nonEmptyStringSchema = z
  .string()
  .min(1, 'Este campo es requerido')
  .trim();

// Texto opcional
export const optionalStringSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''));

// Array no vacío
export const nonEmptyArraySchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.array(schema).min(1, 'Debe haber al menos un elemento');

/**
 * Validadores de archivos
 */

// Tamaño máximo de archivo (en bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Tipos de imagen permitidos
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'La imagen debe ser menor a 5MB',
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: 'Solo se permiten imágenes JPG, PNG o WebP',
  });

// Validador de imagen opcional (puede ser File o URL)
export const imageSchema = z.union([
  imageFileSchema,
  urlSchema,
  z.literal(''),
]);

/**
 * Validadores de enums
 */

export const genderSchema = z.enum(['male', 'female', 'other'], {
  message: 'Género inválido',
});

export const trainingDaysSchema = z.enum(['2-3', '4-5', '5+'], {
  message: 'Días de entrenamiento inválidos',
});

export const fitnessGoalSchema = z.enum(
  ['weight_loss', 'muscle_gain', 'maintenance', 'general_fitness', 'endurance'],
  {
    message: 'Objetivo de fitness inválido',
  }
);

export const difficultySchema = z.enum(
  ['principiante', 'intermedio', 'avanzado'],
  {
    message: 'Dificultad inválida',
  }
);

export const exerciseCategorySchema = z.enum(
  ['strength', 'cardio', 'flexibility'],
  {
    message: 'Categoría de ejercicio inválida',
  }
);

export const routineCategorySchema = z.enum(
  ['strength', 'cardio', 'hybrid', 'flexibility'],
  {
    message: 'Categoría de rutina inválida',
  }
);

export const bodyMetricTypeSchema = z.enum(
  ['weight', 'body_fat_percentage', 'muscle_mass', 'waist_circumference'],
  {
    message: 'Tipo de métrica corporal inválida',
  }
);

export const goalTypeSchema = z.enum(
  [
    'weight_lift',
    'consistency',
    'body_weight',
    'cardio_distance',
    'cardio_time',
    'flexibility',
    'body_composition',
    'nutrition',
  ],
  {
    message: 'Tipo de objetivo inválido',
  }
);

export const goalStatusSchema = z.enum(
  ['in_progress', 'completed', 'abandoned'],
  {
    message: 'Estado de objetivo inválido',
  }
);

export const mealTypeSchema = z.enum(
  ['breakfast', 'lunch', 'dinner', 'snack'],
  {
    message: 'Tipo de comida inválido',
  }
);
