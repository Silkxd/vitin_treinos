import React from 'react';
import { Exercise } from '../../types/exercise';
import { ExerciseCard } from './ExerciseCard';

interface ExerciseListProps {
  exercises: Exercise[];
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const ExerciseList = ({ exercises, onEdit, onDelete, isLoading }: ExerciseListProps) => {
  if (isLoading) {
    return <div className="text-center py-10">Carregando exercícios...</div>;
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        Nenhum exercício cadastrado.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
