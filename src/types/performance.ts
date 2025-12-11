export interface Performance {
  id: string;
  workout_exercise_id: string;
  weight: number;
  repetitions: number;
  record_date: string;
  created_at: string;
}

export interface PerformanceInput {
  weight: number;
  repetitions: number;
  record_date: string;
}
