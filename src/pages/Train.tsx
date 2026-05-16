import { useState } from 'react';
import { Link } from 'react-router-dom';
import RoutineList from '../components/routines/RoutineList';
import WorkoutHistory from './WorkoutHistory';
import './Train.css';

function Train() {
  const [activeTab, setActiveTab] = useState<'routines' | 'history'>('routines');

  return (
    <div className="train-container">
      <header className="train-header">
        <h1>Entrenar</h1>
        <p>Tus rutinas y progreso</p>
      </header>

      <div className="train-tabs">
        <button
          className={`train-tab ${activeTab === 'routines' ? 'active' : ''}`}
          onClick={() => setActiveTab('routines')}
        >
          Mis Rutinas
        </button>
        <button
          className={`train-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Historial
        </button>
      </div>

      <div className="train-content">
        {activeTab === 'routines' ? (
          <>
            <RoutineList />
            <div className="train-quick-links">
              <Link to="/explore-plans" className="quick-link-card">
                <span className="quick-link-icon">🗺️</span>
                <div>
                  <h3>Explorar Planes</h3>
                  <p>Descubre nuevas rutinas</p>
                </div>
              </Link>
              <Link to="/exercises" className="quick-link-card">
                <span className="quick-link-icon">💪</span>
                <div>
                  <h3>Ejercicios</h3>
                  <p>Biblioteca completa</p>
                </div>
              </Link>
            </div>
          </>
        ) : (
          <WorkoutHistory />
        )}
      </div>
    </div>
  );
}

export default Train;
