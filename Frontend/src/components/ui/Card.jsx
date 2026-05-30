import React from 'react';
import { cn } from '../../lib/utils';

export const Card = React.forwardRef(({ className, children, hoverable = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'glass-panel rounded-xl overflow-hidden shadow-card transition-all duration-300',
        hoverable && 'glass-panel-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('p-5 border-b border-border/80 flex flex-col gap-1.5', className)} {...props} />
);

export const CardTitle = ({ className, children, ...props }) => (
  <h3 className={cn('text-lg font-bold text-text-primary tracking-wide leading-none', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-xs text-text-muted/80', className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-5', className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div className={cn('p-5 border-t border-border/80 flex items-center justify-end gap-3 bg-surface-2/20', className)} {...props} />
);

export default Card;
