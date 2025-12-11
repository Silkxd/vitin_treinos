import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Exercise } from '../../types/exercise';

const exerciseSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  muscle_group: z.string().min(1, 'Grupo muscular é obrigatório'),
  description: z.string().optional(),
  image_url: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
});

type ExerciseFormData = z.infer<typeof exerciseSchema>;

interface ExerciseFormProps {
  initialData?: Exercise;
  onSubmit: (data: ExerciseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Pernas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Abdômen',
  'Cardio',
  'Outros'
];

export const ExerciseForm = ({ initialData, onSubmit, onCancel, isLoading }: ExerciseFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: initialData?.name || '',
      muscle_group: initialData?.muscle_group || '',
      description: initialData?.description || '',
      image_url: initialData?.image_url || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome do Exercício *"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Grupo Muscular *
        </label>
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register('muscle_group')}
        >
          <option value="">Selecione...</option>
          {MUSCLE_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
        {errors.muscle_group && (
          <p className="text-xs text-red-500">{errors.muscle_group.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Descrição Técnica
        </label>
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          {...register('description')}
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      <Input
        label="URL da Imagem (Opcional)"
        placeholder="https://..."
        error={errors.image_url?.message}
        {...register('image_url')}
      />

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Salvar
        </Button>
      </div>
    </form>
  );
};
