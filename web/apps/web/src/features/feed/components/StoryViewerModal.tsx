import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Send, Volume2, VolumeX } from 'lucide-react';

export interface StoryItem {
  id: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  caption?: string;
  timeAgo: string;
}

interface StoryViewerModalProps {
  stories: StoryItem[];
  initialIndex?: number;
  onClose: () => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  const currentStory = stories[currentIndex];

  // Auto advance story progress timer (5 seconds per story)
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return prev + 2; // 50 ticks * 100ms = 5000ms = 5s
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4 select-none">
      
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors z-50 p-2 rounded-full bg-white/10 hover:bg-white/20"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev Navigation Arrow */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={handlePrev}
          className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-50 cursor-pointer"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}

      {/* Main Story Media Card */}
      <div className="relative w-full max-w-sm h-[85vh] rounded-lg overflow-hidden bg-surface border border-border-default flex flex-col justify-between shadow-2xl">
        
        {/* Story Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent space-y-3">
          
          {/* Progress Bar Indicators */}
          <div className="flex gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-100 ease-linear"
                  style={{
                    width:
                      idx === currentIndex
                        ? `${progress}%`
                        : idx < currentIndex
                        ? '100%'
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* User Info Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentStory.userAvatar}
                alt={currentStory.userName}
                className="w-9 h-9 rounded-full object-cover border border-border-default aspect-square"
              />
              <div>
                <span className="text-xs font-semibold text-text-primary block">{currentStory.userName}</span>
                <span className="text-[10px] text-text-secondary font-mono">{currentStory.timeAgo}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Story Media Center */}
        <div className="relative w-full h-full">
          <img
            src={currentStory.mediaUrl}
            alt="Story content"
            className="w-full h-full object-cover"
          />

          {/* Left/Right Click Areas for Navigation */}
          <div className="absolute inset-0 flex">
            <div className="w-1/2 h-full cursor-pointer" onClick={handlePrev} />
            <div className="w-1/2 h-full cursor-pointer" onClick={handleNext} />
          </div>

          {/* Caption Overlay */}
          {currentStory.caption && (
            <div className="absolute bottom-16 left-4 right-4 z-20 bg-surface/90 backdrop-blur-md p-3 rounded-sm border border-border-default text-xs font-mono text-text-primary">
              {currentStory.caption}
            </div>
          )}
        </div>

        {/* Story Bottom Reply Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Reply to ${currentStory.userName}...`}
            className="flex-1 bg-surface-raised/90 border border-border-default rounded-sm px-3.5 py-2 text-xs text-text-primary placeholder:text-text-muted outline-none focus:border-accent font-mono transition-colors"
          />

          <button
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-sm transition-colors cursor-pointer ${
              isLiked ? 'text-diff-remove bg-surface-raised' : 'text-text-secondary hover:text-text-primary bg-surface-raised/80'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-diff-remove' : ''}`} />
          </button>

          {replyText && (
            <button
              type="button"
              onClick={() => setReplyText('')}
              className="p-2 rounded-sm bg-accent hover:bg-accent-hover text-canvas transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* Next Navigation Arrow */}
      {currentIndex < stories.length - 1 && (
        <button
          type="button"
          onClick={handleNext}
          className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all z-50 cursor-pointer"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

    </div>
  );
};
