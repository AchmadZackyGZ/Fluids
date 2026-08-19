import React, { useState } from "react";
import {
  X,
  User,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ImageUploadDropzone } from "../../../components/ui/ImageUploadDropzone";

interface EditProfileModalProps {
  user: {
    fullName?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
  };
  onClose: () => void;
  onSave: (updatedData: {
    fullName: string;
    username: string;
    bio: string;
    avatarUrl: string;
  }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState(user.fullName || "");
  const [username, setUsername] = useState(user.username || "");
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
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

  const initialLetter = fullName ? fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-lg p-6 border border-border-default relative overflow-hidden shadow-2xl space-y-4">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border-default pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold text-text-primary tracking-wide font-mono">
              Edit Profil Developer
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Avatar Upload Dropzone */}
          <ImageUploadDropzone
            label="Avatar Foto Profil"
            value={avatarUrl}
            onChange={setAvatarUrl}
            placeholder="https://images.unsplash.com/photo-..."
            helpText="PNG, JPG, GIF, WebP hingga 10MB"
          />

          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface-raised border border-border-default rounded-sm py-1.5 pl-8 pr-3 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted font-mono text-xs">
                @
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-surface-raised border border-border-default rounded-sm py-1.5 pl-8 pr-3 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Bio / Ringkasan Keahlian
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Backend Developer @ FLUIDS. Go, Postgres, Kubernetes..."
                className="w-full bg-surface-raised border border-border-default rounded-sm p-2 pl-8 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong resize-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary text-xs font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2 rounded-sm bg-accent hover:bg-accent-hover text-canvas text-xs font-semibold tracking-wide transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
