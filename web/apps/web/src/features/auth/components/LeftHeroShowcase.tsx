import React from 'react';
import { TrendingUp, Play, Cpu, Radio, GitPullRequest, Terminal } from 'lucide-react';
import { FluidsLogoMark } from '../../../components/ui/FluidsLogo';

export const LeftHeroShowcase: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center p-8 md:p-12 overflow-hidden bg-canvas select-none">
      {/* Subtle Grid Background */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Main Branding Header */}
      <div className="relative z-10 flex flex-col items-center text-center mb-8 max-w-lg">
        <FluidsLogoMark size={56} className="mb-3 drop-shadow-lg" />
        <h1 className="text-5xl font-bold tracking-wider text-text-primary font-display mb-1.5">
          FLUIDS
        </h1>
        <p className="text-xs text-text-secondary font-mono tracking-wide">
          Sosial Media Berkecepatan Tinggi untuk Developer
        </p>
      </div>

      {/* Floating Showcase Cards Container */}
      <div className="relative z-10 w-full max-w-md h-[400px] flex items-center justify-center">
        
        {/* Card 1: Active Commits Analytics (Left Back) */}
        <div className="absolute left-0 top-4 w-60 bg-surface rounded-md p-4 border border-border-default shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-semibold text-text-primary font-mono">
                Aktivitas Git Realtime
              </span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-diff-add"></span>
            </span>
          </div>

          {/* SVG Sparkline Graph */}
          <div className="w-full h-14 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
              <path
                d="M 0 35 Q 20 20 40 25 T 80 10 T 100 5"
                fill="none"
                stroke="#E8A33D"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono">
            <span>Commit 24 Jam</span>
            <span className="text-text-primary font-semibold">142,850 Total</span>
          </div>
        </div>

        {/* Card 2: Developer Showcase (Center Front) */}
        <div className="absolute z-20 w-72 bg-surface-raised rounded-md p-4 shadow-2xl border border-border-strong space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-sm bg-surface flex items-center justify-center border border-border-default">
              <Terminal className="w-3.5 h-3.5 text-accent" />
            </div>
            <span className="text-xs font-semibold text-text-primary font-mono">
              Live Showcase Stream
            </span>
          </div>

          {/* Thumbnail Mockup */}
          <div className="relative w-full h-36 rounded-sm overflow-hidden border border-border-default group bg-surface">
            <img
              src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop"
              alt="Developer Workspace"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Live Indicator */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-xs bg-diff-remove text-[9px] font-bold text-white flex items-center gap-1 font-mono">
              <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE STREAM
            </div>

            {/* Author */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-surface-raised border border-border-default flex items-center justify-center text-[9px] font-mono font-bold text-accent">
                GO
              </div>
              <span className="text-xs font-mono font-medium text-text-primary">
                @go_architect
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: PR & Build Metrics (Right Bottom) */}
        <div className="absolute right-0 bottom-4 w-56 bg-surface rounded-md p-3.5 border border-border-default shadow-xl space-y-2.5">
          <div className="flex items-center gap-2">
            <GitPullRequest className="w-3.5 h-3.5 text-diff-add" />
            <span className="text-xs font-semibold text-text-primary font-mono">
              Pull Request Merge
            </span>
          </div>

          <div className="w-full bg-surface-raised rounded-xs h-1.5 overflow-hidden border border-border-default">
            <div className="bg-diff-add h-full rounded-xs w-[84%]" />
          </div>

          <div className="flex justify-between items-center text-[10px] text-text-secondary font-mono">
            <span>CI/CD Pipeline</span>
            <span className="text-diff-add font-semibold font-mono">98% Passed</span>
          </div>
        </div>

      </div>
    </div>
  );
};
