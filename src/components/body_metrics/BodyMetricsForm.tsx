// src/components/body_metrics/BodyMetricsForm.tsx
import React, { useState } from 'react';
import {
  bodyMetricTypes,
  weightUnits,
  bodyFatUnit,
  muscleMassUnits,
  waistCircumferenceUnits,
} from '../../types';
import type {
  BodyMetricInsert,
  BodyMetricType,
  BodyMetricUnit,
} from '../../types';
import './BodyMetricsForm.css';

interface BodyMetricsFormProps {
  addBodyMetric: (metric: BodyMetricInsert) => Promise<void>;
  isLoading: boolean;
}

const unitsForMetric: Record<BodyMetricType, readonly BodyMetricUnit[]> = {
  weight: weightUnits,
  body_fat_percentage: bodyFatUnit,
  muscle_mass: muscleMassUnits,
  waist_circumference: waistCircumferenceUnits,
};

const metricLabels: Record<BodyMetricType, string> = {
  weight: 'Peso Corporal',
  body_fat_percentage: 'Porcentaje de Grasa Corporal',
  muscle_mass: 'Masa Muscular',
  waist_circumference: 'Circunferencia de Cintura',
};

const metricDescriptions: Record<BodyMetricType, string> = {
  weight: 'Registra tu peso actual para seguir tu progreso a lo largo del tiempo',
  body_fat_percentage: 'Mide tu porcentaje de grasa corporal con una báscula de bioimpedancia o cáliper',
  muscle_mass: 'Registra tu masa muscular para ver cómo aumenta con tu entrenamiento',
  waist_circumference: 'Mide tu cintura en el punto más estrecho, generalmente a la altura del ombligo',
};

const metricPlaceholders: Record<BodyMetricType, string> = {
  weight: 'Ej: 75.5',
  body_fat_percentage: 'Ej: 18.5',
  muscle_mass: 'Ej: 45.0',
  waist_circumference: 'Ej: 85.0',
};

const BodyMetricsForm: React.FC<BodyMetricsFormProps> = React.memo(
  ({ addBodyMetric, isLoading }) => {
    const [metricType, setMetricType] = useState<BodyMetricType>('weight');
    const [value, setValue] = useState<string>('');
    const [unit, setUnit] = useState<BodyMetricUnit>(
      unitsForMetric[metricType][0]
    );
    const [error, setError] = useState<string>('');

    const handleMetricTypeChange = (
      e: React.ChangeEvent<HTMLSelectElement>
    ) => {
      const newMetricType = e.target.value as BodyMetricType;
      setMetricType(newMetricType);
      setUnit(unitsForMetric[newMetricType][0]); // Reset unit to the default for the new type
      setValue(''); // Clear value when changing metric type
      setError(''); // Clear any errors
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!value || isNaN(parseFloat(value))) {
        setError('Por favor ingresa un valor numérico válido.');
        return;
      }
      
      const numValue = parseFloat(value);
      if (numValue <= 0) {
        setError('El valor debe ser mayor a 0.');
        return;
      }

      // Validaciones específicas por tipo de métrica
      if (metricType === 'body_fat_percentage' && (numValue < 3 || numValue > 50)) {
        setError('El porcentaje de grasa corporal debe estar entre 3% y 50%.');
        return;
      }

      setError('');

      const newMetric: BodyMetricInsert = {
        metric_type: metricType,
        value: numValue,
        unit,
      };

      await addBodyMetric(newMetric);
      setValue(''); // Reset value after submission
    };

    return (
      <form onSubmit={handleSubmit} className="body-metrics-form">
        <div className="form-header">
          <h3>Registrar Métrica Corporal</h3>
          <p className="form-description">
            Lleva un seguimiento de tus métricas corporales para monitorear tu progreso
          </p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="metricType">Tipo de Métrica</label>
          <select
            id="metricType"
            value={metricType}
            onChange={handleMetricTypeChange}
          >
            {bodyMetricTypes.map((type) => (
              <option key={type} value={type}>
                {metricLabels[type]}
              </option>
            ))}
          </select>
          <p className="metric-description">{metricDescriptions[metricType]}</p>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="value">Valor</label>
            <input
              id="value"
              type="number"
              step="0.1"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={metricPlaceholders[metricType]}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="unit">Unidad</label>
            <select
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as BodyMetricUnit)}
            >
              {unitsForMetric[metricType].map((unitOption) => (
                <option key={unitOption} value={unitOption}>
                  {unitOption}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? 'Guardando...' : 'Guardar Métrica'}
        </button>
      </form>
    );
  }
);

export default BodyMetricsForm;
