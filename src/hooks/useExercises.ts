import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Exercise } from '../types/exercise';

interface ExerciseState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  fetchExercises: () => Promise<void>;
  addExercise: (exercise: Omit<Exercise, 'id' | 'created_at' | 'updated_at' | 'personal_trainer_id'>) => Promise<void>;
  updateExercise: (id: string, updates: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
}

export const useExercises = create<ExerciseState>((set) => ({
  exercises: [],
  loading: false,
  error: null,
  fetchExercises: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      if (error) throw error;
      set({ exercises: data || [] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
  addExercise: async (exerciseData) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('exercises')
        .insert([{ ...exerciseData, personal_trainer_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      set((state) => ({ exercises: [...state.exercises, data] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  updateExercise: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        exercises: state.exercises.map((e) => (e.id === id ? data : e)),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  deleteExercise: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        exercises: state.exercises.filter((e) => e.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
