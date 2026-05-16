import { z } from 'zod';
import {
  emailSchema,
  passwordSchema,
  usernameSchema,
  urlSchema,
  weightSchema,
  heightSchema,
  ageSchema,
  positiveNumberSchema,
  positiveIntegerSchema,
  nonEmptyStringSchema,
  optionalStringSchema,
  uuidSchema,
  dateSchema,
  genderSchema,
  trainingDaysSchema,
  fitnessGoalSchema,
  difficultySchema,
  exerciseCategorySchema,
  routineCategorySchema,
  bodyMetricTypeSchema,
  goalTypeSchema,
  goalStatusSchema,
  mealTypeSchema,
  nonEmptyArraySchema,
} from './validators';

/**
 * Schema de Autenticación
 */

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

/**
 * Schema de Perfil de Usuario
 */

export const profileSetupSchema = z.object({
  username: usernameSchema.optional(),
  gender: genderSchema,
  age: ageSchema,
  height_cm: heightSchema,
  weight_kg: weightSchema,
  training_days: trainingDaysSchema.optional(),
  goal: fitnessGoalSchema.optional(),
});

export const profileUpdateSchema = z.object({
  username: usernameSchema.optional(),
  avatar_url: urlSchema.optional(),
  gender: genderSchema.optional(),
  age: ageSchema.optional(),
  height_cm: heightSchema.optional(),
  weight_kg: weightSchema.optional(),
  training_days: trainingDaysSchema.optional(),
  fitness_goal: fitnessGoalSchema.optional(),
  onboarding_completed: z.boolean().optional(),
  current_plan_id: uuidSchema.optional(),
});

/**
 * Schema de Ejercicios
 */

export const exerciseSchema = z.object({
  id: positiveIntegerSchema,
  name: nonEmptyStringSchema,
  description: nonEmptyStringSchema,
  instructions: z.array(nonEmptyStringSchema),
  category: exerciseCategorySchema,
  image: urlSchema,
  gif_url: urlSchema.optional(),
  body_zone: nonEmptyArraySchema(z.string()),
  youtube_id: optionalStringSchema,
  calories_burned_per_minute: positiveNumberSchema.optional(),
  benefits: optionalStringSchema,
  requires_machine: z.boolean().optional(),
});

export const exerciseCreateSchema = exerciseSchema.omit({ id: true });

export const exerciseUpdateSchema = exerciseSchema.partial().required({ id: true });

/**
 * Schema de Rutinas
 */

export const routineSchema = z.object({
  id: positiveIntegerSchema,
  name: nonEmptyStringSchema.max(100, 'El nombre es demasiado largo'),
  description: nonEmptyStringSchema.max(500, 'La descripción es demasiado larga'),
  category: routineCategorySchema,
  difficulty: difficultySchema,
  goal: fitnessGoalSchema,
  body_zone_focus: nonEmptyArraySchema(z.string()),
  exercises: nonEmptyArraySchema(positiveIntegerSchema),
});

export const routineCreateSchema = routineSchema.omit({ id: true });

export const routineUpdateSchema = routineSchema.partial().required({ id: true });

/**
 * Schema de Workout Logs
 */

export const workoutLogSchema = z.object({
  id: uuidSchema.optional(),
  created_at: dateSchema.optional(),
  user_id: uuidSchema.optional(),
  routine_id: positiveIntegerSchema,
  exercise_id: positiveIntegerSchema,
  sets: positiveIntegerSchema.optional(),
  set_number: positiveIntegerSchema.optional(),
  reps: positiveIntegerSchema.max(1000, 'Número de repeticiones inválido').optional(),
  weight: positiveNumberSchema.max(1000, 'Peso inválido').optional(),
  duration_seconds: positiveIntegerSchema.max(86400, 'Duración inválida').optional(),
  notes: z.string().max(500, 'Las notas son demasiado largas').optional(),
  volume: positiveNumberSchema.optional(),
  synced: z.boolean().optional(),
  workout_log_id: uuidSchema.optional(),
});

export const workoutLogCreateSchema = workoutLogSchema.omit({
  id: true,
  created_at: true,
  user_id: true,
});

/**
 * Schema de Métricas Corporales
 */

const weightUnitSchema = z.enum(['kg', 'lbs']);
const bodyFatUnitSchema = z.enum(['%']);
const muscleMassUnitSchema = z.enum(['kg', 'lbs']);
const waistCircumferenceUnitSchema = z.enum(['cm', 'in']);

export const bodyMetricSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  metric_type: bodyMetricTypeSchema,
  value: positiveNumberSchema,
  unit: z.union([
    weightUnitSchema,
    bodyFatUnitSchema,
    muscleMassUnitSchema,
    waistCircumferenceUnitSchema,
  ]),
  recorded_at: dateSchema,
});

export const bodyMetricCreateSchema = z.object({
  metric_type: bodyMetricTypeSchema,
  value: positiveNumberSchema,
  unit: z.union([
    weightUnitSchema,
    bodyFatUnitSchema,
    muscleMassUnitSchema,
    waistCircumferenceUnitSchema,
  ]),
});

/**
 * Schema de Objetivos (Goals)
 */

export const goalSchema = z.object({
  id: positiveIntegerSchema,
  user_id: uuidSchema,
  created_at: dateSchema,
  type: goalTypeSchema,
  description: nonEmptyStringSchema.max(200, 'La descripción es demasiado larga'),
  target_value: positiveNumberSchema,
  current_value: z.number().min(0, 'El valor actual no puede ser negativo'),
  unit: z
    .enum([
      'kg',
      'reps',
      'days',
      'km',
      'miles',
      'minutes',
      'hours',
      'calories',
      '%',
      'grams',
      'cm',
      'degrees',
    ])
    .optional(),
  target_date: dateSchema.optional(),
  status: goalStatusSchema,
  exercise_id: positiveIntegerSchema.nullable().optional(),
});

export const goalCreateSchema = goalSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  status: true,
  current_value: true,
});

export const goalUpdateSchema = z.object({
  id: positiveIntegerSchema,
  current_value: z.number().min(0).optional(),
  status: goalStatusSchema.optional(),
  target_value: positiveNumberSchema.optional(),
  target_date: dateSchema.optional(),
});

/**
 * Schema de Planes
 */

export const planSchema = z.object({
  id: uuidSchema,
  name: nonEmptyStringSchema.max(100, 'El nombre es demasiado largo'),
  description: nonEmptyStringSchema.max(1000, 'La descripción es demasiado larga'),
  goal_id: uuidSchema,
  difficulty: difficultySchema,
  duration_weeks: positiveIntegerSchema.max(52, 'Duración máxima: 52 semanas'),
  diet_recommendation: optionalStringSchema,
  meal_plan_description: optionalStringSchema,
  foods_to_eat: z.array(z.string()).optional(),
  foods_to_avoid: z.array(z.string()).optional(),
  routine_id: uuidSchema.optional(),
});

/**
 * Schema de Recetas
 */

export const recipeIngredientSchema = z.object({
  item: nonEmptyStringSchema,
  quantity: nonEmptyStringSchema,
});

export const recipeSchema = z.object({
  id: positiveIntegerSchema,
  created_at: dateSchema,
  name: nonEmptyStringSchema.max(100, 'El nombre es demasiado largo'),
  description: nonEmptyStringSchema.max(500, 'La descripción es demasiado larga'),
  ingredients: nonEmptyArraySchema(recipeIngredientSchema),
  instructions: nonEmptyArraySchema(nonEmptyStringSchema),
  prep_time_minutes: positiveIntegerSchema.max(480, 'Tiempo de preparación inválido'),
  cook_time_minutes: positiveIntegerSchema.max(480, 'Tiempo de cocción inválido'),
  servings: positiveIntegerSchema.max(50, 'Número de porciones inválido'),
  image_url: urlSchema,
  calories: positiveNumberSchema.max(10000, 'Calorías inválidas'),
  protein_grams: positiveNumberSchema.max(1000, 'Proteína inválida'),
  carbs_grams: positiveNumberSchema.max(1000, 'Carbohidratos inválidos'),
  fat_grams: positiveNumberSchema.max(1000, 'Grasas inválidas'),
  goal: fitnessGoalSchema,
});

export const recipeCreateSchema = recipeSchema.omit({
  id: true,
  created_at: true,
});

/**
 * Schema de Nutrición (Logged Food)
 */

export const loggedFoodSchema = z.object({
  product_id: nonEmptyStringSchema,
  name: nonEmptyStringSchema.max(100, 'El nombre es demasiado largo'),
  quantity: positiveNumberSchema.max(10000, 'Cantidad inválida'),
  unit: nonEmptyStringSchema.max(20, 'Unidad inválida'),
  meal: mealTypeSchema,
  calories: positiveNumberSchema.max(10000, 'Calorías inválidas'),
  proteins: positiveNumberSchema.max(1000, 'Proteína inválida'),
  carbohydrates: positiveNumberSchema.max(1000, 'Carbohidratos inválidos'),
  fats: positiveNumberSchema.max(1000, 'Grasas inválidas'),
});

/**
 * Schema de Comentarios
 */

export const commentSchema = z.object({
  id: positiveIntegerSchema,
  created_at: dateSchema,
  updated_at: dateSchema,
  post_id: positiveIntegerSchema,
  user_id: uuidSchema,
  comment_text: nonEmptyStringSchema.max(500, 'El comentario es demasiado largo'),
  parent_comment_id: positiveIntegerSchema.nullable().optional(),
});

export const commentCreateSchema = z.object({
  post_id: positiveIntegerSchema,
  comment_text: nonEmptyStringSchema.max(500, 'El comentario es demasiado largo'),
  parent_comment_id: positiveIntegerSchema.nullable().optional(),
});

/**
 * Schema de Notificaciones
 */

export const notificationSchema = z.object({
  id: positiveIntegerSchema,
  created_at: dateSchema,
  recipient_id: uuidSchema,
  actor_id: uuidSchema.nullable(),
  type: z.enum(['like', 'comment', 'follow', 'new_post', 'comment_reply']),
  post_id: positiveIntegerSchema.nullable().optional(),
  comment_id: positiveIntegerSchema.nullable().optional(),
  read: z.boolean(),
  message: optionalStringSchema,
});

/**
 * Tipos TypeScript inferidos de los schemas
 */

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileSetupInput = z.infer<typeof profileSetupSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ExerciseInput = z.infer<typeof exerciseSchema>;
export type ExerciseCreateInput = z.infer<typeof exerciseCreateSchema>;
export type RoutineInput = z.infer<typeof routineSchema>;
export type RoutineCreateInput = z.infer<typeof routineCreateSchema>;
export type WorkoutLogInput = z.infer<typeof workoutLogSchema>;
export type WorkoutLogCreateInput = z.infer<typeof workoutLogCreateSchema>;
export type BodyMetricInput = z.infer<typeof bodyMetricSchema>;
export type BodyMetricCreateInput = z.infer<typeof bodyMetricCreateSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type GoalCreateInput = z.infer<typeof goalCreateSchema>;
export type GoalUpdateInput = z.infer<typeof goalUpdateSchema>;
export type RecipeInput = z.infer<typeof recipeSchema>;
export type RecipeCreateInput = z.infer<typeof recipeCreateSchema>;
export type LoggedFoodInput = z.infer<typeof loggedFoodSchema>;
export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
