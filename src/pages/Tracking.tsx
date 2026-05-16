// src/pages/Tracking.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button/Button';
import './Tracking.css';

interface PlanDetail {
  id: string;
  name: string;
  description: string;
  // Add other plan details you want to display
}

const Tracking: React.FC = () => {
  const { session, loading: authLoading } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<PlanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentPlan() {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch user's profile to get current_plan_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('current_plan_id')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;

        if (profileData?.current_plan_id) {
          // Fetch plan details using current_plan_id
          const { data: planData, error: planError } = await supabase
            .from('plans')
            .select('id, name, description')
            .eq('id', profileData.current_plan_id)
            .single();

          if (planError) throw planError;
          setCurrentPlan(planData);
        } else {
          setCurrentPlan(null);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al cargar el plan actual.');
        console.error('Error fetching current plan:', err);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchCurrentPlan();
    }
  }, [session, authLoading]);

  if (authLoading || loading) {
    return <LoadingOverlay message="Cargando tu plan..." />;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="tracking-container">
      <h1>Mi Plan Actual</h1>
      {currentPlan ? (
        <div className="card-base current-plan-card">
          <h2>{currentPlan.name}</h2>
          <p>{currentPlan.description}</p>
          <Button as={Link} to={`/plan/${currentPlan.id}`} variant="primary">
            Ver Detalles del Plan
          </Button>
        </div>
      ) : (
        <div className="empty-state-message">
          <p>No tienes un plan activo en este momento.</p>
          <Button as={Link} to="/explore-plans" variant="primary">
            Explorar Planes
          </Button>
        </div>
      )}
    </div>
  );
};

export default Tracking;
