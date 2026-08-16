import React, { useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { 
  Search, Heart, MessageCircle, Sparkles, TrendingUp, Grid, Play, Hash, Film 
} from 'lucide-react';

interface ExplorePageProps {
  user: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  onNavigateToDashboard: () => void;
  onNavigateToNetwork: () => void;
  onNavigateToProfile: () => void;
  onNavigateToMessages: () => void;
  onNavigateToReels: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  user,
  onNavigateToDashboard,
  onNavigateToNetwork,
  onNavigateToProfile,
  onNavigateToMessages,
  onNavigateToReels,
  onNavigateToSettings,
  onLogout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'for_you' | 'trending' | 'reels' | 'cyberart'>('for_you');

  const exploreGridItems = [
    {
      id: 1,
      type: 'reel',
      title: 'Kenapa Skyrim Masih Banyak Dimainin?',
      img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
      likes: '45.2k',
      comments: '1.2k',
      author: '@skyrim_node',
      isLarge: true,
    },
    {
      id: 2,
      type: 'photo',
      title: 'Neural Matrix Shader v2',
      img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
      likes: '12.8k',
      comments: '342',
      author: '@neon_architect',
      isLarge: false,
    },
    {
      id: 3,
      type: 'reel',
      title: 'Claude AI Invisible Watermark Tech',
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
      likes: '89.4k',
      comments: '4.8k',
      author: '@tech_insider',
      isLarge: false,
    },
    {
      id: 4,
      type: 'photo',
      title: 'Future Tech 2030 Architecture',
      img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
      likes: '23.1k',
      comments: '912',
      author: '@cyber_vision',
      isLarge: false,
    },
    {
      id: 5,
      type: 'reel',
      title: 'Mobile Gaming High Fidelity Stream',
      img: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=600&auto=format&fit=crop',
      likes: '67.3k',
      comments: '2.1k',
      author: '@gamer_pulse',
      isLarge: false,
    },
    {
      id: 6,
      type: 'photo',
      title: 'Estonia Tech Capital Node',
      img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
      likes: '14.5k',
      comments: '410',
      author: '@global_tech',
      isLarge: false,
    },
    {
      id: 7,
      type: 'reel',
      title: 'AI Data Center Cooling Innovations',
      img: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600&auto=format&fit=crop',
      likes: '38.9k',
      comments: '1.5k',
      author: '@datacenter_hacks',
      isLarge: true,
    },
    {
      id: 8,
      type: 'photo',
      title: 'Black Matcha Cyber Vibe',
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
      likes: '9.2k',
      comments: '280',
      author: '@vibe_node',
      isLarge: false,
    },
  ];

  return (
    <div className="w-full h-screen bg-canvas text-text-primary flex overflow-hidden font-body select-none">
      
      {/* ================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      {/* ================================================================= */}
      <Sidebar
        activeView="explore"
        user={user}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToNetwork={onNavigateToNetwork}
        onNavigateToExplore={() => {}}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToReels={onNavigateToReels}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onLogout}
      />

      {/* ================================================================= */}
      {/* 2. EXPLORE STREAM CONTENT */}
      {/* ================================================================= */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-6 space-y-5 max-w-5xl mx-auto scrollbar-none">
        
        {/* Search Bar & Category Filter Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari postingan, repositori, developer, atau #tagar (misal #golang)..."
              className="w-full bg-surface border border-border-default rounded-sm py-2.5 pl-10 pr-4 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong transition-colors"
            />
          </div>

          {/* Categories Horizontal Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'for_you', label: 'Untuk Anda', icon: Sparkles },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'reels', label: 'Reels & Video', icon: Film },
              { id: 'cyberart', label: '#Arsitektur', icon: Grid },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-1.5 rounded-sm font-mono font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-accent-muted border border-accent/40 text-accent'
                      : 'bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explore Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 pb-8">
          {exploreGridItems.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-md overflow-hidden border border-border-default group cursor-pointer bg-surface"
            >
              {/* Media Image */}
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Reel Video Indicator Badge */}
              {item.type === 'reel' && (
                <div className="absolute top-2.5 right-2.5 p-1 rounded-sm bg-canvas/80 text-text-primary border border-border-default shadow-sm">
                  <Play className="w-3 h-3 fill-text-primary text-text-primary" />
                </div>
              )}

              {/* Hover Dark Overlay with Likes & Comments Count */}
              <div className="absolute inset-0 bg-canvas/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3.5 text-text-primary">
                <span className="text-xs font-mono font-semibold text-accent">
                  {item.author}
                </span>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold line-clamp-2">{item.title}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-mono pt-1 text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-diff-remove fill-diff-remove" />
                      <span>{item.likes}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{item.comments}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

    </div>
  );
};

export default ExplorePage;
