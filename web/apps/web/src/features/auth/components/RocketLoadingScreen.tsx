import React, { useEffect } from 'react';
import { Rocket, Sparkles } from 'lucide-react';

interface RocketLoadingScreenProps {
  onComplete: () => void;
  userName?: string;
}

export const RocketLoadingScreen: React.FC<RocketLoadingScreenProps> = ({ onComplete, userName }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] overflow-hidden">
      {/* Background Ambient Glowing Orbs */}
      <div className="absolute w-96 h-96 bg-[#00f0ff] opacity-20 blur-[130px] rounded-full animate-pulse-glow" />
      <div className="absolute w-96 h-96 bg-[#9d00ff] opacity-20 blur-[150px] rounded-full animate-pulse-glow" />

      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* Central Rocket Animation Container */}
      <div className="relative flex flex-col items-center">
        {/* Particle Trail Animation */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] p-0.5 shadow-[0_0_50px_rgba(0,240,255,0.6)] animate-bounce">
            <div className="w-full h-full bg-[#080a0f] rounded-full flex items-center justify-center">
              <Rocket className="w-10 h-10 text-[#00f0ff] -rotate-45" />
            </div>
          </div>
        </div>

        {/* Text Showcase */}
        <div className="text-center space-y-2 relative z-10 max-w-sm px-4">
          <div className="flex items-center justify-center gap-2 text-[#00f0ff] font-bold text-xs tracking-widest uppercase">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Initializing Protocol</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">
            Launching {userName ? `${userName}'s` : 'Your'} Identity...
          </h2>
          <p className="text-xs text-gray-400">
            Setting up high-performance neural nodes & sync parameters.
          </p>
        </div>

        {/* Progress Loading Bar */}
        <div className="w-64 bg-gray-900/80 rounded-full h-1.5 mt-8 overflow-hidden border border-white/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <div className="bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#00f0ff] h-full rounded-full animate-[pulseGlow_1.5s_ease-in-out_infinite] w-full" />
        </div>
      </div>
    </div>
  );
};
