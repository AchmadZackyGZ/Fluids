import React, { useState } from 'react';
import { 
  LayoutDashboard, Network, MessageSquare, Compass, Film, Settings, 
  User, Plus, LogOut, Edit3, Share2, Grid, Bookmark, CheckCircle2, 
  Archive, UserCheck, Heart, MessageCircle
} from 'lucide-react';
import { EditProfileModal } from '../components/EditProfileModal';
import { StoryViewerModal, StoryItem } from '../../feed/components/StoryViewerModal';
import { AddStoryModal } from '../../feed/components/AddStoryModal';
import { CreateHighlightModal } from '../components/CreateHighlightModal';
import { DevActivityHeatmap } from '../components/DevActivityHeatmap';
import { Sidebar } from '../../../components/Sidebar';

interface ProfilePageProps {
  user: {
    id?: string;
    username?: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
  };
  viewingUser?: {
    id?: string;
    username?: string;
    fullName?: string;
    avatarUrl?: string;
    bio?: string;
    techStack?: string[];
    note?: string;
    postsCount?: string | number;
    followersCount?: string | number;
    followingCount?: string | number;
    isFollowing?: boolean;
  } | null;
  onNavigateToDashboard: () => void;
  onNavigateToNetwork: () => void;
  onNavigateToExplore: () => void;
  onNavigateToMessages: () => void;
  onNavigateToReels: () => void;
  onNavigateToProfile: (targetUser?: any) => void;
  onNavigateToSettings: () => void;
  onUpdateProfile: (updatedData: {
    fullName: string;
    username: string;
    bio: string;
    avatarUrl: string;
  }) => void;
  onLogout: () => void;
}

interface HighlightItem {
  id: string;
  title: string;
  img: string;
  stories: StoryItem[];
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  viewingUser,
  onNavigateToDashboard,
  onNavigateToNetwork,
  onNavigateToExplore,
  onNavigateToMessages,
  onNavigateToReels,
  onNavigateToProfile,
  onNavigateToSettings,
  onUpdateProfile,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'saved' | 'tagged'>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isCreateHighlightOpen, setIsCreateHighlightOpen] = useState(false);
  const [activeStoryView, setActiveStoryView] = useState<StoryItem[] | null>(null);

  const [userNote, setUserNote] = useState<string>('Catatan...');

  const isOwnProfile = !viewingUser || viewingUser.username === user.username;
  const [isFollowingState, setIsFollowingState] = useState(viewingUser?.isFollowing ?? false);

  const displayName = isOwnProfile 
    ? (user.fullName || 'Achmad Zacky') 
    : (viewingUser?.fullName || viewingUser?.username || 'Developer');
  const username = isOwnProfile 
    ? (user.username || 'achmadzacky') 
    : (viewingUser?.username || 'developer');
  const avatarUrl = isOwnProfile 
    ? user.avatarUrl 
    : viewingUser?.avatarUrl;
  const bio = isOwnProfile 
    ? (user.bio || 'Lead Cybernetics Architect @ FLUIDS. Crafting high-performance distributed systems & web applications.') 
    : (viewingUser?.bio || 'Developer @ FLUIDS. Exploring low-level systems, GPU shaders, and distributed computing.');
  const techStack = isOwnProfile
    ? ['Go', 'TypeScript', 'PostgreSQL', 'Docker', 'React', 'TailwindCSS']
    : (viewingUser?.techStack || ['C++', 'GLSL', 'Vulkan', 'Rust', 'DirectX 12']);
  const noteText = isOwnProfile 
    ? userNote 
    : (viewingUser?.note || 'Coding...');
  const postsCount = isOwnProfile ? 342 : (viewingUser?.postsCount || 128);
  const followersCount = isOwnProfile ? '14.2k' : (viewingUser?.followersCount || '45.2k');
  const followingCount = isOwnProfile ? 892 : (viewingUser?.followingCount || 342);
  const initialLetter = displayName.charAt(0).toUpperCase();

  const [storyHighlightsList, setStoryHighlightsList] = useState<HighlightItem[]>([
    {
      id: 'hl-1',
      title: 'CyberArt',
      img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150',
      stories: [
        {
          id: 's-hl-1',
          userName: displayName,
          userAvatar: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          mediaUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800',
          caption: 'CyberArt collection 2026 #CyberArt',
          timeAgo: 'Highlights',
        },
      ],
    },
    {
      id: 'hl-2',
      title: 'Projects',
      img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      stories: [
        {
          id: 's-hl-2',
          userName: displayName,
          userAvatar: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
          caption: 'Neural Architecture UI Projects',
          timeAgo: 'Highlights',
        },
      ],
    },
    {
      id: 'hl-3',
      title: 'Setup 2026',
      img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150',
      stories: [
        {
          id: 's-hl-3',
          userName: displayName,
          userAvatar: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800',
          caption: 'Cyberpunk Battlestation Node',
          timeAgo: 'Highlights',
        },
      ],
    },
  ]);

  const handleCreateHighlight = (newHighlight: {
    title: string;
    coverImg: string;
    stories: StoryItem[];
  }) => {
    const newEntry = {
      id: `hl-${Date.now()}`,
      title: newHighlight.title,
      img: newHighlight.coverImg,
      stories: newHighlight.stories,
    };
    setStoryHighlightsList([newEntry, ...storyHighlightsList]);
    setIsCreateHighlightOpen(false);
  };

  const samplePosts = [
    { id: 1, img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop', likes: '1.4k', comments: '92' },
    { id: 2, img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop', likes: '2.8k', comments: '143' },
    { id: 3, img: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop', likes: '4.1k', comments: '312' },
    { id: 4, img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop', likes: '980', comments: '45' },
    { id: 5, img: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=600&auto=format&fit=crop', likes: '3.5k', comments: '210' },
    { id: 6, img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop', likes: '5.2k', comments: '489' },
  ];

  const handleAddStory = (newStory: { mediaUrl: string; caption: string; note: string }) => {
    if (newStory.note) setUserNote(newStory.note);
  };

  return (
    <div className="w-full h-screen bg-canvas text-text-primary flex overflow-hidden font-body select-none">
      
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

      {/* Modal Create Highlight */}
      {isCreateHighlightOpen && (
        <CreateHighlightModal
          user={user}
          onClose={() => setIsCreateHighlightOpen(false)}
          onCreateHighlight={handleCreateHighlight}
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
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      {/* ================================================================= */}
      <Sidebar
        activeView="profile"
        user={user}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToNetwork={onNavigateToNetwork}
        onNavigateToExplore={onNavigateToExplore}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToReels={onNavigateToReels}
        onNavigateToProfile={() => onNavigateToProfile()}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onLogout}
      />

      {/* ================================================================= */}
      {/* 2. INSTAGRAM-AUTHENTIC PROFILE STREAM */}
      {/* ================================================================= */}
      <main className="flex-1 h-screen overflow-y-auto px-4 md:px-12 py-8 space-y-8 max-w-4xl mx-auto scrollbar-none">
        
        {/* Instagram Header Layout (2-Column Desktop Grid) */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-14 pt-2">
          
          {/* Avatar Section + Floating Note Bubble */}
          <div className="relative flex-shrink-0 mx-auto md:mx-0 group cursor-pointer">
            {/* Note Bubble Float */}
            <div
              onClick={() => {
                if (isOwnProfile) {
                  setIsAddStoryOpen(true);
                }
              }}
              className="absolute -top-6 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-sm bg-surface-raised border border-border-default text-[10px] font-mono text-text-primary shadow-sm hover:border-border-strong transition-colors z-10 flex items-center gap-1.5"
            >
              <span>{noteText}</span>
            </div>

            {/* Avatar Circle */}
            <div 
              onClick={() => {
                if (isOwnProfile) {
                  setIsAddStoryOpen(true);
                }
              }}
              className="w-32 h-32 rounded-full aspect-square shrink-0 p-0.5 border border-border-default hover:border-accent transition-colors"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full rounded-full object-cover aspect-square"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-surface-raised border border-border-default flex items-center justify-center text-3xl font-mono font-bold text-accent">
                  {initialLetter}
                </div>
              )}
            </div>
          </div>

          {/* Right Column Details (Username, Actions, Stats, Bio) */}
          <div className="flex-1 space-y-4 w-full">
            
            {/* Row 1: Username & Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-text-primary tracking-wide font-mono">@{username}</h2>
                <CheckCircle2 className="w-4 h-4 text-accent" />
              </div>

              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-sm bg-surface-raised hover:bg-surface border border-border-default hover:border-border-strong text-xs font-semibold text-text-primary transition-colors cursor-pointer"
                    >
                      Edit Profile
                    </button>

                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-sm bg-surface-raised hover:bg-surface border border-border-default hover:border-border-strong text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Arsip</span>
                    </button>

                    <button
                      type="button"
                      onClick={onNavigateToSettings}
                      className="p-1.5 rounded-sm bg-surface-raised hover:bg-surface border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsFollowingState(!isFollowingState)}
                      className={`px-4 py-1.5 rounded-sm text-xs font-semibold font-mono transition-colors cursor-pointer ${
                        isFollowingState
                          ? 'bg-surface-raised hover:bg-surface border border-border-default hover:border-border-strong text-text-primary'
                          : 'bg-accent hover:bg-accent-hover text-canvas'
                      }`}
                    >
                      {isFollowingState ? 'Mengikuti' : 'Ikuti'}
                    </button>

                    <button
                      type="button"
                      onClick={onNavigateToMessages}
                      className="px-3.5 py-1.5 rounded-sm bg-surface-raised hover:bg-surface border border-border-default hover:border-border-strong text-xs font-semibold text-text-primary transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Kirim Pesan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigateToProfile()}
                      className="px-3 py-1.5 rounded-sm bg-surface-raised hover:bg-surface border border-border-default hover:border-border-strong text-xs font-mono text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    >
                      Profil Saya
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Row 2: Stats Row */}
            <div className="flex items-center gap-8 text-xs font-mono text-text-secondary">
              <div>
                <span className="font-semibold text-text-primary">{postsCount} </span>
                <span>posts</span>
              </div>
              <div>
                <span className="font-semibold text-text-primary">{followersCount} </span>
                <span>followers</span>
              </div>
              <div>
                <span className="font-semibold text-text-primary">{followingCount} </span>
                <span>following</span>
              </div>
            </div>

            {/* Row 3: Full Name & Bio Text */}
            <div className="space-y-1.5 pt-0.5">
              <h3 className="text-xs font-semibold text-text-primary">{displayName}</h3>
              <p className="text-xs text-text-secondary leading-relaxed max-w-lg">{bio}</p>
              
              {/* Tech Stack Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {techStack.map((tech, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-sm bg-surface-raised border border-border-default text-text-secondary font-mono text-[10px]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Developer Activity Heatmap Widget (GitHub Style) */}
        <div className="pt-2">
          <DevActivityHeatmap username={username} totalContributions={isOwnProfile ? 1248 : 892} streakDays={isOwnProfile ? 42 : 19} />
        </div>

        {/* Story Highlights Bar */}
        <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none border-t border-border-default pt-4">
          {/* Add New Highlight Button (+ Baru) */}
          {isOwnProfile && (
            <div
              onClick={() => setIsCreateHighlightOpen(true)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full aspect-square shrink-0 bg-surface-raised border border-dashed border-border-strong group-hover:border-accent flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-text-secondary group-hover:text-accent" />
              </div>
              <span className="text-[11px] font-mono text-text-secondary group-hover:text-text-primary">Baru</span>
            </div>
          )}

          {/* Story Highlights Items */}
          {storyHighlightsList.map((hl) => (
            <div
              key={hl.id}
              onClick={() => setActiveStoryView(hl.stories)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-full aspect-square shrink-0 p-0.5 border border-border-default group-hover:border-accent transition-colors overflow-hidden">
                <img
                  src={hl.img}
                  alt={hl.title}
                  className="w-full h-full rounded-full object-cover aspect-square"
                />
              </div>
              <span className="text-[11px] font-mono text-text-secondary group-hover:text-text-primary truncate max-w-[70px]">
                {hl.title}
              </span>
            </div>
          ))}
        </div>

        {/* Instagram Profile Tabs & Grid Section */}
        <div className="space-y-4">
          
          {/* Tabs Divider Bar */}
          <div className="border-t border-border-default flex justify-center gap-10 text-xs font-mono tracking-wider">
            
            {/* POSTS TAB */}
            <button
              type="button"
              onClick={() => setActiveTab('posts')}
              className={`py-3 flex items-center gap-2 border-t-2 transition-colors cursor-pointer ${
                activeTab === 'posts'
                  ? 'border-accent text-accent font-semibold -mt-[1px]'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>POSTINGAN</span>
            </button>

            {/* REELS TAB */}
            <button
              type="button"
              onClick={() => setActiveTab('reels')}
              className={`py-3 flex items-center gap-2 border-t-2 transition-colors cursor-pointer ${
                activeTab === 'reels'
                  ? 'border-accent text-accent font-semibold -mt-[1px]'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>REELS</span>
            </button>

            {/* SAVED TAB */}
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`py-3 flex items-center gap-2 border-t-2 transition-colors cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-accent text-accent font-semibold -mt-[1px]'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>TERSIMPAN</span>
            </button>
          </div>

          {/* 3-Column Square Grid Layout */}
          <div className="grid grid-cols-3 gap-3 md:gap-4 pb-8">
            {samplePosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square rounded-md overflow-hidden border border-border-default group cursor-pointer bg-surface"
              >
                <img
                  src={post.img}
                  alt={`Post ${post.id}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Dark Hover Overlay with Likes & Comments Count */}
                <div className="absolute inset-0 bg-canvas/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-text-primary font-mono font-medium text-xs">
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-diff-remove fill-diff-remove" />
                    <span>{post.likes}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-text-primary" />
                    <span>{post.comments}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </main>
    </div>
  );
};

export default ProfilePage;
