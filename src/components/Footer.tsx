import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full mt-auto bg-[#111417] border-t border-[#252A30] py-8 text-xs font-mono text-[#8B949E]">
      <div className="w-full app-container flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          <span className="text-[#FF6B00] font-bold">SHADOWNET CTF</span>
          <span>•</span>
          <span className="text-[#22D3EE]">v2.4.0-PROD</span>
          <span>•</span>
          <span className="text-[#8B949E]">NEXACORP DEFENSE RANGE</span>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
            <span>ENCRYPTED SECURE UPLINK</span>
          </span>
          <span>•</span>
          <span className="text-[#8B949E]">NEXT.JS 16 &times; SUPABASE &times; VERCEL</span>
        </div>
      </div>
    </footer>
  );
}
