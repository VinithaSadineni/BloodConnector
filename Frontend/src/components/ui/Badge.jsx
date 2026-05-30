import React from 'react';
import { cn } from '../../lib/utils';

export const Badge = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border font-mono';
  
  const variants = {
    default: 'bg-surface-3 text-text-muted border-border',
    success: 'bg-success/15 text-success border-success/30',
    warning: 'bg-warning/15 text-warning border-warning/30',
    danger: 'bg-critical/15 text-critical border-critical/30',
    info: 'bg-info/15 text-info border-info/30',
    outline: 'bg-transparent text-text-primary border-white/20',
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
