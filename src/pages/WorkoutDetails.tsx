import React, { useState, useEffect, useMemo } from 'react';
import { Save } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

interface WeeklyInputProps {
  weekNumber: number;
  weight: number;
  reps: number;
  onChange: (field: 'weight' | 'reps', value: number) => void;
}

const WeeklyInput = ({ weekNumber, weight, reps, onChange }: WeeklyInputProps) => (
  <div className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
    <span className="text-xs font-bold text-gray-500 uppercase">S{weekNumber}</span>
    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        <label className="text-[10px] text-gray-400 text-center">kg</label>
        <input
          type="number"
          value={weight || ''}
          onChange={(e) => onChange('weight', Number(e.target.value))}
          className="w-16 p-1 text-sm text-center border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] text-gray-400 text-center">reps</label>
        <input
          type="number"
          value={reps || ''}
          onChange={(e) => onChange('reps', Number(e.target.value))}
          className="w-12 p-1 text-sm text-center border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
        />
      </div>
    </div>
  </div>
);

export const WorkoutDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedWorkout, fetchWorkoutDetails, saveBulkPerformance, loading } = useWorkouts();

  const [saving, setSaving] = useState(false);
  const [performances, setPerformances] = useState<{ [key: string]: { weight: number; reps: number } }>({});

  useEffect(() => {
    if (id) {
      fetchWorkoutDetails(id);
    }
  }, [id]);

  // Initialize performances state when workout data loads
  useEffect(() => {
    if (selectedWorkout?.workout_exercises) {
      const initialPerformances: { [key: string]: { weight: number; reps: number } } = {};

      selectedWorkout.workout_exercises.forEach(we => {
        // We use the current date as the key for simplicity in this view, 
        // assuming we are editing the "current state" of the workout plan.
        // In a real app, you might want to handle specific dates better.
        // Here we map: workout_exercise_id -> { weight, reps }
        // We look for the MOST RECENT performance record for this item to pre-fill

        if (we.performances && we.performances.length > 0) {
          // Sort by date desc
          const sorted = [...we.performances].sort((a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime());
          const latest = sorted[0];
          initialPerformances[we.id] = { weight: latest.weight || 0, reps: latest.repetitions || 0 };
        } else {
          initialPerformances[we.id] = { weight: 0, reps: 0 };
        }
      });
      setPerformances(initialPerformances);
    }
  }, [selectedWorkout]);

  const handleInputChange = (workoutExerciseId: string, field: 'weight' | 'reps', value: number) => {
    setPerformances(prev => ({
      ...prev,
      [workoutExerciseId]: {
        ...prev[workoutExerciseId],
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const updates = Object.entries(performances).map(([workoutExerciseId, data]) => ({
        workout_exercise_id: workoutExerciseId,
        weight: data.weight,
        repetitions: data.reps,
        record_date: today
      })).filter(p => p.weight > 0 || p.repetitions > 0); // Only save if there's data

      if (updates.length > 0) {
        await saveBulkPerformance(updates);
        alert('Dados salvos com sucesso!');
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Erro ao salvar dados.');
    } finally {
      setSaving(false);
    }
  };

  // Group exercises by name to show weeks side-by-side
  // We need to group workout_exercises that belong to the same "Exercise" but different weeks
  const groupedExercises = useMemo(() => {
    if (!selectedWorkout?.workout_exercises) return [];

    const groups: { [exerciseId: string]: { exercise: any, weeks: any[] } } = {};

    selectedWorkout.workout_exercises.forEach(we => {
      if (!groups[we.exercise_id]) {
        groups[we.exercise_id] = {
          exercise: we.exercises,
          weeks: []
        };
      }
      groups[we.exercise_id].weeks.push(we);
    });

    // Sort weeks within each group
    Object.values(groups).forEach(group => {
      group.weeks.sort((a, b) => a.week_number - b.week_number);
    });

    return Object.values(groups);
  }, [selectedWorkout]);

  if (loading || !selectedWorkout) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-gray-50 z-10 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/treinos')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedWorkout.name || 'Detalhes do Treino'}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(selectedWorkout.start_date), "d MMM", { locale: ptBR })} - {format(new Date(selectedWorkout.end_date), "d MMM, yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 shadow-sm disabled:opacity-50 transition-all font-medium"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Alterações
            </>
          )}
        </button>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {groupedExercises.map(({ exercise, weeks }) => (
          <div key={exercise.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Exercise Info */}
              <div className="lg:w-1/4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                  {exercise.muscle_group}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mt-2">{exercise.name}</h3>
                {exercise.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{exercise.description}</p>
                )}
              </div>

              {/* Weeks Inputs */}
              <div className="flex-1 overflow-x-auto pb-2 lg:pb-0">
                <div className="flex gap-3">
                  {weeks.map((we) => (
                    <WeeklyInput
                      key={we.id}
                      weekNumber={we.week_number}
                      weight={performances[we.id]?.weight}
                      reps={performances[we.id]?.reps}
                      onChange={(field, value) => handleInputChange(we.id, field, value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {groupedExercises.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            Nenhum exercício encontrado neste treino.
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDetails;
