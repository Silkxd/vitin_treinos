import React from 'react';
import { ChevronRight, Bell } from 'lucide-react';

export const DashboardHeader = () => {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">Visão Geral</h1>
            </div>

            {/* Notification & Profile removed */}
            <div></div>
        </div>
    );
};
