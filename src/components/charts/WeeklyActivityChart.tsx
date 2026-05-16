// src/components/charts/WeeklyActivityChart.tsx
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
export interface WeeklyActivityData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface WeeklyActivityChartProps {
  data: WeeklyActivityData | null;
}


const WeeklyActivityChart: React.FC<WeeklyActivityChartProps> = ({ data }) => {
  if (!data) {
    return <p>No hay datos de actividad semanal.</p>;
  }

  const chartData = data.labels?.map((label, index) => ({
    name: label,
    Entrenamientos: data.datasets[0].data[index],
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Entrenamientos" fill="var(--color-primary)" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeeklyActivityChart;
