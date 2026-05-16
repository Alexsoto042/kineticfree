import React, { type ReactElement } from 'react';

interface StatCardProps {
  icon: ReactElement;
  value: number;
  label: string;
}

export const StatCard = React.memo(({ icon, value, label }: StatCardProps) => {
  return (
    <div className="card-base stat-card">
      <div className="card-content">
        {icon}
        <h3 className="card-title">{value}</h3>
        <p className="card-text">{label}</p>
      </div>
    </div>
  );
});

StatCard.displayName = 'StatCard';
