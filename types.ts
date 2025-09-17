export type View = 'home' | 'routine' | 'nutrition' | 'analysis' | 'calendar' | 'exercises' | 'history' | 'sleep' | 'check-in-form' | 'check-ins' | 'check-in-detail' | 'exercise-library' | 'sets' | 'set-form' | 'tracking' | 'settings-hub' | 'profile-settings' | 'system-settings' | 'activity-summary' | 'habits-hub' | 'reading-library' | 'book-form' | 'habits-library';

export enum ActivityType {
  WeightLifting = 'WeightLifting',
  Cardio = 'Cardio',
  Sport = 'Sport',
  OutdoorRun = 'OutdoorRun',
}

export enum HabitType {
  English = 'English',
  Reading = 'Reading',
  Blogging = 'Blogging',
  Custom = 'Custom',
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


export type WorkoutActivity = Exercise | Cardio | Sport | OutdoorRunActivity;

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

export interface GenericHabitLog extends BaseHabitLog {
    type: HabitType.English | HabitType.Blogging | HabitType.Custom;
    notes?: string;
    customHabitId?: string; // Links to CustomHabit['id']
}

export type HabitLog = ReadingHabitLog | GenericHabitLog;

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

export interface CustomHabit {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  coverPhoto: string | null;
  totalPages: number;
  isFinished: boolean;
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
  books: Book[];
  customHabits: CustomHabit[];
}