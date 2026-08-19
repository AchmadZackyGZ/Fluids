import React, { useState } from 'react';
import { X, ArrowLeft, Check, Plus } from 'lucide-react';
import { StoryItem } from '../../feed/components/StoryViewerModal';

interface CreateHighlightModalProps {
  user: {
    fullName?: string;
    avatarUrl?: string;
  };
  onClose: () => void;
  onCreateHighlight: (newHighlight: {
    title: string;
    coverImg: string;
    stories: StoryItem[];
  }) => void;
}

export const CreateHighlightModal: React.FC<CreateHighlightModalProps> = ({
  user,
  onClose,
  onCreateHighlight,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [selectedStoryIds, setSelectedStoryIds] = useState<string[]>([]);

  // Simulated User Story History (Arsip Cerita / History Story)
  const storyArchive = [
    {
      id: 'arch-1',
      date: '14 Aug 2026',
      mediaUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=800',
      caption: 'Neural Shader Matrix Testing #CyberArt',
    },
    {
      id: 'arch-2',
      date: '31 Jul 2026',
      mediaUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800',
      caption: 'Deep dive into Claude AI Watermarking',
    },
    {
      id: 'arch-3',
      date: '8 Jul 2026',
      mediaUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800',
      caption: 'Future Tech 2030 City Architecture Render',
    },
    {
      id: 'arch-4',
      date: '4 Jul 2026',
      mediaUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800',
      caption: 'Cyberpunk Battlestation Node Setup',
    },
    {
      id: 'arch-5',
      date: '1 Jul 2026',
      mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800',
      caption: 'Late night coding session with FLUIDS monorepo',
    },
    {
      id: 'arch-6',
      date: '6 Jun 2026',
      mediaUrl: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=800',
      caption: 'Quantum computing algorithm visualizations',
    },
  ];

  const toggleSelectStory = (id: string) => {
    if (selectedStoryIds.includes(id)) {
      setSelectedStoryIds(selectedStoryIds.filter((item) => item !== id));
    } else {
      setSelectedStoryIds([...selectedStoryIds, id]);
    }
  };

  const handleFinish = () => {
    if (!title.trim()) return;

    const selectedStories = storyArchive.filter((item) => selectedStoryIds.includes(item.id));
    const coverMedia = selectedStories.length > 0 ? selectedStories[0].mediaUrl : storyArchive[0].mediaUrl;

    const formattedStories: StoryItem[] = (selectedStories.length > 0 ? selectedStories : [storyArchive[0]]).map((s) => ({
      id: s.id,
      userName: user.fullName || 'You',
      userAvatar: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      mediaUrl: s.mediaUrl,
      caption: s.caption,
      timeAgo: s.date,
    }));

    onCreateHighlight({
      title: title.trim(),
      coverImg: coverMedia,
      stories: formattedStories,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface border border-border-default rounded-lg overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default text-text-primary">
          {step === 2 ? (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-4" />
          )}

          <h3 className="text-xs font-semibold tracking-wide font-mono">
            {step === 1 ? 'Sorotan Baru' : 'Pilih Arsip Story'}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {step === 1 ? (
          /* STEP 1: Title Input */
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-medium text-text-secondary font-mono">Nama Sorotan</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="misal: Setup 2026..."
                autoFocus
                className="w-full bg-surface-raised border border-border-default rounded-sm px-3.5 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong transition-colors"
              />
            </div>

            <button
              type="button"
              disabled={!title.trim()}
              onClick={() => setStep(2)}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover rounded-sm text-canvas font-semibold text-xs transition-colors disabled:opacity-40 cursor-pointer"
            >
              Selanjutnya
            </button>
          </div>
        ) : (
          /* STEP 2: Story History Archive Selection Grid */
          <div className="flex flex-col h-[400px]">
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-3 gap-2 scrollbar-none">
              {storyArchive.map((item) => {
                const isSelected = selectedStoryIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectStory(item.id)}
                    className="relative aspect-[9/16] rounded-md overflow-hidden cursor-pointer group border border-border-default"
                  >
                    {/* Story Media Preview */}
                    <img
                      src={item.mediaUrl}
                      alt={item.date}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />

                    {/* Date Badge (Atas Kiri) */}
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-sm bg-canvas/80 text-text-primary text-[9px] font-mono font-bold">
                      {item.date}
                    </div>

                    {/* Circular Checkbox (Bawah Kanan) */}
                    <div className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border border-border-default flex items-center justify-center transition-all ${
                      isSelected ? 'bg-accent border-accent text-canvas' : 'bg-surface/80'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Step 2 Bottom Finish Button */}
            <div className="p-4 border-t border-border-default bg-surface">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-2.5 bg-accent hover:bg-accent-hover rounded-sm text-canvas font-semibold text-xs transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CreateHighlightModal;
