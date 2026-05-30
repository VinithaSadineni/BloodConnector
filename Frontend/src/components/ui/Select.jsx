import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({
  className,
  label,
  error,
  options = [],
  placeholder,
  ...props
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5 font-body relative">
      {label && (
        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          ref={ref}
          className={cn(
            'w-full bg-surface-3 text-text-primary border border-border rounded-lg py-2.5 px-3 pr-10 focus:border-blood focus:ring-1 focus:ring-blood/50 outline-none transition-all duration-200 text-sm appearance-none cursor-pointer',
            error && 'border-critical focus:border-critical focus:ring-critical/50',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-text-muted/65 bg-surface-2">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} className="text-text-primary bg-surface-2">
                {lbl}
              </option>
            );
          })}
        </select>
        <span className="absolute right-3 pointer-events-none text-text-muted">
          <ChevronDown className="w-4 h-4" />
        </span>
      </div>
      {error && (
        <span className="text-xs text-critical font-semibold animate-fade-in mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
