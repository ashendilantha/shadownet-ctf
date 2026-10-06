import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full mt-auto bg-[#111417] border-t border-[#252A30] py-4 text-xs font-mono text-[#8B949E]">
      <div className="w-full app-container flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="text-[#FF6B00] font-bold">SHADOWNET CTF</span>
          <span className="text-[#22D3EE] font-medium">v2.4.0</span>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-[11px]">
          <span className="flex items-center gap-1.5 text-[#22C55E]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
            <span>Range active</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
