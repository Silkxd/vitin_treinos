import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Workout } from '../types/workout';

interface WorkoutState {
  workouts: Workout[];
  selectedWorkout: Workout | null;
  studentHistory: Workout[];
  loading: boolean;
  error: string | null;
  fetchWorkouts: () => Promise<void>;
  fetchWorkoutDetails: (id: string) => Promise<void>;
  fetchStudentHistory: (studentId: string) => Promise<void>;
  createWorkout: (workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>, exercises: any[]) => Promise<void>;
  savePerformance: (data: { workout_exercise_id: string; weight: number; repetitions: number; record_date: string }) => Promise<void>;
  saveBulkPerformance: (performances: { workout_exercise_id: string; weight: number; repetitions: number; record_date: string }[]) => Promise<void>;
}

export const useWorkouts = create<WorkoutState>((set, get) => ({
  workouts: [],
  selectedWorkout: null,
  studentHistory: [],
  loading: false,
  error: null,
  fetchWorkouts: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, students(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ workouts: data || [] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
  fetchWorkoutDetails: async (id) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          students (name),
          workout_exercises (
            *,
            exercises (*),
            performances (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Sort exercises by week and order
      if (data && data.workout_exercises) {
        data.workout_exercises.sort((a: any, b: any) => {
          if (a.week_number !== b.week_number) return a.week_number - b.week_number;
          return a.order_index - b.order_index;
        });
      }

      set({ selectedWorkout: data });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
  createWorkout: async (workoutData, exercises) => {
    set({ loading: true, error: null });
    try {
      // 1. Calculate next workout number
      const { count, error: countError } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', workoutData.student_id);

      if (countError) throw countError;

      const nextNumber = (count || 0) + 1;
      const workoutName = `Treino ${nextNumber}`;

      // 2. Create Workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert([{ ...workoutData, name: workoutName }])
        .select()
        .single();

      if (workoutError) throw workoutError;

      // 2. Create Workout Exercises
      const workoutExercises = exercises.map((ex) => ({
        workout_id: workout.id,
        exercise_id: ex.exercise_id,
        week_number: ex.week_number,
        order_index: ex.order_index,
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (exercisesError) throw exercisesError;

      set((state) => ({ workouts: [workout, ...state.workouts] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  fetchStudentHistory: async (studentId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          students (name),
          workout_exercises (
            *,
            exercises (*),
            performances (*)
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: true }); // Important: sorted by creation for continuity

      if (error) throw error;

      // Sort exercises within each workout
      if (data) {
        data.forEach((w: any) => {
          if (w.workout_exercises) {
            w.workout_exercises.sort((a: any, b: any) => {
              if (a.week_number !== b.week_number) return a.week_number - b.week_number;
              return a.order_index - b.order_index;
            });
          }
        });
      }

      // We can store this in a new state variable 'studentHistory' or just return it. 
      // For now, let's just return it, but since this is a global store, sticking it in state is better?
      // Actually, let's add 'studentHistory' to the interface and state.
      set({ studentHistory: data || [] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
  savePerformance: async (data) => {
    try {
      const { error } = await supabase
        .from('performances')
        .upsert(data, { onConflict: 'workout_exercise_id, record_date' });

      if (error) throw error;

      // Refresh the selected workout to show new data
      const currentSelected = get().selectedWorkout;
      if (currentSelected) {
        await get().fetchWorkoutDetails(currentSelected.id);
      }
    } catch (err: any) {
      console.error('Error saving performance:', err);
      throw err;
    }
  },
  saveBulkPerformance: async (performances) => {
    try {
      const { error } = await supabase
        .from('performances')
        .upsert(performances, { onConflict: 'workout_exercise_id, record_date' });

      if (error) throw error;

      const currentSelected = get().selectedWorkout;
      if (currentSelected) {
        await get().fetchWorkoutDetails(currentSelected.id);
      }
    } catch (err: any) {
      console.error('Error saving bulk performance:', err);
      throw err;
    }
  }
}));
