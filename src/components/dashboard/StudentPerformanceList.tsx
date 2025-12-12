import React, { useState } from 'react';
import { Student } from '../../types/student';
import { Workout } from '../../types/workout';
import { ArrowUpRight, ArrowDownRight, Minus, Dumbbell, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAggregateExerciseHistory } from '../../utils/workoutUtils';

interface StudentPerformanceListProps {
    students: Student[];
    workouts: Workout[];
    onSelectStudent: (id: string) => void;
}

// Internal Component for individual card state (Pagination)
const StudentPerformanceCard = ({ student, stats, onSelect }: { student: Student, stats: any[], onSelect: () => void }) => {
    const [page, setPage] = useState(0);
    const ITEMS_PER_PAGE = 6;

    const totalPages = Math.ceil(stats.length / ITEMS_PER_PAGE);
    const currentExercises = stats.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const nextPage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (page < totalPages - 1) setPage(p => p + 1);
    };

    const prevPage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (page > 0) setPage(p => p - 1);
    };

    const hasWorkouts = stats.length > 0;

    return (
        <div
            onClick={onSelect}
            className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow cursor-pointer group h-[420px]"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gray-50/30">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{student.name}</h3>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${hasWorkouts ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                        {hasWorkouts ? `${stats.length} Exercícios` : 'Sem registros'}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-0">
                    {stats.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10 text-[10px] uppercase text-gray-500 font-semibold tracking-wider">
                                <tr>
                                    <th className="px-4 py-2 border-b border-gray-100 w-[40%]">Exercício</th>
                                    <th className="px-2 py-2 border-b border-gray-100 text-center w-[15%]">Mín</th>
                                    <th className="px-2 py-2 border-b border-gray-100 text-center w-[15%]">Méd</th>
                                    <th className="px-2 py-2 border-b border-gray-100 text-center w-[15%]">Rec</th>
                                    <th className="px-2 py-2 border-b border-gray-100 text-center w-[15%]">Evo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentExercises.map((ex: any) => {
                                    const isPos = ex.evolution > 0;
                                    const isNeg = ex.evolution < 0;
                                    const EvoColor = isPos ? 'text-emerald-600' : isNeg ? 'text-red-600' : 'text-gray-400';
                                    const EvoIcon = isPos ? ArrowUpRight : isNeg ? ArrowDownRight : Minus;

                                    return (
                                        <tr key={ex.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="px-4 py-3 text-xs font-medium text-gray-900 line-clamp-1" title={ex.name}>
                                                {ex.name}
                                            </td>
                                            <td className="px-2 py-3 text-xs text-center text-gray-500">
                                                {ex.min}
                                            </td>
                                            <td className="px-2 py-3 text-xs text-center text-gray-600">
                                                {ex.avg}
                                            </td>
                                            <td className="px-2 py-3 text-xs text-center font-semibold text-gray-900">
                                                {ex.max}
                                            </td>
                                            <td className={`px-2 py-3 text-xs text-right font-bold ${EvoColor}`}>
                                                <div className="flex items-center justify-end gap-0.5">
                                                    {isPos && '+'}{ex.evolution}%
                                                    <EvoIcon className="w-3 h-3" />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm p-6 text-center">
                            <Dumbbell className="w-8 h-8 mb-2 opacity-20" />
                            Nenhum exercício registrado.
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <button
                            onClick={prevPage}
                            disabled={page === 0}
                            className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-[10px] font-medium text-gray-400">
                            Página {page + 1} de {totalPages}
                        </span>
                        <button
                            onClick={nextPage}
                            disabled={page === totalPages - 1}
                            className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const StudentPerformanceList = ({ students, workouts, onSelectStudent }: StudentPerformanceListProps) => {

    const getStudentExercisesStats = (studentId: string) => {
        // Filter workouts for this student
        const studentWorkouts = workouts.filter(w => w.student_id === studentId);

        // Find all unique exercises first: Map<ExerciseID, ExerciseName>
        const uniqueExerciseIds = new Map<string, string>();
        studentWorkouts.forEach(w => {
            w.workout_exercises?.forEach(we => {
                if (we.performances && we.performances.length > 0 && we.exercises) {
                    uniqueExerciseIds.set(we.exercise_id, we.exercises.name);
                }
            });
        });

        const exercisesStats: any[] = [];

        // Calculate stats using the CENTRALIZED utility used by Charts
        uniqueExerciseIds.forEach((name, id) => {
            const { history } = getAggregateExerciseHistory(studentWorkouts, id);

            if (history.length > 0) {
                // history contains { date, weight, reps, week } points (Weekly Max)
                const weights = history.map(h => h.weight);
                const min = Math.min(...weights);
                const max = Math.max(...weights);
                const avg = Math.round(weights.reduce((a, b) => a + b, 0) / weights.length);

                let evolution = 0;
                if (history.length > 1) {
                    const first = weights[0];
                    const last = weights[weights.length - 1];
                    if (first > 0) {
                        evolution = Math.round(((last - first) / first) * 100);
                    }
                }

                exercisesStats.push({
                    id,
                    name,
                    min,
                    max,
                    avg,
                    evolution
                });
            }
        });

        // Sort by Name
        return exercisesStats.sort((a, b) => a.name.localeCompare(b.name));
    };

    const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedStudents.map(student => {
                const exercisesStats = getStudentExercisesStats(student.id);
                return (
                    <StudentPerformanceCard
                        key={student.id}
                        student={student}
                        stats={exercisesStats}
                        onSelect={() => onSelectStudent(student.id)}
                    />
                );
            })}
        </div>
    );
};
