import { useState } from 'react';
import { useLeaderboard, LeaderboardFilter } from '../../hooks/useLeaderboard';
import UsernameDisplay from './UsernameDisplay'; // Import the new component
import './Leaderboard.css';

// Forzar la re-evaluación del módulo por Vite
function Leaderboard() {
  const [filter, setFilter] = useState<keyof typeof LeaderboardFilter>(
    'TOTAL_WEIGHT_LIFTED'
  );
  const { leaderboardData, loading } = useLeaderboard(
    LeaderboardFilter[filter]
  );

  const handleFilterChange = (newFilter: keyof typeof LeaderboardFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="leaderboard-container card-base">
      <div className="leaderboard-header">
        <h2>Tabla de Clasificación</h2>
        <div className="leaderboard-filters">
          <button
            onClick={() => handleFilterChange('TOTAL_WEIGHT_LIFTED')}
            className={`btn ${filter === 'TOTAL_WEIGHT_LIFTED' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Peso Total
          </button>
          <button
            onClick={() => handleFilterChange('TOTAL_WORKOUTS')}
            className={`btn ${filter === 'TOTAL_WORKOUTS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Entrenamientos
          </button>
        </div>
      </div>
      {loading ? (
        <p className="loading-message">Cargando...</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Puesto</th>
              <th>Usuario</th>
              <th>
                {filter === 'TOTAL_WEIGHT_LIFTED'
                  ? 'Peso Levantado (kg)'
                  : 'Entrenamientos'}
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((user) => {
              return (
                <tr key={user.user_id}>
                  <td className="leaderboard-rank">{user.rank}</td>
                  <td>
                    <div className="leaderboard-user">
                      <img
                        src={user.avatar_url || '/images/default-avatar.svg'}
                        alt={user.username}
                        className="leaderboard-avatar"
                      />
                      <UsernameDisplay username={user.username} />
                    </div>
                  </td>
                  <td>{user.value.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Leaderboard;
