import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import type { Plan, Exercise, LinkedRoutine } from '../../types';
import { ExerciseCard } from './exercises/ExerciseCard'; // Reutilizamos ExerciseCard
import './PlanDetail.css';

function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [linkedRoutine, setLinkedRoutine] = useState<LinkedRoutine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlanAndRoutine() {
      if (!id) return;

      try {
        setLoading(true);
        // 1. Fetch the plan details
        const { data: planData, error: planError } = await supabase
          .from('plans')
          .select('*')
          .eq('id', id)
          .single();

        if (planError) {
          if (planError.code === 'PGRST116') {
            throw new Error('Plan no encontrado.');
          } else {
            throw planError;
          }
        }
        setPlan(planData);

        // 2. If plan has a routine_id, fetch the routine details
        if (planData.routine_id) {
          const { data: routineOnlyData, error: routineError } = await supabase
            .from('routines')
            .select('*') // Fetch routine data first
            .eq('id', planData.routine_id)
            .single();

          if (routineError) {
            console.error(
              'Error fetching linked routine:',
              routineError.message
            );
          } else if (routineOnlyData) {
            // 3. Now fetch the full exercise details for the routine
            if (
              routineOnlyData.exercises &&
              routineOnlyData.exercises.length > 0
            ) {
              const { data: exercisesData, error: exercisesError } =
                await supabase
                  .from('exercises')
                  .select('*')
                  .in('id', routineOnlyData.exercises);

              if (exercisesError) {
                console.error(
                  'Error fetching routine exercises:',
                  exercisesError.message
                );
              } else {
                setLinkedRoutine({
                  ...routineOnlyData,
                  exercises: exercisesData,
                });
              }
            } else {
              setLinkedRoutine({ ...routineOnlyData, exercises: [] });
            }
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch plan details.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchPlanAndRoutine();
  }, [id]);

  // Temporal console.log para depuración
  useEffect(() => {
    if (!loading && plan) {
      console.log('Plan cargado:', plan);
      console.log('Rutina vinculada cargada:', linkedRoutine);
    }
  }, [loading, plan, linkedRoutine]);

  if (loading) {
    return <div className="loading-container">Cargando plan...</div>;
  }

  if (error || !plan) {
    return (
      <div className="error-message">
        Error: {error || 'Plan no encontrado.'}
      </div>
    );
  }

  return (
    <div className="plan-detail-container">
      <Link to="/explore-plans" className="back-link">
        &#8592; Volver a los planes
      </Link>
      <header className="plan-detail-header">
        <h1>{plan.name}</h1>
        <p className="plan-description">{plan.description}</p>
        <div className="plan-meta">
          <span>Duración: {plan.duration_weeks} semanas</span>
          <span>Objetivo: {plan.goal_id}</span>
        </div>
      </header>

      <div className="plan-content">
        {plan.diet_recommendation && (
          <section className="plan-section">
            <h2>Recomendación Dietética</h2>
            <p>{plan.diet_recommendation}</p>
          </section>
        )}

        {plan.meal_plan_description && (
          <section className="plan-section">
            <h2>Descripción del Plan de Comidas</h2>
            <p>{plan.meal_plan_description}</p>
          </section>
        )}

        {plan.foods_to_eat && plan.foods_to_eat.length > 0 && (
          <section className="plan-section">
            <h2>Alimentos Recomendados</h2>
            <ul>
              {plan.foods_to_eat.map((food, index) => (
                <li key={index}>{food}</li>
              ))}
            </ul>
          </section>
        )}

        {plan.foods_to_avoid && plan.foods_to_avoid.length > 0 && (
          <section className="plan-section">
            <h2>Alimentos a Evitar</h2>
            <ul>
              {plan.foods_to_avoid.map((food, index) => (
                <li key={index}>{food}</li>
              ))}
            </ul>
          </section>
        )}

        {linkedRoutine &&
          linkedRoutine.exercises &&
          linkedRoutine.exercises.length > 0 && (
            <section className="plan-section">
              <h2>Rutina de Ejercicio Recomendada</h2>
              <p className="routine-name">{linkedRoutine.name}</p>
              <div className="routine-exercises-grid">
                {linkedRoutine.exercises.map((exercise: Exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
              <Link
                to={`/routine/${linkedRoutine.id}`}
                className="view-routine-link"
              >
                Ver detalles de la rutina
              </Link>
            </section>
          )}
      </div>
    </div>
  );
}

export default PlanDetail;
