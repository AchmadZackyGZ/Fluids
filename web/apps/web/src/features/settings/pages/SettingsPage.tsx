import React, { useState } from "react";
import { Sidebar } from "../../../components/Sidebar";
import {
  Settings,
  Key,
  Bell,
  Shield,
  Lock,
  Moon,
  CheckCircle2,
  AlertCircle,
  Save,
  Smartphone,
  User,
} from "lucide-react";

interface SettingsPageProps {
  user: {
    fullName?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
  };
  onNavigateToDashboard: () => void;
  onNavigateToNetwork: () => void;
  onNavigateToExplore: () => void;
  onNavigateToMessages: () => void;
  onNavigateToReels: () => void;
  onNavigateToProfile: () => void;
  onNavigateToSettings: () => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onNavigateToDashboard,
  onNavigateToNetwork,
  onNavigateToExplore,
  onNavigateToMessages,
  onNavigateToReels,
  onNavigateToProfile,
  onNavigateToSettings,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<
    "account" | "security" | "notifications" | "theme"
  >("account");
  const [fullName, setFullName] = useState(user.fullName || "Achmad Zacky");
  const [username, setUsername] = useState(user.username || "achmadzacky");
  const [email, setEmail] = useState(user.email || "zacky@fluids.com");
  const [bio, setBio] = useState(
    user.bio || "Lead Cybernetics Architect at FLUIDS.",
  );

  const [savedToast, setSavedToast] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="w-full h-screen bg-[#07090e] text-white flex overflow-hidden font-body select-none">
      {/* Reusable Sidebar with activeView="settings" */}
      <Sidebar
        activeView="settings"
        user={user}
        onNavigateToDashboard={onNavigateToDashboard}
        onNavigateToNetwork={onNavigateToNetwork}
        onNavigateToExplore={onNavigateToExplore}
        onNavigateToMessages={onNavigateToMessages}
        onNavigateToReels={onNavigateToReels}
        onNavigateToProfile={onNavigateToProfile}
        onNavigateToSettings={onNavigateToSettings}
        onLogout={onLogout}
      />

      {/* Save Success Toast */}
      {savedToast && (
        <div className="fixed top-5 right-5 z-50 p-3 rounded-sm bg-surface-raised border border-border-strong flex items-center gap-2.5 text-text-primary text-xs font-mono shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-diff-add" />
          <span>Pengaturan berhasil disimpan!</span>
        </div>
      )}

      {/* ================================================================= */}
      {/* SETTINGS CONTENT STREAM */}
      {/* ================================================================= */}
      <main className="flex-1 h-screen overflow-y-auto p-6 md:p-8 max-w-4xl mx-auto space-y-6 scrollbar-none">
        {/* Settings Header */}
        <div className="flex items-center gap-3 border-b border-border-default pb-4">
          <div className="p-2.5 rounded-sm bg-surface-raised border border-border-default text-accent">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-text-primary font-display">
              Pengaturan
            </h1>
            <p className="text-xs text-text-secondary font-mono">
              Kelola preferensi akun, sesi token JWT, dan notifikasi.
            </p>
          </div>
        </div>

        {/* Settings Tabs & Panels */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Tab Buttons */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveTab("account")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-mono font-medium transition-colors text-left cursor-pointer ${
                activeTab === "account"
                  ? "bg-surface-raised border border-border-strong text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-raised/50"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Edit Profil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-mono font-medium transition-colors text-left cursor-pointer ${
                activeTab === "security"
                  ? "bg-surface-raised border border-border-strong text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-raised/50"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Keamanan & JWT</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-mono font-medium transition-colors text-left cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-surface-raised border border-border-strong text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-raised/50"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notifikasi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("theme")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-sm text-xs font-mono font-medium transition-colors text-left cursor-pointer ${
                activeTab === "theme"
                  ? "bg-surface-raised border border-border-strong text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-raised/50"
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Ubah Tampilan</span>
            </button>
          </div>

          {/* Right Form Panel */}
          <div className="md:col-span-3 bg-surface border border-border-default rounded-md p-5 shadow-sm space-y-5">
            {activeTab === "account" && (
              <form onSubmit={handleSaveSettings} className="space-y-4">
                <h3 className="text-xs font-semibold text-text-primary border-b border-border-default pb-2 font-mono">
                  Informasi Akun
                </h3>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary font-mono">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-surface-raised border border-border-default rounded-sm px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary font-mono">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-surface-raised border border-border-default rounded-sm px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary font-mono">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-raised border border-border-default rounded-sm px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-text-secondary font-mono">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-surface-raised border border-border-default rounded-sm px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-sm text-canvas font-semibold text-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </form>
            )}

            {activeTab === "security" && (
              <div className="space-y-5">
                <h3 className="text-xs font-semibold text-text-primary border-b border-border-default pb-2 font-mono">
                  Keamanan & Sesi Token JWT
                </h3>

                {/* JWT Token Session Card */}
                <div className="p-3.5 rounded-sm bg-surface-raised border border-border-default space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-text-primary font-mono">
                      <Key className="w-3.5 h-3.5 text-accent" />
                      <span>Status Token JWT Go Backend</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-xs bg-diff-add/15 text-diff-add border border-diff-add/30 text-[10px] font-mono font-semibold">
                      AKTIF (24 JAM)
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed font-mono">
                    Durasi masa berlaku sesi token JWT Anda diatur menjadi{" "}
                    <strong>24 Jam (1 Hari)</strong> untuk menjamin keamanan
                    optimal data akun Anda di server FLUIDS.
                  </p>
                </div>

                <div className="space-y-3 pt-1">
                  <h4 className="text-xs font-semibold text-text-primary font-mono">
                    Ubah Kata Sandi
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Kata sandi saat ini..."
                      className="w-full bg-surface-raised border border-border-default rounded-sm px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
                    />
                    <input
                      type="password"
                      placeholder="Kata sandi baru..."
                      className="w-full bg-surface-raised border border-border-default rounded-sm px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSavedToast(true)}
                    className="px-4 py-2 bg-surface-raised border border-border-default hover:border-border-strong text-text-primary rounded-sm font-semibold text-xs font-mono transition-colors cursor-pointer"
                  >
                    Perbarui Kata Sandi
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-text-primary border-b border-border-default pb-2 font-mono">
                  Preferensi Notifikasi
                </h3>

                <div className="space-y-2.5 text-xs text-text-secondary font-mono">
                  <div className="flex items-center justify-between p-3 bg-surface-raised rounded-sm border border-border-default">
                    <div>
                      <span className="font-semibold text-text-primary block">
                        Notifikasi Pesan Langsung (DM)
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        Dapatkan notifikasi saat seseorang mengirim pesan.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-accent cursor-pointer w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-surface-raised rounded-sm border border-border-default">
                    <div>
                      <span className="font-semibold text-text-primary block">
                        Suka & Komentar
                      </span>
                      <span className="text-[11px] text-text-secondary">
                        Dapatkan notifikasi saat postingan/reels Anda disukai.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="accent-accent cursor-pointer w-4 h-4"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "theme" && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-text-primary border-b border-border-default pb-2 font-mono">
                  Tema & Tampilan Estetika
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-sm bg-surface-raised border border-accent space-y-2 cursor-pointer">
                    <div className="w-full h-10 rounded-xs bg-canvas border border-border-default flex items-center justify-center text-xs font-mono font-semibold text-accent">
                      Developer Dark (Default)
                    </div>
                    <span className="text-[10px] text-accent font-mono font-semibold block text-center">
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
