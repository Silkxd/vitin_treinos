import React from 'react';
import { Users, Dumbbell, Activity, ArrowUpRight } from 'lucide-react';

interface GlobalStatsRowProps {
    activeStudents: number;
    activeWorkouts: number;
}

export const GlobalStatsRow = ({ activeStudents, activeWorkouts }: GlobalStatsRowProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Stat 1 */}
            <div className="bg-white p-6 hover:bg-gray-50/50 transition-colors group cursor-default">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Alunos Ativos</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        +1 novo
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-gray-900 tracking-tight">{activeStudents}</span>
                    <span className="text-sm text-gray-400">total</span>
                </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white p-6 hover:bg-gray-50/50 transition-colors group cursor-default">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Dumbbell className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Treinos Vigentes</span>
                    </div>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-gray-900 tracking-tight">{activeWorkouts}</span>
                    <span className="text-sm text-gray-400">planos</span>
                </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white p-6 hover:bg-gray-50/50 transition-colors group cursor-default">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wider">Taxa de Conclusão</span>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        Esta semana
                    </span>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-gray-900 tracking-tight">85%</span>
                    <span className="text-sm text-emerald-600 font-medium flex items-center">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" /> 12%
                    </span>
                </div>
            </div>
        </div>
    );
};
