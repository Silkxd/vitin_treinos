import React from 'react';
import { Pencil, Trash2, Dumbbell } from 'lucide-react';
import { Button } from '../common/Button';
import { Exercise } from '../../types/exercise';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
}

export const ExerciseCard = ({ exercise, onEdit, onDelete }: ExerciseCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="h-40 bg-gray-100 flex items-center justify-center relative">
        {exercise.image_url ? (
          <img 
            src={exercise.image_url} 
            alt={exercise.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <Dumbbell className="h-12 w-12 text-gray-300" />
        )}
        <div className="absolute top-2 right-2 flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/80 hover:bg-white text-gray-700 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(exercise);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/80 hover:bg-white text-red-600 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(exercise.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{exercise.name}</h3>
        </div>
        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md mb-2 self-start">
          {exercise.muscle_group}
        </span>
        <p className="text-sm text-gray-500 line-clamp-2 flex-1">
          {exercise.description || 'Sem descrição.'}
        </p>
      </div>
    </div>
  );
};
