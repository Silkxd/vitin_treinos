import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, User, Dumbbell, ArrowLeft, ChevronRight } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useStudents } from '../hooks/useStudents';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx } from 'clsx';

export const Workouts = () => {
  const navigate = useNavigate();
  const { workouts, loading: loadingWorkouts, fetchWorkouts } = useWorkouts();
  const { students, loading: loadingStudents, fetchStudents } = useStudents();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
    fetchWorkouts();
  }, []);

  const loading = loadingWorkouts || loadingStudents;

  if (selectedStudentId) {
    const student = students.find(s => s.id === selectedStudentId);
    const studentWorkouts = workouts.filter(w => w.student_id === selectedStudentId);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedStudentId(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Treinos de {student?.name}</h1>
              <p className="text-sm text-gray-500">Gerencie os treinos deste aluno</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/treinos/novo')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Treino
          </button>
        </div>

        {studentWorkouts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treino encontrado</h3>
            <p className="text-gray-500 mb-6">Este aluno ainda não possui treinos cadastrados.</p>
            <button
              onClick={() => navigate('/treinos/novo')}
              className="text-primary hover:text-primary/80 font-medium"
            >
              Criar primeiro treino
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentWorkouts.map((workout) => (
              <div 
                key={workout.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/treinos/${workout.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {student?.name}
                      </h3>
                      <span className={clsx(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        workout.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      )}>
                        {workout.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {format(new Date(workout.start_date), "d 'de' MMM", { locale: ptBR })} - {format(new Date(workout.end_date), "d 'de' MMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Treinos por Aluno</h1>
        <button
          onClick={() => navigate('/treinos/novo')}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Treino
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando alunos...</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum aluno encontrado</h3>
          <p className="text-gray-500 mb-6">Cadastre alunos para começar a criar treinos.</p>
          <button
            onClick={() => navigate('/alunos')}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Ir para Alunos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => {
            const studentWorkoutCount = workouts.filter(w => w.student_id === student.id).length;
            const activeWorkout = workouts.find(w => w.student_id === student.id && w.active);
            
            return (
              <div 
                key={student.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelectedStudentId(student.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <User className="h-6 w-6 text-gray-500 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">
                        {studentWorkoutCount} {studentWorkoutCount === 1 ? 'treino' : 'treinos'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                
                {activeWorkout && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Treino ativo: {format(new Date(activeWorkout.start_date), "d MMM", { locale: ptBR })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Workouts;
