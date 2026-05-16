import React from 'react';
import { FaTrophy, FaLock } from 'react-icons/fa';
import type { UnlockedAchievement } from '../../hooks/useAchievements'; // Import as value
import './AchievementList.css';

interface AchievementListProps {
  achievements: UnlockedAchievement[];
}

export const AchievementList = React.memo(
  ({ achievements }: AchievementListProps) => {
    return (
      <div className="achievements-container">
        <h2>Logros</h2>
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`achievement-card card-base ${achievement.unlocked ? 'unlocked' : ''}`}>
              <div className="achievement-icon">
                {achievement.unlocked ? <FaTrophy /> : <FaLock />}
              </div>
              <h3>{achievement.name}</h3>
              <p>{achievement.description}</p>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${achievement.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
);