import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Users, Dumbbell, Activity, Download, Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStudents } from '../hooks/useStudents';
import { useWorkouts } from '../hooks/useWorkouts';
import { ExerciseStatsCard } from '../components/performance/ExerciseStatsCard';
import { getExerciseHistory } from '../utils/workoutUtils';
import html2canvas from 'html2canvas';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard = ({ title, value, icon: Icon, description, color = 'blue' }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={cn("p-3 rounded-full", colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="text-gray-500">{description}</span>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { students, fetchStudents } = useStudents();
  const { workouts, fetchWorkouts, fetchWorkoutDetails, selectedWorkout } = useWorkouts();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStudents();
    fetchWorkouts();
  }, []);

  // KPIs
  const activeStudents = students.filter(s => s.active !== false).length;
  const activeWorkouts = workouts.filter(w => new Date(w.end_date) >= new Date()).length;
  const totalWorkouts = workouts.length;

  // Handle Student Selection
  useEffect(() => {
    if (selectedStudentId) {
      // Find latest workout for this student
      const studentWorkouts = workouts
        .filter(w => w.student_id === selectedStudentId)
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
      
      if (studentWorkouts.length > 0) {
        fetchWorkoutDetails(studentWorkouts[0].id);
      }
    }
  }, [selectedStudentId, workouts]);

  const handleExport = async () => {
    if (dashboardRef.current) {
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#f9fafb', // Match dashboard background
        scale: 2, // Better quality
      });
      const link = document.createElement('a');
      link.download = `relatorio-desempenho-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Group exercises by ID to show unique charts
  const uniqueExercises = useMemo(() => {
    if (!selectedWorkout?.workout_exercises) return [];
    
    const seen = new Set();
    const unique: any[] = [];
    
    // Sort by order first to maintain some order
    const sortedExercises = [...selectedWorkout.workout_exercises].sort((a, b) => a.order_index - b.order_index);

    sortedExercises.forEach(we => {
        if (!seen.has(we.exercise_id)) {
            seen.add(we.exercise_id);
            unique.push(we);
        }
    });
    return unique;
  }, [selectedWorkout]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Resumo geral e acompanhamento de alunos.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Alunos Ativos" 
          value={activeStudents} 
          icon={Users} 
          description="Alunos cadastrados e ativos"
          color="blue"
        />
        <StatCard 
          title="Treinos Ativos" 
          value={activeWorkouts} 
          icon={Dumbbell} 
          description="Planos de treino em vigência"
          color="green"
        />
        <StatCard 
          title="Total de Treinos" 
          value={totalWorkouts} 
          icon={Activity} 
          description="Histórico total de treinos criados"
          color="purple"
        />
      </div>

      {/* Student Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um Aluno para ver o desempenho</label>
            <div className="relative">
              <select
                className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Selecione um aluno...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </div>
          </div>

          {selectedStudentId && selectedWorkout && (
            <button
              onClick={handleExport}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Exportar Relatório
            </button>
          )}
        </div>

        {selectedStudentId && !selectedWorkout && (
           <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
             Este aluno não possui treinos registrados.
           </div>
        )}

        {/* Charts Section (Exportable) */}
        {selectedStudentId && selectedWorkout && (
          <div ref={dashboardRef} className="bg-gray-50/50 p-4 rounded-xl">
             <div className="mb-6 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900">
                  Desempenho: {selectedWorkout.students?.name}
                </h2>
                <p className="text-sm text-gray-500">
                  Último treino iniciado em {new Date(selectedWorkout.start_date).toLocaleDateString('pt-BR')}
                </p>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {uniqueExercises.map((we) => {
                 const history = getExerciseHistory(selectedWorkout, we.exercise_id);
                 return (
                   <ExerciseStatsCard 
                     key={we.exercise_id}
                     history={history}
                     exerciseName={we.exercises?.name}
                     muscleGroup={we.exercises?.muscle_group}
                   />
                 );
               })}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
