import { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle, Plus, Edit2, Trash2 } from 'lucide-react';
import { useGoals } from '../hooks/useGoals';
import { supabase } from '../supabaseClient';
import type { Goal, GoalCreation, Exercise } from '../types';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button/Button';
import { Capacitor } from '@capacitor/core';
import MobileTopBar from '../components/navigation/MobileTopBar';
import { useValidatedForm } from '../hooks/useValidatedForm';
import { goalCreateSchema, type GoalCreateInput } from '../lib/validation';
import './Goals.css';

const Goals = () => {
  const { goals, loading, error, addGoal, updateGoalProgress, deleteGoal } = useGoals();

  // Form State
  const [showForm, setShowForm] = useState(false);

  // Exercise list for the dropdown
  const [exercises, setExercises] = useState<Pick<Exercise, 'id' | 'name'>[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);

  // Form validation hook
  const {
    values,
    isSubmitting,
    getFieldError,
    hasFieldError,
    handleSubmit,
    setFieldValue,
    reset,
  } = useValidatedForm<GoalCreateInput>({
    schema: goalCreateSchema,
    initialValues: {
      description: '',
      target_value: 100,
      type: 'weight_lift',
      unit: 'kg',
      exercise_id: null,
    },
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (data) => {
      await addGoal(data as GoalCreation);
      reset();
      setShowForm(false);
    },
  });

  // Fetch exercises when type is weight_lift
  useEffect(() => {
    if (values.type === 'weight_lift') {
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
  }, [values.type]);

  // Auto-set appropriate unit based on type
  const handleTypeChange = (newType: Goal['type']) => {
    setFieldValue('type', newType);
    
    // Auto-set appropriate unit
    if (newType === 'weight_lift') setFieldValue('unit', 'kg');
    else if (newType === 'cardio_distance') setFieldValue('unit', 'km');
    else if (newType === 'cardio_time') setFieldValue('unit', 'minutes');
    else if (newType === 'consistency') setFieldValue('unit', 'days');
    else if (newType === 'body_weight' || newType === 'body_composition') setFieldValue('unit', 'kg');
    else if (newType === 'flexibility') setFieldValue('unit', 'cm');
    else if (newType === 'nutrition') setFieldValue('unit', 'grams');
  };

  const activeGoals = goals.filter((g) => g.status === 'in_progress');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="goals-page">
        {Capacitor.isNativePlatform() && <MobileTopBar />}
        <div className="loading-message">Cargando metas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="goals-page">
        {Capacitor.isNativePlatform() && <MobileTopBar />}
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="goals-page">
      {Capacitor.isNativePlatform() && <MobileTopBar />}
      
      {/* Header Section */}
      <header className="goals-header">
        <div className="goals-header-content">
          <div className="goals-header-text">
            <h1>
              <Target className="header-icon" />
              Mis Metas
            </h1>
            <p>Define tus objetivos y alcanza tu máximo potencial</p>
          </div>
          <div className="goals-stats">
            <div className="stat-badge">
              <TrendingUp size={20} />
              <span>{activeGoals.length} Activas</span>
            </div>
            <div className="stat-badge completed">
              <CheckCircle size={20} />
              <span>{completedGoals.length} Completadas</span>
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(!showForm)}
          className="create-goal-btn"
        >
          <Plus size={20} />
          Nueva Meta
        </Button>
      </header>

      {/* Goal Creation Form */}
      {showForm && (
        <div className="goal-form-container card-base">
          <h2>Crear Nueva Meta</h2>
          <form onSubmit={handleSubmit} className="goal-form">
            <div className="form-group">
              <label htmlFor="goal-type">Tipo de Meta</label>
              <select
                id="goal-type"
                value={values.type}
                onChange={(e) => handleTypeChange(e.target.value as Goal['type'])}
              >
                <option value="weight_lift">💪 Levantar Peso</option>
                <option value="cardio_distance">🏃 Distancia Cardio</option>
                <option value="cardio_time">⏱️ Tiempo Cardio</option>
                <option value="consistency">📅 Consistencia</option>
                <option value="body_weight">⚖️ Peso Corporal</option>
                <option value="body_composition">📊 Composición Corporal</option>
                <option value="flexibility">🧘 Flexibilidad</option>
                <option value="nutrition">🥗 Nutrición</option>
              </select>
              <p className="form-hint">
                {values.type === 'weight_lift' && 'Alcanza un peso específico en un ejercicio'}
                {values.type === 'cardio_distance' && 'Corre o camina una distancia objetivo'}
                {values.type === 'cardio_time' && 'Mantén actividad cardio por un tiempo determinado'}
                {values.type === 'consistency' && 'Entrena de forma consistente durante días consecutivos'}
                {values.type === 'body_weight' && 'Alcanza tu peso corporal objetivo'}
                {values.type === 'body_composition' && 'Mejora tu porcentaje de grasa corporal'}
                {values.type === 'flexibility' && 'Mejora tu flexibilidad o rango de movimiento'}
                {values.type === 'nutrition' && 'Alcanza objetivos nutricionales diarios'}
              </p>
            </div>

            {values.type === 'weight_lift' && (
              <div className="form-group">
                <label htmlFor="exercise">Ejercicio</label>
                <select
                  id="exercise"
                  value={values.exercise_id || ''}
                  onChange={(e) => setFieldValue('exercise_id', Number(e.target.value))}
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
                {hasFieldError('exercise_id') && (
                  <span className="error-message">{getFieldError('exercise_id')}</span>
                )}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <input
                id="description"
                type="text"
                value={values.description}
                onChange={(e) => setFieldValue('description', e.target.value)}
                onBlur={() => {/* handled by hook */}}
                placeholder={
                  values.type === 'weight_lift' ? 'Ej: Levantar 100kg en press de banca' :
                  values.type === 'cardio_distance' ? 'Ej: Correr 10km sin parar' :
                  values.type === 'cardio_time' ? 'Ej: Correr 60 minutos continuos' :
                  values.type === 'consistency' ? 'Ej: Entrenar 30 días seguidos' :
                  values.type === 'body_weight' ? 'Ej: Alcanzar 75kg de peso' :
                  values.type === 'body_composition' ? 'Ej: Reducir grasa corporal a 15%' :
                  values.type === 'flexibility' ? 'Ej: Tocar el suelo sin doblar rodillas' :
                  'Ej: Consumir 150g de proteína diaria'
                }
                className={hasFieldError('description') ? 'error' : ''}
              />
              {hasFieldError('description') && (
                <span className="error-message">{getFieldError('description')}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="target-value">Objetivo</label>
                <input
                  id="target-value"
                  type="number"
                  value={values.target_value}
                  onChange={(e) => setFieldValue('target_value', parseFloat(e.target.value))}
                  min="0"
                  step={values.type === 'body_composition' ? '0.1' : '1'}
                  className={hasFieldError('target_value') ? 'error' : ''}
                />
                {hasFieldError('target_value') && (
                  <span className="error-message">{getFieldError('target_value')}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="unit">Unidad</label>
                <select
                  id="unit"
                  value={values.unit}
                  onChange={(e) => setFieldValue('unit', e.target.value as Goal['unit'])}
                >
                  {values.type === 'weight_lift' && (
                    <>
                      <option value="kg">kg</option>
                      <option value="reps">reps</option>
                    </>
                  )}
                  {values.type === 'cardio_distance' && (
                    <>
                      <option value="km">km</option>
                      <option value="miles">millas</option>
                    </>
                  )}
                  {values.type === 'cardio_time' && (
                    <>
                      <option value="minutes">minutos</option>
                      <option value="hours">horas</option>
                    </>
                  )}
                  {values.type === 'consistency' && (
                    <option value="days">días</option>
                  )}
                  {values.type === 'body_weight' && (
                    <option value="kg">kg</option>
                  )}
                  {values.type === 'body_composition' && (
                    <option value="%">%</option>
                  )}
                  {values.type === 'flexibility' && (
                    <>
                      <option value="cm">cm</option>
                      <option value="degrees">grados</option>
                    </>
                  )}
                  {values.type === 'nutrition' && (
                    <>
                      <option value="grams">gramos</option>
                      <option value="calories">calorías</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear Meta'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Active Goals Section */}
      <section className="goals-section">
        <h2>Metas Activas</h2>
        {activeGoals.length === 0 ? (
          <EmptyState
            icon={<Target size={64} />}
            title="No tienes metas activas"
            description="Crea tu primera meta para comenzar a alcanzar tus objetivos. Define metas de peso, consistencia o progreso personal."
          />
        ) : (
          <div className="goals-grid">
            {activeGoals.map((goal) => {
              const progress = getProgressPercentage(goal.current_value, goal.target_value);
              return (
                <div key={goal.id} className="goal-card card-base">
                  <div className="goal-card-header">
                    <h3>{goal.description}</h3>
                    <span className="goal-type-badge">{goal.type}</span>
                  </div>
                  
                  <div className="goal-progress">
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="progress-text">
                      <span className="current-value">{goal.current_value}</span>
                      <span className="separator">/</span>
                      <span className="target-value">{goal.target_value} {goal.unit}</span>
                    </div>
                    <div className="progress-percentage">{progress.toFixed(0)}%</div>
                  </div>

                  <div className="goal-actions">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        const newProgress = prompt(
                          'Introduce tu nuevo progreso:',
                          String(goal.current_value)
                        );
                        if (newProgress !== null && !isNaN(parseFloat(newProgress))) {
                          updateGoalProgress(goal.id, parseFloat(newProgress));
                        }
                      }}
                    >
                      <Edit2 size={16} />
                      Actualizar
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => {
                        if (confirm('¿Estás seguro de que quieres eliminar esta meta?')) {
                          deleteGoal(goal.id);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed Goals Section */}
      {completedGoals.length > 0 && (
        <section className="goals-section completed-section">
          <h2>
            <CheckCircle size={24} />
            Metas Completadas
          </h2>
          <div className="goals-grid">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="goal-card card-base completed">
                <div className="goal-card-header">
                  <h3>{goal.description}</h3>
                  <CheckCircle className="completed-icon" size={24} />
                </div>
                <div className="goal-completed-info">
                  <span className="completed-value">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Goals;
