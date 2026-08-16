import React, { useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { Search, Hash } from 'lucide-react';

interface NetworkPageProps {
  user: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  onNavigateToDashboard: () => void;
  onNavigateToProfile: () => void;
  onNavigateToExplore: () => void;
  onNavigateToMessages: () => void;
  onNavigateToReels: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

export const NetworkPage: React.FC<NetworkPageProps> = ({
  user,
  onNavigateToDashboard,
  onNavigateToProfile,
  onNavigateToExplore,
  onNavigateToMessages,
  onNavigateToReels,
  onNavigateToSettings,
  onLogout,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'creators' | 'devs' | 'designers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string) => {
    setFollowingMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const suggestedConnections = [
    {
      id: 'sug-1',
      name: 'Dr. Sarah Vance',
      username: 'svance_neural',
      role: 'Spatial Computing Architect',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      isOnline: true,
    },
    {
      id: 'sug-2',
      name: 'VOID Art',
      username: 'void_construct',
      role: 'Generative Audio-Visual Designer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      isOnline: false,
    },
  ];

  const discoveryCreators = [
    {
      id: 'disc-1',
      name: 'Kaelen Ren',
      username: 'kaelen_ren',
      role: 'Systems Architect',
      bio: 'Membuat infrastruktur terdistribusi berkinerja tinggi.',
      tags: ['#Infrastruktur', '#Web3', '#Teknologi'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      banner: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600',
    },
    {
      id: 'disc-2',
      name: 'Nova Sync',
      username: 'nova_ghost',
      role: 'SecOps Specialist',
      bio: 'Keamanan sistem dan visualisasi analisis data.',
      tags: ['#SecOps', '#DataVis', '#Teknologi'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
    },
    {
      id: 'disc-3',
      name: 'Unit 04',
      username: 'unit_zero',
      role: 'Desainer UI/UX',
      bio: 'Eksplorasi estetika antarmuka fungsional & minimalis.',
      tags: ['#CyberArt', '#DesainUI', '#UIUX'],
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      banner: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
    },
  ];

  const trendingHashtags = [
    { tag: '#teknologi', postsCount: '89.4rb postingan' },
    { tag: '#desain_ui', postsCount: '45.2rb postingan' },
    { tag: '#cybersecurity', postsCount: '12.8rb postingan' },
    { tag: '#web_development', postsCount: '8.9rb postingan' },
  ];

  const activeConnections = [
    { name: 'Lex Terminal', handle: '@lex_terminal', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100' },
    { name: 'Cipher X', handle: '@cipher_x', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100' },
    { name: 'Vera Link', handle: '@vera_link', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
  ];

  return (
    <div className="w-full h-screen bg-[#07090e] text-white flex overflow-hidden font-body select-none">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <Sidebar
        activeView="network"
        user={user}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToNetwork={() => {}}
        onNavigateToExplore={onNavigateToExplore}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToReels={onNavigateToReels}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onLogout}
      />

      {/* 2. CENTER STREAM */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 space-y-8 max-w-4xl mx-auto scrollbar-none">
        
        {/* Search & Category Filter Header */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari developer, repositori, atau #topik..."
              className="w-full bg-surface border border-border-default rounded-sm py-2 pl-9 pr-4 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong transition-colors"
            />
          </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border-default">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-sm font-mono font-semibold transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-accent-muted border border-accent/40 text-accent'
                  : 'bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
              }`}
            >
              Semua
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('creators')}
              className={`px-3 py-1.5 rounded-sm font-mono font-semibold transition-colors cursor-pointer ${
                activeFilter === 'creators'
                  ? 'bg-accent-muted border border-accent/40 text-accent'
                  : 'bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
              }`}
            >
              Kreator
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('devs')}
              className={`px-3 py-1.5 rounded-sm font-mono font-semibold transition-colors cursor-pointer ${
                activeFilter === 'devs'
                  ? 'bg-accent-muted border border-accent/40 text-accent'
                  : 'bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
              }`}
            >
              Pengembang
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('designers')}
              className={`px-3 py-1.5 rounded-sm font-mono font-semibold transition-colors cursor-pointer ${
                activeFilter === 'designers'
                  ? 'bg-accent-muted border border-accent/40 text-accent'
                  : 'bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
              }`}
            >
              Desainer
            </button>

            {selectedHashtag && (
              <span className="px-2.5 py-1 rounded-sm bg-accent-muted border border-accent/40 text-accent font-mono text-xs flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" />
                {selectedHashtag}
                <button
                  type="button"
                  onClick={() => setSelectedHashtag(null)}
                  className="ml-1 hover:text-text-primary cursor-pointer"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

        {/* SECTION 1: Saran untuk Anda */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary tracking-wide">
              Saran untuk Anda
            </h2>
            <p className="text-xs text-text-secondary">
              Pengguna dengan minat dan keahlian yang serupa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedConnections.map((userCard) => {
              const isFollowing = followingMap[userCard.id];
              return (
                <div
                  key={userCard.id}
                  className="bg-surface rounded-md p-4 border border-border-default hover:border-border-strong transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={userCard.avatar}
                        alt={userCard.name}
                        className="w-11 h-11 rounded-full object-cover border border-border-default aspect-square"
                      />
                      {userCard.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-diff-add border-2 border-surface" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xs font-semibold text-text-primary truncate">
                        {userCard.name}
                      </h3>
                      <span className="text-[11px] text-text-secondary block font-mono">@{userCard.username}</span>
                      <p className="text-[11px] text-text-muted truncate pt-0.5">{userCard.role}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleFollow(userCard.id)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-colors shrink-0 cursor-pointer ${
                      isFollowing
                        ? 'bg-surface border border-border-default text-text-muted hover:text-diff-remove'
                        : 'bg-surface-raised border border-border-strong hover:border-accent text-text-primary hover:text-accent font-semibold'
                    }`}
                  >
                    {isFollowing ? 'Mengikuti' : 'Ikuti'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: Jelajahi Kreator & Komunitas */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary tracking-wide">
              Jelajahi Kreator & Komunitas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {discoveryCreators.map((node) => {
              const isFollowing = followingMap[node.id];
              return (
                <div
                  key={node.id}
                  className="bg-surface rounded-md overflow-hidden border border-border-default hover:border-border-strong transition-colors flex flex-col justify-between"
                >
                  {/* Banner */}
                  <div className="relative h-20 w-full">
                    <img
                      src={node.banner}
                      alt={node.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-black/40 to-transparent" />
                    
                    {/* Avatar Overlap */}
                    <div className="absolute -bottom-4 left-4">
                      <img
                        src={node.avatar}
                        alt={node.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-surface aspect-square"
                      />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 pt-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-text-primary truncate">
                          {node.name}
                        </h3>
                        <span className="text-[10px] text-text-secondary font-mono">@{node.username}</span>
                      </div>
                      <span className="text-[11px] text-accent font-mono block pt-0.5">{node.role}</span>
                      <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed pt-1.5">{node.bio}</p>
                    </div>

                    {/* Hashtag Badges */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {node.tags.map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedHashtag(tag)}
                          className="px-2 py-0.5 rounded-sm bg-surface-raised hover:bg-surface border border-border-default hover:border-border-strong text-[10px] font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={() => toggleFollow(node.id)}
                      className={`w-full mt-2 py-1.5 rounded-sm text-xs font-mono transition-colors cursor-pointer ${
                        isFollowing
                          ? 'bg-surface border border-border-default text-text-muted hover:text-diff-remove'
                          : 'bg-surface-raised border border-border-strong hover:border-accent text-text-primary hover:text-accent font-semibold'
                      }`}
                    >
                      {isFollowing ? 'Mengikuti' : 'Ikuti'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* 3. RIGHT SIDEBAR WIDGETS */}
      <aside className="hidden xl:flex flex-col w-80 border-l border-border-default bg-canvas p-5 h-screen sticky top-0 space-y-4 overflow-y-auto shrink-0 select-none scrollbar-none">
        
        {/* Trending Hashtags */}
        <div className="bg-surface rounded-md p-4 border border-border-default space-y-3">
          <h3 className="text-xs font-semibold text-text-primary tracking-wide">
            Topik Populer
          </h3>

          <div className="space-y-2">
            {trendingHashtags.map((h, i) => (
              <div
                key={i}
                onClick={() => setSelectedHashtag(h.tag)}
                className="flex items-center justify-between p-2.5 rounded-sm bg-surface-raised hover:bg-surface-raised/80 border border-border-default hover:border-border-strong transition-colors cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-mono font-semibold text-text-primary group-hover:text-accent transition-colors block">
                    {h.tag}
                  </span>
                  <span className="text-[10px] text-text-secondary font-mono">{h.postsCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Connections */}
        <div className="bg-surface rounded-md p-4 border border-border-default space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-text-primary tracking-wide">
              Koneksi Aktif
            </h3>
            <span className="w-2 h-2 rounded-full bg-diff-add" />
          </div>

          <div className="space-y-2.5">
            {activeConnections.map((conn, i) => (
              <div key={i} className="flex items-center gap-2.5 p-1.5 rounded-sm hover:bg-surface-raised transition-colors cursor-pointer">
                <div className="relative">
                  <img src={conn.avatar} alt={conn.name} className="w-8 h-8 rounded-full object-cover border border-border-default aspect-square" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-diff-add border border-surface" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-text-primary truncate">{conn.name}</h4>
                  <span className="text-[10px] text-text-secondary font-mono block">{conn.handle}</span>
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
