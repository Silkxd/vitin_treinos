import React from 'react';
import { Users, Dumbbell, Calendar, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  trendUp?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const StatCard = ({ title: titleProp, value, icon: Icon, description, trend, trendUp, color = 'blue' }: StatCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{titleProp}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={cn("p-3 rounded-full", colorClasses[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {trend && (
          <span className={cn("font-medium", trendUp ? "text-green-600" : "text-red-600")}>
            {trend}
          </span>
        )}
        <span className="text-gray-500 ml-2">{description}</span>
      </div>
    </div>
  );
};

export const Dashboard = () => {
  // In a real app, these would come from an API/Supabase
  const stats = [
    {
      title: 'Alunos Ativos',
      value: '12',
      icon: Users,
      description: 'Total de alunos cadastrados',
      trend: '+2 esse mês',
      trendUp: true,
      color: 'blue' as const,
    },
    {
      title: 'Treinos Ativos',
      value: '8',
      icon: Dumbbell,
      description: 'Treinos em andamento',
      color: 'green' as const,
    },
    {
      title: 'Aulas na Semana',
      value: '24',
      icon: Calendar,
      description: 'Agendamentos previstos',
      color: 'purple' as const,
    },
    {
      title: 'Desempenho',
      value: '95%',
      icon: Activity,
      description: 'Taxa de conclusão de treinos',
      trend: '+5%',
      trendUp: true,
      color: 'orange' as const,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bem-vindo de volta! Aqui está o resumo de hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Placeholder for Charts/Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução de Alunos</h3>
          <div className="h-full flex items-center justify-center text-gray-400">
            Gráfico de evolução aqui
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[300px]">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Treinos</h3>
          <div className="h-full flex items-center justify-center text-gray-400">
            Lista de atividades aqui
          </div>
        </div>
      </div>
    </div>
  );
};
