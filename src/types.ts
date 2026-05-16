import type { Database } from './database.types';

// src/types.ts

export interface FilterContextType {
  filter: string;
  setFilter: (filter: string) => void;
  bodyZoneFilter: string;
  setBodyZoneFilter: (filter: string) => void;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  instructions: string[];
  category: 'strength' | 'cardio' | 'flexibility';
  image: string;
  gif_url?: string; // <-- Nueva propiedad para el GIF de Supabase
  body_zone: string[];
  youtube_id?: string;
  calories_burned_per_minute?: number;
  benefits?: string;
  requires_machine?: boolean;
  alternatives?: Exercise[];
}

export interface Routine {
  id: number;
  name: string;
  description: string;
  category: 'strength' | 'cardio' | 'hybrid' | 'flexibility';
  difficulty: 'principiante' | 'intermedio' | 'avanzado';
  goal: 'muscle_gain' | 'weight_loss' | 'endurance' | 'general_fitness';
  body_zone_focus: string[];
  exercises: number[];
}

export type RoutineGoal =
  | 'muscle_gain'
  | 'weight_loss'
  | 'endurance'
  | 'general_fitness';

export interface WorkoutLog {
  id?: string;
  created_at?: string;
  user_id?: string;
  routine_id: number;
  exercise_id: number;
  sets?: number;
  set_number?: number;
  reps?: number;
  weight?: number;
  duration_seconds?: number;
  notes?: string;
  volume?: number;
  synced?: boolean; // To track offline sync status
  workout_log_id?: string;
}

export interface Goal {
  id: number;
  user_id: string;
  created_at: string;
  type: 'weight_lift' | 'consistency' | 'body_weight' | 'cardio_distance' | 'cardio_time' | 'flexibility' | 'body_composition' | 'nutrition';
  description: string;
  target_value: number;
  current_value: number;
  unit?: 'kg' | 'reps' | 'days' | 'km' | 'miles' | 'minutes' | 'hours' | 'calories' | '%' | 'grams' | 'cm' | 'degrees';
  target_date?: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  exercise_id?: number | null;
}

export type GoalCreation = Omit<Goal, 'id' | 'user_id' | 'created_at' | 'status'>;

export type BodyMetricType =
  | 'weight'
  | 'body_fat_percentage'
  | 'muscle_mass'
  | 'waist_circumference';

export const bodyMetricTypes: readonly BodyMetricType[] = [
  'weight',
  'body_fat_percentage',
  'muscle_mass',
  'waist_circumference',
];

export const weightUnits = ['kg', 'lbs'] as const;
export type WeightUnit = (typeof weightUnits)[number];

export const bodyFatUnit = ['%'] as const;
export type BodyFatUnit = (typeof bodyFatUnit)[number];

export const muscleMassUnits = ['kg', 'lbs'] as const;
export type MuscleMassUnit = (typeof muscleMassUnits)[number];

export const waistCircumferenceUnits = ['cm', 'in'] as const;
export type WaistCircumferenceUnit = (typeof waistCircumferenceUnits)[number];

export type BodyMetricUnit =
  | WeightUnit
  | BodyFatUnit
  | MuscleMassUnit
  | WaistCircumferenceUnit;

export interface BodyMetric {
  id: string;
  user_id: string;
  metric_type: BodyMetricType;
  value: number;
  unit: BodyMetricUnit;
  recorded_at: string;
}

export type BodyMetricInsert = Omit<
  BodyMetric,
  'id' | 'user_id' | 'recorded_at'
>;

export interface Achievement {
  id: string;
  name: string;
  description: string;
  goal: number;
  check: (stats: DashboardStats | null, streak: number) => boolean;
}

export interface DashboardStats {
  exercise_count: number;
  routine_count: number;
  recent_workout_count: number;
  total_reps: number;
  total_weight_lifted: number;
  total_workouts: number;
}

export type UnlockedAchievement = {
  id: string;
  name: string;
  description: string;
  goal: number;
  check: (stats: DashboardStats | null, streak: number) => boolean;
  unlocked: boolean;
  progress: number;
};

// Types for Guided Plans
export interface PlanGoal {
  id: string;
  name: string;
  description: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  goal_id: string;
  difficulty: 'principiante' | 'intermedio' | 'avanzado';
  duration_weeks: number;
  diet_recommendation?: string; // Nueva propiedad
  meal_plan_description?: string; // Nueva propiedad
  foods_to_eat?: string[]; // Nueva propiedad
  foods_to_avoid?: string[]; // Nueva propiedad
  routine_id?: string; // ID de la rutina vinculada
  recipes?: PlanRecipe[];
}

export interface PlanRecipe {
  recipe: Recipe;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  day_of_week?: number;
}

// Types for Open Food Facts API
export interface Nutriments {
  'energy-kcal_100g': number;
  energy_kcal_100g: number;
  fat_100g?: number;
  carbohydrates_100g?: number;
  proteins_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;
}

export interface FoodProduct {
  id: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  nutriments: Nutriments;
  serving_size?: string;
  quantity?: string;
}

export interface LoggedFood {
  product_id: string;
  name: string;
  quantity: number;
  unit: string;
  meal: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fats: number;
}

export interface RecipeIngredientItem {
  quantity: number;
  unit: string;
  ingredients: { name: string }[] | null;
}

// Extend Routine to include full Exercise objects
export interface LinkedRoutine extends Omit<Routine, 'exercises'> {
  exercises: Exercise[];
}

export interface ExerciseAlternative {
  exercise_id: number;
  alternative: Exercise;
}

export type Answers = {
  goal?: string;
  experience?: string;
  trainingDays?: '2-3' | '4-5' | '5+';
  equipment?: string;
  nutritionInterest?: string;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  height_cm?: number;
  weight_kg?: number;
};

export type ProfileUpdate = {
  username?: string;
  avatar_url?: string;
  onboarding_completed?: boolean;
  current_plan_id?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height_cm?: number;
  weight_kg?: number;
  training_days?: '2-3' | '4-5' | '5+';
};

export interface Recipe {
  id: number;
  created_at: string;
  name: string;
  description: string;
  ingredients: { item: string; quantity: string }[];
  instructions: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  image_url: string;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance';
}

// Extend the Profile type to include the new 'has_seen_tutorial' field
export type Gender = 'male' | 'female' | 'other';
export type FitnessGoal = 'weight_loss' | 'gain_muscle' | 'get_fit';
export type TrainingDays = '2-3' | '4-5' | '5+';

export type UserProfile =
  Database['public']['Tables']['profiles']['Row'] & {
    has_seen_tutorial: boolean;
    weight_kg: number;
    height_cm: number;
    age: number;
    gender: Gender;
    trainingDays: TrainingDays;
    goal: FitnessGoal;
    fitness_goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | null;
  };

// Define the MotivationalPost interface
export interface MotivationalPost {
  id: number;
  created_at: string;
  type: 'video' | 'image';
  media_url: string;
  caption: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
  user_id: string | null; // Add user_id
  likes: number;
  liked_by: string[];
}

// Post Comment interface (with nested replies support)
export interface PostComment {
  id: number;
  created_at: string;
  updated_at: string;
  post_id: number;
  user_id: string;
  comment_text: string;
  parent_comment_id: number | null;
  // User profile data (from join)
  user_profile?: {
    username: string | null;
    avatar_url: string | null;
  };
  // Nested replies
  replies?: PostComment[];
}

// User Follow interface
export interface UserFollow {
  id: number;
  created_at: string;
  follower_id: string;
  following_id: string;
}

// Notification interface
export interface Notification {
  id: number;
  created_at: string;
  recipient_id: string;
  actor_id: string | null;
  type: 'like' | 'comment' | 'follow' | 'new_post' | 'comment_reply';
  post_id: number | null;
  comment_id: number | null;
  read: boolean;
  message: string | null;
  // Actor profile data (from join)
  actor_profile?: {
    username: string | null;
    avatar_url: string | null;
  };
  // Post data (from join) - optional
  post?: {
    media_url: string;
    type: 'video' | 'image';
  };
}

// Follow stats interface
export interface FollowStats {
  followers_count: number;
  following_count: number;
}
