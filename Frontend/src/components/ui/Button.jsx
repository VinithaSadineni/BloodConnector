import React from 'react';
import { cn } from '../../lib/utils';
import Spinner from './Spinner';

export const Button = React.forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  children,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-body font-medium rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-blood/50 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-blood hover:bg-blood-dark text-white shadow-blood hover:shadow-blood-lg border border-transparent',
    secondary: 'bg-surface-3 hover:bg-surface-4 text-text-primary border border-border',
    danger: 'bg-critical hover:bg-red-700 text-white shadow-lg border border-transparent',
    outline: 'bg-transparent border border-white/20 hover:border-white/40 hover:bg-white/5 text-text-primary',
    ghost: 'bg-transparent hover:bg-white/5 text-text-muted hover:text-text-primary border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold tracking-wide',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base font-semibold tracking-wider font-display uppercase',
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && <Spinner className="w-4 h-4 mr-2 text-white" />}
      {!isLoading && icon && <span className="mr-2 inline-block">{icon}</span>}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
