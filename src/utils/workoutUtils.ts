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

export const getAggregateExerciseHistory = (workouts: Workout[], exerciseId: string) => {
  if (!workouts || workouts.length === 0) return { history: [], boundaries: [] };

  const rawHistory: { date: string, weight: number, reps: number, week: number }[] = [];
  const boundaries: { name: string, startWeek: number, endWeek: number }[] = [];

  let weekOffset = 0;

  // Workouts should be sorted by creation date (older first) for continuity
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  sortedWorkouts.forEach(workout => {
    if (!workout.workout_exercises) return;

    let maxWeekInWorkout = 0;
    let hasExercise = false;
    // Track local start/end weeks for this workout to define boundary
    // The start week in GLOBAL terms is weekOffset + 1
    // The end week in GLOBAL terms is weekOffset + maxWeekInWorkout

    // First pass to find max week (duration of workout plan)
    workout.workout_exercises.forEach(we => {
      maxWeekInWorkout = Math.max(maxWeekInWorkout, we.week_number);
    });

    if (maxWeekInWorkout === 0) return; // Skip empty workouts

    const currentBoundary = {
      name: workout.name || `Treino`,
      startWeek: weekOffset + 1,
      endWeek: weekOffset + maxWeekInWorkout
    };
    boundaries.push(currentBoundary);

    workout.workout_exercises.forEach(we => {
      if (we.exercise_id === exerciseId && we.performances) {
        hasExercise = true;
        we.performances.forEach(p => {
          rawHistory.push({
            date: p.record_date,
            weight: p.weight,
            reps: p.repetitions,
            week: we.week_number + weekOffset
          });
        });
      }
    });

    weekOffset += maxWeekInWorkout;
  });

  // Deduplication: Group by week, take record with Max Weight
  // usage: map week -> record
  const weekMap = new Map<number, typeof rawHistory[0]>();

  rawHistory.forEach(record => {
    if (!weekMap.has(record.week)) {
      weekMap.set(record.week, record);
    } else {
      const existing = weekMap.get(record.week)!;
      // Logic: Max Weight. If duplicate weights, maybe Max Reps?
      if (record.weight > existing.weight) {
        weekMap.set(record.week, record);
      } else if (record.weight === existing.weight && record.reps > existing.reps) {
        weekMap.set(record.week, record);
      }
    }
  });

  const history = Array.from(weekMap.values()).sort((a, b) => a.week - b.week);

  return { history, boundaries };
};
