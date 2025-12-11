import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { ExerciseList } from '../components/exercises/ExerciseList';
import { ExerciseForm } from '../components/exercises/ExerciseForm';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { useExercises } from '../hooks/useExercises';
import { Exercise } from '../types/exercise';

export const Exercises = () => {
  const { exercises, loading, fetchExercises, addExercise, updateExercise, deleteExercise } = useExercises();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('');

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const muscleGroups = Array.from(new Set(exercises.map(e => e.muscle_group))).sort();

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedMuscleGroup ? exercise.muscle_group === selectedMuscleGroup : true;
    return matchesSearch && matchesGroup;
  });

  const handleOpenModal = (exercise?: Exercise) => {
    setEditingExercise(exercise);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingExercise(undefined);
    setIsModalOpen(false);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingExercise) {
        await updateExercise(editingExercise.id, data);
      } else {
        await addExercise(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save exercise:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este exercício?')) {
      await deleteExercise(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banco de Exercícios</h1>
          <p className="text-gray-500 mt-1">Gerencie os exercícios disponíveis para os treinos.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Exercício
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Pesquisar exercício..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedMuscleGroup}
            onChange={(e) => setSelectedMuscleGroup(e.target.value)}
          >
            <option value="">Todos os Grupos</option>
            {muscleGroups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      <ExerciseList 
        exercises={filteredExercises} 
        onEdit={handleOpenModal} 
        onDelete={handleDelete}
        isLoading={loading}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
      >
        <ExerciseForm
          initialData={editingExercise}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={loading}
        />
      </Modal>
    </div>
  );
};
