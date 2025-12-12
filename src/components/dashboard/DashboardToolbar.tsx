import React from 'react';
import { Search, ChevronDown, Calendar, Download } from 'lucide-react';
import { Student } from '../../types/student';

interface DashboardToolbarProps {
    students: Student[];
    selectedStudentId: string;
    onSelectStudent: (id: string) => void;
    onExport: () => void;
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}

export const DashboardToolbar = ({ students, selectedStudentId, onSelectStudent, onExport, searchTerm, onSearchChange }: DashboardToolbarProps) => {
    return (
        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg p-2 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center w-full md:w-auto gap-2">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none appearance-none cursor-pointer transition-shadow hover:bg-gray-100"
                        value={selectedStudentId}
                        onChange={(e) => onSelectStudent(e.target.value)}
                    >
                        <option value="">Selecione um aluno na barra...</option>
                        {students.map((student) => (
                            <option key={student.id} value={student.id}>{student.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Search for Overview List */}
                {!selectedStudentId && onSearchChange && (
                    <div className="relative w-full md:w-48">
                        <input
                            type="text"
                            placeholder="Buscar aluno..."
                            className="w-full pl-3 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-shadow"
                            value={searchTerm || ''}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                )}

                {selectedStudentId && (
                    <>
                        <div className="hidden md:flex h-6 w-px bg-gray-200 mx-1"></div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 px-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Aluno Ativo
                        </div>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
                {/* Date Filter Removed */}
                <button
                    onClick={onExport}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <Download className="w-4 h-4" />
                    <span>Exportar</span>
                </button>
            </div>
        </div>
    );
};
