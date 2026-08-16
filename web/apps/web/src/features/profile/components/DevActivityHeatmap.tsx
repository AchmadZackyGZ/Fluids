import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DevActivityHeatmapProps {
  username?: string;
  totalContributions?: number;
  streakDays?: number;
}

export const DevActivityHeatmap: React.FC<DevActivityHeatmapProps> = ({
  username = 'achmadzacky',
  totalContributions = 1248,
  streakDays = 42,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);

  // Generate 52 weeks (364 days) of simulated activity
  const weeks = 52;
  const daysPerWeek = 7;
  
  const generateGrid = () => {
    const grid = [];
    for (let w = 0; w < weeks; w++) {
      const week = [];
      for (let d = 0; d < daysPerWeek; d++) {
        const seed = (w * 7 + d * 13 + 5) % 100;
        let level = 0;
        if (seed > 80) level = 4;
        else if (seed > 60) level = 3;
        else if (seed > 40) level = 2;
        else if (seed > 20) level = 1;
        
        week.push({
          level,
          count: level === 0 ? 0 : level * 3 + (seed % 4),
          date: `Day ${w * 7 + d + 1}`,
        });
      }
      grid.push(week);
    }
    return grid;
  };

  const activityGrid = generateGrid();

  const getLevelBg = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-border-default';
      case 2:
        return 'bg-border-strong';
      case 3:
        return 'bg-accent/50';
      case 4:
        return 'bg-accent';
      default:
        return 'bg-surface-raised';
    }
  };

  return (
    <div className="bg-surface border border-border-default rounded-md p-4 space-y-3.5 select-none">
      
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-default pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-primary tracking-wide font-mono">
            Dev Activity Heatmap
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-sm bg-surface-raised text-text-secondary font-mono border border-border-default">
            @{username}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-text-secondary">
            <span className="text-text-primary font-semibold">{totalContributions.toLocaleString()}</span> Kontribusi di 2026
          </span>
          <span className="px-2 py-0.5 rounded-sm bg-accent-muted border border-accent/40 text-accent font-semibold">
            {streakDays} Hari Streak
          </span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto scrollbar-none pb-1">
        <div className="inline-flex gap-1">
          {activityGrid.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((cell, dIdx) => (
                <motion.div
                  key={dIdx}
                  whileHover={{ scale: 1.3 }}
                  onMouseEnter={() => setHoveredCell({ date: cell.date, count: cell.count })}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`w-3 h-3 rounded-xs transition-colors cursor-pointer ${getLevelBg(cell.level)}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info & Legend */}
      <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono pt-0.5">
        <div>
          {hoveredCell ? (
            <span className="text-text-primary font-semibold">
              {hoveredCell.count} kontribusi pada {hoveredCell.date}
            </span>
          ) : (
            <span>Aktivitas komit & koding 12 bulan terakhir</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span>Kurang</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-surface-raised" />
          <span className="w-2.5 h-2.5 rounded-xs bg-border-default" />
          <span className="w-2.5 h-2.5 rounded-xs bg-border-strong" />
          <span className="w-2.5 h-2.5 rounded-xs bg-accent/50" />
          <span className="w-2.5 h-2.5 rounded-xs bg-accent" />
          <span>Banyak</span>
        </div>
      </div>

    </div>
  );
};

export default DevActivityHeatmap;
