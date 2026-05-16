import React from 'react';
import styles from './Tag.module.css';

interface TagProps {
  label: string;
  type?: string; // Can be used to force a specific style class
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ label, type, className = '' }) => {
  // If type is provided, use it. Otherwise, try to use the label as the class key (normalized).
  const styleKey = type?.toLowerCase() || label.toLowerCase().replace(/\s+/g, '_');
  
  // Check if the style exists, otherwise fallback to default
  const variantClass = styles[styleKey] || styles.default;

  return (
    <span className={`${styles.tag} ${variantClass} ${className}`}>
      {label}
    </span>
  );
};
