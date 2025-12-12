import React, { useState } from 'react';
import { Check, Dumbbell, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { Workout } from '../../types/workout';

interface RecentHistoryListProps {
    history: Workout[];
}

export const RecentHistoryList = ({ history }: RecentHistoryListProps) => {
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    // Show only last 5
    const recentWorkouts = history ? history.slice(0, 5) : [];

    if (selectedWorkout) {
        // Prepare exercises list (unique by exercise_id + week separation if needed, but for summary let's just list unique exercises)
        const uniqueExercises = new Map();
        selectedWorkout.workout_exercises?.forEach(we => {
            if (we.exercises && !uniqueExercises.has(we.exercise_id)) {
                uniqueExercises.set(we.exercise_id, we.exercises);
            }
        });
        const exercisesList = Array.from(uniqueExercises.values());

        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <button
                        onClick={() => setSelectedWorkout(null)}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{selectedWorkout.name}</h3>
                        <p className="text-xs text-gray-500">{new Date(selectedWorkout.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
                <div className="overflow-y-auto max-h-[300px] p-2 space-y-1">
                    {exercisesList.length > 0 ? (
                        exercisesList.map((ex) => (
                            <div key={ex.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                                    <Dumbbell className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-900">{ex.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">{ex.muscle_group}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                            Nenhum exercício registrado neste treino.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Histórico Recente</h3>
                <button className="text-xs font-medium text-blue-600 hover:text-blue-700">Ver tudo</button>
            </div>
            <div className="divide-y divide-gray-100">
                {recentWorkouts.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                        Nenhum histórico recente.
                    </div>
                ) : (
                    recentWorkouts.map((workout) => (
                        <div
                            key={workout.id}
                            onClick={() => setSelectedWorkout(workout)}
                            className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-gray-50 text-gray-400 flex items-center justify-center border border-gray-100">
                                    <Dumbbell className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{workout.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(workout.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
