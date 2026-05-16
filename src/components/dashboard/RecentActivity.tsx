import type { RecentWorkout } from '../../hooks/useDashboardData';

interface RecentActivityProps {
  workouts: RecentWorkout[];
}

export function RecentActivity({ workouts }: RecentActivityProps) {
  return (
    <section className="recent-activity">
      <h2>Actividad Reciente</h2>
      {workouts.length > 0 ? (
        <ul className="activity-list">
          {workouts.map((log) => (
            <li key={log.id} className="activity-item">
              <div className="activity-info">
                <span className="routine-name">{log.routine_name}</span>
                <span className="activity-details">
                  {log.reps} reps, {log.sets} series, {log.weight} kg
                </span>
              </div>
              <span className="activity-date">
                {new Date(log.created_at!).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No has registrado ninguna actividad recientemente.</p>
      )}
    </section>
  );
}
