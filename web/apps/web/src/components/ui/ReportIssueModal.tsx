import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Send, Bug, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';
import { ImageUploadDropzone } from './ImageUploadDropzone';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [issueType, setIssueType] = useState<'ui' | 'api' | 'security' | 'other'>('ui');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2000);
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
        onClick={onClose}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-surface border border-border-default rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default bg-surface-raised/70">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-sm bg-diff-remove/15 border border-diff-remove/30 text-diff-remove">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary font-mono">
                  Laporkan Masalah / Bug
                </h3>
                <span className="text-[10px] text-text-secondary font-mono">
                  Bantu tim FLUIDS memperbaiki bug & performa sistem
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

          {isSubmitted ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-diff-add/15 border border-diff-add/40 text-diff-add flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-text-primary font-mono">
                Laporan Berhasil Terkirim!
              </h4>
              <p className="text-xs text-text-secondary font-mono">
                Terima kasih atas kontribusi Anda. Tiket issue telah dicatat di repo sistem.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto scrollbar-none">
              
              {/* Category Pills */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-medium text-text-secondary block">
                  Kategori Masalah
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setIssueType('ui')}
                    className={`py-2 rounded-sm text-xs font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      issueType === 'ui'
                        ? 'bg-accent-muted border border-accent/40 text-accent font-semibold'
                        : 'bg-surface-raised border border-border-default text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Bug className="w-3.5 h-3.5" />
                    <span>UI / Glitch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIssueType('api')}
                    className={`py-2 rounded-sm text-xs font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      issueType === 'api'
                        ? 'bg-accent-muted border border-accent/40 text-accent font-semibold'
                        : 'bg-surface-raised border border-border-default text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>API / Backend</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIssueType('security')}
                    className={`py-2 rounded-sm text-xs font-mono transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      issueType === 'security'
                        ? 'bg-accent-muted border border-accent/40 text-accent font-semibold'
                        : 'bg-surface-raised border border-border-default text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Keamanan</span>
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-medium text-text-secondary block">
                  Judul Ringkasan Kendala
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Gagal upload file gambar di Create Post..."
                  className="w-full bg-surface-raised border border-border-default rounded-sm px-3 py-2 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-accent"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-medium text-text-secondary block">
                  Detail & Langkah Reproduksi Bug
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan kronologi kendala, pesan error console, atau perilaku yang diharapkan..."
                  className="w-full bg-surface-raised border border-border-default rounded-sm p-3 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-accent resize-none"
                />
              </div>

              {/* Image Upload Dropzone */}
              <div className="space-y-1.5">
                <ImageUploadDropzone
                  label="Tangkapan Layar Error (Opsional)"
                  value={mediaUrl}
                  onChange={setMediaUrl}
                  placeholder="https://..."
                  helpText="PNG, JPG, screenshot error log"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary text-xs font-mono transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim()}
                  className="px-4 py-2 rounded-sm bg-diff-remove hover:bg-diff-remove/90 text-white font-mono text-xs font-bold tracking-wide transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}</span>
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </AnimatePresence>
  );
};

export default ReportIssueModal;
