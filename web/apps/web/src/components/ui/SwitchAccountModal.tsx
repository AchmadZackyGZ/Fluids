import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Check, Plus, ShieldCheck, Building, User } from 'lucide-react';

interface SwitchAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  onSwitchUser?: (account: any) => void;
}

export const SwitchAccountModal: React.FC<SwitchAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUser,
}) => {
  if (!isOpen) return null;

  const accounts = [
    {
      id: 'acc-1',
      name: currentUser.fullName || 'Achmad Zacky',
      username: currentUser.username || 'achmadzacky',
      role: 'Personal Developer Profile',
      avatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      isActive: true,
      type: 'personal',
    },
    {
      id: 'acc-2',
      name: 'FLUIDS Core Architecture Team',
      username: 'fluids_core',
      role: 'Organization Workspace • Owner',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      isActive: false,
      type: 'org',
    },
    {
      id: 'acc-3',
      name: 'HyperDevs Open Source Studio',
      username: 'hyperdevs_org',
      role: 'Contributor • 14 Members',
      avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150',
      isActive: false,
      type: 'org',
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
          className="relative w-full max-w-md bg-surface border border-border-default rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-surface-raised/70">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-sm bg-accent-muted border border-accent/40 text-accent">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary font-mono">
                  Alihkan Akun & Workspace
                </h3>
                <span className="text-[10px] text-text-secondary font-mono">
                  Beralih profil personal atau workspace tim developer
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

          {/* Account List */}
          <div className="p-5 space-y-2.5 overflow-y-auto scrollbar-none">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                onClick={() => {
                  if (onSwitchUser) onSwitchUser(acc);
                  onClose();
                }}
                className={`p-3 rounded-md border flex items-center justify-between cursor-pointer transition-all ${
                  acc.isActive
                    ? 'bg-surface-raised border-accent shadow-sm'
                    : 'bg-surface hover:bg-surface-raised border-border-default hover:border-border-strong'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-full aspect-square p-0.5 border border-border-default shrink-0">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                    {acc.type === 'org' && (
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-surface-raised border border-border-default text-accent">
                        <Building className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-semibold text-text-primary font-mono truncate">
                        {acc.name}
                      </h4>
                    </div>
                    <span className="text-[10px] text-text-secondary font-mono block truncate">
                      @{acc.username} • {acc.role}
                    </span>
                  </div>
                </div>

                {acc.isActive ? (
                  <span className="px-2 py-0.5 rounded-sm bg-accent-muted border border-accent/40 text-[10px] font-mono text-accent font-semibold flex items-center gap-1 shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" /> Aktif
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-text-secondary hover:text-accent shrink-0">
                    Beralih →
                  </span>
                )}
              </div>
            ))}

            {/* Add New Workspace / Account Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full p-3 rounded-md border border-dashed border-border-strong hover:border-accent text-text-secondary hover:text-accent bg-surface-raised/40 transition-colors flex items-center justify-center gap-2 text-xs font-mono font-medium cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Akun / Buat Workspace Tim Baru</span>
            </button>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border-default bg-surface-raised/50 flex items-center justify-end">
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

export default SwitchAccountModal;
