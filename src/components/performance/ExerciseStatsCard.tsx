import React from 'react';
import { PerformanceChart } from './PerformanceChart';

interface HistoryData {
  date: string;
  weight: number;
  reps: number;
  week: number;
}

interface ExerciseStatsContentProps {
  history: HistoryData[];
  boundaries?: { name: string; startWeek: number; endWeek: number }[];
}

export const ExerciseStatsContent = ({ history, boundaries }: ExerciseStatsContentProps) => {
  // Calculate stats
  const weights = history.map(h => h.weight).filter(w => w > 0);
  const minWeight = weights.length ? Math.min(...weights) : 0;
  const maxWeight = weights.length ? Math.max(...weights) : 0;
  const avgWeight = weights.length ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : '0';

  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">Evolução de Carga</h4>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
          <span className="text-xs text-gray-500 font-medium block uppercase tracking-wide">Mínimo</span>
          <span className="text-lg font-bold text-gray-900">{minWeight}kg</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
          <span className="text-xs text-gray-500 font-medium block uppercase tracking-wide">Máximo</span>
          <span className="text-lg font-bold text-gray-900">{maxWeight}kg</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
          <span className="text-xs text-gray-500 font-medium block uppercase tracking-wide">Média</span>
          <span className="text-lg font-bold text-gray-900">{avgWeight}kg</span>
        </div>
      </div>

      <PerformanceChart data={history} boundaries={boundaries} />
    </div>
  );
};

interface ExerciseStatsCardProps extends ExerciseStatsContentProps {
  exerciseName: string;
  muscleGroup?: string;
  boundaries?: { name: string; startWeek: number; endWeek: number }[];
}

export const ExerciseStatsCard = ({ history, exerciseName, muscleGroup, boundaries }: ExerciseStatsCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 break-inside-avoid mb-6">
      <div className="mb-6 border-b border-gray-100 pb-4">
        {muscleGroup && (
          <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full mb-2 inline-block">
            {muscleGroup}
          </span>
        )}
        <h3 className="text-xl font-bold text-gray-900">{exerciseName}</h3>
      </div>
      <ExerciseStatsContent history={history} boundaries={boundaries} />
    </div>
  );
};
