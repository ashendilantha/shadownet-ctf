import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#111417] border-t border-[#252A30] py-6 text-xs font-mono text-[#8B949E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-[#FF6B00] font-bold">SHADOWNET CTF</span>
          <span>•</span>
          <span className="text-[#22D3EE]">v2.4.0-PROD</span>
          <span>•</span>
          <span className="text-[#8B949E]">ENTERPRISE ATTACK SIMULATION</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
            <span>ENCRYPTED SECURE UPLINK</span>
          </span>
          <span>•</span>
          <span className="text-[#8B949E]">NEXT.JS &times; SUPABASE &times; VERCEL</span>
        </div>
      </div>
    </footer>
  );
}
