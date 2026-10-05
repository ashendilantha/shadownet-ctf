import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((current / (total || 1)) * 100));

  return (
    <div className="w-full bg-[#111417] border border-[#252A30] rounded-2xl p-6 sm:p-7 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 font-mono text-xs sm:text-sm">
        <span className="text-[#8B949E] font-bold tracking-wider uppercase">
          {label || 'CAMPAIGN INFILTRATION PROGRESS'}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[#22D3EE] font-black text-sm">
            {current}/{total} STAGES CONQUERED
          </span>
          <span className="text-[#FF6B00] font-black text-sm">({percentage}%)</span>
        </div>
      </div>

      <div className="w-full h-3 bg-[#090B0D] rounded-full overflow-hidden border border-[#252A30] p-0.5">
        <div
          className="h-full bg-gradient-to-r from-[#FF6B00] via-[#FF9F43] to-[#22D3EE] transition-all duration-700 rounded-full shadow-[0_0_15px_rgba(255,107,0,0.6)]"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
