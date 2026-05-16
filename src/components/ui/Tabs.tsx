// src/components/ui/Tabs.tsx
import React from 'react';
import './Tabs.css';

interface TabProps {
  label: string;
  children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({ children }) => {
  return <div className="tab-content">{children}</div>;
};

interface TabsProps {
  children: React.ReactElement<TabProps>[];
  activeTab: number;
  onTabChange: (index: number) => void;
}

export const Tabs: React.FC<TabsProps> = ({ children, activeTab, onTabChange }) => {
  const handleTabClick = (index: number) => {
    onTabChange(index);
  };

  return (
    <div className="tabs-container">
      <div className="tabs-list">
        {children.map((child, index) => (
          <button
            key={index}
            className={`tab-item ${index === activeTab ? 'active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="tabs-content">
        {children[activeTab]}
      </div>
    </div>
  );
};
