import React, { useState } from 'react';
import { X, Code, Link, Terminal, Sparkles } from 'lucide-react';
import { ImageUploadDropzone } from '../../../components/ui/ImageUploadDropzone';
import { Category3DCarouselModal, CATEGORIES_DATA } from '../../../components/ui/Category3DCarouselModal';

export type PostType = 'curhat' | 'showcase' | 'bug' | 'regular' | string;

export interface NewPostData {
  type: PostType;
  caption: string;
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
  repoUrl?: string;
  mediaUrl?: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitPost: (data: NewPostData) => void;
  user: {
    fullName?: string;
    username?: string;
    avatarUrl?: string;
  };
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmitPost,
  user,
}) => {
  const [postType, setPostType] = useState<PostType>('curhat');
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [includeCode, setIncludeCode] = useState(true);
  const [codeFilename, setCodeFilename] = useState('main.go');
  const [codeLanguage, setCodeLanguage] = useState('Go');
  const [codeContent, setCodeContent] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && !codeContent.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitPost({
        type: postType,
        caption,
        codeSnippet: includeCode && codeContent.trim() ? {
          filename: codeFilename || 'snippet.txt',
          language: codeLanguage,
          code: codeContent,
        } : undefined,
        repoUrl: repoUrl.trim() || undefined,
        mediaUrl: mediaUrl.trim() || undefined,
      });
      setIsSubmitting(false);
      onClose();
      // Reset form
      setCaption('');
      setCodeContent('');
      setRepoUrl('');
      setMediaUrl('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-raised border border-border-default rounded-lg w-full max-w-xl shadow-2xl overflow-hidden animate-float">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-text-primary">Buat Postingan Developer</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-sm text-text-secondary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Post Type Selector Tabs */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-medium text-text-secondary block">
                Tipe Postingan
              </label>
              <button
                type="button"
                onClick={() => setIs3DModalOpen(true)}
                className="text-[11px] font-mono text-accent hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                title="Buka 3D Ring untuk memilih seluruh kategori postingan"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D Ring Kategori</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPostType('curhat')}
                className={`py-2 rounded-sm text-xs font-mono font-medium transition-colors cursor-pointer text-center ${
                  postType === 'curhat'
                    ? 'bg-accent-muted border border-accent/40 text-accent font-semibold'
                    : 'bg-surface border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
                }`}
              >
                Dev Curhat
              </button>

              <button
                type="button"
                onClick={() => setPostType('showcase')}
                className={`py-2 rounded-sm text-xs font-mono font-medium transition-colors cursor-pointer text-center ${
                  postType === 'showcase'
                    ? 'bg-accent-muted border border-accent/40 text-accent font-semibold'
                    : 'bg-surface border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
                }`}
              >
                Project Showcase
              </button>

              <button
                type="button"
                onClick={() => setPostType('bug')}
                className={`py-2 rounded-sm text-xs font-mono font-medium transition-colors cursor-pointer text-center ${
                  postType === 'bug'
                    ? 'bg-accent-muted border border-accent/40 text-accent font-semibold'
                    : 'bg-surface border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
                }`}
              >
                Bug Hunting
              </button>

              <button
                type="button"
                onClick={() => setPostType('regular')}
                className={`py-2 rounded-sm text-xs font-mono font-medium transition-colors cursor-pointer text-center ${
                  postType === 'regular'
                    ? 'bg-accent-muted border border-accent/40 text-accent font-semibold'
                    : 'bg-surface border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
                }`}
              >
                Post Biasa
              </button>
            </div>

            {/* Custom 3D Ring Selected Category Tag */}
            {!['curhat', 'showcase', 'bug', 'regular'].includes(postType) && (
              <div className="pt-1 flex items-center gap-2">
                <span className="text-[10px] font-mono text-text-muted">Kategori Terpilih (3D Ring):</span>
                <span className="px-2.5 py-0.5 rounded-sm bg-accent-muted border border-accent/40 text-accent font-mono text-xs font-semibold flex items-center gap-1.5">
                  <span>{CATEGORIES_DATA.find((c) => c.id === postType)?.name || postType}</span>
                  <span className="text-[9px] text-accent">●</span>
                </span>
              </div>
            )}
          </div>

          {/* User Preview & Caption Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <img
                src={user.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                alt={user.fullName || "User"}
                className="w-8 h-8 rounded-full object-cover border border-border-default aspect-square"
              />
              <div>
                <span className="text-xs font-semibold text-text-primary block leading-tight">
                  @{user.username || 'developer'}
                </span>
                <span className="text-[10px] text-text-secondary font-mono">
                  {postType === 'curhat' ? 'Status: Curhat Koding' : postType === 'showcase' ? 'Status: Pamer Karya' : postType === 'bug' ? 'Status: Investigasi Bug' : 'Status: Publik'}
                </span>
              </div>
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder={
                postType === 'curhat'
                  ? 'Ceritakan kendala koding, duka debugging jam 2 pagi, atau cerita seputar pekerjaan...'
                  : postType === 'showcase'
                  ? 'Jelaskan proyek yang baru saja Anda buat, stack teknologi yang digunakan, serta fitur utamanya...'
                  : postType === 'bug'
                  ? 'Bagikan analisis error, stack trace, atau solusi fix yang Anda temukan...'
                  : 'Tulis sesuatu untuk komunitas developer...'
              }
              className="w-full bg-surface border border-border-default focus:border-border-strong rounded-sm p-3 text-xs text-text-primary placeholder:text-text-muted outline-none transition-colors resize-none"
            />
          </div>

          {/* Code Snippet Attachment Box */}
          <div className="space-y-2 border-t border-border-default pt-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-medium text-text-secondary flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-accent" />
                <span>Lampirkan Cuplikan Kode (Opsional)</span>
              </label>
              <button
                type="button"
                onClick={() => setIncludeCode(!includeCode)}
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded-sm transition-colors cursor-pointer ${
                  includeCode ? 'text-accent bg-accent-muted' : 'text-text-muted hover:text-text-secondary bg-surface'
                }`}
              >
                {includeCode ? 'Aktif' : 'Nonaktif'}
              </button>
            </div>

            {includeCode && (
              <div className="bg-canvas border border-border-default rounded-sm overflow-hidden space-y-2 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-text-muted block mb-1">Nama Berkas</label>
                    <input
                      type="text"
                      value={codeFilename}
                      onChange={(e) => setCodeFilename(e.target.value)}
                      placeholder="e.g. server.go"
                      className="w-full bg-surface border border-border-default rounded-sm px-2.5 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-text-muted block mb-1">Bahasa</label>
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="w-full bg-surface border border-border-default rounded-sm px-2.5 py-1.5 text-xs font-mono text-text-primary outline-none cursor-pointer"
                    >
                      <option value="Go">Go</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="Python">Python</option>
                      <option value="Rust">Rust</option>
                      <option value="SQL">SQL</option>
                      <option value="HTML/CSS">HTML/CSS</option>
                      <option value="Shell">Bash/Shell</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-text-muted block mb-1">Kode Sumber</label>
                  <textarea
                    value={codeContent}
                    onChange={(e) => setCodeContent(e.target.value)}
                    rows={4}
                    placeholder={`// Tempel potongan kode ${codeLanguage} di sini...`}
                    className="w-full bg-surface border border-border-default focus:border-border-strong rounded-sm p-2.5 text-[11px] font-mono text-text-primary placeholder:text-text-muted outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Optional Links & Media Inputs */}
          <div className="space-y-3 border-t border-border-default pt-3">
            <div>
              <label className="text-[11px] font-mono text-text-secondary flex items-center gap-1.5 mb-1">
                <Link className="w-3 h-3 text-text-secondary" />
                <span>Link GitHub Repo / Demo (Opsional)</span>
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-surface border border-border-default rounded-sm px-3 py-1.5 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
              />
            </div>

            {/* Media Upload Dropzone */}
            <ImageUploadDropzone
              label="Lampirkan Gambar / Mockup (Opsional)"
              value={mediaUrl}
              onChange={setMediaUrl}
              placeholder="https://images.unsplash.com/..."
              helpText="PNG, JPG, GIF, WebP hingga 10MB"
            />
          </div>

          {/* Modal Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-default">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-sm bg-surface border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary text-xs font-medium transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!caption.trim() && !codeContent.trim())}
              className="px-4 py-2 rounded-sm bg-accent hover:bg-accent-hover text-canvas text-xs font-semibold tracking-wide transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Menerbitkan...' : 'Bagikan Postingan'}
            </button>
          </div>

        </form>

      </div>

      {/* 3D Cylindrical Ring Category Modal */}
      <Category3DCarouselModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        selectedCategoryId={postType}
        onSelectCategory={(cat) => {
          setPostType(cat.id as PostType);
        }}
      />
    </div>
  );
};

export default CreatePostModal;
