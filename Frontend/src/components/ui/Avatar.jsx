import React from 'react';
import { cn } from '../../lib/utils';

export const Avatar = ({
  name = '',
  src,
  size = 'md',
  className,
  status,
  ...props
}) => {
  const getInitials = (userName) => {
    if (!userName) return 'U';
    const parts = userName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-2xl font-bold font-display tracking-wider',
  };

  const statusColors = {
    online: 'bg-success',
    available: 'bg-success',
    offline: 'bg-slate-500',
    unavailable: 'bg-slate-500',
    busy: 'bg-critical',
    pending: 'bg-warning',
  };

  return (
    <div className="relative inline-block select-none" {...props}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-surface-3 border border-border text-text-primary overflow-hidden transition-all duration-200 shadow-md',
          sizes[size],
          className
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="tracking-wider">{getInitials(name)}</span>
        )}
      </div>
      {status && statusColors[status] && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-surface w-2.5 h-2.5 shadow-sm animate-pulse',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
