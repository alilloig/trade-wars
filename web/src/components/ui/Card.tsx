import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  variant?: 'gold' | 'erbium' | 'lanthanum' | 'thorium' | 'success' | 'warning' | 'default';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export function Card({ variant = 'default', children, className = '', onClick, style }: CardProps) {
  const variantClasses = {
    gold: 'bg-gold/10 border border-gold',
    erbium: 'card-element-erbium',
    lanthanum: 'card-element-lanthanum',
    thorium: 'card-element-thorium',
    success: 'card-universe-joined',
    warning: 'card-universe-available',
    default: 'bg-gray-800/50 border border-gray-700',
  };

  const clickableClasses = onClick
    ? 'cursor-pointer hover:opacity-80 transition-opacity duration-200'
    : '';

  return (
    <div
      className={`rounded-md p-3 ${variantClasses[variant]} ${clickableClasses} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
