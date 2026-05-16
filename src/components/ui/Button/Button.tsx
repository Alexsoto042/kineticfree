import React from 'react';
import styles from './Button.module.css';

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  className?: string;
}

type ButtonAsButton = BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
    as?: 'button';
  };

type ButtonAsComponent = BaseButtonProps & {
  as: React.ElementType;
  [key: string]: any;
};

type ButtonProps = ButtonAsButton | ButtonAsComponent;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, as, ...props }, ref) => {
    const Component = as || 'button';
    const variantClass = styles[variant];
    
    return (
      <Component
        ref={ref}
        className={`${styles.button} ${variantClass} ${className}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Button.displayName = 'Button';
