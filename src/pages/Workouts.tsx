import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, User, Dumbbell } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { clsx } from 'clsx';

export const Workouts = () => {
  const navigate = useNavigate();
  const { workouts, loading, fetchWorkouts } = useWorkouts();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Treinos</h1>
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
          <p className="mt-4 text-gray-500">Carregando treinos...</p>
        </div>
      ) : workouts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treino encontrado</h3>
          <p className="text-gray-500 mb-6">Comece criando um plano de treino para seus alunos.</p>
          <button
            onClick={() => navigate('/treinos/novo')}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Criar primeiro treino
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workouts.map((workout) => (
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
                      {workout.students?.name || 'Aluno desconhecido'}
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
};

export default Workouts;
