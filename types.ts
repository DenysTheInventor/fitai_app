
export type View =
  | 'home'
  | 'calendar'
  | 'history'
  | 'exercises'
  | 'analysis'
  | 'settings'
  | 'routine'
  | 'nutrition'
  | 'sleep'
  | 'exercise-library'
  | 'sets'
  | 'set-form'
  | 'check-ins'
  | 'check-in-form'
  | 'check-in-detail'
  | 'map'
  | 'activity-summary'
  | 'habits'
  | 'reading-library'
  | 'book-form';

export enum ActivityType {
  WeightLifting = 'WeightLifting',
  Cardio = 'Cardio',
  Sport = 'Sport',
  OutdoorRun = 'OutdoorRun',
}

export interface Set {
  reps: number;
  weight: number;
}

export interface WeightLiftingActivity {
  id: string;
  name: string;
  type: ActivityType.WeightLifting;
  sets: Set[];
}

export interface CardioActivity {
    id: string;
    name: string;
    type: ActivityType.Cardio;
    steps: number;
}

export interface SportActivity {
    id: string;
    name: string;
    type: ActivityType.Sport;
    durationMinutes: number;
}

export interface GPSPoint {
  lat: number;
  lng: number;
  timestamp: number;
  altitude: number | null;
}

export interface OutdoorRunActivity {
  id: string;
  name: string;
  type: ActivityType.OutdoorRun;
  durationSeconds: number;
  distanceKm: number;
  route: GPSPoint[];
}

export type WorkoutActivity = WeightLiftingActivity | CardioActivity | SportActivity | OutdoorRunActivity;

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

export enum HabitType {
  Reading = 'Reading',
  English = 'English',
  Blogging = 'Blogging',
}

export interface BaseHabitLog {
    id: string;
    type: HabitType;
    durationMinutes: number;
}

export interface ReadingHabitLog extends BaseHabitLog {
    type: HabitType.Reading;
    bookId: string;
    pagesRead: number;
}

export interface EnglishHabitLog extends BaseHabitLog {
    type: HabitType.English;
}

export interface BloggingHabitLog extends BaseHabitLog {
    type: HabitType.Blogging;
}

export type HabitLog = ReadingHabitLog | EnglishHabitLog | BloggingHabitLog;

export interface DailyLog {
  date: string; // YYYY-MM-DD
  workouts: WorkoutActivity[];
  nutrition: NutritionLog | null;
  sleep: SleepLog | null;
  habits: HabitLog[];
}

export interface CustomExercise {
  id: string;
  name: string;
}

export interface ExerciseSet {
  id: string;
  name: string;
  exerciseIds: string[];
}

export interface UserSettings {
  name: string;
  weight: number;
  height: number;
  goal: string;
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

export interface Book {
    id: string;
    title: string;
    author: string;
    totalPages: number;
    coverPhoto: string | null;
    isFinished: boolean;
}
