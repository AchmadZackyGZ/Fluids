import React, { useState } from 'react';
import { Sidebar } from '../../../components/Sidebar';
import { 
  Heart, MessageCircle, Share2, Bookmark, ChevronUp, ChevronDown, 
  Play, Pause, Volume2, VolumeX, Music, CheckCircle2, Send, X, Film 
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
  onNavigateToProfile: (targetUser?: any) => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

export const ReelsPage: React.FC<ReelsPageProps> = ({
  user,
  onNavigateToDashboard,
  onNavigateToNetwork,
  onNavigateToExplore,
  onNavigateToMessages,
  onNavigateToProfile,
  onNavigateToSettings,
  onLogout,
}) => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedReels, setLikedReels] = useState<Record<number, boolean>>({});
  const [savedReels, setSavedReels] = useState<Record<number, boolean>>({});
  const [followingAuthors, setFollowingAuthors] = useState<Record<number, boolean>>({});
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [shareToast, setShareToast] = useState(false);

  const reelsData = [
    {
      id: 1,
      author: '@skyrim_node',
      authorName: 'Skyrim Shader Node',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      authorBio: 'Game Engine Modder & Graphics Programmer. Building real-time raytracing shaders and custom Vulkan pipelines in Skyrim 2026.',
      authorTech: ['C++', 'GLSL', 'Vulkan', 'DirectX 12', 'Rust'],
      authorNote: 'Compiling shaders...',
      title: 'Kenapa Skyrim Masih Banyak Dimainin di 2026? 🐉',
      description: 'Eksplorasi modding engine neural shader matrix di Skyrim. Visual fidelity di renderer ini gila banget! Mod ini mengintegrasikan dynamic lighting, volumetric fog real-time, dan texture enhancement berbasis neural network langsung ke dalam creation engine.',
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
      authorName: 'Cyber Vision Systems',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      authorBio: 'Architect & 3D Spatial Computing Engineer. Designing next-gen cyberpunk urban spaces and real-time raytraced environments.',
      authorTech: ['TypeScript', 'Three.js', 'WebGPU', 'Blender', 'Unreal Engine 5'],
      authorNote: 'Rendering 4K viewport',
      title: 'Future Tech 2030 Architecture Render 🏙️',
      description: 'Konsep desain kota cyberpunk masa depan menggunakan teknologi ray-tracing real-time dan computational architecture procedural. Menampilkan sistem transportasi otonom dan pencahayaan dinamis berskala kota.',
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
      authorName: 'Tech Insider Daily',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      authorBio: 'AI Researcher & Systems Engineer. Writing in-depth technical breakdowns of generative AI architectures and secure protocols.',
      authorTech: ['Python', 'PyTorch', 'Go', 'Kubernetes', 'FastAPI'],
      authorNote: 'Reading arXiv papers',
      title: 'Claude AI Invisible Watermark Deep Dive 🤖',
      description: 'Bagaimana teknologi watermark tak terlihat menyaring konten buatan AI secara presisi. Kami membedah implementasi steganografi matematis pada latent space model dan bagaimana verifikasi kriptografi dijalankan pada backend.',
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
      setIsCaptionExpanded(false);
    }
  };

  const handleNextReel = () => {
    if (currentReelIndex < reelsData.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
      setIsPlaying(true);
      setIsCaptionExpanded(false);
    }
  };

  const toggleLike = (reelId: number) => {
    setLikedReels((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const toggleSave = (reelId: number) => {
    setSavedReels((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
  };

  const toggleFollow = (reelId: number) => {
    setFollowingAuthors((prev) => ({
      ...prev,
      [reelId]: !(prev[reelId] ?? currentReel.isFollowing)
    }));
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
      time: 'Baru saja',
    });
    setCommentInput('');
  };

  return (
    <div className="w-full h-screen bg-canvas text-text-primary flex overflow-hidden font-body select-none">
      
      {/* Share Toast Notification */}
      {shareToast && (
        <div className="fixed top-5 right-5 z-50 p-3 rounded-sm bg-surface-raised border border-border-strong flex items-center gap-2.5 text-text-primary text-xs font-mono shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-diff-add flex-shrink-0" />
          <span>Tautan reel disalin ke clipboard!</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      {/* ================================================================= */}
      <Sidebar
        activeView="reels"
        user={user}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToNetwork={onNavigateToNetwork}
        onNavigateToExplore={onNavigateToExplore}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToReels={() => {}}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onLogout}
      />

      {/* ================================================================= */}
      {/* 2. REELS PLAYER STREAM CENTER */}
      {/* ================================================================= */}
      <main className="flex-1 h-screen flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Main Video Reel Container */}
        <div className="relative w-full max-w-sm h-[88vh] rounded-lg overflow-hidden bg-surface border border-border-default flex flex-col justify-between shadow-2xl">
          
          {/* Background Video Image */}
          <img
            src={currentReel.videoBg}
            alt={currentReel.title}
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Top Controls Overlay */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider text-white uppercase flex items-center gap-2 font-mono drop-shadow-md">
              <Film className="w-4 h-4 text-accent" />
              <span>FLUIDS REELS</span>
            </span>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 hover:border-white/40 text-white transition-colors cursor-pointer backdrop-blur-md shadow-md"
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
              <div className="w-14 h-14 rounded-full bg-black/70 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl">
                <Play className="w-6 h-6 fill-white ml-1" />
              </div>
            )}
          </div>

          {/* Bottom Left Creator & Caption Info Overlay */}
          <div className="absolute bottom-0 left-0 right-16 z-20 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent space-y-2.5 pointer-events-auto">
            
            {/* Creator Header (Clickable Avatar & Username) */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => onNavigateToProfile({
                  username: currentReel.author.replace('@', ''),
                  fullName: currentReel.authorName || currentReel.author.replace('@', ''),
                  avatarUrl: currentReel.authorAvatar,
                  bio: currentReel.authorBio,
                  techStack: currentReel.authorTech,
                  note: currentReel.authorNote,
                  postsCount: 128,
                  followersCount: currentReel.likes,
                  followingCount: 342,
                  isFollowing: followingAuthors[currentReel.id] ?? currentReel.isFollowing
                })}
                className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
              >
                <img
                  src={currentReel.authorAvatar}
                  alt={currentReel.author}
                  className="w-9 h-9 rounded-full object-cover border border-white/30 group-hover:border-accent shrink-0 aspect-square shadow-md transition-colors"
                />
                <span className="text-xs font-semibold text-white font-mono drop-shadow-md group-hover:text-accent transition-colors">
                  {currentReel.author}
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => toggleFollow(currentReel.id)}
                className={`px-2.5 py-0.5 rounded-sm border text-[11px] font-mono font-medium transition-colors cursor-pointer backdrop-blur-sm shadow-sm ${
                  followingAuthors[currentReel.id] ?? currentReel.isFollowing
                    ? 'bg-surface-raised/80 border-border-default text-text-secondary hover:text-text-primary'
                    : 'bg-white/15 hover:bg-white/25 border-white/30 text-white'
                }`}
              >
                {followingAuthors[currentReel.id] ?? currentReel.isFollowing ? 'Mengikuti' : 'Ikuti'}
              </button>
            </div>

            {/* Title & Expandable Caption (Instagram-Style) */}
            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-white leading-snug drop-shadow-md">{currentReel.title}</h3>
              <div 
                onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                className="cursor-pointer group/caption"
              >
                <p className={`text-[11px] text-white/90 leading-relaxed drop-shadow-sm transition-all ${
                  isCaptionExpanded 
                    ? 'max-h-40 overflow-y-auto pr-1 scrollbar-none bg-black/50 p-2.5 rounded-sm backdrop-blur-md border border-white/15' 
                    : 'line-clamp-2'
                }`}>
                  {currentReel.description}
                </p>
                <span className="text-[10px] text-white/80 group-hover/caption:text-white font-mono font-semibold inline-block mt-0.5 transition-colors">
                  {isCaptionExpanded ? 'Lebih sedikit' : '...selengkapnya'}
                </span>
              </div>
            </div>

            {/* Audio Track Ticker */}
            <div className="flex items-center gap-1.5 text-[10px] text-white/90 font-mono drop-shadow-md">
              <Music className="w-3 h-3 text-accent" />
              <span className="truncate">{currentReel.audio}</span>
            </div>
          </div>

          {/* Right Side Action Buttons Strip */}
          <div className="absolute bottom-6 right-3 z-30 flex flex-col items-center gap-3.5 text-white">
            
            {/* Like Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => toggleLike(currentReel.id)}
                className={`p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-xl ${
                  likedReels[currentReel.id]
                    ? 'bg-diff-remove/25 border-diff-remove text-diff-remove scale-105'
                    : 'bg-black/60 hover:bg-black/80 border-white/25 hover:border-white/50 text-white hover:text-diff-remove'
                }`}
              >
                <Heart className={`w-5 h-5 ${likedReels[currentReel.id] ? 'fill-diff-remove' : ''}`} />
              </button>
              <span className="text-xs font-mono font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{currentReel.likes}</span>
            </div>

            {/* Comments Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => setIsCommentsOpen(true)}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/25 hover:border-white/50 backdrop-blur-md text-white hover:text-accent transition-all cursor-pointer shadow-xl"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{currentReel.commentsCount}</span>
            </div>

            {/* Share Button */}
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 border border-white/25 hover:border-white/50 backdrop-blur-md text-white hover:text-accent transition-all cursor-pointer shadow-xl"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{currentReel.shares}</span>
            </div>

            {/* Bookmark / Save Button */}
            <button
              type="button"
              onClick={() => toggleSave(currentReel.id)}
              className={`p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-xl ${
                savedReels[currentReel.id]
                  ? 'bg-accent/25 border-accent text-accent scale-105'
                  : 'bg-black/60 hover:bg-black/80 border-white/25 hover:border-white/50 text-white hover:text-accent'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${savedReels[currentReel.id] ? 'fill-accent' : ''}`} />
            </button>
          </div>

        </div>

        {/* Up / Down Navigation Controls */}
        <div className="hidden md:flex flex-col gap-3 ml-6 z-30">
          <button
            type="button"
            onClick={handlePrevReel}
            disabled={currentReelIndex === 0}
            className="p-3 rounded-full bg-surface-raised/90 hover:bg-surface-raised border border-border-strong text-text-primary hover:text-white disabled:opacity-30 transition-colors cursor-pointer shadow-2xl"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNextReel}
            disabled={currentReelIndex === reelsData.length - 1}
            className="p-3 rounded-full bg-surface-raised/90 hover:bg-surface-raised border border-border-strong text-text-primary hover:text-white disabled:opacity-30 transition-colors cursor-pointer shadow-2xl"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Slide-over Drawer */}
        {isCommentsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-canvas/80 backdrop-blur-sm">
            <div className="w-full max-w-md h-full bg-surface border-l border-border-default p-5 flex flex-col justify-between shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-border-default pb-3">
                <h3 className="text-xs font-semibold text-text-primary flex items-center gap-2 font-mono">
                  <MessageCircle className="w-4 h-4 text-accent" />
                  <span>Komentar ({currentReel.comments.length})</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCommentsOpen(false)}
                  className="text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Stream */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-none">
                {currentReel.comments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 text-xs bg-surface-raised p-2.5 rounded-sm border border-border-default">
                    <div className="w-7 h-7 rounded-full bg-surface border border-border-default text-accent font-mono font-bold flex items-center justify-center shrink-0">
                      {c.user.charAt(1).toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary font-mono">{c.user}</span>
                        <span className="text-[10px] text-text-secondary font-mono">{c.time}</span>
                      </div>
                      <p className="text-text-secondary leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2 border-t border-border-default pt-3">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Tulis komentar..."
                  className="flex-1 bg-surface-raised border border-border-default rounded-sm px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="p-2 bg-accent hover:bg-accent-hover rounded-sm text-canvas cursor-pointer disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
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
