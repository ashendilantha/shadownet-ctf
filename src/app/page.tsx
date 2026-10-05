'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [terminalStep, setTerminalStep] = useState(0);

  useEffect(() => {
    axios
      .get('/api/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const terminalLogs = [
    { text: '[INIT] Initializing NexaCorp Attack Perimeter Gateway...', color: 'text-[#8B949E]' },
    { text: '[NET] 10.100.0.0/16 subnet mapped — 8 target vectors detected.', color: 'text-[#22D3EE]' },
    { text: '[AUTH] Zero-Trust session validation: ACTIVE.', color: 'text-[#22C55E]' },
    { text: '[STAGE 01] OSINT metadata leak identified on public endpoints.', color: 'text-[#F59E0B]' },
    { text: '[STAGE 02] Whistleblower frequency spectrogram decrypted.', color: 'text-[#FF9F43]' },
    { text: '[STAGE 03] Cryptographic Vigenère oracle key recovered.', color: 'text-[#FF6B00]' },
    { text: '[STAGE 04] SQLi payload executed — legacy portal bypassed.', color: 'text-[#22D3EE]' },
    { text: '[STAGE 05] Linear Congruential PRNG token stream predicted.', color: 'text-[#22C55E]' },
    { text: '[STAGE 06] ELF 64-bit binary disassembled — access granted.', color: 'text-[#FF6B00]' },
    { text: '[STAGE 07] Linux SUID privilege escalation succeeded: UID=0 (root).', color: 'text-[#22C55E]' },
    { text: '[STAGE 08] SSRF pivot established — MySQL crown jewel extracted.', color: 'text-[#22C55E]' },
    { text: '[STATUS] Range telemetry online. Awaiting operative engagement.', color: 'text-[#FF6B00]' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalStep((prev) => (prev < terminalLogs.length ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(timer);
  }, [terminalLogs.length]);

  return (
    <div className="w-full space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#111417]/90 border border-[#252A30] rounded-3xl p-8 sm:p-14 lg:p-16 shadow-[0_0_60px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        {/* Ambient Gradient Lights */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-[600px] h-[600px] bg-[#FF6B00]/12 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-[600px] h-[600px] bg-[#22D3EE]/10 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Mission Brief & Headlines */}
          <div className="lg:col-span-7 space-y-8">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-[#171B20] border border-[#252A30] rounded-full text-xs font-mono shadow-[0_0_15px_rgba(0,0,0,0.5)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span className="text-[#22D3EE] font-bold tracking-wider">NEXACORP ATTACK RANGE</span>
              <span className="text-[#252A30]">|</span>
              <span className="text-[#8B949E]">ENTERPRISE CTF v2.4</span>
            </div>

            {/* Title */}
            <h1 className="font-mono text-4xl sm:text-6xl lg:text-7xl font-black text-[#F5F5F5] tracking-tight leading-[1.08]">
              OFFENSIVE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF9F43] to-[#FF6B00]">
                CYBER WARFARE
              </span>
              <br />
              SIMULATION
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#8B949E] font-sans leading-relaxed max-w-2xl">
              A realistic military-grade penetration testing cyber range simulating full-scope internal network compromise. Authenticated operatives conquer 8 progressive killchain stages — from public OSINT reconnaissance to kernel privilege escalation and segmented database extraction.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-5 pt-2">
              {user ? (
                <Link
                  href="/dashboard/challenges"
                  className="btn-primary text-sm sm:text-base px-9 py-4 font-bold"
                >
                  <span>⚡ ACCESS COMMAND DECK</span>
                  <span>→</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="btn-primary text-sm sm:text-base px-9 py-4 font-bold"
                  >
                    <span>🛡️ ENROLL OPERATIVE</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href="/auth/login"
                    className="btn-secondary text-sm sm:text-base px-7 py-4 font-bold"
                  >
                    <span>AGENT LOGIN</span>
                  </Link>
                </>
              )}

              <Link
                href="/dashboard/leaderboard"
                className="btn-secondary text-sm sm:text-base px-7 py-4 font-bold text-[#22D3EE] hover:text-[#22D3EE]"
              >
                <span>🏆 SCOREBOARD</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Live Terminal Telemetry */}
          <div className="lg:col-span-5 w-full">
            <div className="terminal-window shadow-[0_0_40px_rgba(0,0,0,0.9)] border-[#252A30]">
              <div className="terminal-header justify-between bg-[#0E1216]">
                <div className="flex items-center gap-2.5">
                  <span className="terminal-dot bg-[#EF4444]"></span>
                  <span className="terminal-dot bg-[#F59E0B]"></span>
                  <span className="terminal-dot bg-[#22C55E]"></span>
                  <span className="text-xs text-[#8B949E] ml-2 font-mono font-semibold">
                    telemetry@shadownet-core:~
                  </span>
                </div>
                <span className="text-[10px] text-[#22D3EE] font-mono font-bold bg-[#171B20] px-2.5 py-1 rounded border border-[#252A30]">
                  LIVE TELEMETRY
                </span>
              </div>

              <div className="p-5 sm:p-6 font-mono text-xs sm:text-[13px] space-y-2.5 min-h-[320px] max-h-[380px] overflow-hidden bg-[#06080A]">
                {terminalLogs.slice(0, terminalStep).map((log, idx) => (
                  <div key={idx} className={`${log.color} flex items-start gap-2.5 leading-relaxed`}>
                    <span className="text-[#FF6B00] font-bold select-none">❯</span>
                    <span>{log.text}</span>
                  </div>
                ))}
                {terminalStep < terminalLogs.length && (
                  <div className="text-[#8B949E] flex items-center gap-1.5 animate-pulse">
                    <span className="text-[#FF6B00] font-bold">❯</span>
                    <span className="w-2.5 h-4 bg-[#FF6B00] inline-block"></span>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-[#0E1216] border-t border-[#252A30] flex items-center justify-between text-xs font-mono text-[#8B949E]">
                <span>TARGET: NEXACORP-RANGE-01</span>
                <span className="text-[#22C55E] font-bold">● RANGE ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="mt-14 pt-10 border-t border-[#252A30] grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#171B20] border border-[#252A30] p-5 sm:p-6 rounded-2xl">
            <span className="font-mono text-xs font-semibold text-[#22D3EE] block mb-1">TOTAL BOUNTY</span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#FF6B00]">2,250 XP</span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] p-5 sm:p-6 rounded-2xl">
            <span className="font-mono text-xs font-semibold text-[#22D3EE] block mb-1">CAMPAIGN TARGETS</span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#F5F5F5]">8 KILLCHAINS</span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] p-5 sm:p-6 rounded-2xl">
            <span className="font-mono text-xs font-semibold text-[#22D3EE] block mb-1">UNLOCK PROTOCOL</span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#22C55E]">SEQUENTIAL</span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] p-5 sm:p-6 rounded-2xl">
            <span className="font-mono text-xs font-semibold text-[#22D3EE] block mb-1">FLAG VERIFICATION</span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#FF9F43]">REAL-TIME</span>
          </div>
        </div>
      </section>

      {/* Killchain Phase Overview */}
      <section className="space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#171B20] border border-[#252A30] rounded-full text-xs font-mono text-[#FF6B00] font-bold">
            <span>◈</span>
            <span>ENTERPRISE INFILTRATION ROADMAP</span>
          </div>
          <h2 className="font-mono text-3xl sm:text-5xl font-black text-[#F5F5F5]">
            THE 8-PHASE PENETRATION CHAIN
          </h2>
          <p className="text-base text-[#8B949E] font-sans max-w-2xl mx-auto">
            Each objective unlocks upon successful submission of the previous proof-of-exploitation flag.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phase 1 */}
          <div className="cyber-card p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#22D3EE] bg-[#111417] px-3 py-1 rounded-lg border border-[#252A30]">
                  PHASE 01
                </span>
                <span className="text-xs font-mono text-[#22C55E] font-bold">STAGES 1–2</span>
              </div>
              <h3 className="font-mono text-xl font-bold text-[#F5F5F5]">
                Perimeter Recon & Stego
              </h3>
              <p className="text-sm text-[#8B949E] leading-relaxed font-sans">
                Analyze public digital footprints, metadata, and concealed frequency signals embedded in whistleblower audio assets.
              </p>
            </div>
            <div className="pt-4 border-t border-[#252A30] font-mono text-xs text-[#22D3EE] font-semibold">
              VECTOR: OSINT & AUDIO FREQUENCIES
            </div>
          </div>

          {/* Phase 2 */}
          <div className="cyber-card p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#FF9F43] bg-[#111417] px-3 py-1 rounded-lg border border-[#252A30]">
                  PHASE 02
                </span>
                <span className="text-xs font-mono text-[#FF9F43] font-bold">STAGES 3–4</span>
              </div>
              <h3 className="font-mono text-xl font-bold text-[#F5F5F5]">
                Crypto Oracle & SQLi
              </h3>
              <p className="text-sm text-[#8B949E] leading-relaxed font-sans">
                Exploit cryptographic oracle vulnerabilities and breach internal authentication portals via SQL injection.
              </p>
            </div>
            <div className="pt-4 border-t border-[#252A30] font-mono text-xs text-[#FF9F43] font-semibold">
              VECTOR: DOCKER CONTAINER SERVICES
            </div>
          </div>

          {/* Phase 3 */}
          <div className="cyber-card p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#FF6B00] bg-[#111417] px-3 py-1 rounded-lg border border-[#252A30]">
                  PHASE 03
                </span>
                <span className="text-xs font-mono text-[#FF6B00] font-bold">STAGES 5–6</span>
              </div>
              <h3 className="font-mono text-xl font-bold text-[#F5F5F5]">
                PRNG & Reverse Eng
              </h3>
              <p className="text-sm text-[#8B949E] leading-relaxed font-sans">
                Reverse-engineer pseudorandom token generators and disassemble compiled 64-bit ELF binaries with Ghidra/GDB.
              </p>
            </div>
            <div className="pt-4 border-t border-[#252A30] font-mono text-xs text-[#FF6B00] font-semibold">
              VECTOR: ALGORITHMS & ELF REVERSAL
            </div>
          </div>

          {/* Phase 4 */}
          <div className="cyber-card p-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#EF4444] bg-[#111417] px-3 py-1 rounded-lg border border-[#252A30]">
                  PHASE 04
                </span>
                <span className="text-xs font-mono text-[#EF4444] font-bold">STAGES 7–8</span>
              </div>
              <h3 className="font-mono text-xl font-bold text-[#F5F5F5]">
                PrivEsc & Subnet Pivoting
              </h3>
              <p className="text-sm text-[#8B949E] leading-relaxed font-sans">
                Escalate privileges to root on Linux hosts, weaponize SSRF vulnerabilities, and pivot across internal database subnets.
              </p>
            </div>
            <div className="pt-4 border-t border-[#252A30] font-mono text-xs text-[#EF4444] font-semibold">
              VECTOR: VM CLUSTER CAPSTONE
            </div>
          </div>
        </div>
      </section>

      {/* Rules of Engagement & Readiness */}
      <section className="bg-[#111417] border border-[#252A30] rounded-3xl p-8 sm:p-12 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 font-mono text-xs text-[#22D3EE] font-bold">
              <span>[PROTOCOL]</span>
              <span>ENGAGEMENT GUIDELINES</span>
            </div>
            <h3 className="font-mono text-2xl sm:text-3xl font-black text-[#F5F5F5]">
              ZERO-TRUST RANGE CONDUCT
            </h3>
            <p className="text-sm sm:text-base text-[#8B949E] leading-relaxed font-sans">
              1. All challenges are strictly isolated within simulated sandbox subnets.<br />
              2. Stage 1 is unlocked upon operative enrollment; subsequent stages unlock sequentially upon valid flag submission.<br />
              3. Submit flags in standard case-sensitive format: <code className="text-[#FF6B00] font-mono">SHADOWNET{'{...}'}</code>.
            </p>
          </div>

          <div className="w-full lg:w-auto flex-shrink-0">
            {user ? (
              <Link href="/dashboard/challenges" className="btn-primary text-sm px-8 py-4 font-bold w-full text-center">
                ENTER CHALLENGE DECK →
              </Link>
            ) : (
              <Link href="/auth/register" className="btn-primary text-sm px-8 py-4 font-bold w-full text-center">
                ENROLL OPERATIVE HANDLE →
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
