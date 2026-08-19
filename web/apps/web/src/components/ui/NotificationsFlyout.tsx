import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, UserPlus, Heart, MessageSquare, Repeat2, 
  Check, UserCheck, Sparkles, Code, User, ArrowRight, CheckCheck 
} from 'lucide-react';

export type NotificationTabType = 
  | 'all' 
  | 'following' 
  | 'comments' 
  | 'followers' 
  | 'mentions' 
  | 'verified';

export interface DeveloperNotification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'repost' | 'mention';
  actor: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string;
    techStack?: string[];
    bio?: string;
  };
  content?: string;
  timeAgo: string;
  period: 'today' | 'this_week' | 'this_month';
  isRead: boolean;
  isFollowing?: boolean;
  targetPreview?: {
    type: 'post' | 'reels' | 'code';
    title?: string;
    snippet?: string;
    mediaUrl?: string;
  };
}

interface NotificationsFlyoutProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile?: (targetUser: any) => void;
  onMarkAllAsRead?: () => void;
}

export const INITIAL_NOTIFICATIONS: DeveloperNotification[] = [
  // HARI INI
  {
    id: 'n-1',
    type: 'follow',
    actor: {
      id: 'dev-1',
      name: 'Satriya Inframe',
      username: 'satriyainframe',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      bio: 'Go Backend & Cloud Engineer @ Tokopedia',
    },
    timeAgo: '7 jam',
    period: 'today',
    isRead: false,
    isFollowing: true,
  },
  {
    id: 'n-2',
    type: 'like',
    actor: {
      id: 'dev-2',
      name: 'Alex Rivera',
      username: 'synth_wave',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: 'Distributed Systems & Go Architect',
    },
    content: 'menyukai postingan Anda: "Fixed 24-Hour JWT Token Expiration in Go"',
    timeAgo: '4 jam',
    period: 'today',
    isRead: false,
    targetPreview: {
      type: 'code',
      title: 'jwt.go',
      snippet: 'token := jwt.NewWithClaims(...)',
    },
  },

  // MINGGU INI
  {
    id: 'n-3',
    type: 'follow',
    actor: {
      id: 'dev-3',
      name: 'Faidza Airlangga',
      username: 'faidzaa.airlangga',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      bio: 'Low-level C++ & Vulkan Graphics Engineer',
    },
    timeAgo: '3 hari',
    period: 'this_week',
    isRead: false,
    isFollowing: true,
  },
  {
    id: 'n-4',
    type: 'comment',
    actor: {
      id: 'dev-4',
      name: 'Abie Learns',
      username: 'abie.learns',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'Fullstack Rust & Next.js Dev',
    },
    content: 'membalas komentar Anda di postingan abie.learns: "in your DMs ;) exciting!!"',
    timeAgo: '5 hari',
    period: 'this_week',
    isRead: true,
    targetPreview: {
      type: 'reels',
      mediaUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150',
    },
  },

  // BULAN INI
  {
    id: 'n-5',
    type: 'follow',
    actor: {
      id: 'dev-5',
      name: 'Auliya Rahma',
      username: 'auliyrhn',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      bio: 'DevOps & Kubernetes SRE',
    },
    timeAgo: 'Aug 03',
    period: 'this_month',
    isRead: true,
    isFollowing: true,
  },
  {
    id: 'n-6',
    type: 'follow',
    actor: {
      id: 'dev-6',
      name: 'Pandy Ro',
      username: 'pandy.ro_',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Compiler Engineer & LLVM enthusiast',
    },
    timeAgo: 'Jul 31',
    period: 'this_month',
    isRead: true,
    isFollowing: true,
  },
  {
    id: 'n-7',
    type: 'follow',
    actor: {
      id: 'dev-7',
      name: 'Arbhiie Code',
      username: 'arbhiiie',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      bio: 'Frontend UI/UX Specialist',
    },
    timeAgo: 'Jul 28',
    period: 'this_month',
    isRead: true,
    isFollowing: true,
  },
  {
    id: 'n-8',
    type: 'follow',
    actor: {
      id: 'dev-8',
      name: 'Dita Supermacy',
      username: 'ditasupermacy',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
      bio: 'Cybersecurity Analyst & Pentester',
    },
    timeAgo: 'Jul 22',
    period: 'this_month',
    isRead: true,
    isFollowing: true,
  },
  {
    id: 'n-9',
    type: 'follow',
    actor: {
      id: 'dev-9',
      name: 'Dimas Bimantoro',
      username: 'dimas.bimantoro',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      bio: 'PostgreSQL Database Engineer',
    },
    timeAgo: 'Jul 20',
    period: 'this_month',
    isRead: true,
    isFollowing: true,
  },
  {
    id: 'n-10',
    type: 'follow',
    actor: {
      id: 'dev-10',
      name: 'Rana Yuliana',
      username: 'rrnayyy01_',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      bio: 'Junior Developer @ Fluids',
    },
    timeAgo: 'Jun 15',
    period: 'this_month',
    isRead: true,
    isFollowing: false, // User hasn't followed back yet ("Ikuti Balik")
  },
];

export const SUGGESTED_DEVELOPERS = [
  {
    id: 'sug-1',
    name: 'Putti Esca',
    username: 'pummkiss',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    mutualText: 'Diikuti oleh aisyhhhh___ + 6 lainnya',
    isFollowing: false,
  },
  {
    id: 'sug-2',
    name: 'Nasgor Six Nine',
    username: '14sfth',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    mutualText: 'Diikuti oleh pandy.ro_ + 14 lainnya',
    isFollowing: false,
  },
  {
    id: 'sug-3',
    name: 'Farrel Abhirama',
    username: 'farrel.abh',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    mutualText: 'Diikuti oleh faidzaa.airlangga + 14 lainnya',
    isFollowing: false,
  },
];

export const NotificationsFlyout: React.FC<NotificationsFlyoutProps> = ({
  isOpen,
  onClose,
  onNavigateToProfile,
  onMarkAllAsRead,
}) => {
  const [activeTab, setActiveTab] = useState<NotificationTabType>('all');
  const [notifications, setNotifications] = useState<DeveloperNotification[]>(INITIAL_NOTIFICATIONS);
  const [suggestedList, setSuggestedList] = useState(SUGGESTED_DEVELOPERS);

  if (!isOpen) return null;

  const toggleFollow = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isFollowing: !n.isFollowing } : n))
    );
  };

  const toggleSuggestedFollow = (id: string) => {
    setSuggestedList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFollowing: !s.isFollowing } : s))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (onMarkAllAsRead) onMarkAllAsRead();
  };

  // Filter based on active horizontal pill tab (Instagram style)
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'following') return n.type === 'like' || n.type === 'comment' || n.type === 'repost';
    if (activeTab === 'comments') return n.type === 'comment';
    if (activeTab === 'followers') return n.type === 'follow';
    if (activeTab === 'mentions') return n.type === 'mention' || n.type === 'comment';
    if (activeTab === 'verified') return true;
    return true;
  });

  const todayList = filteredNotifications.filter((n) => n.period === 'today');
  const thisWeekList = filteredNotifications.filter((n) => n.period === 'this_week');
  const thisMonthList = filteredNotifications.filter((n) => n.period === 'this_month');

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-start select-none animate-fade-in"
        onClick={onClose}
      >
        {/* Slide-out Sidebar Panel (400px width matching Instagram Web) */}
        <motion.div
          initial={{ x: -420, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -420, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[400px] h-screen bg-surface border-r border-border-default shadow-2xl flex flex-col z-50 overflow-hidden"
        >
          {/* 1. Header with Close X */}
          <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-border-default/60">
            <h2 className="text-xl font-bold text-text-primary font-display tracking-tight">
              Notifikasi
            </h2>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs font-mono text-accent hover:underline cursor-pointer flex items-center gap-1"
                  title="Tandai semua notifikasi telah dibaca"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Dibaca</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-text-secondary hover:text-text-primary rounded-sm hover:bg-surface-raised transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Horizontal Filter Tabs (Instagram Web Pill Style) */}
          <div className="px-4 py-3 border-b border-border-default/50 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-surface-raised text-text-primary border border-border-strong font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/40'
              }`}
            >
              Semua
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('following')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'following'
                  ? 'bg-surface-raised text-text-primary border border-border-strong font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/40'
              }`}
            >
              Orang yang Anda ikuti
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'comments'
                  ? 'bg-surface-raised text-text-primary border border-border-strong font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/40'
              }`}
            >
              Komentar
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('followers')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'followers'
                  ? 'bg-surface-raised text-text-primary border border-border-strong font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/40'
              }`}
            >
              Mengikuti
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('mentions')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'mentions'
                  ? 'bg-surface-raised text-text-primary border border-border-strong font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/40'
              }`}
            >
              Tanda & penyebutan
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('verified')}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'verified'
                  ? 'bg-surface-raised text-text-primary border border-border-strong font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/40'
              }`}
            >
              Terverifikasi
            </button>
          </div>

          {/* 3. Notifications Stream Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-border-default/40 scrollbar-none">
            
            {/* Empty State for "Orang yang Anda ikuti" with Disarankan Section */}
            {activeTab === 'following' && filteredNotifications.length === 0 && (
              <div className="p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full border border-border-default flex items-center justify-center mx-auto text-text-secondary">
                  <Heart className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h3 className="text-sm font-bold text-text-primary font-display">
                  Aktivitas Di Kiriman Anda
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Saat seseorang menyukai atau mengomentari salah satu postingan Anda, Anda akan melihatnya di sini.
                </p>
              </div>
            )}

            {/* SECTION 1: HARI INI */}
            {todayList.length > 0 && (
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-bold text-text-primary font-mono">
                  Hari Ini
                </h3>
                <div className="space-y-3">
                  {todayList.map((item) => (
                    <NotificationRow 
                      key={item.id} 
                      item={item} 
                      onToggleFollow={toggleFollow}
                      onNavigateToProfile={onNavigateToProfile}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: MINGGU INI */}
            {thisWeekList.length > 0 && (
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-bold text-text-primary font-mono">
                  Minggu Ini
                </h3>
                <div className="space-y-3">
                  {thisWeekList.map((item) => (
                    <NotificationRow 
                      key={item.id} 
                      item={item} 
                      onToggleFollow={toggleFollow}
                      onNavigateToProfile={onNavigateToProfile}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: BULAN INI */}
            {thisMonthList.length > 0 && (
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-bold text-text-primary font-mono">
                  Bulan ini
                </h3>
                <div className="space-y-3">
                  {thisMonthList.map((item) => (
                    <NotificationRow 
                      key={item.id} 
                      item={item} 
                      onToggleFollow={toggleFollow}
                      onNavigateToProfile={onNavigateToProfile}
                      onClose={onClose}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: DISARANKAN UNTUK ANDA (SUGGESTED DEVELOPERS) */}
            {activeTab === 'following' && (
              <div className="p-4 space-y-3 border-t border-border-default">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-text-primary font-mono">
                    Disarankan untuk Anda
                  </h3>
                  <button type="button" className="text-[11px] font-mono text-accent hover:underline cursor-pointer">
                    Lihat semua
                  </button>
                </div>

                <div className="space-y-3">
                  {suggestedList.map((sug) => (
                    <div key={sug.id} className="flex items-center justify-between gap-3">
                      <div 
                        className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                        onClick={() => {
                          if (onNavigateToProfile) onNavigateToProfile(sug);
                          onClose();
                        }}
                      >
                        <img
                          src={sug.avatarUrl}
                          alt={sug.name}
                          className="w-10 h-10 rounded-full object-cover border border-border-default shrink-0 aspect-square"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-semibold text-text-primary font-mono block truncate">
                            {sug.username}
                          </span>
                          <span className="text-[10px] text-text-secondary block truncate">
                            {sug.mutualText}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSuggestedFollow(sug.id)}
                        className={`px-4 py-1.5 rounded-sm text-xs font-mono font-semibold transition-colors cursor-pointer shrink-0 ${
                          sug.isFollowing
                            ? 'bg-surface-raised border border-border-strong text-text-secondary hover:text-diff-remove'
                            : 'bg-accent hover:bg-accent-hover text-canvas font-bold'
                        }`}
                      >
                        {sug.isFollowing ? 'Mengikuti' : 'Ikuti'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* 4. Bottom Brand Tag */}
          <div className="p-3 border-t border-border-default bg-surface-raised/40 flex items-center justify-between text-[11px] font-mono text-text-secondary">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Notifikasi Developer FLUIDS</span>
            </span>
            <span>© 2026 FLUIDS</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ========================================================================= */
/* NOTIFICATION ROW ITEM (PIXEL PERFECT INSTAGRAM / DEVELOPER STYLE)           */
/* ========================================================================= */
function NotificationRow({
  item,
  onToggleFollow,
  onNavigateToProfile,
  onClose,
}: {
  item: DeveloperNotification;
  onToggleFollow: (id: string) => void;
  onNavigateToProfile?: (actor: any) => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2.5 py-1">
      {/* Left: Avatar + Narrative */}
      <div 
        className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
        onClick={() => {
          if (onNavigateToProfile) onNavigateToProfile(item.actor);
          onClose();
        }}
      >
        <div className="relative w-10 h-10 rounded-full aspect-square shrink-0">
          <img
            src={item.actor.avatarUrl}
            alt={item.actor.name}
            className="w-full h-full rounded-full object-cover border border-border-default aspect-square"
          />
          {item.type === 'follow' && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent text-canvas flex items-center justify-center border border-surface">
              <User className="w-2 h-2 stroke-[2.5]" />
            </span>
          )}
          {item.type === 'like' && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-diff-remove text-white flex items-center justify-center border border-surface">
              <Heart className="w-2 h-2 fill-current" />
            </span>
          )}
          {item.type === 'comment' && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-accent text-canvas flex items-center justify-center border border-surface">
              <MessageSquare className="w-2 h-2" />
            </span>
          )}
        </div>

        <div className="min-w-0 text-xs leading-snug">
          <p className="text-text-primary line-clamp-2">
            <strong className="font-semibold font-mono group-hover:text-accent transition-colors">
              {item.actor.username}
            </strong>{' '}
            <span className="text-text-secondary">
              {item.type === 'follow' ? 'mulai mengikuti Anda.' : item.content}
            </span>{' '}
            <span className="text-text-muted font-mono text-[11px] whitespace-nowrap">
              {item.timeAgo}
            </span>
          </p>
        </div>
      </div>

      {/* Right: Action Button (Ikuti / Diikuti / Ikuti Balik) OR Thumbnail Preview */}
      {item.type === 'follow' ? (
        <button
          type="button"
          onClick={() => onToggleFollow(item.id)}
          className={`px-3 py-1.5 rounded-sm font-mono text-xs font-semibold transition-all shrink-0 cursor-pointer min-w-[76px] text-center ${
            item.isFollowing
              ? 'bg-surface-raised border border-border-strong text-text-primary hover:border-diff-remove hover:text-diff-remove'
              : 'bg-accent hover:bg-accent-hover text-canvas font-bold'
          }`}
        >
          {item.isFollowing ? 'Diikuti' : 'Ikuti Balik'}
        </button>
      ) : item.targetPreview ? (
        <div className="w-10 h-10 rounded-sm bg-surface-raised border border-border-default overflow-hidden shrink-0 flex items-center justify-center">
          {item.targetPreview.mediaUrl ? (
            <img
              src={item.targetPreview.mediaUrl}
              alt="Post preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-1 flex flex-col items-center justify-center text-center">
              <Code className="w-3.5 h-3.5 text-accent" />
              <span className="text-[8px] font-mono text-text-muted truncate max-w-full">
                {item.targetPreview.title || 'jwt.go'}
              </span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default NotificationsFlyout;
