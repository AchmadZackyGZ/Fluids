import React, { useState } from 'react';
import { X, Image, MessageSquare, Plus, CheckCircle2 } from 'lucide-react';

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
        note: note || 'Cyber Status...',
      });
      setIsPosting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="w-full max-w-md glass-panel-glow rounded-3xl p-6 border border-white/10 relative overflow-hidden shadow-2xl animate-float">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <h2 className="text-base font-bold text-white tracking-wide">Add New Story / Node</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Note Bubble (Catatan Status) */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Avatar Note Bubble (Catatan Status Profil)
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="misal: 'Coding late night...'"
                maxLength={30}
                className="input-field"
              />
            </div>
          </div>

          {/* Story Image URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Story Media URL (Foto / Video)
            </label>
            <div className="relative">
              <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="input-field"
              />
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Story Caption / Teks (Opsional)
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              placeholder="What's happening in your node?"
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#00f0ff] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-bold uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPosting}
              className="flex-1 py-3 btn-neon-gradient text-xs uppercase tracking-wider font-bold"
            >
              {isPosting ? 'Publishing...' : 'Share Story'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
