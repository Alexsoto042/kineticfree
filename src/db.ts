import Dexie, { type Table } from 'dexie';
import type {
  Exercise,
  Routine,
  WorkoutLog,
  Goal,
  BodyMetric,
  Plan,
} from './types';
import { logger } from './lib/logger';

const dbLogger = logger.createContext('IndexedDB');

export interface MotivationVideo {
  id?: string;
  title: string;
  videoBlob?: Blob; // For web
  nativePath?: string; // For native mobile
  createdAt: Date;
}

export interface UserSavedPlan {
  id: string;
  user_id: string;
  plan_id: string;
  saved_at: string;
  is_downloaded: boolean;
}

export interface PlanRoutine {
  id: string;
  plan_id: string;
  routine_id: number;
  day_of_week?: number;
}

export class KineticDB extends Dexie {
  videos!: Table<MotivationVideo>;
  exercises!: Table<Exercise>;
  routines!: Table<Routine>;
  plans!: Table<Plan>;
  workout_logs!: Table<WorkoutLog>;
  goals!: Table<Goal>;
  body_metrics!: Table<BodyMetric>;
  user_saved_plans!: Table<UserSavedPlan>;
  profiles!: Table<any>; // Cache de perfiles de usuario para offline
  plan_routines!: Table<PlanRoutine>; // Relación plan-rutinas para offline

  constructor() {
    super('kineticDB');
    this.version(6).stores({
      videos: '++id, title, createdAt',
      exercises: 'id, name, category, body_zone',
      routines: 'id, name, category, goal, difficulty',
      plans: 'id, name, goal_id, difficulty',
      workout_logs: 'id, created_at, user_id, routine_id, exercise_id, synced',
      goals: 'id, user_id, type, status, exercise_id',
      body_metrics: 'id, user_id, metric_type, recorded_at',
      user_saved_plans: 'id, user_id, plan_id, saved_at',
      profiles: 'id, username',
      plan_routines: 'id, plan_id, routine_id', // Nueva tabla
    });
  }
}

export const db = new KineticDB();

// --- Motivation Video Functions ---

export async function saveVideoToDB(video: MotivationVideo) {
  try {
    await db.videos.add(video);
    dbLogger.debug('Video saved to IndexedDB');
  } catch (error) {
    console.error('Error saving video:', error);
  }
}

export async function deleteVideoFromDB(id: string) {
  try {
    await db.videos.delete(id);
    dbLogger.debug(`Video with id ${id} deleted`);
  } catch (error) {
    console.error(`Error deleting video with id ${id}:`, error);
  }
}
