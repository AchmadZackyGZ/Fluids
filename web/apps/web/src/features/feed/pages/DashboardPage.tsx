import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Network,
  MessageSquare,
  Compass,
  Film,
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
  User,
  X,
  Copy,
  Check,
  ExternalLink,
  Code,
  Layers,
} from "lucide-react";
import { StoryViewerModal, StoryItem } from "../components/StoryViewerModal";
import { AddStoryModal } from "../components/AddStoryModal";
import {
  CreatePostModal,
  NewPostData,
  PostType,
} from "../components/CreatePostModal";
import { Sidebar } from "../../../components/Sidebar";
import {
  Category3DCarouselModal,
  CATEGORIES_DATA,
} from "../../../components/ui/Category3DCarouselModal";

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
  onNavigateToProfile: () => void;
  onNavigateToNetwork: () => void;
  onNavigateToExplore: () => void;
  onNavigateToMessages: () => void;
  onNavigateToReels: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  welcomeToast,
  onNavigateToProfile,
  onNavigateToNetwork,
  onNavigateToExplore,
  onNavigateToMessages,
  onNavigateToReels,
  onNavigateToSettings,
  onLogout,
}) => {
  const [postText, setPostText] = useState("");
  const [showToast, setShowToast] = useState(Boolean(welcomeToast));
  const [toastMessage, setToastMessage] = useState(welcomeToast || "");

  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [is3DCarouselModalOpen, setIs3DCarouselModalOpen] = useState(false);
  const [activeStoryView, setActiveStoryView] = useState<StoryItem[] | null>(
    null,
  );
  const [viewedStories, setViewedStories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  // Dynamic Developer Posts State
  const [posts, setPosts] = useState<
    Array<{
      id: string;
      author: {
        name: string;
        username: string;
        avatarUrl: string;
        title: string;
      };
      type: PostType;
      timeAgo: string;
      caption: string;
      codeSnippet?: {
        filename: string;
        language: string;
        code: string;
      };
      repoUrl?: string;
      mediaUrl?: string;
      likes: number;
      isLiked: boolean;
      commentsCount: number;
      repostsCount: number;
    }>
  >([
    {
      id: "post-1",
      author: {
        name: user.fullName || "Genta Ramadhan",
        username: user.username || "genta_dev",
        avatarUrl:
          user.avatarUrl ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        title: "Go Backend Developer",
      },
      type: "curhat",
      timeAgo: "10m ago",
      caption:
        "Jam 1 malam nemu bug fatal di JWT expiration token backend. Ternyata cuma gara-gara salah format unit time. Fixed 24-hour expiry!",
      codeSnippet: {
        filename: "jwt.go",
        language: "Go",
        code: `// Fixed 24-Hour JWT Token Expiration in Go Platform
token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
    "sub": user.ID,
    "exp": time.Now().Add(24 * 1 * time.Hour).Unix(), // 1 Day Expiry
})`,
      },
      likes: 42,
      isLiked: false,
      commentsCount: 14,
      repostsCount: 6,
    },
    {
      id: "post-2",
      author: {
        name: "Neon Owl",
        username: "neon_owl",
        avatarUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        title: "Graphics & Shader Engineer",
      },
      type: "showcase",
      timeAgo: "2h ago",
      caption:
        "Baru saja deploy WebGL neural shader matrix untuk canvas background. Rendering 60 FPS stabil di mobile browser.",
      repoUrl: "https://github.com/neonowl/webgl-shader-matrix",
      mediaUrl:
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1000&auto=format&fit=crop",
      likes: 320,
      isLiked: true,
      commentsCount: 84,
      repostsCount: 29,
    },
    {
      id: "post-3",
      author: {
        name: "Ade Suwarendra",
        username: "ade_suwarendra",
        avatarUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        title: "DevOps & Cloud Architect",
      },
      type: "bug",
      timeAgo: "5h ago",
      caption:
        "Investigasi PostgreSQL connection pool exhaustion di Kubernetes: driver default tidak me-recycle idle connection saat traffic loncat. Set MaxIdleConns ke 10.",
      codeSnippet: {
        filename: "db.go",
        language: "Go",
        code: `db.SetMaxOpenConns(50)
db.SetMaxIdleConns(10)
db.SetConnMaxLifetime(time.Hour)`,
      },
      likes: 95,
      isLiked: false,
      commentsCount: 31,
      repostsCount: 12,
    },
  ]);

  const handleOpenStory = (storyName: string, storyItems: StoryItem[]) => {
    if (!viewedStories.includes(storyName)) {
      setViewedStories((prev) => [...prev, storyName]);
    }
    setActiveStoryView(storyItems);
  };

  const handleCreatePostSubmit = (data: NewPostData) => {
    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        name: user.fullName || "Developer",
        username: user.username || "developer",
        avatarUrl:
          user.avatarUrl ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
        title: "FLUIDS Developer",
      },
      type: data.type,
      timeAgo: "Baru saja",
      caption: data.caption,
      codeSnippet: data.codeSnippet,
      repoUrl: data.repoUrl,
      mediaUrl: data.mediaUrl,
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      repostsCount: 0,
    };

    setPosts((prev) => [newPost, ...prev]);
    setToastMessage("Postingan berhasil dibagikan ke komunitas!");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  const handleQuickComposerPost = () => {
    if (!postText.trim()) {
      setIsCreatePostModalOpen(true);
      return;
    }

    handleCreatePostSubmit({
      type: "curhat",
      caption: postText,
    });
    setPostText("");
  };

  const handleToggleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: !p.isLiked,
            likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          };
        }
        return p;
      }),
    );
  };

  const handleCopyCode = (postId: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(postId);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const filteredPosts = posts.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.type === selectedCategory;
  });

  const sampleDashboardStories: Record<string, StoryItem[]> = {
    "@live_x": [
      {
        id: "s-1",
        userName: "@live_x",
        userAvatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        mediaUrl:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800",
        caption: "Live streaming Go concurrency pipeline refactor! 🚀",
        timeAgo: "10m ago",
      },
    ],
    "@glitch": [
      {
        id: "s-2",
        userName: "@glitch",
        userAvatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        mediaUrl:
          "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800",
        caption: "New shader matrix build complete.",
        timeAgo: "1h ago",
      },
    ],
    "@cipher": [
      {
        id: "s-3",
        userName: "@cipher",
        userAvatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        mediaUrl:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
        caption: "Late night coding vibes at FLUIDS.",
        timeAgo: "3h ago",
      },
    ],
  };

  useEffect(() => {
    if (welcomeToast) {
      setToastMessage(welcomeToast);
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

  return (
    <div className="w-full h-screen bg-canvas text-text-primary flex overflow-hidden font-body">
      {/* Modal Create Post */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onSubmitPost={handleCreatePostSubmit}
        user={user}
      />

      {/* Modal Add Story */}
      {isAddStoryOpen && (
        <AddStoryModal
          user={user}
          onClose={() => setIsAddStoryOpen(false)}
          onAddStory={() => {}}
        />
      )}

      {/* Modal Fullscreen Story Viewer */}
      {activeStoryView && (
        <StoryViewerModal
          stories={activeStoryView}
          onClose={() => setActiveStoryView(null)}
        />
      )}

      {/* Toast Notification Banner */}
      {showToast && toastMessage && (
        <div className="fixed top-5 right-5 z-50 p-3.5 rounded-sm bg-surface-raised border border-diff-add/40 flex items-center gap-3 text-text-primary text-xs font-mono font-medium shadow-xl transition-all duration-300">
          <CheckCircle2 className="w-4 h-4 text-diff-add flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            className="ml-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (20% Widescreen Column)                */}
      {/* ================================================================= */}
      <Sidebar
        activeView="dashboard"
        user={user}
        onNavigateToDashboard={() => {}}
        onNavigateToNetwork={onNavigateToNetwork}
        onNavigateToExplore={onNavigateToExplore}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToReels={onNavigateToReels}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToSettings={onNavigateToSettings}
        onCreatePost={() => setIsCreatePostModalOpen(true)}
        onLogout={onLogout}
      />

      {/* ================================================================= */}
      {/* 2. CENTER FEED STREAM (50% Widescreen Column - Independently Scrolls) */}
      {/* ================================================================= */}
      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-6 space-y-5 max-w-2xl mx-auto scrollbar-none">
        {/* Stories / Node Bar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {/* Add Story Button */}
          <div
            onClick={() => setIsAddStoryOpen(true)}
            className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-surface-raised border border-dashed border-border-strong group-hover:border-accent flex items-center justify-center transition-all group-hover:scale-105 shadow-sm aspect-square">
              <Plus className="w-5 h-5 text-text-secondary group-hover:text-accent" />
            </div>
            <span className="text-[10px] font-mono text-text-secondary group-hover:text-text-primary">
              Add Story
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
          ].map((story, idx) => {
            const hasViewed = viewedStories.includes(story.name);
            return (
              <div
                key={idx}
                onClick={() => {
                  const items = sampleDashboardStories[story.name] || [];
                  handleOpenStory(story.name, items);
                }}
                className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
              >
                <div
                  className={`w-14 h-14 rounded-full p-0.5 transition-all group-hover:scale-105 ${
                    story.isLive
                      ? "border border-accent"
                      : hasViewed
                        ? "border border-border-default opacity-60"
                        : "border border-border-strong"
                  }`}
                >
                  <img
                    src={story.img}
                    alt={story.name}
                    className="w-full h-full rounded-full object-cover aspect-square"
                  />
                </div>
                <span className="text-[10px] font-mono text-text-secondary group-hover:text-text-primary truncate max-w-[60px]">
                  {story.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Create Post Card / Feed Quick Composer */}
        <div className="bg-surface border border-border-default rounded-md p-4 space-y-3">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover border border-border-default aspect-square cursor-pointer"
                onClick={onNavigateToProfile}
              />
            ) : (
              <div
                onClick={onNavigateToProfile}
                className="w-9 h-9 rounded-full bg-surface-raised border border-border-default flex items-center justify-center font-bold text-accent text-xs cursor-pointer"
              >
                {initialLetter}
              </div>
            )}
            <input
              type="text"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleQuickComposerPost();
              }}
              placeholder="Ceritakan kendala koding, ide arsitektur, atau share karya..."
              className="flex-1 bg-surface-raised border border-border-default focus:border-border-strong rounded-sm px-3 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border-default pt-2.5">
            <div className="flex items-center gap-2 text-text-secondary text-xs">
              <button
                type="button"
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
              >
                <Code className="w-3.5 h-3.5 text-accent" />
                <span className="text-[11px] font-mono">Kode</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
              >
                <Image className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono">Media</span>
              </button>

              <button
                type="button"
                onClick={onNavigateToReels}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm hover:bg-surface-raised hover:text-text-primary transition-colors cursor-pointer"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono">Reels</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleQuickComposerPost}
              className="px-4 py-1.5 rounded-sm bg-accent hover:bg-accent-hover text-canvas text-xs font-semibold tracking-wide transition-colors cursor-pointer"
            >
              Post
            </button>
          </div>
        </div>

        {/* Developer Feed Category Filter Bar & 3D Ring Expand Button */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-sm font-semibold font-mono shrink-0 transition-colors cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-accent-muted border border-accent/40 text-accent"
                  : "bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary"
              }`}
            >
              Semua Feed
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("curhat")}
              className={`px-3 py-1.5 rounded-sm font-semibold font-mono shrink-0 transition-colors cursor-pointer ${
                selectedCategory === "curhat"
                  ? "bg-accent-muted border border-accent/40 text-accent"
                  : "bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary"
              }`}
            >
              Dev Curhat
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("showcase")}
              className={`px-3 py-1.5 rounded-sm font-semibold font-mono shrink-0 transition-colors cursor-pointer ${
                selectedCategory === "showcase"
                  ? "bg-accent-muted border border-accent/40 text-accent"
                  : "bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary"
              }`}
            >
              Project Showcase
            </button>

            <button
              type="button"
              onClick={() => setSelectedCategory("bug")}
              className={`px-3 py-1.5 rounded-sm font-semibold font-mono shrink-0 transition-colors cursor-pointer ${
                selectedCategory === "bug"
                  ? "bg-accent-muted border border-accent/40 text-accent"
                  : "bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary"
              }`}
            >
              Bug Hunting
            </button>

            {/* Custom 3D Ring Selected Category Pill (if not in top 4) */}
            {!["all", "curhat", "showcase", "bug"].includes(
              selectedCategory,
            ) && (
              <button
                type="button"
                className="px-3 py-1.5 rounded-sm font-semibold font-mono shrink-0 bg-accent-muted border border-accent/40 text-accent flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>
                  {CATEGORIES_DATA.find((c) => c.id === selectedCategory)
                    ?.name || selectedCategory}
                </span>
                <span className="text-[9px] text-accent">●</span>
              </button>
            )}
          </div>

          {/* 3D Ring Expand Button (Per User Sketch) */}
          <button
            type="button"
            onClick={() => setIs3DCarouselModalOpen(true)}
            className="shrink-0 px-3 py-1.5 rounded-sm bg-surface-raised hover:bg-surface border border-border-strong hover:border-accent text-accent font-mono text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm group"
            title="Buka 3D Ring untuk melihat dan memilih seluruh kategori developer"
          >
            {/* <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" /> */}
            <span>3D Ring Kategori</span>
          </button>
        </div>

        {/* Feed Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isCodeCopied = copiedCodeId === post.id;
            return (
              <article
                key={post.id}
                className="bg-surface border border-border-default rounded-md p-4 space-y-3 transition-colors hover:border-border-strong"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      className="w-9 h-9 rounded-full object-cover border border-border-default aspect-square"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-text-primary">
                          @{post.author.username}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-sm font-mono font-semibold ${
                            post.type === "curhat"
                              ? "bg-accent-muted text-accent border border-accent/40"
                              : post.type === "showcase"
                                ? "bg-surface-raised text-diff-add border border-diff-add/30"
                                : post.type === "bug"
                                  ? "bg-surface-raised text-diff-remove border border-diff-remove/30"
                                  : "bg-surface-raised text-text-secondary border border-border-default"
                          }`}
                        >
                          {post.type === "curhat"
                            ? "Dev Curhat"
                            : post.type === "showcase"
                              ? "Project Showcase"
                              : post.type === "bug"
                                ? "Bug Hunting"
                                : "Post"}
                        </span>
                      </div>
                      <span className="text-[10px] text-text-secondary font-mono">
                        {post.timeAgo} • {post.author.title}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="text-text-secondary hover:text-text-primary p-1 rounded-sm hover:bg-surface-raised transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Caption Body */}
                <p className="text-xs text-text-primary leading-relaxed whitespace-pre-line">
                  {post.caption}
                </p>

                {/* Optional Syntax Highlighted Code Snippet */}
                {post.codeSnippet && (
                  <div className="bg-canvas border border-border-default rounded-sm overflow-hidden font-mono text-xs">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-surface-raised border-b border-border-default text-text-secondary text-[10px]">
                      <span className="text-accent font-semibold flex items-center gap-1.5">
                        <Code className="w-3 h-3" />
                        {post.codeSnippet.filename}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-text-muted">
                          {post.codeSnippet.language}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyCode(post.id, post.codeSnippet!.code)
                          }
                          className="text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {isCodeCopied ? (
                            <>
                              <Check className="w-3 h-3 text-diff-add" />
                              <span className="text-diff-add font-mono">
                                Copied
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <pre className="p-3 text-text-primary overflow-x-auto leading-relaxed text-[11px]">
                      <code>{post.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}

                {/* Optional GitHub Repo Link */}
                {post.repoUrl && (
                  <a
                    href={post.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-surface-raised border border-border-default hover:border-accent text-accent font-mono text-xs transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="truncate max-w-sm">{post.repoUrl}</span>
                  </a>
                )}

                {/* Optional Image Media (Clickable to Enlarge) */}
                {post.mediaUrl && (
                  <div
                    onClick={() => setPreviewMediaUrl(post.mediaUrl || null)}
                    className="relative w-full h-72 rounded-sm overflow-hidden border border-border-default cursor-pointer group/media"
                    title="Klik untuk melihat foto lebih besar"
                  >
                    <img
                      src={post.mediaUrl}
                      alt="Post attachment"
                      className="w-full h-full object-cover group-hover/media:scale-[1.02] transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/media:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-mono gap-1.5 backdrop-blur-[2px]">
                      <span>Lihat Ukuran Penuh</span>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between pt-1 text-text-secondary text-xs font-mono">
                  <div className="flex items-center gap-5">
                    <button
                      type="button"
                      onClick={() => handleToggleLikePost(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        post.isLiked
                          ? "text-diff-remove"
                          : "hover:text-diff-remove"
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${post.isLiked ? "fill-diff-remove" : ""}`}
                      />
                      <span>{post.likes}</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{post.commentsCount}</span>
                    </button>

                    <button
                      type="button"
                      className="flex items-center gap-1.5 hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Repeat2 className="w-3.5 h-3.5" />
                      <span>{post.repostsCount}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* ================================================================= */}
      {/* 3. RIGHT SIDEBAR WIDGETS (30% Widescreen Column)                 */}
      {/* ================================================================= */}
      <aside className="hidden xl:flex flex-col w-80 border-l border-border-default bg-canvas p-5 h-screen sticky top-0 space-y-4 overflow-y-auto scrollbar-none">
        {/* User Quick Profile Card */}
        <div
          onClick={onNavigateToProfile}
          className="bg-surface rounded-md p-4 border border-border-default space-y-3 cursor-pointer hover:border-border-strong transition-colors group"
        >
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover border border-border-default group-hover:scale-105 transition-transform aspect-square"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-surface-raised border border-border-default flex items-center justify-center font-bold text-accent text-sm aspect-square">
                {initialLetter}
              </div>
            )}
            <div>
              <h3 className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
                {displayName}
              </h3>
              <span className="text-[11px] text-text-secondary font-mono">
                @{username}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-2.5 border-t border-border-default font-mono">
            <div>
              <span className="block text-xs font-semibold text-text-primary">
                14.2k
              </span>
              <span className="text-[10px] text-text-secondary">Followers</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-text-primary">
                892
              </span>
              <span className="text-[10px] text-text-secondary">Following</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-accent">
                42d
              </span>
              <span className="text-[10px] text-text-secondary">Streak</span>
            </div>
          </div>
        </div>

        {/* Trending Developer Topics Widget */}
        <div className="bg-surface rounded-md p-4 border border-border-default space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
            <TrendingUp className="w-3.5 h-3.5 text-accent" />
            <span>Topik Tren Developer</span>
          </div>

          <div className="space-y-2 pt-1">
            {[
              { tag: "#golang", posts: "45.2k postingan" },
              { tag: "#typescript", posts: "28.9k postingan" },
              { tag: "#docker", posts: "12.1k postingan" },
            ].map((trend, i) => (
              <div
                key={i}
                className="p-2.5 rounded-sm bg-surface-raised hover:bg-surface-raised/80 border border-border-default hover:border-border-strong transition-colors cursor-pointer"
              >
                <span className="text-xs font-mono font-semibold text-text-primary hover:text-accent block">
                  {trend.tag}
                </span>
                <span className="text-[10px] font-mono text-text-secondary">
                  {trend.posts}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Developers Widget */}
        <div className="bg-surface rounded-md p-4 border border-border-default space-y-3">
          <span className="text-xs font-semibold text-text-primary block">
            Rekomendasi Developer
          </span>

          <div className="space-y-3">
            {[
              {
                name: "@synth_wave",
                sub: "Backend Engineer • Go",
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
              },
              {
                name: "@moto_g",
                sub: "DevOps & Cloud Architect",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
              },
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={node.img}
                    alt={node.name}
                    className="w-8 h-8 rounded-full object-cover border border-border-default aspect-square"
                  />
                  <div>
                    <span className="text-xs font-semibold text-text-primary block">
                      {node.name}
                    </span>
                    <span className="text-[10px] text-text-secondary font-mono">
                      {node.sub}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-2.5 py-1 rounded-sm bg-surface-raised border border-border-default hover:border-accent text-text-primary hover:text-accent font-mono text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Fullscreen Post Media Lightbox Modal */}
      {previewMediaUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setPreviewMediaUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[92vh] w-full flex flex-col bg-surface border border-border-strong rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-surface-raised/80">
              <span className="text-xs font-mono font-semibold text-text-primary">
                Preview Media Postingan
              </span>
              <button
                type="button"
                onClick={() => setPreviewMediaUrl(null)}
                className="p-1 text-text-secondary hover:text-text-primary rounded-sm hover:bg-surface transition-colors cursor-pointer"
                title="Tutup (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-canvas/60 min-h-[300px] max-h-[75vh]">
              <img
                src={previewMediaUrl}
                alt="Enlarged Post Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-sm border border-border-default shadow-lg"
              />
            </div>
            <div className="px-4 py-2 border-t border-border-default bg-surface-raised flex items-center justify-between text-[11px] font-mono text-text-secondary">
              <span>Klik di luar atau tombol silang untuk menutup</span>
              <button
                type="button"
                onClick={() => setPreviewMediaUrl(null)}
                className="text-accent hover:underline font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3D Cylindrical Ring Category Modal */}
      <Category3DCarouselModal
        isOpen={is3DCarouselModalOpen}
        onClose={() => setIs3DCarouselModalOpen(false)}
        selectedCategoryId={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat.id);
        }}
      />
    </div>
  );
};

export default DashboardPage;
