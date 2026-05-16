import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaDumbbell, 
  FaUtensils, 
  FaListAlt, 
  FaBullseye, 
  FaUsers,
  FaUserFriends
} from 'react-icons/fa';
import './Explore.css';

interface ExploreCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  count?: string;
  color: string;
}

const ExploreCard: React.FC<ExploreCardProps> = ({ to, icon, title, count, color }) => {
  return (
    <Link to={to} className="explore-card" style={{ '--card-color': color } as React.CSSProperties}>
      <div className="explore-card-icon">{icon}</div>
      <h3 className="explore-card-title">{title}</h3>
      {count && <span className="explore-card-count">{count}</span>}
    </Link>
  );
};

const Explore = () => {
  return (
    <div className="explore-container">
      <header className="explore-header">
        <h1>🔍 Explorar</h1>
        <p>Descubre todo el contenido disponible</p>
      </header>

      <div className="explore-grid">
        <ExploreCard
          to="/exercises"
          icon={<FaDumbbell size={40} />}
          title="Ejercicios"
          count="500+"
          color="#6366f1"
        />

        <ExploreCard
          to="/nutrition"
          icon={<FaUtensils size={40} />}
          title="Nutrición"
          count="100+"
          color="#10b981"
        />

        <ExploreCard
          to="/routines"
          icon={<FaListAlt size={40} />}
          title="Rutinas"
          count="50+"
          color="#f59e0b"
        />

        <ExploreCard
          to="/goals"
          icon={<FaBullseye size={40} />}
          title="Metas"
          color="#ef4444"
        />

        <ExploreCard
          to="/friends"
          icon={<FaUserFriends size={40} />}
          title="Amigos"
          color="#ec4899"
        />

        <ExploreCard
          to="/community"
          icon={<FaUsers size={40} />}
          title="Comunidad"
          color="#8b5cf6"
        />
      </div>
    </div>
  );
};

export default Explore;
