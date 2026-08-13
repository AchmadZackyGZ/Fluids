import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, User, Camera, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  fullName: string;
  username: string;
  onFinish: (profileData?: { bio: string; avatarUrl: string }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ fullName, username, onFinish }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['CyberArt', 'AI & ML']);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const interestsList = [
    'CyberArt', 'AI & ML', 'NeonTech', 'Web3', 'Gaming', 
    'Music Production', '3D Graphics', 'Software Arch'
  ];

  const initialLetter = fullName ? fullName.charAt(0).toUpperCase() : 'U';

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const handleSubmitProfile = () => {
    onFinish({ bio, avatarUrl });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <div className="w-full max-w-xl glass-panel-glow rounded-2xl p-6 md:p-8 border border-white/10 relative overflow-hidden shadow-2xl animate-float">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00f0ff] via-[#a855f7] to-[#00f0ff]" />

        {/* STEP 1: WELCOME & INTEREST QUESTIONNAIRE */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Welcome to FLUIDS
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                Greetings, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] to-[#a855f7]">{fullName}</span>!
              </h2>
              <p className="text-xs text-gray-400">
                Customize your neural feed vector by selecting your core interests.
              </p>
            </div>

            {/* Interest Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-6">
              {interestsList.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all border ${
                      isSelected
                        ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-white shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <span>{interest}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#00f0ff]" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 btn-neon-gradient flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-bold"
            >
              <span>Next: Setup Profile (Optional)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: PROFILE SETUP (OPTIONAL WITH SKIP BUTTON) */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-[#00f0ff]" /> Step 2 of 2 • Optional
              </div>
              <h2 className="text-xl font-extrabold text-white">
                Set Your Avatar & Bio
              </h2>
              <p className="text-xs text-gray-400">
                You can complete this now or skip for your default initial avatar.
              </p>
            </div>

            {/* Avatar Preview */}
            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative group cursor-pointer">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullName}
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.4)]"
                  />
                ) : (
                  /* Initial Avatar Fallback */
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#9d00ff] p-0.5 shadow-[0_0_25px_rgba(0,240,255,0.4)]">
                    <div className="w-full h-full rounded-full bg-[#080a0f] flex items-center justify-center text-3xl font-extrabold text-white">
                      {initialLetter}
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-[11px] text-gray-400 mt-2 font-mono">
                @{username}
              </span>
            </div>

            {/* Bio Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Bio / Status (Optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your fluid bio or tagline..."
                rows={2}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] resize-none"
              />
            </div>

            {/* Actions: Skip vs Save */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all uppercase tracking-wider"
              >
                Skip For Now (Lewati)
              </button>

              <button
                type="button"
                onClick={handleSubmitProfile}
                className="flex-1 py-3 btn-neon-gradient text-xs uppercase tracking-wider font-bold"
              >
                Save & Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
