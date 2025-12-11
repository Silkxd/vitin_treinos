import React, { useState } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Exercise } from '../../types/exercise';
import { cn } from '../../lib/utils';

// Draggable Exercise Item (Source)
const DraggableExercise = ({ exercise }: { exercise: Exercise }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `source-${exercise.id}`,
    data: { exercise, type: 'source' },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-white border border-gray-200 rounded-md mb-2 cursor-move hover:border-primary shadow-sm"
    >
      <p className="font-medium text-sm">{exercise.name}</p>
      <p className="text-xs text-gray-500">{exercise.muscle_group}</p>
    </div>
  );
};

// Droppable Week (Target)
const DroppableWeek = ({ weekNumber, exercises, onRemove }: { weekNumber: number, exercises: Exercise[], onRemove: (index: number) => void }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `week-${weekNumber}`,
    data: { weekNumber, type: 'target' },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "p-4 bg-gray-50 rounded-lg border-2 min-h-[150px] transition-colors",
        isOver ? "border-primary bg-primary/5" : "border-dashed border-gray-300"
      )}
    >
      <h3 className="font-semibold text-gray-700 mb-3">Semana {weekNumber}</h3>
      {exercises.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">Arraste exercícios aqui</p>
      ) : (
        <div className="space-y-2">
          {exercises.map((ex, idx) => (
            <div key={`${ex.id}-${idx}`} className="p-2 bg-white rounded border border-gray-200 text-sm flex justify-between items-center group">
              <span>{ex.name}</span>
              <button 
                onClick={() => onRemove(idx)}
                className="text-red-500 opacity-0 group-hover:opacity-100 hover:text-red-700"
              >
                ×
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
    if (event.active.data.current?.type === 'source') {
      setActiveExercise(event.active.data.current.exercise);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.data.current?.type === 'source') {
      const weekId = over.id as string; // week-1
      const weekNum = parseInt(weekId.split('-')[1]);
      const exercise = active.data.current.exercise as Exercise;

      setWeeks(prev => ({
        ...prev,
        [weekNum]: [...(prev[weekNum] || []), exercise]
      }));
    }

    setActiveId(null);
    setActiveExercise(null);
  };

  const removeExerciseFromWeek = (weekNum: number, index: number) => {
    setWeeks(prev => ({
      ...prev,
      [weekNum]: prev[weekNum].filter((_, i) => i !== index)
    }));
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 h-[600px]">
        {/* Sidebar: Exercises */}
        <div className="w-1/3 flex flex-col bg-gray-50 rounded-lg p-4 overflow-hidden border border-gray-200">
          <h3 className="font-bold text-gray-700 mb-4">Exercícios Disponíveis</h3>
          <div className="overflow-y-auto flex-1 pr-2">
            {availableExercises.map(ex => (
              <DraggableExercise key={ex.id} exercise={ex} />
            ))}
          </div>
        </div>

        {/* Main: Weeks */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(weeks).map(weekNum => (
              <DroppableWeek 
                key={weekNum} 
                weekNumber={parseInt(weekNum)} 
                exercises={weeks[parseInt(weekNum)]}
                onRemove={(idx) => removeExerciseFromWeek(parseInt(weekNum), idx)}
              />
            ))}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId && activeExercise ? (
          <div className="p-3 bg-white border border-primary rounded-md shadow-lg opacity-80 w-64">
            <p className="font-medium text-sm">{activeExercise.name}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
