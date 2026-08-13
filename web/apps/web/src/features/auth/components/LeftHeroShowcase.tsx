import React from 'react';
import { TrendingUp, Play, Cpu, Activity, Radio } from 'lucide-react';

export const LeftHeroShowcase: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-center items-center p-8 md:p-12 overflow-hidden bg-[#07090e]">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff] opacity-10 blur-[120px] rounded-full animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#9d00ff] opacity-15 blur-[140px] rounded-full animate-pulse-glow" />

      {/* Grid Mesh Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Main Branding Header */}
      <div className="relative z-10 text-center mb-10 max-w-lg">
        <h1 className="text-6xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#ffffff] via-[#00f0ff] to-[#a855f7] mb-3">
          FLUIDS
        </h1>
        <p className="text-lg text-gray-300 font-medium tracking-wide">
          The Next-Gen High-Performance Social Network
        </p>
      </div>

      {/* Floating Showcase Cards Container */}
      <div className="relative z-10 w-full max-w-md h-[420px] flex items-center justify-center">
        
        {/* Card 1: Active Nodes Analytics (Left Back) */}
        <div className="absolute left-0 top-6 w-64 glass-panel rounded-2xl p-5 border border-white/10 animate-float shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00f0ff]" />
              <span className="text-xs font-semibold tracking-wider text-gray-300">
                Real-time Analytics
              </span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f0ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f0ff]"></span>
            </span>
          </div>

          {/* SVG Sparkline Graph */}
          <div className="w-full h-16 mb-3 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
              <path
                d="M 0 35 Q 20 20 40 25 T 80 10 T 100 5"
                fill="none"
                stroke="url(#cyanGradient)"
                strokeWidth="3"
              />
              <defs>
                <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between items-center text-[11px] text-gray-400">
            <span>Active Nodes</span>
            <span className="text-[#00f0ff] font-bold">142,850 Peak</span>
          </div>
        </div>

        {/* Card 2: Immersive Reels Showcase (Center Front) */}
        <div className="absolute z-20 w-72 glass-panel-glow rounded-2xl p-4 animate-float-delayed shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-[#9d00ff]/30 flex items-center justify-center border border-[#9d00ff]/50">
              <Play className="w-3 h-3 text-[#00f0ff] fill-[#00f0ff]" />
            </div>
            <span className="text-xs font-bold tracking-wide text-white">
              Immersive Reels
            </span>
          </div>

          {/* Video Thumbnail Mockup */}
          <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 border border-white/10 group">
            <img
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop"
              alt="Cyberpunk City Reels"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {/* Live Indicator */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-red-600/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
              <Radio className="w-3 h-3 animate-pulse" /> LIVE
            </div>

            {/* Reel Author */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#00f0ff] to-[#9d00ff] p-0.5">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
                  CN
                </div>
              </div>
              <span className="text-xs font-medium text-white shadow-sm">
                @cyber_node
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Network Sync Progress (Right Bottom) */}
        <div className="absolute right-0 bottom-6 w-60 glass-panel rounded-2xl p-4 border border-white/10 animate-float shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-[#a855f7]" />
            <span className="text-xs font-semibold text-gray-200">
              Network Nodes
            </span>
          </div>

          <div className="w-full bg-gray-800/80 rounded-full h-2 mb-2 overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-[#00f0ff] to-[#a855f7] h-full rounded-full w-[78%]" />
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-400">
            <span>Sync Status</span>
            <span className="text-[#a855f7] font-bold">78% Synced</span>
          </div>
        </div>

      </div>
    </div>
  );
};
