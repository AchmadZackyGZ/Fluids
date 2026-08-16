import React from 'react';

interface FluidsLogoProps {
  size?: number;
  className?: string;
  withText?: boolean;
  withSlogan?: boolean;
}

export const FluidsLogoMark: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Speech Bubble Background with Tail */}
      <path
        d="M 22 10 
           H 74 
           C 84 10, 90 16, 90 26 
           V 68 
           C 90 70, 90 72, 90 72
           L 100 88 
           C 100 90, 98 90, 95 90 
           H 80 
           H 22 
           C 12 90, 6 84, 6 74 
           V 26 
           C 6 16, 12 10, 22 10 Z"
        fill="#E8A33D"
      />

      {/* Negative Space Cutout for Letter "F" */}
      <path
        d="M 26 26 
           H 74 
           V 40 
           H 42 
           V 49 
           H 66 
           V 61 
           H 42 
           V 74 
           H 26 
           Z"
        fill="#0D0E10"
      />
    </svg>
  );
};

export const FluidsLogo: React.FC<FluidsLogoProps> = ({
  size = 32,
  className = '',
  withText = false,
  withSlogan = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <FluidsLogoMark size={size} />
      {withText && (
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-wider text-text-primary font-display leading-tight">
            FLUIDS
          </span>
          {withSlogan && (
            <span className="text-[9px] font-mono font-semibold tracking-widest text-text-secondary uppercase block -mt-0.5">
              Sosmed for Developers
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FluidsLogo;
