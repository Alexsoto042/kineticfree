import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePlans } from '../hooks/usePlans';
import { useCurrentPlan } from '../features/plans/hooks/useCurrentPlan';
import { useSavedPlans } from '../hooks/useSavedPlans';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import PlanCard from '../components/plans/PlanCard';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { useToasts } from '../hooks/useToasts';
import { FaCheckCircle, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import './ExplorePlans.css';
import { lazy, Suspense } from 'react';

const LazyNutrition = lazy(() => import('./Nutrition'));

function ExplorePlans() {
  const { goals, plans, loading, error } = usePlans();
  const { currentPlan, loading: loadingCurrentPlan } = useCurrentPlan();
  const { savedPlans, savePlan, unsavePlan, isPlanSaved } = useSavedPlans();
  const { updateProfileState } = useAuth();
  const { showSuccessToast, showErrorToast } = useToasts();
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<'plans' | 'nutrition'>('plans');
  const [activatingPlanId, setActivatingPlanId] = useState<string | null>(null);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [recommendedPlanId, setRecommendedPlanId] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.fromNav === 'nutrition') {
      setActiveSection('nutrition');
    }
  }, [location.state]);

  // Get recommended plan ID from profile
  useEffect(() => {
    const fetchRecommendedPlan = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_plan_id')
          .eq('id', user.id)
          .single();
        
        if (profile?.current_plan_id) {
          setRecommendedPlanId(profile.current_plan_id.toString());
        }
      }
    };
    fetchRecommendedPlan();
  }, []);

  const activatePlan = async (planId: string, planName: string) => {
    setActivatingPlanId(planId);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Auth error:', userError);
        showErrorToast('Debes iniciar sesión');
        setActivatingPlanId(null);
        return;
      }

      console.log('Activating plan:', { planId, userId: user.id });

      // Update using authenticated user's ID
      // Note: planId is a UUID string, not an integer
      const { data, error } = await supabase
        .from('profiles')
        .update({ current_plan_id: planId })
        .eq('id', user.id)
        .select();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      console.log('Update successful:', data);
      showSuccessToast(`¡Plan "${planName}" activado!`);
      
      // Update profile state
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (updatedProfile) {
        updateProfileState(updatedProfile);
        setRecommendedPlanId(planId); // Update local state
      }
    } catch (error: any) {
      console.error('Activation error:', error);
      showErrorToast(`Error al activar plan: ${error.message || 'Inténtalo de nuevo'}`);
    } finally {
      setActivatingPlanId(null);
    }
  };

  const handleSavePlan = async (planId: string, planName: string) => {
    setSavingPlanId(planId);
    const success = await savePlan(planId);
    if (success) {
      showSuccessToast(`Plan "${planName}" guardado`);
    } else {
      showErrorToast('Error al guardar plan');
    }
    setSavingPlanId(null);
  };

  const handleUnsavePlan = async (planId: string, planName: string) => {
    setSavingPlanId(planId);
    const success = await unsavePlan(planId);
    if (success) {
      showSuccessToast(`Plan "${planName}" eliminado`);
    } else {
      showErrorToast('Error al eliminar plan');
    }
    setSavingPlanId(null);
  };

  const filteredPlans =
    selectedGoal === 'all'
      ? plans
      : plans.filter((plan) => {
          return plan.goal_id.toString() === selectedGoal;
        });

  // Sort plans: recommended plan first, then others
  const sortedPlans = [...filteredPlans].sort((a: any, b: any) => {
    const aId = a.id.toString();
    const bId = b.id.toString();
    
    // Recommended plan goes first
    if (aId === recommendedPlanId) return -1;
    if (bId === recommendedPlanId) return 1;
    
    // Current plan goes second
    if (aId === currentPlan?.id.toString()) return -1;
    if (bId === currentPlan?.id.toString()) return 1;
    
    return 0; // Keep original order for others
  });

  const getGoalName = (goalId: string | number) => {
    if (!goalId) return 'General';
    const goal = goals.find((g: any) => g.id.toString() === goalId.toString());
    return goal?.name || goal?.goal_name || 'General';
  };

  if (loading || loadingCurrentPlan) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="explore-plans-container error-message">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="explore-plans-container">
      <header className="explore-header">
        <h1>Explorar</h1>
        <p>
          Encuentra el plan perfecto para alcanzar tus objetivos de fitness y
          nutrición.
        </p>
      </header>

      <div className="section-tabs">
        <button
          onClick={() => setActiveSection('plans')}
          className={activeSection === 'plans' ? 'active' : ''}
        >
          Planes
        </button>
        <button
          onClick={() => setActiveSection('nutrition')}
          className={activeSection === 'nutrition' ? 'active' : ''}
        >
          Nutrición
        </button>
      </div>

      {activeSection === 'plans' ? (
        <>
          <div className="goal-filters">
            <button
              onClick={() => setSelectedGoal('all')}
              className={selectedGoal === 'all' ? 'active' : ''}
            >
              Todos
            </button>
            {goals.map((goal: any) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id.toString())}
                className={selectedGoal === goal.id.toString() ? 'active' : ''}
              >
                {goal.name || goal.goal_name || `Objetivo ${goal.id}`}
              </button>
            ))}
          </div>

          <div className="plans-grid">
            {sortedPlans.length > 0 ? (
              sortedPlans.map((plan: any, index: number) => {
                const isCurrentPlan = currentPlan?.id === plan.id;
                const isRecommended = plan.id.toString() === recommendedPlanId;
                return (
                  <div key={plan.id} className="plan-card-wrapper">
                    {isRecommended && index === 0 && (
                      <div className="recommended-badge">
                        ⭐ Plan Recomendado
                      </div>
                    )}
                    <Link to={`/plan/${plan.id}`} className="plan-link">
                      <PlanCard plan={plan} goalName={getGoalName(plan.goal_id)} />
                    </Link>
                    <div className="plan-actions">
                      {/* Bookmark Button */}
                      <button
                        className={`btn-save-plan ${isPlanSaved(plan.id) ? 'saved' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (isPlanSaved(plan.id)) {
                            handleUnsavePlan(plan.id, plan.name);
                          } else {
                            handleSavePlan(plan.id, plan.name);
                          }
                        }}
                        disabled={savingPlanId === plan.id}
                        title={isPlanSaved(plan.id) ? 'Plan guardado' : 'Guardar plan'}
                      >
                        {isPlanSaved(plan.id) ? <FaBookmark /> : <FaRegBookmark />}
                        {savingPlanId === plan.id ? 'Guardando...' : (isPlanSaved(plan.id) ? 'Guardado' : 'Guardar')}
                      </button>
                      
                      {/* Activate Button or Active Badge */}
                      {isCurrentPlan ? (
                        <div className="current-plan-badge">
                          <FaCheckCircle /> Plan Activo
                        </div>
                      ) : (
                        <button
                          className="btn-activate-plan"
                          onClick={(e) => {
                            e.preventDefault();
                            activatePlan(plan.id.toString(), plan.name);
                          }}
                          disabled={activatingPlanId === plan.id.toString()}
                        >
                          {activatingPlanId === plan.id.toString() ? 'Activando...' : 'Activar Plan'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No se encontraron planes para el objetivo seleccionado.</p>
            )}
          </div>
        </>
      ) : (
        <Suspense fallback={<div>Cargando Nutrición...</div>}>
          <LazyNutrition />
        </Suspense>
      )}
    </div>
  );
}

export default ExplorePlans;
