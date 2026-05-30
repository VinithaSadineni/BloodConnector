import React from 'react';
import { cn, statusColor } from '../../lib/utils';

export const StatusBadge = ({ status = 'pending', className, ...props }) => {
  const styles = statusColor(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 border text-xs font-semibold rounded-full select-none capitalize font-body',
        styles.bg,
        styles.text,
        className
      )}
      {...props}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full inline-block', styles.dot)} />
      {status}
    </span>
  );
};

export default StatusBadge;
