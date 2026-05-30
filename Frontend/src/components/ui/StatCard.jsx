import React from 'react';
import { Card, CardContent } from './Card';
import { cn } from '../../lib/utils';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendColor = 'success',
  colorClass = 'text-blood',
  className,
  ...props
}) => {
  const colors = {
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    critical: 'text-critical bg-critical/10',
    info: 'text-info bg-info/10',
    blood: 'text-blood bg-blood/10',
  };

  return (
    <Card hoverable className={cn('relative border-white/5 overflow-hidden', className)} {...props}>
      {/* Glowing colored accent line on the left side of the metric card */}
      <div className="absolute top-0 left-0 w-1 h-full bg-blood" />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              {title}
            </span>
            <span className="text-4xl font-bold font-display text-text-primary tracking-wide mt-1 select-all">
              {value}
            </span>
          </div>
          {Icon && (
            <div className={cn('p-3 rounded-lg border border-white/5', colors[trendColor] || 'bg-white/5 text-text-primary')}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 mt-4 text-xs font-medium">
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold border border-white/5', colors[trendColor]?.split(' ')[0], colors[trendColor]?.split(' ')[1])}>
              {trend}
            </span>
            <span className="text-text-muted/80">since last check</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
