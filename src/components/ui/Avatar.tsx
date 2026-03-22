import React from 'react';
import { cn } from './Badge';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ name, color = '#3B82F6', size = 'md', className, ...props }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeStyles = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-medium text-white shadow-sm ring-2 ring-white',
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

export function AvatarGroup({ children, max = 3 }: { children: React.ReactNode; max?: number }) {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = childrenArray.length - max;

  return (
    <div className="flex -space-x-2 overflow-hidden">
      {visibleChildren}
      {remainingCount > 0 && (
        <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 shadow-sm ring-2 ring-white">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
