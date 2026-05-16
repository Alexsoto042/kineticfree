import styles from './LoadingSpinner.module.css';


interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'medium',
  className = '' 
}: LoadingSpinnerProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.circle}></div>
      </div>
    </div>
  );
}

