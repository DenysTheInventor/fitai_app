export type View = 'home' | 'routine' | 'nutrition' | 'analysis' | 'calendar' | 'exercises' | 'history' | 'settings' | 'sleep';

export enum ActivityType {
  WeightLifting = 'WeightLifting',
  Cardio = 'Cardio',
  Sport = 'Sport',
}

export type UserGoal = 'lose' | 'maintain' | 'gain';

export interface Set {
  reps: number;
  weight: number;
}

export interface Exercise {
  id: string;
  name: string;
  type: ActivityType.WeightLifting;
  sets: Set[];
}

export interface Cardio {
  id: string;
  name: string;
  type: ActivityType.Cardio;
  durationMinutes: number;
  distanceKm?: number;
}

export interface Sport {
  id: string;
  name: string;
  type: ActivityType.Sport;
  durationMinutes: number;
}

export type WorkoutActivity = Exercise | Cardio | Sport;

export interface NutritionLog {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  sugar: number;
}

export interface SleepLog {
    durationHours: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  workouts: WorkoutActivity[];
  nutrition: NutritionLog | null;
  sleep: SleepLog | null;
}

export interface CustomExercise {
    id: string;
    name: string;
}

export interface UserSettings {
  name: string;
  photo: string | null; // Base64 encoded image
  weight: number | null;
  height: number | null;
  age: number | null;
  goal: UserGoal | null;
  bio: string;
  lastBackupDate: string | null;
}

export interface AppData {
  logs: DailyLog[];
  customExercises: CustomExercise[];
  userSettings: UserSettings;
}