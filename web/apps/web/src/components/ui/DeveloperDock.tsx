import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  LayoutDashboard, Network, MessageSquare, Compass, Film, 
  User, Plus, Settings, Sparkles 
} from 'lucide-react';

export interface DeveloperDockItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  active?: boolean;
  hasBadge?: boolean;
  badgeCount?: number;
  followerCount?: number;
  customBadge?: React.ReactNode;
  isPrimaryAction?: boolean;
  onClick: () => void;
}

interface DeveloperDockProps {
  items: DeveloperDockItem[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

function DockButton({ 
  item, 
  mouseCoordinate,
  orientation 
}: { 
  item: DeveloperDockItem; 
  mouseCoordinate: any;
  orientation: 'vertical' | 'horizontal';
}) {
  const ref = useRef<HTMLDivElement>(null);
  
  const distance = useTransform(mouseCoordinate, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, y: 0, width: 0, height: 0 };
    if (orientation === 'vertical') {
      return val - bounds.y - bounds.height / 2;
    }
    return val - bounds.x - bounds.width / 2;
  });

  const sizeSync = useTransform(distance, [-120, 0, 120], [42, 60, 42]);
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 180, damping: 14 });

  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  return (
    <motion.div
      ref={ref}
      style={orientation === 'vertical' ? { height: size, width: '100%' } : { width: size, height: size }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsClicked(true)}
      onMouseUp={() => setIsClicked(false)}
      onClick={item.onClick}
      className="relative flex items-center justify-center cursor-pointer group select-none"
      whileTap={{ scale: 0.94 }}
    >
      <motion.div
        className={`w-full h-full rounded-md flex items-center justify-center relative transition-colors shadow-md ${
          item.isPrimaryAction
            ? 'bg-surface-raised border border-accent text-accent hover:bg-accent hover:text-canvas'
            : item.active
              ? 'bg-surface-raised border border-border-strong text-accent'
              : 'bg-surface hover:bg-surface-raised border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary'
        }`}
        animate={{
          scale: isClicked ? 0.95 : isHovered ? 1.05 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 17,
        }}
      >
        <div className="w-5 h-5 flex items-center justify-center">
          {item.icon}
        </div>

        {/* 1. New Follower Badge with Person Icon & Count */}
        {item.followerCount && item.followerCount > 0 ? (
          <span className="absolute -top-1.5 -right-2 px-1 min-w-[20px] h-[17px] rounded-full bg-accent text-canvas font-mono text-[9px] font-bold flex items-center justify-center gap-0.5 border border-canvas shadow-lg z-20">
            <User className="w-2.5 h-2.5 stroke-[2.5]" />
            <span>{item.followerCount}</span>
          </span>
        ) : item.customBadge ? (
          item.customBadge
        ) : item.badgeCount && item.badgeCount > 0 ? (
          <span className="absolute -top-1.5 -right-1.5 px-1 min-w-[17px] h-[17px] rounded-full bg-diff-remove text-white font-mono text-[9px] font-bold flex items-center justify-center border border-canvas shadow-lg z-20">
            {item.badgeCount > 9 ? '9+' : item.badgeCount}
          </span>
        ) : item.hasBadge ? (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-diff-remove border border-canvas animate-pulse" />
        ) : null}
      </motion.div>

      {/* Developer Tooltip Tag */}
      <motion.div
        initial={{ opacity: 0, x: orientation === 'vertical' ? 10 : 0, y: orientation === 'vertical' ? 0 : 10, scale: 0.85 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          x: isHovered ? (orientation === 'vertical' ? 14 : 0) : (orientation === 'vertical' ? 5 : 0),
          y: isHovered ? (orientation === 'vertical' ? 0 : -16) : (orientation === 'vertical' ? 0 : 10),
          scale: isHovered ? 1 : 0.85,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={`absolute z-50 px-2.5 py-1 rounded-sm bg-surface-raised border border-border-strong text-text-primary text-[11px] font-mono whitespace-nowrap pointer-events-none shadow-2xl backdrop-blur-sm ${
          orientation === 'vertical' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : '-top-10 left-1/2 -translate-x-1/2'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span>{item.name}</span>
          {item.active && <span className="text-accent text-[9px]">●</span>}
        </span>
      </motion.div>

      {/* Active Indicator Dot on Sidebar Edge */}
      {item.active && (
        <motion.div
          className={`absolute rounded-full bg-accent ${
            orientation === 'vertical' ? '-left-2 top-1/2 -translate-y-1/2 w-1 h-3' : '-bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1'
          }`}
          layoutId="activeDockIndicator"
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
        />
      )}
    </motion.div>
  );
}

export const DeveloperDock: React.FC<DeveloperDockProps> = ({
  items,
  orientation = 'vertical',
  className = '',
}) => {
  const mouseCoord = useMotionValue(Infinity);

  return (
    <div
      onMouseMove={(e) => mouseCoord.set(orientation === 'vertical' ? e.pageY : e.pageX)}
      onMouseLeave={() => mouseCoord.set(Infinity)}
      className={`${
        orientation === 'vertical'
          ? 'flex flex-col items-center gap-2.5 w-14 py-4 px-2 rounded-lg bg-surface border border-border-default shadow-xl'
          : 'flex items-center gap-3 h-16 px-4 rounded-xl bg-surface border border-border-default shadow-2xl'
      } ${className}`}
    >
      {items.map((item) => (
        <DockButton
          key={item.id}
          item={item}
          mouseCoordinate={mouseCoord}
          orientation={orientation}
        />
      ))}
    </div>
  );
};

export default DeveloperDock;
