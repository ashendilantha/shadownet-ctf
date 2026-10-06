import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((current / (total || 1)) * 100));

  return (
    <div className="w-full cyber-panel p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5 font-mono text-xs">
        <span className="text-[#8B949E] font-bold tracking-wider uppercase">
          {label || 'Campaign progress'}
        </span>
        <div className="flex items-center gap-2.5">
          <span className="text-[#22D3EE] font-bold text-xs">
            {current} / {total} stages
          </span>
          <span className="text-[#FF6B00] font-bold text-xs">({percentage}%)</span>
        </div>
      </div>

      <div className="w-full h-2.5 bg-[#090B0D] rounded-full overflow-hidden border border-[#252A30] p-0.5">
        <div
          className="h-full bg-gradient-to-r from-[#FF6B00] via-[#FF9F43] to-[#22D3EE] transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(255,107,0,0.4)]"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
