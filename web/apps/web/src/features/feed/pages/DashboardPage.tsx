import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Network,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
  HelpCircle,
  LogOut,
  Image,
  Video,
  Sparkles,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  CheckCircle2,
  TrendingUp,
  UserPlus,
  X,
} from "lucide-react";

interface DashboardPageProps {
  user: {
    id?: string;
    username?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
  };
  welcomeToast?: string;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  welcomeToast,
  onLogout,
}) => {
  const [likesCount, setLikesCount] = useState(1240);
  const [isLiked, setIsLiked] = useState(false);
  const [postText, setPostText] = useState("");
  const [showToast, setShowToast] = useState(Boolean(welcomeToast));

  useEffect(() => {
    if (welcomeToast) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [welcomeToast]);

  const displayName = user.fullName || "Cipher Node_01";
  const username = user.username || "cipher_active";
  const initialLetter = displayName.charAt(0).toUpperCase();

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(likesCount - 1);
      setIsLiked(false);
    } else {
      setLikesCount(likesCount + 1);
      setIsLiked(true);
    }
  };

  return (
    <div className="w-full h-screen bg-[#07090e] text-white flex overflow-hidden font-body">
      {/* Toast Notification Banner (Welcome Back - Auto Dismiss in 3.5s) */}
      {showToast && welcomeToast && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 backdrop-blur-xl flex items-center gap-3 text-emerald-300 text-xs font-bold shadow-2xl transition-all duration-500 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{welcomeToast}</span>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="ml-2 text-emerald-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (20% Widescreen Column)                */}
      {/* ================================================================= */}
      <aside className="hidden lg:flex flex-col justify-between w-64 h-screen border-r border-white/5 bg-[#080a0f] p-6 shrink-0 select-none">
        {/* Top Section */}
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
              {/* <span className="text-[10px] text-[#00f0ff] uppercase tracking-widest font-mono block">
                CYBERNET ACTIVE
              </span> */}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <a
              href="#dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-[#00f0ff]/30 text-white font-bold text-sm shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              <LayoutDashboard className="w-5 h-5 text-[#00f0ff]" />
              <span>Dashboard</span>
            </a>

            <a
              href="#network"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 font-medium text-sm transition-all"
            >
              <Network className="w-5 h-5" />
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

        {/* Bottom Section: Support & Logout (Forced to Screen Bottom via mt-auto) */}
        <div className="space-y-1 border-t border-white/5 pt-4 mt-auto">
          <a
            href="#support"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 text-xs font-semibold transition-all"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Support</span>
          </a>

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
      {/* 2. CENTER FEED STREAM (50% Widescreen Column - Independently Scrolls) */}
      {/* ================================================================= */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-6 space-y-6 max-w-2xl mx-auto">
        {/* Stories / Node Bar */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
          {/* Add Story Button */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-dashed border-white/20 hover:border-[#00f0ff] flex items-center justify-center transition-all group">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#00f0ff]" />
            </div>
            <span className="text-[11px] text-gray-400 font-medium">
              Add Node
            </span>
          </div>

          {/* Sample Active Stories */}
          {[
            {
              name: "@live_x",
              isLive: true,
              img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            },
            {
              name: "@glitch",
              isLive: false,
              img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
            },
            {
              name: "@cipher",
              isLive: false,
              img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
            },
          ].map((story, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <div className="relative p-0.5 rounded-2xl bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] shadow-[0_0_12px_rgba(0,240,255,0.3)]">
                <img
                  src={story.img}
                  alt={story.name}
                  className="w-13 h-13 rounded-[14px] object-cover border border-black"
                />
                {story.isLive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-red-600 text-[9px] font-extrabold text-white uppercase tracking-wider">
                    LIVE
                  </span>
                )}
              </div>
              <span className="text-[11px] text-gray-300 font-medium">
                {story.name}
              </span>
            </div>
          ))}
        </div>

        {/* Post Composer Card */}
        <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-xl object-cover border border-[#00f0ff]/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] p-0.5 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                <div className="w-full h-full rounded-[10px] bg-[#080a0f] flex items-center justify-center font-bold text-white text-sm">
                  {initialLetter}
                </div>
              </div>
            )}
            <input
              type="text"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Share your fluid thought..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-gray-500"
            />
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center gap-4 text-gray-400 text-xs">
              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-[#00f0ff] transition-colors"
              >
                <Image className="w-4 h-4 text-[#00f0ff]" />
                <span>Media</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-[#9d00ff] transition-colors"
              >
                <Video className="w-4 h-4 text-[#9d00ff]" />
                <span>Reels</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-amber-400 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Prompt</span>
              </button>
            </div>

            <button
              type="button"
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all border border-white/10"
            >
              Post
            </button>
          </div>
        </div>

        {/* Main Feed Post Card */}
        <article className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          {/* Post Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-0.5 rounded-xl bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  alt="neon_owl"
                  className="w-10 h-10 rounded-[10px] object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white">@neon_owl</h4>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00f0ff] fill-[#00f0ff]/20" />
                </div>
                <span className="text-[11px] text-gray-400">
                  2h ago • Encrypted Node
                </span>
              </div>
            </div>

            <button type="button" className="text-gray-400 hover:text-white">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Caption */}
          <p className="text-xs text-gray-200 leading-relaxed">
            Just deployed the new neural shading matrix. The visual fidelity on
            these glass renders is insane.{" "}
            <span className="text-[#00f0ff]">#CyberArt</span>{" "}
            <span className="text-[#a855f7]">#RenderGen</span>
          </p>

          {/* Post Media Image */}
          <div className="relative w-full h-80 rounded-xl overflow-hidden border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop"
              alt="Cyberpunk City"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-2 text-gray-400 text-xs">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1.5 transition-colors ${
                  isLiked ? "text-red-500" : "hover:text-red-400"
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500" : ""}`} />
                <span className="font-semibold">{likesCount}</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-[#00f0ff] transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="font-semibold">84</span>
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-[#a855f7] transition-colors"
              >
                <Repeat2 className="w-4 h-4" />
                <span className="font-semibold">312</span>
              </button>
            </div>

            <button
              type="button"
              className="hover:text-white transition-colors"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </article>
      </main>

      {/* ================================================================= */}
      {/* 3. RIGHT SIDEBAR WIDGETS (30% Widescreen Column)                 */}
      {/* ================================================================= */}
      <aside className="hidden xl:flex flex-col w-80 border-l border-white/5 bg-[#080a0f] p-6 h-screen sticky top-0 space-y-6 overflow-y-auto">
        {/* User Quick Profile Card */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-12 h-12 rounded-2xl object-cover border border-[#00f0ff]"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                <div className="w-full h-full rounded-[14px] bg-[#080a0f] flex items-center justify-center font-extrabold text-white text-lg">
                  {initialLetter}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-white">{displayName}</h3>
              <span className="text-xs text-gray-400">@{username}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/5">
            <div>
              <span className="block text-xs font-extrabold text-white">
                14.2k
              </span>
              <span className="text-[10px] text-gray-400 uppercase">
                Followers
              </span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-white">
                892
              </span>
              <span className="text-[10px] text-gray-400 uppercase">
                Following
              </span>
            </div>
            <div>
              <span className="block text-xs font-extrabold text-[#00f0ff]">
                98%
              </span>
              <span className="text-[10px] text-gray-400 uppercase">Sync</span>
            </div>
          </div>
        </div>

        {/* Trending Vectors Widget */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
            <TrendingUp className="w-4 h-4 text-[#a855f7]" />
            <span>Trending Vectors</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {[
              { tag: "#CyberArt", posts: "45.2k Nodes Active" },
              { tag: "#FluidsAI", posts: "28.9k Nodes Active" },
              { tag: "#NeonTech", posts: "12.1k Nodes Active" },
            ].map((trend, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
              >
                <span className="text-xs font-bold text-[#00f0ff] block">
                  {trend.tag}
                </span>
                <span className="text-[10px] text-gray-400">{trend.posts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Nodes Widget */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-3">
          <span className="text-xs font-bold text-gray-200 block">
            Suggested Nodes
          </span>

          <div className="space-y-3">
            {[
              {
                name: "@synth_wave",
                sub: "Matches 84% Vector",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
              },
              {
                name: "@moto_g",
                sub: "Followed by @nova_x",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
              },
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={node.img}
                    alt={node.name}
                    className="w-8 h-8 rounded-xl object-cover"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {node.name}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {node.sub}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 text-[10px] font-bold transition-all"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DashboardPage;
