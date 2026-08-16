import React, { useEffect } from 'react';
import { Terminal, Sparkles } from 'lucide-react';

interface RocketLoadingScreenProps {
  onComplete: () => void;
  userName?: string;
}

export const RocketLoadingScreen: React.FC<RocketLoadingScreenProps> = ({ onComplete, userName }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas overflow-hidden select-none">
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Central Animation Container */}
      <div className="relative flex flex-col items-center">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-md bg-surface-raised border border-border-default flex items-center justify-center shadow-lg">
            <Terminal className="w-8 h-8 text-accent" />
          </div>
        </div>

        {/* Text Showcase */}
        <div className="text-center space-y-2 relative z-10 max-w-sm px-4">
          <div className="flex items-center justify-center gap-2 text-accent font-semibold text-xs tracking-wider font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Memuat Lingkungan Developer</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary font-display">
            Menyiapkan Workspace {userName ? `${userName}` : 'Anda'}...
          </h2>
          <p className="text-xs text-text-secondary font-mono">
            Menghubungkan ke node backend FLUIDS & memuat feed komunitas.
          </p>
        </div>

        {/* Progress Loading Bar */}
        <div className="w-56 bg-surface-raised rounded-full h-1 mt-6 overflow-hidden border border-border-default">
          <div className="bg-accent h-full rounded-full animate-pulse w-full" />
        </div>
      </div>
    </div>
  );
};

export default RocketLoadingScreen;
