// src/components/charts/ExerciseVolumeChart.tsx
import React, { useState, useEffect } from 'react';
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
import { useWorkoutLogs } from '../../hooks/useWorkoutLogs';
import type { Exercise } from '../../types';
import { supabase } from '../../supabaseClient';
import './ExerciseVolumeChart.css';

interface ExerciseVolumeChartProps {
  userId: string;
}

const ExerciseVolumeChart: React.FC<ExerciseVolumeChartProps> = React.memo(
  ({ userId }) => {
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
      null
    );
    const { logs, loading, fetchWorkoutLogs } = useWorkoutLogs();

    useEffect(() => {
      const fetchUserExercises = async () => {
        // First, get distinct exercise IDs from user's logs
        const { data: logData, error: logError } = await supabase
          .from('workout_logs')
          .select('exercise_id')
          .eq('user_id', userId);

        if (logError || !logData) {
          console.error('Error fetching user workout logs:', logError);
          return;
        }

        const uniqueExerciseIds = [
          ...new Set(logData.map((log) => log.exercise_id).filter(id => id !== null)), // Filter out nulls
        ];

        if (uniqueExerciseIds.length === 0) return;

        // Then, fetch the details of those exercises
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('*')
          .in('id', uniqueExerciseIds);

        if (exerciseError) {
          console.error('Error fetching exercises:', exerciseError);
          return;
        }

        if (exerciseData) {
          setExercises(exerciseData);
          if (exerciseData.length > 0) {
            setSelectedExerciseId(exerciseData[0].id);
          }
        }
      };

      if (userId) {
        fetchUserExercises();
      }
    }, [userId]);

    useEffect(() => {
      if (userId && selectedExerciseId) {
        fetchWorkoutLogs(userId, selectedExerciseId);
      }
    }, [userId, selectedExerciseId, fetchWorkoutLogs]);

    const formattedData = logs.map((log) => ({
      ...log,
      date: new Date(log.created_at!).toLocaleDateString(),
    }));

    const selectedExerciseName =
      exercises.find((ex) => ex.id === selectedExerciseId)?.name || '';

    return (
      <div className="exercise-volume-chart-container">
        <h4>Progreso de Volumen por Ejercicio</h4>
        <div className="chart-filters">
          <label htmlFor="exercise-select">Seleccionar Ejercicio:</label>
          <select
            id="exercise-select"
            value={selectedExerciseId || ''}
            onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
            disabled={exercises.length === 0}
          >
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </select>
        </div>

        {loading && <p>Cargando datos del gráfico...</p>}
        {!loading && logs.length === 0 && (
          <p>No hay datos de volumen para este ejercicio.</p>
        )}

        {!loading && logs.length > 0 && (
          <div style={{ width: '100%', height: '300px', overflow: 'hidden' }}>
            {' '}
            {/* Fixed height wrapper with overflow hidden */}
            <ResponsiveContainer width="100%">
              <LineChart
                data={formattedData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" />
                <YAxis /* Removed label prop */ />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="volume"
                  name={selectedExerciseName}
                  stroke="var(--color-accent)"
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }
);

export default ExerciseVolumeChart;
