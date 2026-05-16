import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import type { WorkoutLog } from '../types';
import { Tabs, Tab } from '../components/ui/Tabs';
import WorkoutHistoryFilters from '../components/workout_history/WorkoutHistoryFilters';
import WorkoutHistoryList from '../components/workout_history/WorkoutHistoryList';
import WorkoutHistoryReChart from '../components/workout_history/WorkoutHistoryReChart';
import './WorkoutHistory.css';

interface WorkoutLogDisplay extends WorkoutLog {
  exercise_name?: string;
  routine_name?: string;
}

function WorkoutHistory() {
  const [allWorkoutLogs, setAllWorkoutLogs] = useState<WorkoutLogDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercisesData, setExercisesData] = useState<
    { id: number; name: string }[]
  >([]);
  const [routinesData, setRoutinesData] = useState<
    { id: number; name: string }[]
  >([]);

  // Filter states
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | 'all'>(
    'all'
  );
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | 'all'>(
    'all'
  );
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Sort states
  const [sortBy, setSortBy] = useState<
    'created_at' | 'exercise_name' | 'routine_name'
  >('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Chart state
  const [chartMetric, setChartMetric] = useState<
    'sets' | 'reps' | 'weight' | 'duration_seconds'
  >('reps');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [selectedChartExercises, setSelectedChartExercises] = useState<
    number[]
  >([]);
  const [aggregationType, setAggregationType] = useState<'avg' | 'sum' | 'max'>(
    'avg'
  );

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const { data: fetchedExercises, error: exercisesError } = await supabase
          .from('exercises')
          .select('id, name');
        if (exercisesError) throw exercisesError;
        setExercisesData(fetchedExercises || []);
        if (fetchedExercises && fetchedExercises.length > 0) {
          setSelectedChartExercises([fetchedExercises[0].id]);
        }

        const { data: fetchedRoutines, error: routinesError } = await supabase
          .from('routines')
          .select('id, name');
        if (routinesError) throw routinesError;
        setRoutinesData(fetchedRoutines || []);

        const { data: workoutExerciseLogs, error: workoutExerciseLogsError } = await supabase
          .from('workout_exercise_logs')
          .select('*');
        if (workoutExerciseLogsError) throw workoutExerciseLogsError;

        const { data: workoutLogs, error: workoutLogsError } = await supabase
          .from('workout_logs')
          .select('*');
        if (workoutLogsError) throw workoutLogsError;

        const mappedLogs: WorkoutLogDisplay[] = workoutExerciseLogs.map((log) => {
          const workoutLog = workoutLogs.find(wl => wl.id === log.workout_log_id);
          return {
            ...log,
            exercise_name:
              fetchedExercises?.find((ex) => ex.id === log.exercise_id)?.name ||
              'Ejercicio no especificado',
            routine_name:
              fetchedRoutines?.find((rt) => rt.id === workoutLog?.routine_id)?.name ||
              'Desconocida',
            created_at: workoutLog?.created_at,
          }
        });

        setAllWorkoutLogs(mappedLogs);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
        console.error('Error fetching workout history:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredAndSortedLogs = useMemo(() => {
    let filtered = [...allWorkoutLogs];
    if (selectedRoutineId !== 'all') {
      filtered = filtered.filter((log) => log.routine_id === selectedRoutineId);
    }
    if (selectedExerciseId !== 'all') {
      filtered = filtered.filter(
        (log) => log.exercise_id === selectedExerciseId
      );
    }
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((log) => new Date(log.created_at!) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day
      filtered = filtered.filter((log) => new Date(log.created_at!) <= end);
    }
    filtered.sort((a, b) => {
      let compareValue = 0;
      if (sortBy === 'created_at') {
        compareValue =
          new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime();
      } else if (sortBy === 'exercise_name') {
        compareValue = (a.exercise_name || '').localeCompare(
          b.exercise_name || ''
        );
      } else if (sortBy === 'routine_name') {
        compareValue = (a.routine_name || '').localeCompare(
          b.routine_name || ''
        );
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });
    return filtered;
  }, [
    allWorkoutLogs,
    selectedRoutineId,
    selectedExerciseId,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  ]);

  const chartData = useMemo(() => {
    const datasets = selectedChartExercises.map((exerciseId, index) => {
      const exercise = exercisesData.find((ex) => ex.id === exerciseId);
      const logsForExercise = filteredAndSortedLogs.filter(
        (log) => log.exercise_id === exerciseId
      );

      const dataByDate = logsForExercise.reduce(
        (acc, log) => {
          const date = new Date(log.created_at!).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(log[chartMetric] || 0);
          return acc;
        },
        {} as Record<string, number[]>
      );

      const labels = Object.keys(dataByDate).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
      );
      const dataPoints = labels.map((date) => {
        const values = dataByDate[date];
        switch (aggregationType) {
          case 'sum':
            return values.reduce((a, b) => a + b, 0);
          case 'max':
            return Math.max(...values);
          case 'avg':
          default:
            return values.reduce((a, b) => a + b, 0) / values.length;
        }
      });

      const color = `hsl(${(index * 100) % 360}, 70%, 50%)`;

      return {
        label: `${exercise?.name || 'Unknown'} (${chartMetric})`,
        data: dataPoints,
        borderColor: color,
        backgroundColor: `${color}80`,
      };
    });

    const allLabels = [
      ...new Set(datasets.flatMap((d) => d.data.map((_, i) => i))),
    ].map(String);

    const data = allLabels.map((label, index) => {
      const dataPoint: { [key: string]: any } = { name: label };
      datasets.forEach((dataset) => {
        dataPoint[dataset.label] = dataset.data[index];
      });
      return dataPoint;
    });

    return {
      data,
      datasets,
    };
  }, [
    filteredAndSortedLogs,
    chartMetric,
    selectedChartExercises,
    aggregationType,
    exercisesData,
  ]);

  if (loading) {
    return (
      <div className="workout-history-container">
        Cargando historial de entrenamientos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="workout-history-container error-message">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="workout-history-container">
      <h1>Historial de Entrenamientos</h1>
      <WorkoutHistoryFilters
        routinesData={routinesData}
        exercisesData={exercisesData}
        selectedRoutineId={selectedRoutineId}
        setSelectedRoutineId={setSelectedRoutineId}
        selectedExerciseId={selectedExerciseId}
        setSelectedExerciseId={setSelectedExerciseId}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      <Tabs>
        <Tab label="Historial">
          <WorkoutHistoryList logs={filteredAndSortedLogs} />
        </Tab>
        <Tab label="Análisis">
          <div className="chart-controls-grid">
            <div className="chart-control-item">
              <label htmlFor="chart-exercise">Ejercicio del Gráfico:</label>
              <select
                id="chart-exercise"
                multiple
                value={selectedChartExercises.map(String)}
                onChange={(e) =>
                  setSelectedChartExercises(
                    Array.from(e.target.selectedOptions, (option) =>
                      Number(option.value)
                    )
                  )
                }
              >
                {exercisesData.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="chart-control-item">
              <label htmlFor="chartMetric">Métrica:</label>
              <select
                id="chartMetric"
                value={chartMetric}
                onChange={(e) =>
                  setChartMetric(e.target.value as typeof chartMetric)
                }
              >
                <option value="reps">Repeticiones</option>
                <option value="sets">Series</option>
                <option value="weight">Peso</option>
                <option value="duration_seconds">Duración (seg)</option>
              </select>
            </div>

            <div className="chart-control-item">
              <label htmlFor="chart-type">Tipo de Gráfico:</label>
              <select
                id="chart-type"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as typeof chartType)}
              >
                <option value="line">Línea</option>
                <option value="bar">Barra</option>
              </select>
            </div>

            <div className="chart-control-item">
              <label htmlFor="aggregation-type">Agregación:</label>
              <select
                id="aggregation-type"
                value={aggregationType}
                onChange={(e) =>
                  setAggregationType(e.target.value as typeof aggregationType)
                }
              >
                <option value="avg">Promedio</option>
                <option value="sum">Suma</option>
                <option value="max">Máximo</option>
              </select>
            </div>
          </div>
          <WorkoutHistoryReChart chartData={chartData} chartType={chartType} />
        </Tab>
      </Tabs>
    </div>
  );
}

export default WorkoutHistory;
