import React, { useState } from 'react';
import { X, User, Camera, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface EditProfileModalProps {
  user: {
    fullName?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
  };
  onClose: () => void;
  onSave: (updatedData: { fullName: string; username: string; bio: string; avatarUrl: string }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
  const [fullName, setFullName] = useState(user.fullName || '');
  const [username, setUsername] = useState(user.username || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    setTimeout(() => {
      onSave({ fullName, username, bio, avatarUrl });
      setIsSaving(false);
      onClose();
    }, 600);
  };

  const initialLetter = fullName ? fullName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="w-full max-w-lg glass-panel-glow rounded-2xl p-6 md:p-8 border border-white/10 relative overflow-hidden shadow-2xl animate-float">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#00f0ff]" />
            <h2 className="text-lg font-bold text-white tracking-wide">Edit Neural Profile</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar URL & Live Preview */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group mb-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                  <div className="w-full h-full rounded-[14px] bg-[#080a0f] flex items-center justify-center text-2xl font-extrabold text-white">
                    {initialLetter}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full">
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Avatar Image URL (Foto Profil)
              </label>
              <div className="relative">
                <Camera className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Full Name (Nama Lengkap)
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Bio / Status
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Lead Cybernetics Architect at FLUIDS..."
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 pl-10 text-xs text-white outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all uppercase tracking-wider"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 btn-neon-gradient text-xs uppercase tracking-wider font-bold"
            >
              {isSaving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
