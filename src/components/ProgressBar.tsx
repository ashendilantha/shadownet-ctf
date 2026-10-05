import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export default function ProgressBar({ current, total, label }: ProgressBarProps) {
  const percentage = Math.min(100, Math.round((current / (total || 1)) * 100));

  return (
    <div className="w-full bg-[#111417] border border-[#252A30] rounded-lg p-4">
      <div className="flex items-center justify-between mb-2 font-mono text-xs">
        <span className="text-[#8B949E]">{label || 'CAMPAIGN PROGRESS'}</span>
        <div className="flex items-center gap-2">
          <span className="text-[#22D3EE] font-bold">
            {current}/{total} STAGES
          </span>
          <span className="text-[#FF6B00] font-bold">({percentage}%)</span>
        </div>
      </div>

      <div className="w-full h-2.5 bg-[#171B20] rounded-full overflow-hidden border border-[#252A30]">
        <div
          className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9F43] transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(255,107,0,0.5)]"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
