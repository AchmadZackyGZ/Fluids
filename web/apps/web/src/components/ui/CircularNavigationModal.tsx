import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Activity,
  Bookmark,
  Moon,
  AlertCircle,
  Users,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";
import { ActivityLogModal } from "./ActivityLogModal";
import { AppearanceModal } from "./AppearanceModal";
import { ReportIssueModal } from "./ReportIssueModal";
import { SwitchAccountModal } from "./SwitchAccountModal";

export interface CircularNavItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  isDanger?: boolean;
  onClick: () => void;
}

interface CircularNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  onNavigateToSettings: () => void;
  onNavigateToProfile: () => void;
  onLogout: () => void;
}

export const CircularNavigationModal: React.FC<
  CircularNavigationModalProps
> = ({
  isOpen,
  onClose,
  user = { fullName: "Achmad Zacky", username: "achmadzacky" },
  onNavigateToSettings,
  onNavigateToProfile,
  onLogout,
}) => {
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSwitchAccountOpen, setIsSwitchAccountOpen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !isActivityOpen &&
        !isAppearanceOpen &&
        !isReportOpen &&
        !isSwitchAccountOpen
      ) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isOpen,
    onClose,
    isActivityOpen,
    isAppearanceOpen,
    isReportOpen,
    isSwitchAccountOpen,
  ]);

  const items: CircularNavItem[] = [
    {
      id: "settings",
      name: "Pengaturan",
      icon: <Settings className="w-5 h-5" />,
      onClick: () => {
        onClose();
        onNavigateToSettings();
      },
    },
    {
      id: "activity",
      name: "Aktivitas Anda",
      icon: <Activity className="w-5 h-5" />,
      onClick: () => {
        setIsActivityOpen(true);
      },
    },
    {
      id: "bookmarks",
      name: "Tersimpan",
      icon: <Bookmark className="w-5 h-5" />,
      onClick: () => {
        onClose();
        onNavigateToProfile();
      },
    },
    {
      id: "theme",
      name: "Ubah Tampilan",
      icon: <Moon className="w-5 h-5" />,
      onClick: () => {
        setIsAppearanceOpen(true);
      },
    },
    {
      id: "report",
      name: "Laporkan Masalah",
      icon: <AlertCircle className="w-5 h-5" />,
      onClick: () => {
        setIsReportOpen(true);
      },
    },
    {
      id: "switch_account",
      name: "Alihkan Akun",
      icon: <Users className="w-5 h-5" />,
      onClick: () => {
        setIsSwitchAccountOpen(true);
      },
    },
    {
      id: "logout",
      name: "Keluar (Logout)",
      icon: <LogOut className="w-5 h-5" />,
      isDanger: true,
      onClick: () => {
        onClose();
        onLogout();
      },
    },
  ];

  const totalItems = items.length;
  const radius = 118; // Distance from center in px

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none"
        onClick={onClose}
      >
        {/* Container */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.6, opacity: 0, rotate: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-[340px] h-[340px] rounded-full bg-surface border border-border-default shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-center"
        >
          {/* Subtle Ambient Ring Track */}
          <div className="absolute inset-4 rounded-full border border-border-default/40 border-dashed pointer-events-none" />
          <div className="absolute inset-14 rounded-full border border-border-default/30 pointer-events-none" />

          {/* Center Close Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onClose}
            className="relative z-20 w-14 h-14 rounded-full bg-surface-raised border border-border-strong hover:border-accent text-text-primary hover:text-accent flex flex-col items-center justify-center shadow-xl cursor-pointer transition-colors group"
            title="Tutup Menu (Esc)"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-[9px] font-mono text-text-secondary group-hover:text-accent -mt-0.5">
              Tutup
            </span>
          </motion.button>

          {/* Radial Navigation Items */}
          {items.map((item, index) => {
            // Angle around the circle (starting from top, distributing evenly)
            const angleDeg = (index / totalItems) * 360 - 90;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = Math.round(radius * Math.cos(angleRad));
            const y = Math.round(radius * Math.sin(angleRad));

            return (
              <motion.div
                key={item.id}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 1, x, y }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 24,
                  delay: index * 0.03,
                }}
                className="absolute left-1/2 top-1/2 -ml-6 -mt-6 z-10"
              >
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.92 }}
                  type="button"
                  onClick={item.onClick}
                  className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border shadow-lg cursor-pointer transition-all duration-200 group relative ${
                    item.isDanger
                      ? "bg-surface-raised border-diff-remove/40 text-diff-remove hover:bg-diff-remove hover:text-canvas"
                      : "bg-surface-raised border-border-default hover:border-accent text-text-secondary hover:text-accent hover:shadow-[0_0_15px_rgba(232,163,61,0.25)]"
                  }`}
                  title={item.name}
                >
                  <div className="w-5 h-5 flex items-center justify-center">
                    {item.icon}
                  </div>

                  {/* Floating Monospace Tooltip on Hover */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 px-2 py-0.5 rounded-sm bg-surface-raised border border-border-strong text-[10px] font-mono text-text-primary whitespace-nowrap shadow-xl z-30">
                    {item.name}
                  </div>
                </motion.button>
              </motion.div>
            );
          })}

          {/* Subtitle tag below modal */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-mono text-text-secondary flex items-center gap-1.5">
            {/* <Sparkles className="w-3 h-3 text-accent" /> */}
            <span>Menu Pintasan Sirkular Developer</span>
          </div>
        </motion.div>

        {/* 1. Aktivitas Developer Modal */}
        <ActivityLogModal
          isOpen={isActivityOpen}
          onClose={() => {
            setIsActivityOpen(false);
            onClose();
          }}
          user={user}
        />

        {/* 2. Ubah Tampilan / Tema Modal */}
        <AppearanceModal
          isOpen={isAppearanceOpen}
          onClose={() => {
            setIsAppearanceOpen(false);
            onClose();
          }}
        />

        {/* 3. Laporkan Masalah Modal */}
        <ReportIssueModal
          isOpen={isReportOpen}
          onClose={() => {
            setIsReportOpen(false);
            onClose();
          }}
        />

        {/* 4. Alihkan Akun Modal */}
        <SwitchAccountModal
          isOpen={isSwitchAccountOpen}
          onClose={() => {
            setIsSwitchAccountOpen(false);
            onClose();
          }}
          currentUser={user}
        />
      </div>
    </AnimatePresence>
  );
};

export default CircularNavigationModal;
