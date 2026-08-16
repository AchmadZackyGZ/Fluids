import React, { useState } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { ImageUploadDropzone } from '../../../components/ui/ImageUploadDropzone';

interface AddStoryModalProps {
  user: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
  onClose: () => void;
  onAddStory: (newStory: { mediaUrl: string; caption: string; note: string }) => void;
}

export const AddStoryModal: React.FC<AddStoryModalProps> = ({ user, onClose, onAddStory }) => {
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [note, setNote] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    setTimeout(() => {
      onAddStory({
        mediaUrl: mediaUrl || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600',
        caption,
        note: note || 'Developer Status...',
      });
      setIsPosting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-lg p-6 border border-border-default relative overflow-hidden shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-default pb-3">
          <h2 className="text-sm font-semibold text-text-primary tracking-wide font-mono">Tambah Story / Catatan</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Note Bubble (Catatan Status) */}
          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Catatan Status Profil
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="misal: 'Debugging memory leak...'"
                maxLength={30}
                className="w-full bg-surface-raised border border-border-default rounded-sm py-1.5 pl-8 pr-3 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
              />
            </div>
          </div>

          {/* Story Image Upload Dropzone */}
          <ImageUploadDropzone
            label="Story Media (Foto)"
            value={mediaUrl}
            onChange={setMediaUrl}
            placeholder="https://images.unsplash.com/photo-..."
            helpText="PNG, JPG, GIF, WebP hingga 10MB"
          />

          {/* Caption */}
          <div>
            <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
              Caption (Opsional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="Ceritakan proyek atau snippet hari ini..."
              className="w-full bg-surface-raised border border-border-default rounded-sm p-2 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary text-xs font-medium font-mono transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPosting}
              className="flex-1 py-2 rounded-sm bg-accent hover:bg-accent-hover text-canvas text-xs font-semibold font-mono tracking-wide transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPosting ? 'Mengupload...' : 'Bagikan Story'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
