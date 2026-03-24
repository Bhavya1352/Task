import React from 'react';
import { cn } from './Badge';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function Avatar({ name, color = '#3B82F6', size = 'md', className, ...props }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeStyles = {
    xs: 'h-5 w-5 text-[8px]',
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900',
        sizeStyles[size],
        className
      )}
      style={{ backgroundColor: color }}
      title={name}
      {...props}
    >
      {initials}
    </div>
  );
}

export function AvatarGroup({ 
  children, 
  max = 3, 
  size = 'md',
  className 
}: { 
  children: React.ReactNode; 
  max?: number; 
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  const sizeStyles = {
    xs: 'h-5 w-5',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  return (
    <div className={cn("flex -space-x-2 overflow-hidden", className)}>
      {visibleChildren.map((child, i) => (
        <div key={i} className="relative transition-transform duration-300 hover:scale-110 hover:z-10">
          {React.cloneElement(child as React.ReactElement, { size })}
        </div>
      ))}
      {remainingCount > 0 && (
        <div 
          className={cn(
            "z-10 flex items-center justify-center rounded-full bg-gray-100 text-[10px] font-black text-gray-600 shadow-sm ring-2 ring-white dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-900",
            sizeStyles[size]
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
