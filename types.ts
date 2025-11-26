export enum ItemType {
  DAILY_TASK = 'DAILY_TASK',
  LONG_TERM_GOAL = 'LONG_TERM_GOAL',
  EXERCISE = 'EXERCISE',
  WORK = 'WORK',
  WEIGHT = 'WEIGHT',
  HOME_REPAIR = 'HOME_REPAIR'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
}

export interface TodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  type: ItemType;
  createdAt: number;
  description?: string;
  priority?: Priority;
  // Legacy fields for backward compatibility or summaries
  weight?: number; 
  reps?: number;
  sets?: number; 
  // New field for detailed sets
  detailedSets?: ExerciseSet[];
}

export interface AIPlanResponse {
  tasks: string[];
  motivation: string;
}

export interface WeightEntry {
  id: string;
  date: number;
  weight: number;
}