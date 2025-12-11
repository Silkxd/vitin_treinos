import React, { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';
import { useWorkouts } from '../../hooks/useWorkouts';

interface PerformanceInputProps {
  workoutExerciseId: string;
  currentWeight?: number;
  currentReps?: number;
  recordDate: string;
}

export const PerformanceInput = ({ 
  workoutExerciseId, 
  currentWeight = 0, 
  currentReps = 0,
  recordDate 
}: PerformanceInputProps) => {
  const { savePerformance } = useWorkouts();
  const [weight, setWeight] = useState(currentWeight);
  const [reps, setReps] = useState(currentReps);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setWeight(currentWeight);
    setReps(currentReps);
  }, [currentWeight, currentReps]);

  const handleSave = async () => {
    if (weight === 0 && reps === 0) return;
    
    setSaving(true);
    try {
      await savePerformance({
        workout_exercise_id: workoutExerciseId,
        weight,
        repetitions: reps,
        record_date: recordDate
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">Carga (kg)</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="w-20 p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">Reps</label>
        <input
          type="number"
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          className="w-16 p-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-4 p-1.5 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors disabled:opacity-50"
        title="Salvar"
      >
        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
      </button>
    </div>
  );
};
