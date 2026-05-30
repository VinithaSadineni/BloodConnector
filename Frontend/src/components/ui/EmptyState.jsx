import React from 'react';
import { cn } from '../../lib/utils';
import Button from './Button';

export const EmptyState = ({
  title,
  message,
  icon: Icon,
  actionLabel,
  onAction,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 glass-panel rounded-xl border border-white/5 max-w-md mx-auto w-full my-6 font-body',
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="p-4 rounded-full bg-white/5 border border-white/5 text-text-muted/60 mb-4 animate-pulse">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-bold text-text-primary mb-1.5 tracking-wide">
        {title}
      </h3>
      <p className="text-xs text-text-muted/80 max-w-xs mb-5 leading-relaxed">
        {message}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
