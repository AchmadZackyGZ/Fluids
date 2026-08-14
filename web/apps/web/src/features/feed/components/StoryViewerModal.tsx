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
      <div className="relative w-full max-w-sm h-[85vh] rounded-3xl overflow-hidden glass-panel-glow border border-white/10 flex flex-col justify-between shadow-2xl">
        
        {/* Story Top Header Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent space-y-3">
          
          {/* Progress Bar Indicators */}
          <div className="flex gap-1.5 w-full">
            {stories.map((s, idx) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00f0ff] transition-all duration-100 ease-linear shadow-[0_0_8px_#00f0ff]"
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
                className="w-9 h-9 rounded-xl object-cover border border-[#00f0ff]"
              />
              <div>
                <span className="text-xs font-bold text-white block">{currentStory.userName}</span>
                <span className="text-[10px] text-gray-300 font-mono">{currentStory.timeAgo}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="text-white/80 hover:text-white"
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
            <div className="absolute bottom-16 left-4 right-4 z-20 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs text-white">
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
            className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-gray-400 outline-none focus:border-[#00f0ff]"
          />

          <button
            type="button"
            onClick={() => setIsLiked(!isLiked)}
            className={`p-2 rounded-full transition-all ${
              isLiked ? 'text-red-500 bg-red-500/20' : 'text-white/80 hover:text-white bg-white/10'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
          </button>

          {replyText && (
            <button
              type="button"
              onClick={() => setReplyText('')}
              className="p-2 rounded-full btn-neon-gradient text-black"
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
