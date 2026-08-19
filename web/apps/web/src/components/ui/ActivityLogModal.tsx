import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, X, GitCommit, MessageSquare, Bookmark, Film, 
  GitPullRequest, Flame, CheckCircle2, Terminal 
} from 'lucide-react';

interface ActivityLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
}

export const ActivityLogModal: React.FC<ActivityLogModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen) return null;

  const activities = [
    {
      id: 'act-1',
      icon: <GitCommit className="w-3.5 h-3.5 text-accent" />,
      title: 'Pushed 4 commits ke repo `fluids-backend`',
      detail: 'feat(auth): implement 24-hour JWT token expiration & redis session invalidation',
      time: '12m lalu',
      type: 'git',
    },
    {
      id: 'act-2',
      icon: <MessageSquare className="w-3.5 h-3.5 text-diff-add" />,
      title: 'Memberikan feedback kode pada postingan @synth_wave',
      detail: '"Bisa coba pakai sync.Pool untuk mengurangi beban GC di Go runtime bro."',
      time: '1h lalu',
      type: 'social',
    },
    {
      id: 'act-3',
      icon: <Bookmark className="w-3.5 h-3.5 text-accent" />,
      title: 'Menyimpan snippet "Vulkan Pipeline Shader Configuration"',
      detail: 'Disimpan ke koleksi pribadi: Graphics & Game Engine Dev',
      time: '3h lalu',
      type: 'bookmark',
    },
    {
      id: 'act-4',
      icon: <Film className="w-3.5 h-3.5 text-diff-add" />,
      title: 'Memposting Reels "Debugging Race Condition di Jam 2 Pagi"',
      detail: 'Mendapatkan 142 suka dan 28 komentar dari developer lain',
      time: 'Kemarin',
      type: 'reels',
    },
    {
      id: 'act-5',
      icon: <GitPullRequest className="w-3.5 h-3.5 text-accent" />,
      title: 'Merged Pull Request #104: 3D Ring Carousel Component',
      detail: 'Di-merge oleh maintainer @achmadzacky ke branch main',
      time: '2 hari lalu',
      type: 'git',
    },
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
        onClick={onClose}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-xl bg-surface border border-border-default rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-surface-raised/70">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-sm bg-accent-muted border border-accent/40 text-accent">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary font-mono">
                  Aktivitas & Log Developer
                </h3>
                <span className="text-[10px] text-text-secondary font-mono">
                  Riwayat kontribusi kode, interaksi sosial, dan log akun Anda
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-text-primary rounded-sm hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-4 border-b border-border-default bg-surface-raised/30">
            <div className="p-2.5 rounded-sm bg-surface border border-border-default text-center">
              <span className="text-[10px] font-mono text-text-secondary block">Commit Streak</span>
              <span className="text-sm font-bold font-mono text-accent flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-accent text-accent" /> 42 Hari
              </span>
            </div>
            <div className="p-2.5 rounded-sm bg-surface border border-border-default text-center">
              <span className="text-[10px] font-mono text-text-secondary block">Total Postingan</span>
              <span className="text-sm font-bold font-mono text-text-primary">128 Post</span>
            </div>
            <div className="p-2.5 rounded-sm bg-surface border border-border-default text-center">
              <span className="text-[10px] font-mono text-text-secondary block">PR / Merge</span>
              <span className="text-sm font-bold font-mono text-diff-add">34 Selesai</span>
            </div>
          </div>

          {/* Timeline Stream */}
          <div className="p-5 overflow-y-auto space-y-3.5 divide-y divide-border-default/60 scrollbar-none flex-1">
            {activities.map((item, idx) => (
              <div key={item.id} className={`flex items-start gap-3.5 ${idx > 0 ? 'pt-3.5' : ''}`}>
                <div className="p-2 rounded-sm bg-surface-raised border border-border-default shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-text-primary font-mono truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] font-mono text-text-secondary shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary font-mono leading-relaxed bg-surface-raised/40 p-2 rounded-sm border border-border-default/40">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border-default bg-surface-raised/50 flex items-center justify-between">
            <span className="text-[10px] font-mono text-text-secondary">
              Status Sinkronisasi Realtime: <strong className="text-diff-add">Tersinkron</strong>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-text-primary font-mono text-xs transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>

        </div>
      </div>
    </AnimatePresence>
  );
};

export default ActivityLogModal;
