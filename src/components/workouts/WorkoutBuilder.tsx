import React, { useState, useMemo } from 'react';
import { Search, Plus, Copy, Trash2, CheckCircle2 } from 'lucide-react';
import { Exercise } from '../../types/exercise';
import { cn } from '../../lib/utils';

// Exercise Item in Sidebar
const ExerciseItem = ({ 
  exercise, 
  onAdd 
}: { 
  exercise: Exercise; 
  onAdd: (exercise: Exercise) => void; 
}) => {
  return (
    <div
      onClick={() => onAdd(exercise)}
      className="p-3 bg-white border border-gray-200 rounded-md mb-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group flex justify-between items-center shadow-sm"
    >
      <div>
        <p className="font-medium text-sm text-gray-900">{exercise.name}</p>
        <p className="text-xs text-gray-500">{exercise.muscle_group}</p>
      </div>
      <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
    </div>
  );
};

// Selectable Week Card
const WeekCard = ({ 
  weekNumber, 
  exercises, 
  isSelected, 
  onSelect, 
  onRemoveExercise 
}: { 
  weekNumber: number; 
  exercises: Exercise[]; 
  isSelected: boolean; 
  onSelect: () => void; 
  onRemoveExercise: (index: number) => void; 
}) => {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-4 rounded-lg border-2 min-h-[200px] transition-all cursor-pointer relative",
        isSelected 
          ? "border-primary bg-primary/5 ring-2 ring-primary/20 ring-offset-2" 
          : "border-gray-200 bg-gray-50 hover:border-gray-300"
      )}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className={cn(
          "font-semibold",
          isSelected ? "text-primary" : "text-gray-700"
        )}>
          Semana {weekNumber}
        </h3>
        {isSelected && (
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Selecionada
          </span>
        )}
      </div>

      {exercises.length === 0 ? (
        <div className="h-32 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm">Clique para selecionar</p>
          <p className="text-xs mt-1">Adicione exercícios da lista</p>
        </div>
      ) : (
        <div className="space-y-2">
          {exercises.map((ex, idx) => (
            <div 
              key={`${ex.id}-${idx}`} 
              className="p-2 bg-white rounded border border-gray-200 text-sm flex justify-between items-center group shadow-sm hover:border-red-200 transition-colors"
            >
              <div className="flex-1 truncate mr-2">
                <span className="font-medium text-gray-700">{ex.name}</span>
                <span className="text-xs text-gray-400 block">{ex.muscle_group}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveExercise(idx);
                }}
                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                title="Remover exercício"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface WorkoutBuilderProps {
  availableExercises: Exercise[];
  weeks: { [key: number]: Exercise[] };
  setWeeks: React.Dispatch<React.SetStateAction<{ [key: number]: Exercise[] }>>;
}

export const WorkoutBuilder = ({ availableExercises, weeks, setWeeks }: WorkoutBuilderProps) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('all');

  // Filter exercises based on search and muscle group
  const filteredExercises = useMemo(() => {
    return availableExercises.filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGroup = selectedMuscleGroup === 'all' || ex.muscle_group === selectedMuscleGroup;
      return matchesSearch && matchesGroup;
    });
  }, [availableExercises, searchTerm, selectedMuscleGroup]);

  // Get unique muscle groups for filter
  const muscleGroups = useMemo(() => {
    const groups = new Set(availableExercises.map(ex => ex.muscle_group));
    return ['all', ...Array.from(groups).sort()];
  }, [availableExercises]);

  const addExerciseToWeek = (exercise: Exercise) => {
    if (!selectedWeek) return;

    setWeeks(prev => ({
      ...prev,
      [selectedWeek]: [...(prev[selectedWeek] || []), exercise]
    }));
  };

  const removeExerciseFromWeek = (weekNum: number, index: number) => {
    setWeeks(prev => ({
      ...prev,
      [weekNum]: prev[weekNum].filter((_, i) => i !== index)
    }));
  };

  const cloneWeekOne = () => {
    if (window.confirm('Isso substituirá os exercícios das outras semanas pelos da Semana 1. Deseja continuar?')) {
      const weekOneExercises = weeks[1] || [];
      
      setWeeks(prev => {
        const newWeeks = { ...prev };
        Object.keys(newWeeks).forEach(key => {
          const weekNum = parseInt(key);
          if (weekNum !== 1) {
            newWeeks[weekNum] = [...weekOneExercises];
          }
        });
        return newWeeks;
      });
    }
  };

  return (
    <div className="flex gap-6 h-[600px]">
      {/* Sidebar: Exercises */}
      <div className="w-1/3 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50">
          <h3 className="font-bold text-gray-800">Exercícios</h3>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Muscle Group Filter */}
          <select 
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
            className="w-full p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          >
            <option value="all">Todos os grupos musculares</option>
            {muscleGroups.filter(g => g !== 'all').map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 bg-gray-50/50">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhum exercício encontrado.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredExercises.map(ex => (
                <ExerciseItem 
                  key={ex.id} 
                  exercise={ex} 
                  onAdd={addExerciseToWeek}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main: Weeks */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Selecione uma semana abaixo e clique nos exercícios ao lado para adicionar.
          </p>
          <button
            onClick={cloneWeekOne}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
            title="Copiar exercícios da Semana 1 para todas as outras semanas"
          >
            <Copy className="w-4 h-4" />
            Clonar Semana 1
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
            {Object.keys(weeks).map(weekNum => (
              <WeekCard 
                key={weekNum} 
                weekNumber={parseInt(weekNum)} 
                exercises={weeks[parseInt(weekNum)]}
                isSelected={selectedWeek === parseInt(weekNum)}
                onSelect={() => setSelectedWeek(parseInt(weekNum))}
                onRemoveExercise={(idx) => removeExerciseFromWeek(parseInt(weekNum), idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
