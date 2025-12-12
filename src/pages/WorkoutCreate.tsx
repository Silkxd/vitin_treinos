import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { differenceInCalendarWeeks, addWeeks, format, eachDayOfInterval, isWeekend, startOfWeek } from 'date-fns';
import { Save, ArrowLeft, Calendar } from 'lucide-react';
import { useStudents } from '../hooks/useStudents';
import { useExercises } from '../hooks/useExercises';
import { useWorkouts } from '../hooks/useWorkouts';
import { WorkoutBuilder } from '../components/workouts/WorkoutBuilder';
import { Exercise } from '../types/exercise';
import { clsx } from 'clsx';

const workoutSchema = z.object({
  student_id: z.string().min(1, 'Selecione um aluno'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de término é obrigatória'),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

export default function WorkoutCreate() {
  const navigate = useNavigate();
  const { students, fetchStudents } = useStudents();
  const { exercises, fetchExercises } = useExercises();
  const { createWorkout, loading: saving } = useWorkouts();

  const [weeks, setWeeks] = useState<{ [key: number]: Exercise[] }>({});
  const [weekCount, setWeekCount] = useState(4);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      start_date: format(new Date(), 'yyyy-MM-dd'),
      end_date: format(addWeeks(new Date(), 4), 'yyyy-MM-dd'),
    }
  });

  const startDate = watch('start_date');
  const endDate = watch('end_date');

  useEffect(() => {
    fetchStudents();
    fetchExercises();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      // Parse dates as Local Time to ensure correct Day of Week checks
      const [startY, startM, startD] = startDate.split('-').map(Number);
      const [endY, endM, endD] = endDate.split('-').map(Number);

      const start = new Date(startY, startM - 1, startD);
      const end = new Date(endY, endM - 1, endD);

      if (start <= end) {
        const days = eachDayOfInterval({ start, end });
        const validWeeks = new Set<string>();

        days.forEach(day => {
          // If it's a working day (Mon-Fri), mark this week as valid
          if (!isWeekend(day)) {
            // Identify the week by its start date string
            const weekId = startOfWeek(day).toISOString();
            validWeeks.add(weekId);
          }
        });

        // Ensure at least 1 week, and reasonable max (e.g. 12)
        const count = Math.max(1, Math.min(12, validWeeks.size));
        setWeekCount(count);
      }
    }
  }, [startDate, endDate]);

  // Initialize weeks structure when count changes
  useEffect(() => {
    setWeeks(prev => {
      const newWeeks: { [key: number]: Exercise[] } = {};
      for (let i = 1; i <= weekCount; i++) {
        newWeeks[i] = prev[i] || [];
      }
      return newWeeks;
    });
  }, [weekCount]);

  const onSubmit = async (data: WorkoutFormData) => {
    try {
      // Transform weeks state to flat array for DB
      const exerciseData: any[] = [];
      Object.entries(weeks).forEach(([weekNum, weekExercises]) => {
        weekExercises.forEach((ex, index) => {
          exerciseData.push({
            exercise_id: ex.id,
            week_number: parseInt(weekNum),
            order_index: index
          });
        });
      });

      if (exerciseData.length === 0) {
        alert('Adicione pelo menos um exercício ao treino.');
        return;
      }

      await createWorkout({
        student_id: data.student_id,
        start_date: data.start_date,
        end_date: data.end_date,
        active: true
      }, exerciseData);

      navigate('/students'); // Or redirect to dashboard/workouts list
    } catch (error) {
      console.error('Failed to create workout:', error);
      alert('Erro ao criar treino. Tente novamente.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Novo Treino</h1>
        </div>
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Salvando...' : 'Salvar Treino'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Student Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Aluno</label>
            <select
              {...register('student_id')}
              className={clsx(
                "w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all",
                errors.student_id ? "border-red-500" : "border-gray-200"
              )}
            >
              <option value="">Selecione um aluno...</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            {errors.student_id && (
              <span className="text-xs text-red-500">{errors.student_id.message}</span>
            )}
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data Início</label>
            <div className="relative">
              <input
                type="date"
                {...register('start_date')}
                className={clsx(
                  "w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all",
                  errors.start_date ? "border-red-500" : "border-gray-200"
                )}
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Data Término</label>
            <div className="relative">
              <input
                type="date"
                {...register('end_date')}
                className={clsx(
                  "w-full p-2 pl-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all",
                  errors.end_date ? "border-red-500" : "border-gray-200"
                )}
              />
              <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Montagem do Treino ({weekCount} Semanas)</h2>
          <WorkoutBuilder
            availableExercises={exercises}
            weeks={weeks}
            setWeeks={setWeeks}
          />
        </div>
      </div>
    </div>
  );
}
