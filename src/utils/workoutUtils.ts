import { Workout } from '../types/workout';

export const getExerciseHistory = (workout: Workout, exerciseId: string) => {
  if (!workout?.workout_exercises) return [];
  
  const history: { date: string, weight: number, reps: number, week: number }[] = [];
  
  workout.workout_exercises.forEach(we => {
    if (we.exercise_id === exerciseId && we.performances) {
      we.performances.forEach(p => {
        history.push({
          date: p.record_date,
          weight: p.weight,
          reps: p.repetitions,
          week: we.week_number
        });
      });
    }
  });

  return history;
};
