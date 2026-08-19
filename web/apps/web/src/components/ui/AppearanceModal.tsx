import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Check, X, Palette, Code, Sparkles } from 'lucide-react';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedTheme, setSelectedTheme] = useState('dark_dev');
  const [selectedFont, setSelectedFont] = useState('jetbrains');

  if (!isOpen) return null;

  const themes = [
    {
      id: 'dark_dev',
      name: 'Developer Dark (Default)',
      desc: 'Palet arang hangat #0D0E10 dengan aksen amber terminal #E8A33D',
      bgHex: '#0D0E10',
      accentHex: '#E8A33D',
    },
    {
      id: 'tokyo_night',
      name: 'Tokyo Night Cyber',
      desc: 'Nuansa gelap malam #1a1b26 dengan aksen cyan & neon purple',
      bgHex: '#1a1b26',
      accentHex: '#7aa2f7',
    },
    {
      id: 'monokai',
      name: 'Monokai Pro Terminal',
      desc: 'Estetika code editor klasik #272822 dengan aksen amber-kuning',
      bgHex: '#272822',
      accentHex: '#ffd866',
    },
    {
      id: 'nord',
      name: 'Nord Deep Arctic',
      desc: 'Palet dingin Skandinavia #2e3440 dengan aksen ice blue',
      bgHex: '#2e3440',
      accentHex: '#88c0d0',
    },
  ];

  const fonts = [
    { id: 'jetbrains', name: 'JetBrains Mono', sample: 'const buffer = make([]byte, 1024)' },
    { id: 'berkeley', name: 'Berkeley Mono', sample: 'fn compute_shader_matrix() -> Mat4' },
    { id: 'fira', name: 'Fira Code', sample: 'type State = { token: string }' },
  ];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
        onClick={onClose}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-surface border border-border-default rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-surface-raised/70">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-sm bg-accent-muted border border-accent/40 text-accent">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary font-mono">
                  Ubah Tampilan & Tema Developer
                </h3>
                <span className="text-[10px] text-text-secondary font-mono">
                  Kustomisasi skema warna editor dan tipografi signature FLUIDS
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-text-primary rounded-sm hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5 overflow-y-auto scrollbar-none">
            
            {/* Theme Palettes */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-semibold text-text-secondary block uppercase tracking-wider">
                Skema Warna Editor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {themes.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-3 rounded-md border cursor-pointer transition-all space-y-2 ${
                        isSelected
                          ? 'bg-surface-raised border-accent shadow-sm ring-1 ring-accent/30'
                          : 'bg-surface hover:bg-surface-raised border-border-default hover:border-border-strong'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-border-default"
                            style={{ backgroundColor: theme.accentHex }}
                          />
                          <span className="text-xs font-bold font-mono text-text-primary">
                            {theme.name}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-accent stroke-[3]" />}
                      </div>
                      <p className="text-[10px] text-text-secondary font-mono leading-tight">
                        {theme.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Typography Selection */}
            <div className="space-y-2 pt-2 border-t border-border-default">
              <label className="text-[11px] font-mono font-semibold text-text-secondary block uppercase tracking-wider">
                Tipografi Kode Signature
              </label>
              <div className="space-y-2">
                {fonts.map((f) => {
                  const isSelected = selectedFont === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFont(f.id)}
                      className={`p-3 rounded-md border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-surface-raised border-accent'
                          : 'bg-surface hover:bg-surface-raised border-border-default hover:border-border-strong'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-mono font-semibold text-text-primary block">
                          {f.name}
                        </span>
                        <code className="text-[11px] font-mono text-accent">
                          {f.sample}
                        </code>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-accent stroke-[3]" />}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border-default bg-surface-raised/50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary font-mono text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-sm bg-accent hover:bg-accent-hover text-canvas font-mono text-xs font-bold transition-colors cursor-pointer"
            >
              Terapkan Tema
            </button>
          </div>

        </div>
      </div>
    </AnimatePresence>
  );
};

export default AppearanceModal;
