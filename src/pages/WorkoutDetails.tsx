import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Calendar, User, Dumbbell, TrendingUp } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { PerformanceInput } from '../components/performance/PerformanceInput';
import { ExerciseStatsContent } from '../components/performance/ExerciseStatsCard';
import { clsx } from 'clsx';

export const WorkoutDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedWorkout, fetchWorkoutDetails, loading } = useWorkouts();
  
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [recordDate, setRecordDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    if (id) {
      fetchWorkoutDetails(id);
    }
  }, [id]);

  // Group exercises by week
  const weeks = useMemo(() => {
    if (!selectedWorkout?.workout_exercises) return {};
    
    const groups: { [key: number]: typeof selectedWorkout.workout_exercises } = {};
    selectedWorkout.workout_exercises.forEach(we => {
      if (!groups[we.week_number]) groups[we.week_number] = [];
      groups[we.week_number].push(we);
    });
    return groups;
  }, [selectedWorkout]);

  // Get unique week numbers
  const weekNumbers = useMemo(() => Object.keys(weeks).map(Number).sort((a, b) => a - b), [weeks]);

  // Set initial active week
  useEffect(() => {
    if (weekNumbers.length > 0 && !weekNumbers.includes(activeWeek)) {
      setActiveWeek(weekNumbers[0]);
    }
  }, [weekNumbers]);

  // Helper to get chart data for a specific exercise across the entire workout
  const getExerciseHistory = (exerciseId: string) => {
    if (!selectedWorkout?.workout_exercises) return [];
    
    const history: { date: string, weight: number, reps: number, week: number }[] = [];
    
    selectedWorkout.workout_exercises.forEach(we => {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/treinos')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedWorkout.students?.name || 'Detalhes do Treino'}
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(selectedWorkout.start_date), "d MMM", { locale: ptBR })} - {format(new Date(selectedWorkout.end_date), "d MMM, yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-xs font-medium text-gray-500 uppercase">Data do Registro:</span>
          <input 
            type="date" 
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            className="text-sm border-none focus:ring-0 text-gray-700 font-medium bg-transparent outline-none"
          />
        </div>
      </div>

      {/* Week Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        {weekNumbers.map(week => (
          <button
            key={week}
            onClick={() => setActiveWeek(week)}
            className={clsx(
              "px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors",
              activeWeek === week 
                ? "bg-primary text-white shadow-sm" 
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            )}
          >
            Semana {week}
          </button>
        ))}
      </div>

      {/* Exercises List */}
      <div className="grid grid-cols-1 gap-6">
        {weeks[activeWeek]?.map((we) => {
          const exercise = we.exercises;
          if (!exercise) return null;

          const history = getExerciseHistory(exercise.id);
          
          // Find performance for the selected date (if any) to pre-fill input
          const currentPerformance = we.performances?.find(p => p.record_date === recordDate);
          
          // Find last record before selected date for comparison
          const sortedHistory = [...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const lastRecord = sortedHistory.find(h => h.date < recordDate);

          const isToday = recordDate === format(new Date(), 'yyyy-MM-dd');
          const dateLabel = isToday ? 'Hoje' : format(new Date(recordDate), 'dd/MM', { locale: ptBR });

          return (
            <div key={we.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Exercise Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
                        {exercise.muscle_group}
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 mt-2">{exercise.name}</h3>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    {exercise.description && <p>{exercise.description}</p>}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Registro de {dateLabel}
                    </h4>
                    <PerformanceInput 
                      workoutExerciseId={we.id}
                      currentWeight={currentPerformance?.weight}
                      currentReps={currentPerformance?.repetitions}
                      recordDate={recordDate}
                    />
                    {lastRecord && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500 flex items-center gap-2">
                        <span>Último registro ({format(new Date(lastRecord.date), 'dd/MM')}):</span>
                        <span className="font-medium text-gray-700">{lastRecord.weight}kg / {lastRecord.reps} reps</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart Section */}
                <div className="w-full md:w-1/2 lg:w-2/5 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <ExerciseStatsContent history={history} />
                </div>
              </div>
            </div>
          );
        })}
        
        {(!weeks[activeWeek] || weeks[activeWeek].length === 0) && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            Nenhum exercício planejado para esta semana.
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutDetails;
