import React, { useState } from 'react';
import { 
  LayoutDashboard, Network, MessageSquare, Compass, Settings, 
  User, Plus, HelpCircle, LogOut, Edit3, Share2, Grid, Film, 
  Bookmark, CheckCircle2 
} from 'lucide-react';
import { EditProfileModal } from '../components/EditProfileModal';
import { StoryViewerModal, StoryItem } from '../../feed/components/StoryViewerModal';
import { AddStoryModal } from '../../feed/components/AddStoryModal';

interface ProfilePageProps {
  user: {
    id?: string;
    username?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
  };
  onNavigateToDashboard: () => void;
  onNavigateToNetwork?: () => void;
  onNavigateToExplore?: () => void;
  onUpdateProfile: (updatedData: { fullName: string; username: string; bio: string; avatarUrl: string }) => void;
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onNavigateToDashboard,
  onNavigateToNetwork,
  onNavigateToExplore,
  onUpdateProfile,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [activeStoryView, setActiveStoryView] = useState<StoryItem[] | null>(null);

  const [userNote, setUserNote] = useState<string>('Catatan status...');

  const displayName = user.fullName || 'Achmad Zacky';
  const username = user.username || 'achmadzacky';
  const bio = user.bio || 'Lead Cybernetics Architect at FLUIDS. Crafting neural interfaces and high-fidelity augmented realities. Exploring the void between human cognition and synthetic consciousness.';
  const initialLetter = displayName.charAt(0).toUpperCase();

  const storyHighlights = [
    {
      id: 'hl-1',
      title: 'CyberArt',
      img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150',
      story: {
        id: 's-hl-1',
        userName: displayName,
        userAvatar: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        mediaUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800',
        caption: 'CyberArt collection 2026 #CyberArt',
        timeAgo: 'Highlights',
      },
    },
    {
      id: 'hl-2',
      title: 'Projects',
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      story: {
        id: 's-hl-2',
        userName: displayName,
        userAvatar: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
        caption: 'Neural Architecture UI Projects',
        timeAgo: 'Highlights',
      },
    },
    {
      id: 'hl-3',
      title: 'Setup 2026',
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150',
      story: {
        id: 's-hl-3',
        userName: displayName,
        userAvatar: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800',
        caption: 'Cyberpunk Battlestation Node',
        timeAgo: 'Highlights',
      },
    },
  ];

  const samplePosts = [
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
  ];

  const handleAddStory = (newStory: { mediaUrl: string; caption: string; note: string }) => {
    if (newStory.note) setUserNote(newStory.note);
  };

  return (
    <div className="w-full h-screen bg-[#07090e] text-white flex overflow-hidden font-body">
      
      {/* Modal Edit Profile */}
      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSave={onUpdateProfile}
        />
      )}

      {/* Modal Add Story */}
      {isAddStoryOpen && (
        <AddStoryModal
          user={user}
          onClose={() => setIsAddStoryOpen(false)}
          onAddStory={handleAddStory}
        />
      )}

      {/* Modal Fullscreen Story Viewer */}
      {activeStoryView && (
        <StoryViewerModal
          stories={activeStoryView}
          onClose={() => setActiveStoryView(null)}
        />
      )}

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

            <button
              type="button"
              onClick={onNavigateToExplore}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer group"
            >
              <Compass className="w-5 h-5 group-hover:text-[#00f0ff] transition-colors" />
              <span>Explore</span>
            </button>

            <a
              href="#settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>

            {/* Profile Navigation (ACTIVE STATE) */}
            <a
              href="#profile"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              <User className="w-5 h-5 text-[#00f0ff]" />
              <span>Profile</span>
            </a>
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
      {/* 2. MAIN USER PROFILE CONTENT STREAM (Independent Scroll)         */}
      {/* ================================================================= */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-8 space-y-8 max-w-4xl mx-auto">
        
        {/* Profile Banner & Info Header Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-white/10 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Left Avatar & Name */}
            <div className="flex items-start gap-5">
              
              {/* Avatar Image + Note Bubble ("Catatan...") */}
              <div className="relative flex-shrink-0 group">
                
                {/* Note Bubble Float (Catatan Instagram Style) */}
                <div 
                  onClick={() => setIsAddStoryOpen(true)}
                  className="absolute -top-7 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-white/10 border border-[#00f0ff]/40 backdrop-blur-md text-[10px] text-white font-semibold whitespace-nowrap shadow-[0_0_12px_rgba(0,240,255,0.3)] cursor-pointer hover:scale-105 transition-transform animate-bounce"
                >
                  💬 {userNote}
                </div>

                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={displayName}
                    onClick={() => setIsAddStoryOpen(true)}
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-[#00f0ff] shadow-[0_0_25px_rgba(0,240,255,0.4)] cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div 
                    onClick={() => setIsAddStoryOpen(true)}
                    className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] p-0.5 shadow-[0_0_25px_rgba(0,240,255,0.4)] cursor-pointer hover:scale-105 transition-transform"
                  >
                    <div className="w-full h-full rounded-[14px] bg-[#080a0f] flex items-center justify-center text-3xl font-extrabold text-white">
                      {initialLetter}
                    </div>
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-1.5 max-w-md pt-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-wide">
                    {displayName}
                  </h2>
                  <CheckCircle2 className="w-5 h-5 text-[#00f0ff] fill-[#00f0ff]/20" />
                </div>

                <span className="text-xs text-[#00f0ff] font-mono block">
                  @{username}
                </span>

                <p className="text-xs text-gray-300 leading-relaxed pt-1">
                  {bio}
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 hover:border-[#00f0ff]/50 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4 text-[#00f0ff]" />
                <span>EDIT PROFILE</span>
              </button>

              <button
                type="button"
                className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-white/5 border border-white/15 hover:bg-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>SHARE</span>
              </button>
            </div>
          </div>

          {/* Profile Stats Metrics */}
          <div className="grid grid-cols-4 gap-4 text-center pt-6 mt-6 border-t border-white/5">
            <div>
              <span className="block text-xl font-extrabold text-white">342</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Posts</span>
            </div>

            <div>
              <span className="block text-xl font-extrabold text-white">14.2k</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Followers</span>
            </div>

            <div>
              <span className="block text-xl font-extrabold text-white">892</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Following</span>
            </div>

            <div>
              <span className="block text-xl font-extrabold text-[#00f0ff]">98%</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vector Sync</span>
            </div>
          </div>
        </div>

        {/* STORY HIGHLIGHTS BAR (Persis Instagram Desktop Story Highlights) */}
        <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
          
          {/* Add New Highlight Button (+ Baru) */}
          <div 
            onClick={() => setIsAddStoryOpen(true)}
            className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-dashed border-white/20 hover:border-[#00f0ff] flex items-center justify-center transition-all group-hover:scale-105 shadow-md">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#00f0ff]" />
            </div>
            <span className="text-xs text-gray-400 group-hover:text-white font-medium">Baru</span>
          </div>

          {/* Story Highlights Circles */}
          {storyHighlights.map((hl) => (
            <div
              key={hl.id}
              onClick={() => setActiveStoryView([hl.story])}
              className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group"
            >
              <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] shadow-[0_0_12px_rgba(0,240,255,0.3)] group-hover:scale-105 transition-transform">
                <img
                  src={hl.img}
                  alt={hl.title}
                  className="w-15 h-15 rounded-[14px] object-cover border border-black"
                />
              </div>
              <span className="text-xs text-gray-300 group-hover:text-[#00f0ff] font-medium">{hl.title}</span>
            </div>
          ))}
        </div>

        {/* Content Navigation Tabs */}
        <div className="flex border-b border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`pb-3 px-6 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all relative ${
              activeTab === 'posts' ? 'text-[#00f0ff]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>POSTS</span>
            {activeTab === 'posts' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reels')}
            className={`pb-3 px-6 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all relative ${
              activeTab === 'reels' ? 'text-[#00f0ff]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>REELS</span>
            {activeTab === 'reels' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`pb-3 px-6 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all relative ${
              activeTab === 'saved' ? 'text-[#00f0ff]' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>SAVED</span>
            {activeTab === 'saved' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]" />
            )}
          </button>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
          {samplePosts.map((imgUrl, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group cursor-pointer"
            >
              <img
                src={imgUrl}
                alt={`Post ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-bold backdrop-blur-xs">
                <span>❤️ 1.4k</span>
                <span>💬 92</span>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default ProfilePage;
