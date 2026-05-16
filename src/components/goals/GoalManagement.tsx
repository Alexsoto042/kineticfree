import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { useGoals } from '../../hooks/useGoals';
import { supabase } from '../../supabaseClient';
import type { Goal, GoalCreation, Exercise } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import './Goals.css';

export const GoalManagement = React.memo(() => {
  const { goals, loading, error, addGoal, updateGoalProgress, deleteGoal } =
    useGoals();

  // Form State
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Goal['type']>('weight_lift');
  const [targetValue, setTargetValue] = useState(100);
  const [unit, setUnit] = useState<Goal['unit']>('kg');
  const [exerciseId, setExerciseId] = useState<number | null>(null);

  // Exercise list for the dropdown
  const [exercises, setExercises] = useState<Pick<Exercise, 'id' | 'name'>[]>(
    []
  );
  const [loadingExercises, setLoadingExercises] = useState(false);

  useEffect(() => {
    if (type === 'weight_lift') {
      setLoadingExercises(true);
      supabase
        .from('exercises')
        .select('id, name')
        .order('name')
        .then(({ data, error }) => {
          if (error) {
            console.error('Failed to fetch exercises for goal form', error);
          } else {
            setExercises(data || []);
          }
          setLoadingExercises(false);
        });
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) {
      alert('La descripción no puede estar vacía');
      return;
    }

    const newGoal: GoalCreation = {
      description,
      target_value: targetValue,
      unit,
      type,
      current_value: 0, // Initialize current_value for new goals
      exercise_id: type === 'weight_lift' ? exerciseId : undefined,
    };

    addGoal(newGoal).then(() => {
      // Reset form
      setDescription('');
      setTargetValue(100);
      setUnit('kg');
      setType('weight_lift');
      setExerciseId(null);
    });
  };

  if (loading) return <p>Cargando metas...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;

  return (
    <div className="goals-container">
      <h2>Mis Metas</h2>
      <form onSubmit={handleSubmit} className="goal-form">
        <h3>Crear Nueva Meta</h3>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Goal['type'])}
        >
          <option value="weight_lift">Levantar Peso</option>
          <option value="consistency">Consistencia (días)</option>
          <option value="body_weight">Peso Corporal</option>
        </select>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Levantar 100kg en press de banca"
        />
        {type === 'weight_lift' && (
          <select
            value={exerciseId || ''}
            onChange={(e) => setExerciseId(Number(e.target.value))}
            disabled={loadingExercises}
            required
          >
            <option value="" disabled>
              Selecciona un ejercicio...
            </option>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        )}
        <input
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(parseFloat(e.target.value))}
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as Goal['unit'])}
        >
          <option value="kg">kg</option>
          <option value="reps">reps</option>
          <option value="days">días</option>
          <option value="km">km</option>
        </select>
        <button type="submit">Añadir Meta</button>
      </form>

      <div className="goal-list">
        {goals.length === 0 ? (
          <EmptyState
            icon={<Target size={64} />}
            title="No tienes metas definidas"
            description="Crea tu primera meta usando el formulario de arriba. Define objetivos de peso, consistencia o progreso personal."
          />
        ) : (
          goals.map((goal) => (
            <div key={goal.id} className="goal-item">
              <p>{goal.description}</p>
              <progress
                value={goal.current_value}
                max={goal.target_value}
              ></progress>
              <span>
                {goal.current_value} / {goal.target_value} {goal.unit}
              </span>
              <div className="goal-actions">
                <button
                  onClick={() => {
                    const newProgress = prompt(
                      'Introduce tu nuevo progreso:',
                      String(goal.current_value)
                    );
                    if (
                      newProgress !== null &&
                      !isNaN(parseFloat(newProgress))
                    ) {
                      updateGoalProgress(goal.id, parseFloat(newProgress));
                    }
                  }}
                >
                  Actualizar
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteGoal(goal.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
