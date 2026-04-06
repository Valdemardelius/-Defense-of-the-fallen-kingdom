import React from 'react';

interface TooltipProps {
  x: number;
  y: number;
  title: string;
  stats: { label: string; value: string | number }[];
  visible: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ x, y, title, stats, visible }) => {
  if (!visible) return null;
  
  return (
    <div
      className="fixed z-50 bg-black/90 backdrop-blur-md rounded-lg px-3 py-2 border border-yellow-500/50 pointer-events-none"
      style={{
        left: x + 15,
        top: y - 10,
        transform: 'translate(0, -100%)',
        minWidth: '180px'
      }}
    >
      <div className="text-yellow-400 text-xs font-bold mb-1 border-b border-yellow-500/30 pb-1">
        {title}
      </div>
      <div className="space-y-0.5">
        {stats.map((stat, i) => (
          <div key={i} className="text-white text-xs flex justify-between gap-3">
            <span className="text-gray-400">{stat.label}:</span>
            <span className="font-mono">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};