import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChartData {
  date: string;
  weight: number;
  week?: number;
}

interface PerformanceChartProps {
  data: ChartData[];
}

export const PerformanceChart = ({ data }: PerformanceChartProps) => {
  if (!data || data.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded bg-gray-50">
        Dados insuficientes para gráfico
      </div>
    );
  }

  // Sort by week if available, otherwise by date
  const sortedData = [...data].sort((a, b) => {
    if (a.week && b.week && a.week !== b.week) return a.week - b.week;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sortedData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="week" 
            tickFormatter={(value) => `Sem ${value}`}
            stroke="#9ca3af"
            tick={{ fontSize: 10 }}
            tickMargin={10}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis 
            yAxisId="left" 
            stroke="#9ca3af" 
            tick={{ fontSize: 10 }}
            label={{ value: 'kg', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#9ca3af' }}
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            labelFormatter={(value, payload) => {
              if (payload && payload.length > 0) {
                 const dataPoint = payload[0].payload;
                 return `Semana ${dataPoint.week}`;
              }
              return '';
            }}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="weight" 
            stroke="#2563eb" 
            strokeWidth={2}
            name="Carga"
            dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
            activeDot={{ r: 6, fill: '#2563eb' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
