export type View = 'home' | 'routine' | 'nutrition' | 'analysis' | 'calendar' | 'exercises' | 'history' | 'settings' | 'sleep' | 'check-in-form' | 'check-ins' | 'check-in-detail' | 'exercise-library' | 'sets' | 'set-form';

export enum ActivityType {
  WeightLifting = 'WeightLifting',
  Cardio = 'Cardio',
  Sport = 'Sport',
}

export type UserGoal = 'lose' | 'maintain' | 'gain';
export type UserGender = 'male' | 'female';

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
  steps: number;
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

export interface ExerciseSet {
    id: string;
    name: string;
    exerciseIds: string[]; // References CustomExercise['id']
}

export interface CheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  waist: number;
  chest: number;
  photo1: string | null;
  photo2: string | null;
}

export interface UserSettings {
  name: string;
  photo: string | null; // Base64 encoded image
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: UserGender | null;
  goal: UserGoal | null;
  bio: string;
  lastBackupDate: string | null;
}

export interface AppData {
  logs: DailyLog[];
  customExercises: CustomExercise[];
  userSettings: UserSettings;
  checkIns: CheckIn[];
  exerciseSets: ExerciseSet[];
}
