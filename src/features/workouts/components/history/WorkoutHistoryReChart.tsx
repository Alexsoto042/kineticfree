// src/components/workout_history/WorkoutHistoryReChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface WorkoutHistoryReChartProps {
  chartData: any;
  chartType: 'line' | 'bar';
}

const WorkoutHistoryReChart: React.FC<WorkoutHistoryReChartProps> = ({ chartData, chartType }) => {
  if (!chartData || !chartData.datasets || chartData.datasets.length === 0) {
    return <p>No hay datos para mostrar en el gráfico.</p>;
  }

  const ChartComponent = chartType === 'line' ? LineChart : BarChart;
  const ChartElement = chartType === 'line' ? Line : Bar;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ChartComponent data={chartData.data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {chartData.datasets.map((dataset: any, index: number) => (
          <ChartElement
            key={index}
            dataKey={dataset.label}
            fill={dataset.backgroundColor}
            stroke={dataset.borderColor}
          />
        ))}
      </ChartComponent>
    </ResponsiveContainer>
  );
};

export default WorkoutHistoryReChart;
