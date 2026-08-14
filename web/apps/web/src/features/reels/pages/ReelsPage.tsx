import React, { useState } from 'react';
import { 
  LayoutDashboard, Network, MessageSquare, Compass, Settings, 
  User, Plus, LogOut, Heart, MessageCircle, Share2, Bookmark, 
  ChevronUp, ChevronDown, Play, Pause, Volume2, VolumeX, Music, 
  CheckCircle2, Send, X, Film
} from 'lucide-react';

interface ReelsPageProps {
  user: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  onNavigateToDashboard: () => void;
  onNavigateToNetwork: () => void;
  onNavigateToExplore: () => void;
  onNavigateToMessages: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export const ReelsPage: React.FC<ReelsPageProps> = ({
  user,
  onNavigateToDashboard,
  onNavigateToNetwork,
  onNavigateToExplore,
  onNavigateToMessages,
  onNavigateToProfile,
  onLogout,
}) => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState<Record<number, boolean>>({});
  const [savedReels, setSavedReels] = useState<Record<number, boolean>>({});
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [shareToast, setShareToast] = useState(false);

  const reelsData = [
    {
      id: 1,
      author: '@skyrim_node',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      title: 'Kenapa Skyrim Masih Banyak Dimainin di 2026? 🐉',
      description: 'Eksplorasi modding engine neural shader matrix di Skyrim. Visual fidelity di renderer ini gila banget! #Skyrim #CyberArt #NeuralGen',
      videoBg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop',
      audio: 'Original Audio - @skyrim_node • Cyber Synthwave',
      likes: '45.2k',
      commentsCount: '1.2k',
      shares: '892',
      isFollowing: false,
      comments: [
        { id: 'c1', user: '@cyber_vision', text: 'Mod list-nya share dong bro!', time: '2h ago' },
        { id: 'c2', user: '@neon_architect', text: 'Gokil visual lighting-nya smooth bgt!', time: '1h ago' },
      ],
    },
    {
      id: 2,
      author: '@cyber_vision',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      title: 'Future Tech 2030 Architecture Render 🏙️',
      description: 'Konsep desain kota cyberpunk masa depan menggunakan teknologi ray-tracing real-time. #Architecture #Futuristic #FLUIDS',
      videoBg: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
      audio: 'Night City Ambient Soundscapes Vol. 4',
      likes: '23.1k',
      commentsCount: '912',
      shares: '415',
      isFollowing: true,
      comments: [
        { id: 'c3', user: '@tech_insider', text: 'Rendered pake GPU apa ini?', time: '3h ago' },
      ],
    },
    {
      id: 3,
      author: '@tech_insider',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      title: 'Claude AI Invisible Watermark Deep Dive 🤖',
      description: 'Bagaimana teknologi watermark tak terlihat menyaring konten buatan AI secara presisi. #AI #MachineLearning #Tech',
      videoBg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
      audio: 'Neural Intelligence - Tech Beat',
      likes: '89.4k',
      commentsCount: '4.8k',
      shares: '3.2k',
      isFollowing: false,
      comments: [
        { id: 'c4', user: '@skyrim_node', text: 'Penjelasan yang sangat informatif!', time: '30m ago' },
      ],
    },
  ];

  const currentReel = reelsData[currentReelIndex];

  const handlePrevReel = () => {
    if (currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleNextReel = () => {
    if (currentReelIndex < reelsData.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
      setIsPlaying(true);
    }
  };

  const toggleLike = (reelId: number) => {
    setLikedReels((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const toggleSave = (reelId: number) => {
    setSavedReels((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const handleShare = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    currentReel.comments.push({
      id: Date.now().toString(),
      user: `@${user.username || 'you'}`,
      text: commentInput,
      time: 'Just now',
    });
    setCommentInput('');
  };

  return (
    <div className="w-full h-screen bg-[#07090e] text-white flex overflow-hidden font-body select-none">
      
      {/* Share Toast Notification */}
      {shareToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/30 backdrop-blur-xl flex items-center gap-3 text-[#00f0ff] text-xs font-bold shadow-2xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#00f0ff] flex-shrink-0" />
          <span>Reel link copied to clipboard!</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (20% Widescreen Column)                */}
      {/* ================================================================= */}
      <aside className="hidden lg:flex flex-col justify-between w-64 h-screen border-r border-white/5 bg-[#080a0f] p-6 shrink-0 select-none">
        <div className="space-y-6">
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

            <button
              type="button"
              onClick={onNavigateToExplore}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all text-left cursor-pointer group"
            >
              <Compass className="w-5 h-5 group-hover:text-[#00f0ff] transition-colors" />
              <span>Explore</span>
            </button>

            {/* ACTIVE ITEM: REELS */}
            <a
              href="#reels"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              <Film className="w-5 h-5 text-[#00f0ff]" />
              <span>Reels</span>
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

          <button
            type="button"
            className="w-full py-3.5 btn-neon-gradient flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Post</span>
          </button>
        </div>

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
      {/* 2. REELS PLAYER STREAM CENTER (Full-Height Cyber-Player)          */}
      {/* ================================================================= */}
      <main className="flex-1 h-screen flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Main Video Reel Container */}
        <div className="relative w-full max-w-sm h-[88vh] rounded-3xl overflow-hidden glass-panel-glow border border-white/10 flex flex-col justify-between shadow-[0_0_30px_rgba(0,240,255,0.2)]">
          
          {/* Background Video Image */}
          <img
            src={currentReel.videoBg}
            alt={currentReel.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Top Controls Overlay */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-white uppercase flex items-center gap-2">
              <Film className="w-4 h-4 text-[#00f0ff]" />
              <span>FLUIDS REELS</span>
            </span>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/40 border border-white/10 text-white/80 hover:text-white backdrop-blur-md"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Center Play/Pause Touch Area */}
          <div
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
          >
            {!isPlaying && (
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl animate-pulse">
                <Play className="w-8 h-8 fill-white ml-1" />
              </div>
            )}
          </div>

          {/* Bottom Left Creator & Caption Info Overlay */}
          <div className="absolute bottom-0 left-0 right-14 z-20 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent space-y-3 pointer-events-auto">
            
            {/* Creator Header */}
            <div className="flex items-center gap-3">
              <img
                src={currentReel.authorAvatar}
                alt={currentReel.author}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#00f0ff] shadow-md shrink-0 aspect-square"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-white">{currentReel.author}</span>
                <button
                  type="button"
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-[#00f0ff] hover:text-black border border-[#00f0ff]/40 text-[10px] font-bold uppercase transition-all"
                >
                  Follow
                </button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white leading-snug">{currentReel.title}</h3>
              <p className="text-[11px] text-gray-300 line-clamp-2 leading-relaxed">{currentReel.description}</p>
            </div>

            {/* Audio Track Ticker */}
            <div className="flex items-center gap-2 text-[10px] text-[#00f0ff] font-mono">
              <Music className="w-3.5 h-3.5 animate-spin" />
              <span className="truncate">{currentReel.audio}</span>
            </div>
          </div>

          {/* Right Side Action Buttons Strip */}
          <div className="absolute bottom-6 right-3 z-30 flex flex-col items-center gap-5 text-white">
            
            {/* Like Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => toggleLike(currentReel.id)}
                className={`p-3 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                  likedReels[currentReel.id]
                    ? 'bg-red-500/20 border-red-500 text-red-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-black/40 border-white/10 text-white hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${likedReels[currentReel.id] ? 'fill-red-500' : ''}`} />
              </button>
              <span className="text-[10px] font-bold font-mono">{currentReel.likes}</span>
            </div>

            {/* Comments Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                className="p-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-white hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold font-mono">{currentReel.commentsCount}</span>
            </div>

            {/* Share Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={handleShare}
                className="p-3 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-white hover:text-[#00f0ff] transition-all cursor-pointer"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <span className="text-[10px] font-bold font-mono">{currentReel.shares}</span>
            </div>

            {/* Bookmark / Save Button */}
            <button
              type="button"
              onClick={() => toggleSave(currentReel.id)}
              className={`p-3 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                savedReels[currentReel.id]
                  ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]'
                  : 'bg-black/40 border-white/10 text-white hover:text-[#00f0ff]'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${savedReels[currentReel.id] ? 'fill-[#00f0ff]' : ''}`} />
            </button>
          </div>

        </div>

        {/* Up / Down Navigation Controls */}
        <div className="hidden md:flex flex-col gap-3 ml-6 z-30">
          <button
            type="button"
            onClick={handlePrevReel}
            disabled={currentReelIndex === 0}
            className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-[#00f0ff] hover:text-black disabled:opacity-30 transition-all cursor-pointer shadow-lg"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={handleNextReel}
            disabled={currentReelIndex === reelsData.length - 1}
            className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-[#00f0ff] hover:text-black disabled:opacity-30 transition-all cursor-pointer shadow-lg"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        </div>

        {/* Comments Slide-over Drawer */}
        {isCommentsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md">
            <div className="w-full max-w-md h-full bg-[#080a0f] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl animate-float">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#00f0ff]" />
                  <span>Comments ({currentReel.comments.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCommentsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Comments Stream */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {currentReel.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-3 text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] font-bold flex items-center justify-center shrink-0">
                      {c.user.charAt(1).toUpperCase()}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{c.user}</span>
                        <span className="text-[10px] text-gray-500">{c.time}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2 border-t border-white/10 pt-4">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-[#0d1017] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#00f0ff]"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="p-2.5 btn-neon-gradient rounded-xl text-black cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default ReelsPage;
