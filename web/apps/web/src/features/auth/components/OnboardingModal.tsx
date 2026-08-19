import React, { useState } from 'react';
import { ArrowRight, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { ImageUploadDropzone } from '../../../components/ui/ImageUploadDropzone';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-surface rounded-lg p-6 border border-border-default relative overflow-hidden shadow-2xl space-y-5">
        
        {/* Top Accent Indicator */}
        <div className="flex items-center justify-between border-b border-border-default pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-text-secondary">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>FLUIDS SETUP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-accent' : 'bg-border-strong'}`} />
            <span className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-accent' : 'bg-border-strong'}`} />
          </div>
        </div>

        {/* STEP 1: Choose Interests */}
        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary font-display">
                Pilih Topik Minat Anda
              </h2>
              <p className="text-xs text-text-secondary font-mono">
                Bantu algoritma menyajikan feed developer yang relevan untuk Anda.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {interestsList.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-sm border text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-accent-muted border-accent text-accent'
                        : 'bg-surface-raised border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-accent" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full py-2.5 rounded-sm bg-accent hover:bg-accent-hover text-canvas font-semibold text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>Lanjutkan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: Profile Picture & Bio */
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                <ShieldCheck className="w-3.5 h-3.5 text-accent" /> Langkah 2 dari 2 • Opsional
              </div>
              <h2 className="text-lg font-bold text-text-primary font-display">
                Atur Foto Profil & Bio
              </h2>
              <p className="text-xs text-text-secondary font-mono">
                Anda bisa melengkapinya sekarang atau melewatinya dulu.
              </p>
            </div>

            {/* Avatar Upload Dropzone */}
            <ImageUploadDropzone
              label="Avatar Foto Profil"
              value={avatarUrl}
              onChange={setAvatarUrl}
              placeholder="https://images.unsplash.com/photo-..."
              helpText="PNG, JPG, GIF, WebP hingga 10MB"
            />

            {/* Bio Input */}
            <div>
              <label className="block text-[11px] font-medium text-text-secondary font-mono mb-1">
                Bio / Status Developer
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="misal: Backend Engineer @ Tech. Go, Docker, PostgreSQL..."
                rows={2}
                className="w-full bg-surface-raised border border-border-default rounded-sm p-2 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong resize-none"
              />
            </div>

            {/* Actions: Skip vs Save */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 py-2 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary text-xs font-medium font-mono transition-colors cursor-pointer"
              >
                Lewati Dulu
              </button>

              <button
                type="button"
                onClick={handleSubmitProfile}
                className="flex-1 py-2 bg-accent hover:bg-accent-hover text-canvas rounded-sm text-xs font-semibold tracking-wide transition-colors cursor-pointer"
              >
                Simpan & Masuk
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
