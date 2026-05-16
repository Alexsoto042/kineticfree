import { Link, useNavigate } from 'react-router-dom';
import { FaPlay, FaMapSigns, FaCheckCircle } from 'react-icons/fa';
import { useCurrentPlan } from '../features/plans/hooks/useCurrentPlan';
import { useSavedPlans } from '../hooks/useSavedPlans';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PlanCard from '../components/plans/PlanCard';
import './PlanesHub.css';

const PlanesHub = () => {
  const { currentPlan, loading: loadingCurrent } = useCurrentPlan();
  const { savedPlans, loading: loadingSaved } = useSavedPlans();
  const navigate = useNavigate();

  const handleStartWorkout = () => {
    if (currentPlan?.routine_ids && currentPlan.routine_ids.length > 0) {
      // Navigate to the first routine in the plan
      const routineId = currentPlan.routine_ids[0];
      navigate(`/routine/${routineId}`);
    }
  };

  const handleExplorePlans = () => {
    navigate('/explore-plans');
  };

  // Filter out current plan from saved plans
  const otherSavedPlans = currentPlan 
    ? savedPlans.filter((plan: any) => plan.id !== currentPlan.id)
    : savedPlans;

  if (loadingCurrent || loadingSaved) {
    return (
      <div className="planes-hub-container">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="planes-hub-container">
      <header className="planes-hub-header">
        <h1>🗺️ Mis Planes</h1>
        <p className="planes-hub-subtitle">
          {currentPlan 
            ? 'Tu plan de entrenamiento activo' 
            : 'Guarda planes para acceso rápido'}
        </p>
      </header>

      {currentPlan ? (
        <>
          {/* Plan Actual */}
          <section className="current-plan-section">
            <div className="section-header">
              <h2>📌 Plan Actual</h2>
              <span className="plan-active-badge">
                <FaCheckCircle /> Activo
              </span>
            </div>
            
            <div className="current-plan-card">
              <div className="plan-card-header">
                <h3>{currentPlan.name}</h3>
                {currentPlan.current_day && (
                  <span className="plan-week-badge">
                    Día {currentPlan.current_day}
                  </span>
                )}
              </div>

              {currentPlan.routine_ids && currentPlan.routine_ids.length > 0 && (
                <div className="plan-progress-bar">
                  <div 
                    className="plan-progress-fill" 
                    style={{ 
                      width: `${((currentPlan.current_day || 1) / currentPlan.routine_ids.length) * 100}%` 
                    }}
                  />
                </div>
              )}

              <p className="plan-description">
                {currentPlan.routine_ids?.length || 0} rutinas en este plan
              </p>

              <button 
                className="btn-start-workout" 
                onClick={handleStartWorkout}
                disabled={!currentPlan.routine_ids || currentPlan.routine_ids.length === 0}
              >
                <FaPlay /> Continuar Entrenamiento
              </button>
            </div>

            {/* Link a detalles del plan */}
            <Link to={`/plan/${currentPlan.id}`} className="view-plan-details">
              Ver detalles del plan →
            </Link>
          </section>

          {/* Otros Planes Guardados */}
          {otherSavedPlans.length > 0 && (
            <section className="other-plans-section">
              <h2>📚 Otros Planes Guardados</h2>
              <div className="plans-grid">
                {otherSavedPlans.map((plan: any) => (
                  <Link key={plan.id} to={`/plan/${plan.id}`} className="plan-link">
                    <PlanCard plan={plan} goalName={plan.goal_id || 'General'} />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Explorar Más Planes */}
          <section className="explore-plans-section">
            <h2>🔍 Explorar Más Planes</h2>
            <Link to="/explore-plans" className="explore-plans-link">
              <FaMapSigns size={24} />
              <div>
                <h3>Descubre y guarda nuevos planes</h3>
                <p>Encuentra el plan perfecto para tus objetivos</p>
              </div>
            </Link>
          </section>
        </>
      ) : (
        /* Sin Plan Actual */
        <section className="no-plan-section">
          <div className="no-plan-card">
            <FaMapSigns size={64} className="no-plan-icon" />
            <h2>No tienes un plan activo</h2>
            <p>Los planes de entrenamiento te guían paso a paso hacia tus objetivos. Explora nuestros planes diseñados por expertos y comienza tu transformación hoy.</p>
            
            <div className="no-plan-benefits">
              <div className="benefit-item">
                <span className="benefit-icon">📅</span>
                <span>Rutinas programadas</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">📈</span>
                <span>Progreso medible</span>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🎯</span>
                <span>Objetivos claros</span>
              </div>
            </div>

            <button onClick={handleExplorePlans} className="btn-explore-plans">
              <FaMapSigns /> Explorar Planes
            </button>
            
            <p className="help-text">
              💡 Tip: Guarda planes para acceso rápido y actívalos cuando estés listo
            </p>
          </div>

          {/* Mostrar planes guardados incluso sin plan activo */}
          {savedPlans.length > 0 && (
            <section className="available-plans-section">
              <h2>📚 Tus Planes Guardados</h2>
              <div className="plans-grid">
                {savedPlans.map((plan: any) => (
                  <Link key={plan.id} to={`/plan/${plan.id}`} className="plan-link">
                    <PlanCard plan={plan} goalName={plan.goal_id || 'General'} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </section>
      )}
    </div>
  );
};

export default PlanesHub;
