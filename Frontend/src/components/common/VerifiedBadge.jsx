import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export const VerifiedBadge = ({ className, ...props }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-success/15 border border-success/30 text-success text-[9px] font-bold uppercase tracking-wider font-mono select-none',
        className
      )}
      title="Verified by Admin"
      {...props}
    >
      <ShieldCheck className="w-3 h-3 text-success" />
      <span>Verified</span>
    </span>
  );
};

export default VerifiedBadge;
