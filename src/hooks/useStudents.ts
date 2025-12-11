import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Student } from '../types/student';

interface StudentState {
  students: Student[];
  loading: boolean;
  error: string | null;
  fetchStudents: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'personal_trainer_id'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
}

export const useStudents = create<StudentState>((set) => ({
  students: [],
  loading: false,
  error: null,
  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');
      if (error) throw error;
      set({ students: data || [] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
  addStudent: async (studentData) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('students')
        .insert([{ ...studentData, personal_trainer_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      set((state) => ({ students: [...state.students, data] }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  updateStudent: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        students: state.students.map((s) => (s.id === id ? data : s)),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  deleteStudent: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        students: state.students.filter((s) => s.id !== id),
      }));
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
