import { Exercise } from './exercise';
import { Performance } from './performance';

export interface Workout {
  id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  students?: {
    name: string;
  };
  workout_exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string;
  week_number: number;
  order_index: number;
  created_at: string;
  exercises?: Exercise; // The joined exercise data
  performances?: Performance[]; // The joined performance data
}
