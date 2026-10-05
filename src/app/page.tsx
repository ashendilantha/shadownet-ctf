import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  const stages = [
    { num: 1, name: 'NexaCorp Reconnaissance', domain: 'OSINT', diff: 'Easy', pts: 100, type: 'Static' },
    { num: 2, name: 'Covert Transmissions', domain: 'Steganography', diff: 'Medium', pts: 150, type: 'Static' },
    { num: 3, name: 'Cipher Oracle', domain: 'Cryptography', diff: 'Medium', pts: 200, type: 'Docker' },
    { num: 4, name: 'NexaAuth Portal Bypass', domain: 'Web Security', diff: 'Medium', pts: 250, type: 'Docker' },
    { num: 5, name: 'PRNG Token Predictor', domain: 'Scripting', diff: 'Medium', pts: 300, type: 'Docker' },
    { num: 6, name: 'Binary Disassembly', domain: 'Reverse Engineering', diff: 'Hard', pts: 350, type: 'VM' },
    { num: 7, name: 'Privilege Escalation', domain: 'Linux Security', diff: 'Hard', pts: 400, type: 'VM' },
    { num: 8, name: 'Core Infrastructure Breach', domain: 'Network Pivoting', diff: 'Hard', pts: 500, type: 'VMs' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#111417] border border-[#252A30] rounded-xl p-8 sm:p-12">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171B20] border border-[#252A30] rounded-full text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping"></span>
            <span className="text-[#22D3EE]">TARGET ENVIRONMENT:</span>
            <span className="text-[#F5F5F5]">NexaCorp Enterprise Perimeter</span>
          </div>

          <h1 className="font-mono text-3xl sm:text-5xl font-black text-[#F5F5F5] tracking-tight mb-4">
            INFILTRATE THE <span className="text-[#FF6B00]">SHADOWNET</span>
          </h1>

          <p className="text-base sm:text-lg text-[#8B949E] leading-relaxed mb-8">
            An 8-stage progressive cyber warfare simulation. Exploit public intelligence leaks, break crypto oracles, reverse proprietary binaries, and pivot across segregated subnets to extract root flags.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/challenges"
              className="px-6 py-3 rounded font-mono text-sm font-bold text-black bg-[#FF6B00] hover:bg-[#FF9F43] shadow-[0_0_20px_rgba(255,107,0,0.35)] transition-all transform hover:-translate-y-0.5"
            >
              LAUNCH CHALLENGES →
            </Link>
            <Link
              href="/dashboard/leaderboard"
              className="px-6 py-3 rounded font-mono text-sm font-semibold text-[#F5F5F5] bg-[#171B20] border border-[#252A30] hover:border-[#22D3EE] hover:text-[#22D3EE] transition-all"
            >
              VIEW LEADERBOARD
            </Link>
          </div>
        </div>

        {/* Live Terminal Telemetry Teaser */}
        <div className="mt-8 pt-6 border-t border-[#252A30] font-mono text-xs text-[#8B949E] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[#22D3EE]">TOTAL BOUNTY:</span>
            <p className="text-[#FF6B00] font-bold text-base mt-0.5">2,250 XP</p>
          </div>
          <div>
            <span className="text-[#22D3EE]">TOTAL CAMPAIGNS:</span>
            <p className="text-[#F5F5F5] font-bold text-base mt-0.5">8 STAGES</p>
          </div>
          <div>
            <span className="text-[#22D3EE]">EXPLOIT VECTOR:</span>
            <p className="text-[#F5F5F5] font-bold text-base mt-0.5">SSRF / RE / CRYPTO</p>
          </div>
          <div>
            <span className="text-[#22D3EE]">SYSTEM HEALTH:</span>
            <p className="text-[#22C55E] font-bold text-base mt-0.5">100% OPERATIONAL</p>
          </div>
        </div>
      </section>

      {/* Stage Progression Matrix */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-mono text-xl font-bold text-[#F5F5F5] flex items-center gap-2">
              <span className="text-[#FF6B00]">◈</span> ATTACK PROGRESSION CHAIN
            </h2>
            <p className="text-sm text-[#8B949E]">
              Step-by-step killchain designed to replicate advanced real-world persistent threats.
            </p>
          </div>
          <Link
            href="/dashboard/progress"
            className="font-mono text-xs text-[#22D3EE] hover:text-[#FF9F43] flex items-center gap-1"
          >
            VIEW FULL ROADMAP →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stg) => (
            <div
              key={stg.num}
              className="bg-[#171B20] border border-[#252A30] rounded-lg p-4 hover:border-[#FF6B00]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#22D3EE]">
                    STAGE 0{stg.num}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded border ${
                      stg.diff === 'Easy'
                        ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30'
                        : stg.diff === 'Medium'
                        ? 'text-[#FF9F43] bg-[#FF9F43]/10 border-[#FF9F43]/30'
                        : 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30'
                    }`}
                  >
                    {stg.diff}
                  </span>
                </div>
                <h4 className="font-mono text-sm font-bold text-[#F5F5F5] mb-1">
                  {stg.name}
                </h4>
                <p className="font-mono text-xs text-[#8B949E] mb-3">
                  {stg.domain}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#252A30] font-mono text-xs">
                <span className="text-[#FF6B00] font-bold">+{stg.pts} XP</span>
                <span className="text-[#8B949E] text-[11px]">{stg.type}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target Infrastructure / Architecture */}
      <section className="bg-[#111417] border border-[#252A30] rounded-xl p-6 sm:p-8 font-mono">
        <h3 className="text-base font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
          <span className="text-[#22D3EE]">[SYS_ARCH]</span> OPERATIONAL NETWORK TOPOLOGY
        </h3>

        <div className="terminal-box p-4 rounded text-xs text-[#8B949E] overflow-x-auto">
          <pre className="text-[#F5F5F5]">{`
  STAGE 1-2 (Public OSINT / Stego) ───────> STAGE 3-5 (Docker Services) ───────> STAGE 6-8 (VM Subnet & Pivoting)
  ┌──────────────────────────────┐          ┌───────────────────────────┐         ┌──────────────────────────────┐
  │ • NexaCorp Public Website    │          │ • Crypto Oracle (:5000)   │         │ • RE Sandbox VM (ELF)        │
  │ • Hidden Audio Spectrogram   │  ─────>  │ • SQLi Auth Portal (:3000)│  ────>  │ • Linux SUID PrivEsc VM      │
  │ • Metadata Exfiltration      │          │ • LCG Token Predictor     │         │ • Entry Host SSRF -> DB      │
  └──────────────────────────────┘          └───────────────────────────┘         └──────────────────────────────┘
          `}</pre>
        </div>
      </section>
    </div>
  );
}
