import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface HistoryData {
    date: string;
    weight: number;
    reps: number;
    week: number;
}

interface ExerciseChartCardProps {
    exerciseName: string;
    muscleGroup?: string;
    history: HistoryData[];
}

export const ExerciseChartCard = ({ exerciseName, muscleGroup, history }: ExerciseChartCardProps) => {
    // Logic from ExerciseStatsCard but adapted for new UI
    const { avgWeight, maxWeight, minWeight, evolution, sortedHistory } = useMemo(() => {
        if (!history || history.length === 0) {
            return { avgWeight: 0, maxWeight: 0, minWeight: 0, evolution: 0, sortedHistory: [] };
        }

        const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const weights = sorted.map(h => h.weight);

        // Average
        const sum = weights.reduce((acc, curr) => acc + curr, 0);
        const avg = Math.round(sum / weights.length);

        // Record
        const max = Math.max(...weights);
        const min = Math.min(...weights);

        // Evolution (Last vs First)
        const first = weights[0];
        const last = weights[weights.length - 1];
        const evo = first > 0 ? ((last - first) / first) * 100 : 0;

        return { avgWeight: avg, maxWeight: max, minWeight: min, evolution: Math.round(evo), sortedHistory: sorted };
    }, [history]);

    const evolutionColor = evolution > 0 ? 'text-emerald-600' : evolution < 0 ? 'text-red-600' : 'text-gray-500';
    const EvolutionIcon = evolution > 0 ? ArrowUpRight : evolution < 0 ? ArrowDownRight : Minus;

    // Chart Color Logic
    const chartColor = evolution > 0 ? '#059669' : evolution < 0 ? '#DC2626' : '#2563EB'; // emerald-600, red-600, blue-600

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-[0px_2px_8px_rgba(0,0,0,0.04)]">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900">{exerciseName}</h3>
                        {muscleGroup && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide">
                                {muscleGroup}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">Evolução de carga</p>
                </div>

                {/* Mini Stats Summary */}
                <div className="flex gap-6 text-right">
                    <div>
                        <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-medium">Mínimo</span>
                        <span className="block text-lg font-semibold text-gray-900">{minWeight}kg</span>
                    </div>
                    <div>
                        <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-medium">Média</span>
                        <span className="block text-lg font-semibold text-gray-900">{avgWeight}kg</span>
                    </div>
                    <div>
                        <span className="block text-[10px] uppercase tracking-wider text-gray-400 font-medium">Recorde</span>
                        <span className="block text-lg font-semibold text-gray-900">{maxWeight}kg</span>
                    </div>
                    <div className={evolutionColor}>
                        <div className="group relative">
                            <span className="block text-[10px] uppercase tracking-wider font-medium opacity-80 border-b border-dotted border-current cursor-help mb-0.5 w-fit ml-auto">Evolução</span>
                            <div className="invisible group-hover:visible absolute bottom-full right-0 mb-2 w-56 bg-gray-900 text-white text-[11px] p-2 rounded-lg shadow-xl z-50 normal-case font-normal text-left leading-relaxed">
                                Representa o crescimento percentual entre a carga inicial (primeiro registro) e a carga atual (último registro).
                                <div className="absolute top-full right-2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                        </div>
                        <span className="block text-lg font-semibold flex justify-end items-center gap-1">
                            {evolution > 0 && '+'}{evolution}% <EvolutionIcon className="w-3 h-3" />
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-6 relative">
                <div className="h-64 w-full relative group overflow-hidden rounded-b-xl">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sortedHistory}>
                            <defs>
                                <linearGradient id={`colorGradient-${exerciseName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.2} />
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="week"
                                tickFormatter={(val) => `Sem ${val}`}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#9CA3AF' }}
                                dy={10}
                            />
                            <YAxis
                                hide={false}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                tickFormatter={(val) => `${val}`}
                                width={30}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelFormatter={(label) => `Semana ${label}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="weight"
                                stroke={chartColor}
                                fillOpacity={1}
                                fill={`url(#colorGradient-${exerciseName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')})`}
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};
