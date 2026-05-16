// src/components/body_metrics/BodyMetricsChart.tsx
import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { bodyMetricTypes } from '../../types';
import type { BodyMetric, BodyMetricType } from '../../types';
import './BodyMetricsChart.css';

interface BodyMetricsChartProps {
  metrics: BodyMetric[];
  fetchBodyMetrics: (metricType: BodyMetricType) => void;
  isLoading: boolean;
}

const BodyMetricsChart: React.FC<BodyMetricsChartProps> = React.memo(
  ({ metrics, fetchBodyMetrics, isLoading }) => {
    const [selectedMetric, setSelectedMetric] =
      useState<BodyMetricType>('weight');

    useEffect(() => {
      if (fetchBodyMetrics) {
        fetchBodyMetrics(selectedMetric);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMetric]);

    const formattedData = metrics.map((metric) => ({
      ...metric,
      recorded_at: new Date(metric.recorded_at).toLocaleDateString(),
    }));

    const handleMetricChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedMetric(e.target.value as BodyMetricType);
    };

    return (
      <div className="body-metrics-chart-container">
        <h3>Progreso de Métricas</h3>
        <div className="chart-filters">
          <label htmlFor="metric-select">Seleccionar Métrica:</label>
          <select
            id="metric-select"
            value={selectedMetric}
            onChange={handleMetricChange}
          >
            {bodyMetricTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <p>Cargando datos...</p>}
        {!isLoading && metrics.length === 0 && (
          <p>No hay datos para esta métrica. ¡Añade algunos registros!</p>
        )}

        {!isLoading && metrics.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="recorded_at" />
              <YAxis
                label={{
                  value: metrics[0]?.unit,
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                name={selectedMetric.replace(/_/g, ' ')}
                stroke="var(--color-primary)"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  }
);

export default BodyMetricsChart;
