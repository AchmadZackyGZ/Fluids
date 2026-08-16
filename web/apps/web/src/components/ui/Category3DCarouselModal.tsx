import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Check, Sparkles, Terminal,
  MessageSquare, Rocket, Bug, Network, Code, Monitor, Briefcase, Flame
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  badge: string;
  icon: React.ReactNode;
  img: string;
  postsCount: string;
  description: string;
  popularTags: string[];
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'all',
    name: 'Semua Feed',
    badge: 'Global Timeline',
    icon: <Terminal className="w-4 h-4 text-accent" />,
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600&auto=format&fit=crop',
    postsCount: '58.4k post',
    description: 'Aliran linimasa global menampilkan seluruh diskusi, showcase karya, arsitektur kode, dan percakapan developer lintas bahasa dan stack.',
    popularTags: ['#global', '#engineering', '#webdev', '#opensource'],
  },
  {
    id: 'curhat',
    name: 'Dev Curhat',
    badge: 'Cerita & Duka',
    icon: <MessageSquare className="w-4 h-4 text-accent" />,
    img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
    postsCount: '18.2k post',
    description: 'Ruang berbagi keluh kesah, pengalaman debugging jam 2 pagi, lelah sprint meeting, burnout, hingga cerita nyata di balik layar industri tech.',
    popularTags: ['#curhatkoding', '#debugging', '#burnout', '#production'],
  },
  {
    id: 'showcase',
    name: 'Project Showcase',
    badge: 'Karya & Rilis',
    icon: <Rocket className="w-4 h-4 text-accent" />,
    img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop',
    postsCount: '14.5k post',
    description: 'Pamerkan repo GitHub open-source, launch SaaS baru, utility library, arsitektur frontend/backend, dan demo UI terbaik yang kamu bangun.',
    popularTags: ['#showcase', '#opensource', '#saas', '#buildinpublic'],
  },
  {
    id: 'bug',
    name: 'Bug Hunting',
    badge: 'Troubleshoot',
    icon: <Bug className="w-4 h-4 text-accent" />,
    img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop',
    postsCount: '9.8k post',
    description: 'Pusat tanya jawab dan investigasi bug rumit, memory leaks, race conditions, deadlock database, dan kendala deployment server.',
    popularTags: ['#bughunting', '#error', '#memoryleak', '#helpdev'],
  },
  {
    id: 'arch',
    name: 'System Design & RFC',
    badge: 'Arsitektur',
    icon: <Network className="w-4 h-4 text-accent" />,
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop',
    postsCount: '6.2k post',
    description: 'Diskusi arsitektur berskala besar: microservices, distributed caching Redis, skema relasional PostgreSQL, event streaming Kafka, dan Kubernetes.',
    popularTags: ['#systemdesign', '#architecture', '#microservices', '#database'],
  },
  {
    id: 'snippets',
    name: 'Quick Tips & Snippets',
    badge: 'Snippet Kode',
    icon: <Code className="w-4 h-4 text-accent" />,
    img: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    postsCount: '8.1k post',
    description: 'Potongan kode satu baris (one-liner), trik bash sakti, regex praktis, dan shortcut productivity ngoding sehari-hari di Go, Rust, dan TypeScript.',
    popularTags: ['#snippets', '#tips', '#golang', '#typescript', '#rust'],
  },
  {
    id: 'battlestation',
    name: 'Setup & Battlestation',
    badge: 'Workspace',
    icon: <Monitor className="w-4 h-4 text-accent" />,
    img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop',
    postsCount: '4.7k post',
    description: 'Bagikan setup meja kerja impian, mechanical keyboard, tema Neovim/VSCode, monitor vertikal, audio gear, dan dotfiles favoritmu.',
    popularTags: ['#battlestation', '#desksetup', '#mechanicalkeyboard', '#dotfiles'],
  },
  {
    id: 'career',
    name: 'Karier & Remote Work',
    badge: 'Industri Tech',
    icon: <Briefcase className="w-4 h-4 text-accent" />,
    img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=600&auto=format&fit=crop',
    postsCount: '7.3k post',
    description: 'Diskusi transparan seputar negosiasi gaji developer, tips interview teknikal, kultur kerja remote global, dan jenjang karier engineering.',
    popularTags: ['#career', '#remotework', '#salary', '#interview'],
  },
];

interface Category3DCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategoryId: string;
  onSelectCategory: (category: CategoryItem) => void;
}

export const Category3DCarouselModal: React.FC<Category3DCarouselModalProps> = ({
  isOpen,
  onClose,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const categories = CATEGORIES_DATA;
  const numItems = categories.length;
  const anglePerItem = 360 / numItems;
  const radius = 240; // 3D ring radius in px

  // Find initial index
  const initialIndex = Math.max(0, categories.findIndex((c) => c.id === selectedCategoryId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  
  // Motion value for smooth rotation animation
  const rotationMotion = useMotionValue(-initialIndex * anglePerItem);
  const smoothRotation = useSpring(rotationMotion, { mass: 0.15, stiffness: 140, damping: 18 });
  const [currentRotationVal, setCurrentRotationVal] = useState(-initialIndex * anglePerItem);

  useEffect(() => {
    const unsubscribe = smoothRotation.on('change', (v) => {
      setCurrentRotationVal(v);
    });
    return () => unsubscribe();
  }, [smoothRotation]);

  // Sync when activeIndex changes
  useEffect(() => {
    rotationMotion.set(-activeIndex * anglePerItem);
  }, [activeIndex, anglePerItem, rotationMotion]);

  // Keyboard navigation listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter') {
        handleConfirmSelect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : numItems - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < numItems - 1 ? prev + 1 : 0));
  };

  const handleSelectCard = (index: number) => {
    if (index === activeIndex) {
      handleConfirmSelect();
    } else {
      setActiveIndex(index);
    }
  };

  const handleConfirmSelect = () => {
    const selected = categories[activeIndex];
    onSelectCategory(selected);
    onClose();
  };

  // Drag interaction handlers
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startRotationRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startRotationRef.current = rotationMotion.get();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    rotationMotion.set(startRotationRef.current + deltaX * 0.4);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const currentAngle = rotationMotion.get();
    // Snap to nearest item
    let nearestIndex = Math.round(-currentAngle / anglePerItem);
    nearestIndex = ((nearestIndex % numItems) + numItems) % numItems;
    setActiveIndex(nearestIndex);
  };

  if (!isOpen) return null;

  const currentCategory = categories[activeIndex];

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
        onClick={onClose}
      >
        {/* Modal Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-surface border border-border-default rounded-lg overflow-hidden shadow-2xl flex flex-col space-y-4"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-default bg-surface-raised/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-sm bg-accent-muted border border-accent/40 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary font-mono tracking-wide">
                  Jelajahi & Pilih Kategori 3D Ring
                </h3>
                <span className="text-[10px] text-text-secondary font-mono">
                  Putar ring atau gunakan tombol panah untuk memilih kategori
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-secondary hover:text-text-primary rounded-sm hover:bg-surface transition-colors cursor-pointer"
              title="Tutup (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* =============================================================== */}
          {/* 3D CYLINDRICAL RING CAROUSEL CONTAINER                          */}
          {/* =============================================================== */}
          <div 
            className="relative h-64 w-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ perspective: 1000 }}
          >
            {/* 3D Rotator Stage */}
            <div
              className="relative w-44 h-52 transition-transform duration-75 ease-out"
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateY(${currentRotationVal}deg)`,
              }}
            >
              {categories.map((cat, i) => {
                const itemAngle = i * anglePerItem;
                const isCenter = i === activeIndex;

                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCard(i)}
                    className={`absolute inset-0 rounded-md overflow-hidden border cursor-pointer transition-all duration-300 ${
                      isCenter
                        ? 'border-accent shadow-[0_0_25px_rgba(232,163,61,0.25)] scale-105 z-30'
                        : 'border-border-default opacity-50 hover:opacity-85 z-10'
                    }`}
                    style={{
                      transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Background Image */}
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-between p-3">
                      {/* Top Badge */}
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-0.5 rounded-sm bg-surface-raised/90 backdrop-blur-sm border border-border-default text-[9px] font-mono text-text-secondary">
                          {cat.badge}
                        </span>
                        {isCenter && (
                          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                        )}
                      </div>

                      {/* Bottom Title & Stats */}
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-white font-mono text-xs font-bold truncate">
                          {cat.icon}
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-text-secondary font-mono block">
                          {cat.postsCount}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ambient Shadow Depth Floor */}
            <div className="absolute -bottom-6 w-80 h-10 bg-black/60 rounded-full blur-xl pointer-events-none" />
          </div>

          {/* =============================================================== */}
          {/* CENTER CATEGORY TITLE & CAROUSEL NAVIGATION CONTROLS             */}
          {/* =============================================================== */}
          <div className="flex items-center justify-between px-6 pt-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1"
              title="Kategori Sebelumnya (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Centered Active Category Title */}
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-bold text-text-primary font-mono flex items-center gap-1.5">
                  {currentCategory.icon}
                  <span>{currentCategory.name}</span>
                </span>
                <span className="px-2 py-0.5 rounded-sm bg-accent-muted border border-accent/40 text-[10px] font-mono text-accent font-semibold">
                  {currentCategory.badge}
                </span>
              </div>
              <span className="text-[11px] text-text-secondary font-mono block">
                {currentCategory.postsCount} • {activeIndex + 1} dari {numItems}
              </span>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1"
              title="Kategori Selanjutnya (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* =============================================================== */}
          {/* DETAILED DESCRIPTION BOX (KETERANGAN SESUAI SKETSA USER)        */}
          {/* =============================================================== */}
          <div className="px-6 pb-6 space-y-3">
            <div className="bg-surface-raised border border-border-default rounded-md p-4 space-y-2.5">
              <span className="text-[11px] font-mono font-semibold text-text-secondary block uppercase tracking-wider">
                Keterangan Kategori:
              </span>
              <p className="text-xs text-text-primary leading-relaxed">
                {currentCategory.description}
              </p>

              {/* Popular Hashtags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-mono text-text-muted">Topik Terkait:</span>
                {currentCategory.popularTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-sm bg-surface border border-border-default text-text-secondary font-mono text-[10px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Action CTA Confirmation Button */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-sm bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary text-xs font-mono font-medium transition-colors cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmSelect}
                className="flex-1 py-2.5 rounded-sm bg-accent hover:bg-accent-hover text-canvas text-xs font-mono font-bold tracking-wide transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Pilih Kategori "{currentCategory.name}"</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </AnimatePresence>
  );
};

export default Category3DCarouselModal;
