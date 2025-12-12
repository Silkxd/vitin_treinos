import React from 'react';
import { Mail, ArrowUpRight, ArrowDownRight, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Student } from '../../types/student';

interface StudentProfileCardProps {
    student: Student | null;
    currentWorkout?: { id: string, name: string } | null;
    mostImproved?: { name: string, value: number } | null;
    leastImproved?: { name: string, value: number } | null;
}

export const StudentProfileCard = ({ student, currentWorkout, mostImproved, leastImproved }: StudentProfileCardProps) => {
    if (!student) return null;

    const initials = student.name.substring(0, 1).toUpperCase();

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                    {initials}
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900 leading-tight">{student.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Membro desde Out 2024</p>
                </div>
            </div>
            <div className="space-y-4">
                {/* Current Workout */}
                <div className="space-y-1">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Treino Atual</span>
                    {currentWorkout ? (
                        <Link to={`/treinos/${currentWorkout.id}`} className="flex items-center gap-2 group">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                                <Dumbbell className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors border-b border-transparent group-hover:border-indigo-600 leading-tight">
                                {currentWorkout.name}
                            </span>
                        </Link>
                    ) : (
                        <div className="text-sm text-gray-400 italic">Sem treino ativo</div>
                    )}
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Most Improved */}
                    <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Melhor Evolução</span>
                        {mostImproved ? (
                            <div>
                                <div className="text-xs font-medium text-gray-800 truncate" title={mostImproved.name}>{mostImproved.name}</div>
                                <div className="flex items-center text-emerald-600 text-xs font-bold gap-0.5">
                                    <ArrowUpRight className="w-3 h-3" />
                                    {mostImproved.value}%
                                </div>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400">-</span>
                        )}
                    </div>

                    {/* Least Improved */}
                    <div className="space-y-1">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Menor Evolução</span>
                        {leastImproved ? (
                            <div>
                                <div className="text-xs font-medium text-gray-800 truncate" title={leastImproved.name}>{leastImproved.name}</div>
                                <div className="flex items-center text-red-600 text-xs font-bold gap-0.5">
                                    <ArrowDownRight className="w-3 h-3" />
                                    {leastImproved.value}%
                                </div>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-400">-</span>
                        )}
                    </div>
                </div>

                <div className="w-full h-px bg-gray-100"></div>

                <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Status</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Ativo
                    </span>
                </div>
            </div>
            <button className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
                <Mail className="w-4 h-4" />
                Enviar Mensagem
            </button>
        </div>
    );
};
