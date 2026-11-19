import React from 'react';

export default function Footer() {
  return (
    <footer className="glass-footer relative z-10 w-full mt-auto py-4 text-xs font-mono text-[#8B949E]">
      <div className="w-full app-container flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-[#9FEF00] font-bold tracking-wide">SHADOWNET COLLECTIVE</span>
          <span className="text-white/15">|</span>
          <span className="text-[#A4B1CD]">NexaCorp Infiltration Range</span>
          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[#D9A441] font-semibold text-[10px]">
            v2.4
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#9FEF00]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9FEF00] shadow-[0_0_8px_#9FEF00] animate-pulse"></span>
            <span>Target Uplink Online</span>
          </span>
          <span className="text-white/15">|</span>
          <span className="text-[#A4B1CD]">Encrypted Mesh Protocol</span>
        </div>
      </div>
    </footer>
  );
}
