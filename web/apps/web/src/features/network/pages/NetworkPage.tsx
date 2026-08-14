import React, { useState } from 'react';
import { 
  LayoutDashboard, Network, MessageSquare, BarChart3, Settings, 
  User, Plus, LogOut, Search, Sparkles, UserCheck, UserPlus, 
  Hash, ShieldCheck, Cpu, ArrowUpRight, CheckCircle2, Filter
} from 'lucide-react';

interface NetworkPageProps {
  user: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  onNavigateToDashboard: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export const NetworkPage: React.FC<NetworkPageProps> = ({
  user,
  onNavigateToDashboard,
  onNavigateToProfile,
  onLogout,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ai' | 'neural' | 'sys'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  const [connectedNodes, setConnectedNodes] = useState<Record<string, boolean>>({});

  const toggleConnect = (id: string) => {
    setConnectedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const highAffinityMatches = [
    {
      id: 'match-1',
      name: 'Dr. Sarah Vance',
      username: 'svance_neural',
      role: 'Specializing in latent space cartography',
      matchScore: '98%',
      links: '12.4k',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      isOnline: true,
    },
    {
      id: 'match-2',
      name: 'VOID_Art',
      username: 'void_construct',
      role: 'Synthesizing audio-visual hallucinations',
      matchScore: '94%',
      links: '8.9k',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      isOnline: false,
    },
  ];

  const networkDiscoveryNodes = [
    {
      id: 'disc-1',
      name: 'Kaelen Ren',
      username: 'kaelen_ren',
      role: 'Systems Architect',
      bio: 'Building scalable infrastructure for the decentralized web. Coffee addict.',
      tags: ['#Infrastructure', '#Web3', '#teknologi'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      banner: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600',
    },
    {
      id: 'disc-2',
      name: 'Nova Sync',
      username: 'nova_ghost',
      role: 'Data Ghost',
      bio: 'Extracting patterns from the noise. SecOps consultant by day, cyber-flaneur by night.',
      tags: ['#SecOps', '#DataVis', '#teknologi'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    },
    {
      id: 'disc-3',
      name: 'Unit_04',
      username: 'unit_zero',
      role: 'Generative Artist',
      bio: 'Exploring the intersection of logic gates and emotional resonance.',
      tags: ['#CyberArt', '#NeuralNet', '#AI_Art'],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
    },
  ];

  const trendingHashtags = [
    { tag: '#teknologi', postsCount: '89.4k Posts' },
    { tag: '#AI_Architects', postsCount: '45.2k Nodes' },
    { tag: '#Neon_Grid_City', postsCount: '12.8k Nodes' },
    { tag: '#ZeroDay_Exploits', postsCount: '8.9k Nodes' },
  ];

  const activeConnections = [
    { name: 'Lex_Terminal', status: 'Active', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' },
    { name: 'Cipher_X', status: 'Active', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100' },
    { name: 'Vera_Link', status: 'Active', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
  ];

  return (
    <div className="w-full h-screen bg-[#07090e] text-white flex overflow-hidden font-body">
      
      {/* ================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (20% Widescreen Column)                */}
      {/* ================================================================= */}
      <aside className="hidden lg:flex flex-col justify-between w-64 h-screen border-r border-white/5 bg-[#080a0f] p-6 shrink-0 select-none">
        <div className="space-y-6">
          {/* Branding Header */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <div className="w-full h-full bg-[#080a0f] rounded-[10px] flex items-center justify-center font-extrabold text-white text-sm">
                F
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-[#00f0ff] to-[#a855f7]">
                FLUIDS
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            {/* ACTIVE ITEM: NETWORK */}
            <a
              href="#network"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              <Network className="w-5 h-5 text-[#00f0ff]" />
              <span>Network</span>
            </a>

            <a
              href="#messages"
              className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <span>Messages</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#9d00ff] shadow-[0_0_8px_#9d00ff]" />
            </a>

            <a
              href="#analytics"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </a>

            <a
              href="#settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>

            <button
              type="button"
              onClick={onNavigateToProfile}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer group"
            >
              <User className="w-5 h-5 text-gray-400 group-hover:text-[#00f0ff] transition-colors" />
              <span>Profile</span>
            </button>
          </nav>

          {/* Glowing Create Post CTA Button */}
          <button
            type="button"
            className="w-full py-3.5 btn-neon-gradient flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Post</span>
          </button>
        </div>

        {/* Bottom Logout Button */}
        <div className="space-y-1 border-t border-white/5 pt-4 mt-auto">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/15 text-xs font-semibold transition-all text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* 2. CENTER NETWORK DISCOVERY STREAM (Independent Scroll)          */}
      {/* ================================================================= */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Search & Category Filter Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cyber nodes, creators, or #hashtags (e.g. #teknologi)..."
                className="w-full bg-[#0d1017] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => { setActiveFilter('all'); setSelectedHashtag(null); }}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeFilter === 'all' && !selectedHashtag
                  ? 'bg-white/10 border border-[#00f0ff]/50 text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              All Nodes
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('ai')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeFilter === 'ai'
                  ? 'bg-white/10 border border-[#00f0ff]/50 text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              AI Researchers
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('neural')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeFilter === 'neural'
                  ? 'bg-white/10 border border-[#00f0ff]/50 text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              Neural Artists
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('sys')}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeFilter === 'sys'
                  ? 'bg-white/10 border border-[#00f0ff]/50 text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              SysAdmins
            </button>

            {selectedHashtag && (
              <span className="px-3 py-1.5 rounded-xl bg-[#00f0ff]/20 border border-[#00f0ff] text-[#00f0ff] font-mono font-bold flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                {selectedHashtag}
                <button
                  type="button"
                  onClick={() => setSelectedHashtag(null)}
                  className="ml-1 hover:text-white"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* SECTION 1: High Affinity Vector Matches (ML Powered) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00f0ff]" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                High Affinity Vector Matches
              </h2>
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-widest font-mono">
              POWERED BY RECO ML
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highAffinityMatches.map((match) => {
              const isConnected = connectedNodes[match.id];
              return (
                <div
                  key={match.id}
                  className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-[#00f0ff]/40 transition-all flex items-start justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={match.avatar}
                        alt={match.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#00f0ff]/50 group-hover:scale-105 transition-transform"
                      />
                      {match.isOnline && (
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#080a0f] shadow-[0_0_8px_#10b981]" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                          {match.name}
                        </h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#00f0ff]/20 text-[#00f0ff] font-mono font-bold">
                          {match.matchScore} Match
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 block font-mono">@{match.username}</span>
                      <p className="text-xs text-gray-300 line-clamp-2 pt-0.5">{match.role}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleConnect(match.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isConnected
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'btn-neon-gradient'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <UserCheck className="w-4 h-4" />
                        <span>LINKED</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>CONNECT NODE</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: Network Discovery Grid (With Interactive Hashtags) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#9d00ff]" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Network Discovery Clusters
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {networkDiscoveryNodes.map((node) => {
              const isConnected = connectedNodes[node.id];
              return (
                <div
                  key={node.id}
                  className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-[#9d00ff]/50 transition-all flex flex-col justify-between group"
                >
                  {/* Banner */}
                  <div className="relative h-24 w-full">
                    <img
                      src={node.banner}
                      alt={node.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080a0f] via-black/40 to-transparent" />
                    
                    {/* Avatar Overlap */}
                    <div className="absolute -bottom-5 left-4">
                      <img
                        src={node.avatar}
                        alt={node.name}
                        className="w-12 h-12 rounded-xl object-cover border-2 border-[#080a0f] shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 pt-7 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white group-hover:text-[#00f0ff] transition-colors">
                          {node.name}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono">@{node.username}</span>
                      </div>
                      <span className="text-xs text-[#00f0ff] font-semibold block">{node.role}</span>
                      <p className="text-xs text-gray-300 leading-relaxed pt-2">{node.bio}</p>
                    </div>

                    {/* Interactive Hashtag Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {node.tags.map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedHashtag(tag)}
                          className="px-2 py-1 rounded-md bg-white/5 hover:bg-[#00f0ff]/20 text-[10px] font-mono text-gray-300 hover:text-[#00f0ff] border border-white/5 hover:border-[#00f0ff]/30 transition-all cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => toggleConnect(node.id)}
                      className={`w-full mt-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isConnected
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      }`}
                    >
                      {isConnected ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Connected</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Follow Node</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ================================================================= */}
      {/* 3. RIGHT SIDEBAR WIDGETS (Trending Hashtags & Active Connections) */}
      {/* ================================================================= */}
      <aside className="hidden xl:flex flex-col w-80 border-l border-white/5 bg-[#080a0f] p-6 h-screen sticky top-0 space-y-6 overflow-y-auto shrink-0 select-none">
        
        {/* Trending Hashtags & Communities Widget */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#00f0ff]" />
            <h3 className="text-sm font-bold text-white">Trending #Hashtags</h3>
          </div>

          <div className="space-y-3">
            {trendingHashtags.map((h, i) => (
              <div
                key={i}
                onClick={() => setSelectedHashtag(h.tag)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/30 border border-transparent transition-all cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-[#00f0ff] transition-colors block font-mono">
                    {h.tag}
                  </span>
                  <span className="text-[10px] text-gray-400">{h.postsCount}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-[#00f0ff] transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Active Connections Widget */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <h3 className="text-sm font-bold text-white">Active Connections</h3>
          </div>

          <div className="space-y-3">
            {activeConnections.map((conn, i) => (
              <div key={i} className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                <div className="relative">
                  <img src={conn.avatar} alt={conn.name} className="w-9 h-9 rounded-xl object-cover border border-white/10" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#080a0f]" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white">{conn.name}</h4>
                  <span className="text-[10px] text-emerald-400">Connected Online</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </aside>

    </div>
  );
};

export default NetworkPage;
