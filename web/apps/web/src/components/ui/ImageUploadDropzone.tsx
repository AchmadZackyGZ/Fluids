import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, Link, Check, FolderOpen, Maximize2, ZoomIn, Download, ExternalLink } from 'lucide-react';

interface ImageUploadDropzoneProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  helpText?: string;
  maxSizeMB?: number;
  className?: string;
}

export const ImageUploadDropzone: React.FC<ImageUploadDropzoneProps> = ({
  value,
  onChange,
  label,
  placeholder = 'https://images.unsplash.com/...',
  helpText = 'PNG, JPG, GIF, atau WebP hingga 10MB',
  maxSizeMB = 10,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [useUrlMode, setUseUrlMode] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPreviewModalOpen) {
        setIsPreviewModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreviewModalOpen]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar (PNG, JPG, GIF, WebP) yang didukung.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Ukuran file melebihi batas maksimal ${maxSizeMB}MB.`);
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange('');
    setFileName(null);
    setFileSize(null);
    setIsPreviewModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-medium text-text-secondary font-mono">
            {label}
          </label>
          <button
            type="button"
            onClick={() => setUseUrlMode(!useUrlMode)}
            className="text-[10px] text-text-secondary hover:text-accent font-mono transition-colors cursor-pointer flex items-center gap-1"
          >
            <Link className="w-3 h-3" />
            <span>{useUrlMode ? 'Upload File' : 'Input URL'}</span>
          </button>
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* URL Input Mode */}
      {useUrlMode ? (
        <div className="relative">
          <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="url"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setFileName(null);
              setFileSize(null);
            }}
            placeholder={placeholder}
            className="w-full bg-surface-raised border border-border-default rounded-sm py-1.5 pl-8 pr-3 text-xs font-mono text-text-primary placeholder:text-text-muted outline-none focus:border-border-strong"
          />
        </div>
      ) : value ? (
        /* Image Preview Box */
        <div className="relative bg-surface-raised border border-border-default rounded-md p-3 flex items-center gap-3 shadow-sm hover:border-border-strong transition-colors">
          
          {/* Clickable Thumbnail with Zoom Overlay */}
          <div
            onClick={() => setIsPreviewModalOpen(true)}
            className="relative w-14 h-14 rounded-sm overflow-hidden bg-canvas border border-border-default shrink-0 flex items-center justify-center cursor-pointer group/thumb"
            title="Klik untuk melihat preview ukuran penuh"
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

          {/* Metadata info */}
          <div 
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex-1 min-w-0 space-y-0.5 cursor-pointer group/info"
            title="Klik untuk melihat preview ukuran penuh"
          >
            <p className="text-xs font-semibold text-text-primary font-mono truncate group-hover/info:text-accent transition-colors flex items-center gap-1.5">
              <span>{fileName || 'Foto terpilih'}</span>
              <ZoomIn className="w-3 h-3 text-text-secondary opacity-0 group-hover/info:opacity-100 transition-opacity" />
            </p>
            <p className="text-[10px] text-text-secondary font-mono">
              {fileSize ? fileSize : 'Gambar siap dibagikan • Klik untuk memperbesar'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-[10px] font-mono font-medium rounded-sm bg-surface hover:bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-text-secondary hover:text-diff-remove rounded-sm hover:bg-surface transition-colors cursor-pointer"
              title="Hapus foto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* 21st.dev Style Drag and Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative rounded-md border border-dashed transition-all p-5 flex flex-col items-center justify-center text-center cursor-pointer select-none ${
            isDragging
              ? 'border-accent bg-accent-muted/20 scale-[0.99]'
              : 'border-border-default hover:border-border-strong bg-surface-raised/40 hover:bg-surface-raised/70'
          }`}
        >
          {/* Inner Rounded Squircle Box */}
          <div className="w-11 h-11 rounded-lg bg-surface border border-border-default flex items-center justify-center mb-2.5 shadow-inner group-hover:border-accent/40 transition-colors">
            <UploadCloud className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
          </div>

          {/* Text Microcopy */}
          <div className="space-y-0.5 mb-2.5">
            <p className="text-xs font-semibold text-text-primary font-mono group-hover:text-accent transition-colors">
              Klik untuk upload atau drop files
            </p>
            <p className="text-[10px] text-text-muted font-mono">
              {helpText}
            </p>
          </div>

          {/* Browse Files Pill Button */}
          <button
            type="button"
            className="px-3 py-1 text-[10px] font-mono font-semibold rounded-sm bg-surface-raised border border-border-default group-hover:border-border-strong text-text-secondary group-hover:text-text-primary flex items-center gap-1.5 transition-colors pointer-events-none"
          >
            <FolderOpen className="w-3 h-3 text-text-muted group-hover:text-accent transition-colors" />
            <span>Pilih File</span>
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* FULLSCREEN / ENLARGED IMAGE LIGHTBOX MODAL                         */}
      {/* ================================================================= */}
      {isPreviewModalOpen && value && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in"
          onClick={() => setIsPreviewModalOpen(false)}
        >
          {/* Modal Container */}
          <div 
            className="relative max-w-4xl max-h-[92vh] w-full flex flex-col bg-surface border border-border-strong rounded-lg overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-default bg-surface-raised/80">
              <div className="flex items-center gap-2 min-w-0">
                <ImageIcon className="w-4 h-4 text-accent shrink-0" />
                <span className="text-xs font-mono font-semibold text-text-primary truncate">
                  {fileName || 'Preview Gambar'}
                </span>
                {fileSize && (
                  <span className="text-[10px] font-mono text-text-secondary px-1.5 py-0.5 rounded-sm bg-surface border border-border-default">
                    {fileSize}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsPreviewModalOpen(false);
                  }}
                  className="px-2.5 py-1 text-[11px] font-mono rounded-sm bg-surface hover:bg-surface-raised border border-border-default text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                >
                  Ganti Foto
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-1 text-text-secondary hover:text-text-primary rounded-sm hover:bg-surface transition-colors cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main High-Res Image Display */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-canvas/60 min-h-[300px] max-h-[75vh]">
              <img
                src={value}
                alt={fileName || 'Enlarged Preview'}
                className="max-w-full max-h-[70vh] object-contain rounded-sm border border-border-default shadow-lg"
              />
            </div>

            {/* Lightbox Footer Bar */}
            <div className="px-4 py-2 border-t border-border-default bg-surface-raised flex items-center justify-between text-[11px] font-mono text-text-secondary">
              <span>Tekan <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border-default text-text-primary text-[10px]">Esc</kbd> atau klik di luar untuk menutup</span>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-accent hover:underline font-semibold"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadDropzone;
