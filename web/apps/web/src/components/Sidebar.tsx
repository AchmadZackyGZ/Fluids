import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Network, MessageSquare, Compass, Film, 
  User, Plus, LogOut, Menu, Settings, Activity, Bookmark, 
  Moon, AlertCircle, Users, X, PanelLeftClose, PanelLeftOpen,
  Bell
} from 'lucide-react';
import { DeveloperDock, DeveloperDockItem } from './ui/DeveloperDock';
import { FluidsLogo, FluidsLogoMark } from './ui/FluidsLogo';
import { CircularNavigationModal } from './ui/CircularNavigationModal';
import { NotificationsFlyout } from './ui/NotificationsFlyout';

interface SidebarProps {
  activeView: 'dashboard' | 'network' | 'messages' | 'explore' | 'reels' | 'profile' | 'settings';
  user: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  unreadMessagesCount?: number;
  newFollowersCount?: number;
  onNavigateToDashboard: () => void;
  onNavigateToNetwork: () => void;
  onNavigateToExplore: () => void;
  onNavigateToMessages: () => void;
  onNavigateToReels: () => void;
  onNavigateToProfile: (targetUser?: any) => void;
  onNavigateToSettings: () => void;
  onCreatePost?: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  user,
  unreadMessagesCount = 3,
  newFollowersCount = 2,
  onNavigateToDashboard,
  onNavigateToNetwork,
  onNavigateToExplore,
  onNavigateToMessages,
  onNavigateToReels,
  onNavigateToProfile,
  onNavigateToSettings,
  onCreatePost,
  onLogout,
}) => {
  const [isCircularNavOpen, setIsCircularNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [followerCount, setFollowerCount] = useState(newFollowersCount);
  const [isDockMode, setIsDockMode] = useState<boolean>(() => {
    return localStorage.getItem('fluids_sidebar_mode') === 'dock';
  });

  const toggleSidebarMode = () => {
    const newMode = !isDockMode;
    setIsDockMode(newMode);
    localStorage.setItem('fluids_sidebar_mode', newMode ? 'dock' : 'expanded');
  };

  const dockNavItems: DeveloperDockItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      active: activeView === 'dashboard',
      onClick: onNavigateToDashboard,
    },
    {
      id: 'network',
      name: 'Network',
      icon: <Network className="w-4 h-4" />,
      active: activeView === 'network',
      onClick: onNavigateToNetwork,
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: <MessageSquare className="w-4 h-4" />,
      active: activeView === 'messages',
      hasBadge: unreadMessagesCount > 0,
      badgeCount: unreadMessagesCount,
      onClick: onNavigateToMessages,
    },
    {
      id: 'notifications',
      name: 'Notifikasi',
      icon: <Bell className="w-4 h-4" />,
      active: isNotificationsOpen,
      followerCount: followerCount,
      onClick: () => setIsNotificationsOpen(true),
    },
    {
      id: 'explore',
      name: 'Explore',
      icon: <Compass className="w-4 h-4" />,
      active: activeView === 'explore',
      onClick: onNavigateToExplore,
    },
    {
      id: 'reels',
      name: 'Reels',
      icon: <Film className="w-4 h-4" />,
      active: activeView === 'reels',
      onClick: onNavigateToReels,
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: <User className="w-4 h-4" />,
      active: activeView === 'profile',
      onClick: onNavigateToProfile,
    },
    {
      id: 'create_post',
      name: 'Create Post',
      icon: <Plus className="w-4 h-4" />,
      isPrimaryAction: true,
      onClick: onCreatePost || onNavigateToDashboard,
    },
    {
      id: 'more_menu',
      name: 'Lainnya (Menu Sirkular)',
      icon: <Menu className="w-4 h-4" />,
      active: isCircularNavOpen || activeView === 'settings',
      onClick: () => setIsCircularNavOpen(true),
    },
  ];

  /* ========================================================================= */
  /* 1. COMPACT DEVELOPER DOCK VIEW (MINIMALIST MACOS / RAYCAST STYLE)          */
  /* ========================================================================= */
  if (isDockMode) {
    return (
      <aside className="hidden lg:flex flex-col justify-between items-center w-20 h-screen border-r border-border-default bg-canvas py-5 px-2 shrink-0 select-none relative z-40 transition-all duration-300">
        
        {/* Top Header Logo + Toggle Switch */}
        <div className="flex flex-col items-center gap-3 w-full">
          <div 
            onClick={onNavigateToDashboard}
            className="cursor-pointer transition-transform hover:scale-105"
            title="FLUIDS Developer Hub"
          >
            <FluidsLogoMark size={32} />
          </div>

          <button
            type="button"
            onClick={toggleSidebarMode}
            className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            title="Beralih ke Sidebar Penuh"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Vertical Magnification Dock */}
        <div className="my-auto w-full flex justify-center">
          <DeveloperDock
            items={dockNavItems}
            orientation="vertical"
            className="w-14 bg-transparent border-0 shadow-none p-0 gap-2"
          />
        </div>

        {/* Bottom User Avatar / Logout Trigger */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-sm text-text-secondary hover:text-diff-remove hover:bg-surface-raised transition-colors cursor-pointer"
            title="Keluar (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Radial / Circular Navigation Modal */}
        <CircularNavigationModal
          isOpen={isCircularNavOpen}
          onClose={() => setIsCircularNavOpen(false)}
          user={user}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToProfile={onNavigateToProfile}
          onLogout={onLogout}
        />

        {/* Instagram-Style Slide-out Notifications Drawer */}
        <NotificationsFlyout
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onNavigateToProfile={onNavigateToProfile}
          onMarkAllAsRead={() => setFollowerCount(0)}
        />

      </aside>
    );
  }

  /* ========================================================================= */
  /* 2. FULL EXPANDED SIDEBAR VIEW (WITH LABELS & EXTENDED ACTIONS)             */
  /* ========================================================================= */
  return (
    <aside className="hidden lg:flex flex-col justify-between w-64 h-screen border-r border-border-default bg-canvas p-5 shrink-0 select-none relative z-40 transition-all duration-300">
      <div className="space-y-6">
        
        {/* FLUIDS Branding Header & Dock Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onNavigateToDashboard}>
            <FluidsLogo withText withSlogan size={30} />
          </div>

          {/* Toggle to Minimalist Dock Mode */}
          <button
            type="button"
            onClick={toggleSidebarMode}
            className="p-1.5 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            title="Beralih ke mode Dock Minimalis"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Main Core Navigation Links */}
        <nav className="space-y-1.5">
          
          {/* DASHBOARD */}
          <button
            type="button"
            onClick={onNavigateToDashboard}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-medium text-sm transition-colors text-left cursor-pointer ${
              activeView === 'dashboard'
                ? 'bg-surface-raised border border-border-strong text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* NETWORK */}
          <button
            type="button"
            onClick={onNavigateToNetwork}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-medium text-sm transition-colors text-left cursor-pointer ${
              activeView === 'network'
                ? 'bg-surface-raised border border-border-strong text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Network</span>
          </button>

          {/* MESSAGES */}
          <button
            type="button"
            onClick={onNavigateToMessages}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-sm font-medium text-sm transition-colors text-left cursor-pointer ${
              activeView === 'messages'
                ? 'bg-surface-raised border border-border-strong text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </div>
            {unreadMessagesCount > 0 && (
              <span className="px-1.5 py-0.2 min-w-[18px] h-[18px] rounded-full bg-diff-remove text-white text-[10px] font-mono font-bold flex items-center justify-center shadow-sm">
                {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
              </span>
            )}
          </button>

          {/* NOTIFIKASI (INSTAGRAM STYLE WITH FOLLOWER COUNT) */}
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(true)}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-sm font-medium text-sm transition-colors text-left cursor-pointer ${
              isNotificationsOpen
                ? 'bg-surface-raised border border-border-strong text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span>Notifikasi</span>
            </div>
            {followerCount > 0 && (
              <span className="flex items-center gap-0.5 px-1.5 py-0.2 min-w-[20px] h-[18px] rounded-full bg-accent text-canvas text-[10px] font-mono font-bold shadow-sm">
                <User className="w-2.5 h-2.5 stroke-[2.5]" />
                <span>{followerCount}</span>
              </span>
            )}
          </button>

          {/* EXPLORE */}
          <button
            type="button"
            onClick={onNavigateToExplore}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-medium text-sm transition-colors text-left cursor-pointer ${
              activeView === 'explore'
                ? 'bg-surface-raised border border-border-strong text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </button>

          {/* REELS */}
          <button
            type="button"
            onClick={onNavigateToReels}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-medium text-sm transition-colors text-left cursor-pointer ${
              activeView === 'reels'
                ? 'bg-surface-raised border border-border-strong text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Reels</span>
          </button>

          {/* PROFILE */}
          <button
            type="button"
            onClick={onNavigateToProfile}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-medium text-sm transition-colors text-left cursor-pointer ${
              activeView === 'profile'
                ? 'bg-surface-raised border border-border-strong text-accent font-semibold'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </button>

        </nav>

        {/* Create Post Secondary Outline Button */}
        <button
          type="button"
          onClick={onCreatePost}
          className="w-full py-2 rounded-sm bg-surface-raised border border-border-strong hover:border-accent text-accent hover:bg-accent-muted/20 flex items-center justify-center gap-2 text-xs font-semibold tracking-wide transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Create Post</span>
        </button>

      </div>

      {/* ================================================================= */}
      {/* BOTTOM "☰ Lainnya" TRIGGER (CIRCULAR NAVIGATION MODAL)            */}
      {/* ================================================================= */}
      <div className="relative pt-3 border-t border-border-default mt-auto">
        
        {/* "☰ Lainnya" Trigger Button */}
        <button
          type="button"
          onClick={() => setIsCircularNavOpen(true)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-sm font-medium text-sm transition-colors text-left cursor-pointer ${
            isCircularNavOpen || activeView === 'settings'
              ? 'bg-surface-raised border border-border-strong text-accent font-semibold'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>Lainnya</span>
        </button>

      </div>

      {/* Radial / Circular Navigation Modal (Shared for Full & Minimalist Dock Modes) */}
      <CircularNavigationModal
        isOpen={isCircularNavOpen}
        onClose={() => setIsCircularNavOpen(false)}
        user={user}
        onNavigateToSettings={onNavigateToSettings}
        onNavigateToProfile={onNavigateToProfile}
        onLogout={onLogout}
      />

      {/* Instagram-Style Slide-out Notifications Drawer */}
      <NotificationsFlyout
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateToProfile={onNavigateToProfile}
        onMarkAllAsRead={() => setFollowerCount(0)}
      />

    </aside>
  );
};

export default Sidebar;
