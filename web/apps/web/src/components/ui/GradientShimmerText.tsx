import React from 'react';
import { cn } from '../../lib/utils';

interface GradientShimmerTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export const GradientShimmerText: React.FC<GradientShimmerTextProps> = ({
  children,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-block bg-clip-text text-transparent bg-[linear-gradient(110deg,#EDEDEF,45%,#E8A33D,55%,#EDEDEF)] bg-[length:250%_100%] animate-[shimmer_4s_infinite]',
        className
      )}
    >
      {children}
    </span>
  );
};
