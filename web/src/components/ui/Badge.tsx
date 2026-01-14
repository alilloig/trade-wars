import { ReactNode, CSSProperties } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'gold';
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Badge({ variant = 'default', children, className = '', style }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-700 text-gray-200',
    success: 'bg-green-600 text-white',
    warning: 'bg-orange-600 text-white',
    danger: 'bg-red-600 text-white',
    info: 'bg-blue-600 text-white',
    gold: 'bg-gold text-black',
  };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${variantClasses[variant]} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
