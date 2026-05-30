import React from 'react';
import { cn, urgencyColor } from '../../lib/utils';

export const UrgencyIndicator = ({ level = 'normal', className, showIcon = true, ...props }) => {
  const styles = urgencyColor(level);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 border rounded-lg text-xs font-semibold select-none font-body uppercase tracking-wider',
        styles.bg,
        styles.text,
        styles.border,
        level === 'critical' && 'animate-sos-pulse-ring',
        className
      )}
      {...props}
    >
      {showIcon && <span className={cn(level === 'critical' && 'animate-bounce')}>{styles.icon}</span>}
      <span>{styles.label}</span>
    </span>
  );
};

export default UrgencyIndicator;
