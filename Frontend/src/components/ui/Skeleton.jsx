import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded bg-surface-3/50', className)}
      {...props}
    />
  );
};

/**
 * Standard Loading Skeleton for Emergency / Seeker / Donor Cards
 */
export const CardSkeleton = () => {
  return (
    <div className="glass-panel rounded-xl p-5 border border-white/5 flex flex-col gap-4 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="w-1/3 h-4" />
          <Skeleton className="w-1/4 h-3" />
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-4/5 h-4" />
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
        <Skeleton className="w-20 h-7 rounded-lg" />
        <Skeleton className="w-20 h-7 rounded-lg" />
      </div>
    </div>
  );
};

/**
 * Loading Skeleton for Dashboard Tables (Users list, history list, etc.)
 */
export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full flex flex-col gap-4 animate-pulse">
      <div className="flex gap-4 border-b border-border/80 pb-3">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-5" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="flex-1 h-8 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
