import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({
  className,
  type = 'text',
  label,
  error,
  icon,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 font-body">
      {label && (
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-text-muted pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full bg-surface-3 text-text-primary placeholder:text-text-muted/40 border border-border rounded-lg py-2.5 px-3 focus:border-blood focus:ring-1 focus:ring-blood/50 outline-none transition-all duration-200 text-sm',
            icon && 'pl-10',
            error && 'border-critical focus:border-critical focus:ring-critical/50',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-critical font-semibold animate-fade-in mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
