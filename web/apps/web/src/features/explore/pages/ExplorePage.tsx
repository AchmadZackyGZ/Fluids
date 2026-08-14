import React, { useState } from 'react';
import { 
  LayoutDashboard, Network, MessageSquare, Compass, Settings, 
  User, Plus, LogOut, Search, Film, Heart, MessageCircle, 
  Sparkles, TrendingUp, Grid, Play
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
  onNavigateToMessages?: () => void;
  onNavigateToReels?: () => void;
  onLogout: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  user,
  onNavigateToDashboard,
  onNavigateToNetwork,
  onNavigateToProfile,
  onNavigateToMessages,
  onNavigateToReels,
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

            <button
              type="button"
              onClick={onNavigateToNetwork}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer group"
            >
              <Network className="w-5 h-5 group-hover:text-[#00f0ff] transition-colors" />
              <span>Network</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToMessages}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 group-hover:text-[#00f0ff] transition-colors" />
                <span>Messages</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#9d00ff] shadow-[0_0_8px_#9d00ff]" />
            </button>

            {/* ACTIVE ITEM: EXPLORE (REPLACED ANALYTICS) */}
            <a
              href="#explore"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              <Compass className="w-5 h-5 text-[#00f0ff]" />
              <span>Explore</span>
            </a>

            <button
              type="button"
              onClick={onNavigateToReels}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer group"
            >
              <Film className="w-5 h-5 group-hover:text-[#00f0ff] transition-colors" />
              <span>Reels</span>
            </button>

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
      {/* 2. EXPLORE STREAM CONTENT (Instagram Explore Masonry Style)      */}
      {/* ================================================================= */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
        
        {/* Search Bar & Category Filter Bar */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts, reels, creators, or #hashtags (e.g. #teknologi)..."
              className="w-full bg-[#0d1017] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all shadow-lg"
            />
          </div>

          {/* Categories Horizontal Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'for_you', label: 'For You', icon: Sparkles },
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'reels', label: 'Reels & Videos', icon: Film },
              { id: 'cyberart', label: '#CyberArt', icon: Grid },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white/10 border border-[#00f0ff]/50 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Explore Clean 3-Column Uniform Grid (Persis Instagram Explore) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 pb-8">
          {exploreGridItems.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group cursor-pointer shadow-md bg-[#0d1017]"
            >
              {/* Media Image */}
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Reel Video Indicator Badge */}
              {item.type === 'reel' && (
                <div className="absolute top-3 right-3 p-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-md">
                  <Play className="w-3.5 h-3.5 fill-white text-white" />
                </div>
              )}

              {/* Hover Dark Overlay with Likes & Comments Count */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 text-white backdrop-blur-xs">
                <span className="text-xs font-mono font-semibold text-[#00f0ff]">
                  {item.author}
                </span>

                <div className="space-y-2">
                  <p className="text-xs font-bold line-clamp-2">{item.title}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-bold pt-1">
                    <span className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                      {item.likes}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-[#00f0ff]" />
                      {item.comments}
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
