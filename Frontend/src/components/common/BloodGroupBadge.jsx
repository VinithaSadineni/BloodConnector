import React from 'react';
import { cn, bloodGroupColor } from '../../lib/utils';

export const BloodGroupBadge = ({ group = 'O+', size = 'md', className, ...props }) => {
  const styles = bloodGroupColor(group);

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] font-bold border rounded-md',
    md: 'px-3 py-1 text-xs font-bold border rounded-lg',
    lg: 'px-4 py-1.5 text-sm font-bold border rounded-xl',
    xl: 'px-5 py-2 text-lg font-bold border rounded-xl tracking-wider',
  };

  return (
    <span
      className={cn(
        'font-mono inline-flex items-center justify-center font-bold tracking-wide select-none',
        styles.bg,
        styles.text,
        styles.border,
        sizes[size],
        className
      )}
      {...props}
    >
      {group}
    </span>
  );
};

export default BloodGroupBadge;
