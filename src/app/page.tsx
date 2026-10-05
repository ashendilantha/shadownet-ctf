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
    { text: '[INIT] Connecting to NexaCorp Perimeter Network...', color: 'text-[#8B949E]' },
    { text: '[SCAN] 10.100.0.0/16 subnet mapped — 8 target domains identified.', color: 'text-[#22D3EE]' },
    { text: '[RECON] OSINT intelligence leak detected in public DNS records.', color: 'text-[#F59E0B]' },
    { text: '[CRYPTO] Oracle handshake negotiated. Key length: 128-bit Vigenère.', color: 'text-[#FF9F43]' },
    { text: '[EXPLOIT] SQLi authentication bypass payload transmitted.', color: 'text-[#FF6B00]' },
    { text: '[REVERSE] ELF 64-bit binary disassembled. Logic constraints matched.', color: 'text-[#22D3EE]' },
    { text: '[PRIVESC] SUID permission misconfiguration hijacked. Root shell gained.', color: 'text-[#22C55E]' },
    { text: '[PIVOT] SSRF tunnel established to internal MySQL cluster.', color: 'text-[#22C55E]' },
    { text: '[SUCCESS] ShadowNet CTF Range Ready. Awaiting Operative Input.', color: 'text-[#FF6B00]' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalStep((prev) => (prev < terminalLogs.length ? prev + 1 : prev));
    }, 600);
    return () => clearInterval(timer);
  }, [terminalLogs.length]);

  return (
    <div className="w-full space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#111417] border border-[#252A30] rounded-2xl p-6 sm:p-10 lg:p-14 shadow-[0_0_50px_rgba(0,0,0,0.6)]">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-[#FF6B00]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[500px] h-[500px] bg-[#22D3EE]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#171B20] border border-[#252A30] rounded-full text-xs font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span className="text-[#22D3EE] font-bold">NEXACORP DEFENSE RANGE</span>
              <span className="text-[#252A30]">|</span>
              <span className="text-[#8B949E]">v2.4.0 PROD</span>
            </div>

            {/* Title */}
            <h1 className="font-mono text-3xl sm:text-5xl lg:text-6xl font-black text-[#F5F5F5] tracking-tight leading-tight">
              ADVANCED <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF9F43] to-[#FF6B00]">
                CYBER WARFARE
              </span>
              <br />
              SIMULATION
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#8B949E] font-sans leading-relaxed max-w-2xl">
              An enterprise attack range designed to evaluate offensive security competencies. Engage in a progressive 8-stage operation — from initial OSINT reconnaissance and cryptography breaking to binary reverse-engineering, kernel privilege escalation, and multi-host subnet pivoting.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {user ? (
                <Link
                  href="/dashboard/challenges"
                  className="btn-primary text-sm sm:text-base px-8 py-3.5"
                >
                  <span>⚡ ACCESS COMMAND DECK</span>
                  <span>→</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="btn-primary text-sm sm:text-base px-8 py-3.5"
                  >
                    <span>🛡️ ENROLL OPERATIVE</span>
                    <span>→</span>
                  </Link>
                  <Link
                    href="/auth/login"
                    className="btn-secondary text-sm sm:text-base px-6 py-3.5"
                  >
                    <span>AGENT LOGIN</span>
                  </Link>
                </>
              )}

              <Link
                href="/dashboard/leaderboard"
                className="btn-secondary text-sm sm:text-base px-6 py-3.5 text-[#22D3EE] hover:text-[#22D3EE]"
              >
                <span>🏆 SCOREBOARD</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Live Terminal Telemetry Widget */}
          <div className="lg:col-span-5">
            <div className="terminal-window shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <div className="terminal-header justify-between">
                <div className="flex items-center gap-2">
                  <span className="terminal-dot bg-[#EF4444]"></span>
                  <span className="terminal-dot bg-[#F59E0B]"></span>
                  <span className="terminal-dot bg-[#22C55E]"></span>
                  <span className="text-xs text-[#8B949E] ml-2 font-mono">
                    telemetry@shadownet-core:~
                  </span>
                </div>
                <span className="text-[10px] text-[#22D3EE] font-mono bg-[#171B20] px-2 py-0.5 rounded border border-[#252A30]">
                  LIVE STREAM
                </span>
              </div>

              <div className="p-4 sm:p-5 font-mono text-xs space-y-2.5 min-h-[280px] overflow-hidden bg-[#06080A]">
                {terminalLogs.slice(0, terminalStep).map((log, idx) => (
                  <div key={idx} className={`${log.color} flex items-start gap-2 animate-fadeIn`}>
                    <span className="text-[#FF6B00] select-none">❯</span>
                    <span>{log.text}</span>
                  </div>
                ))}
                {terminalStep < terminalLogs.length && (
                  <div className="text-[#8B949E] flex items-center gap-1 animate-pulse">
                    <span className="text-[#FF6B00]">❯</span>
                    <span className="w-2 h-4 bg-[#FF6B00] inline-block"></span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-[#0E1216] border-t border-[#252A30] flex items-center justify-between text-[11px] font-mono text-[#8B949E]">
                <span>TARGET: NEXACORP-RANGE-01</span>
                <span className="text-[#22C55E]">STATUS: ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="mt-12 pt-8 border-t border-[#252A30] grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#171B20] border border-[#252A30] p-4 rounded-xl">
            <span className="font-mono text-xs text-[#22D3EE] block mb-1">TOTAL BOUNTY</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#FF6B00]">2,250 XP</span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] p-4 rounded-xl">
            <span className="font-mono text-xs text-[#22D3EE] block mb-1">CAMPAIGN STAGES</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#F5F5F5]">8 KILLCHAINS</span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] p-4 rounded-xl">
            <span className="font-mono text-xs text-[#22D3EE] block mb-1">PROGRESSION MODE</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#22C55E]">SEQUENTIAL</span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] p-4 rounded-xl">
            <span className="font-mono text-xs text-[#22D3EE] block mb-1">VERIFICATION</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#FF9F43]">REAL-TIME</span>
          </div>
        </div>
      </section>

      {/* Operation Overview & Architecture */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#171B20] border border-[#252A30] rounded-full text-xs font-mono text-[#FF6B00]">
            <span>◈</span>
            <span>ENTERPRISE ATTACK ARCHITECTURE</span>
          </div>
          <h2 className="font-mono text-2xl sm:text-4xl font-bold text-[#F5F5F5]">
            THE 8-PHASE PENETRATION KILLCHAIN
          </h2>
          <p className="text-sm sm:text-base text-[#8B949E] font-sans">
            Challenges are locked sequentially. Complete each stage to extract intel and unlock subsequent attack vectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phase 1 */}
          <div className="cyber-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#22D3EE] bg-[#111417] px-2.5 py-1 rounded border border-[#252A30]">
                  PHASE 01
                </span>
                <span className="text-xs font-mono text-[#22C55E]">STAGES 1-2</span>
              </div>
              <h3 className="font-mono text-lg font-bold text-[#F5F5F5]">
                Perimeter Recon & Stego
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                Analyze public digital footprints, metadata, and concealed frequency signals embedded in whistleblower audio assets.
              </p>
            </div>
            <div className="pt-3 border-t border-[#252A30] font-mono text-[11px] text-[#22D3EE]">
              VECTOR: OSINT & SPECTROGRAMS
            </div>
          </div>

          {/* Phase 2 */}
          <div className="cyber-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#FF9F43] bg-[#111417] px-2.5 py-1 rounded border border-[#252A30]">
                  PHASE 02
                </span>
                <span className="text-xs font-mono text-[#FF9F43]">STAGES 3-4</span>
              </div>
              <h3 className="font-mono text-lg font-bold text-[#F5F5F5]">
                Crypto Oracle & SQLi
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                Exploit cryptographic oracle vulnerabilities and breach internal authentication portals via SQL injection.
              </p>
            </div>
            <div className="pt-3 border-t border-[#252A30] font-mono text-[11px] text-[#FF9F43]">
              VECTOR: DOCKER SERVICES
            </div>
          </div>

          {/* Phase 3 */}
          <div className="cyber-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#FF6B00] bg-[#111417] px-2.5 py-1 rounded border border-[#252A30]">
                  PHASE 03
                </span>
                <span className="text-xs font-mono text-[#FF6B00]">STAGES 5-6</span>
              </div>
              <h3 className="font-mono text-lg font-bold text-[#F5F5F5]">
                PRNG & Reverse Eng
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                Reverse-engineer pseudorandom token generators and disassemble compiled 64-bit ELF binaries with Ghidra.
              </p>
            </div>
            <div className="pt-3 border-t border-[#252A30] font-mono text-[11px] text-[#FF6B00]">
              VECTOR: ALGORITHMS & ELF RE
            </div>
          </div>

          {/* Phase 4 */}
          <div className="cyber-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#EF4444] bg-[#111417] px-2.5 py-1 rounded border border-[#252A30]">
                  PHASE 04
                </span>
                <span className="text-xs font-mono text-[#EF4444]">STAGES 7-8</span>
              </div>
              <h3 className="font-mono text-lg font-bold text-[#F5F5F5]">
                PrivEsc & Subnet Pivoting
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                Escalate privileges to root on Linux hosts, weaponize SSRF vulnerabilities, and pivot to segmented database subnets.
              </p>
            </div>
            <div className="pt-3 border-t border-[#252A30] font-mono text-[11px] text-[#EF4444]">
              VECTOR: VM CLUSTER CAPSTONE
            </div>
          </div>
        </div>
      </section>

      {/* Rules of Engagement */}
      <section className="bg-[#111417] border border-[#252A30] rounded-2xl p-8 sm:p-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="font-mono text-xs text-[#22D3EE] font-bold">[ROE] RULES OF ENGAGEMENT</span>
            <h3 className="font-mono text-2xl font-bold text-[#F5F5F5]">
              SIMULATION PROTOCOLS & GUIDELINES
            </h3>
            <p className="text-sm text-[#8B949E] leading-relaxed">
              1. All challenges are strictly contained within designated virtual sandbox subnets.<br />
              2. Stage 1 is unlocked upon operative enrollment; subsequent stages unlock upon verified flag capture.<br />
              3. Flags follow the standard format: <code className="text-[#FF6B00]">SHADOWNET{'{...}'}</code>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {user ? (
              <Link href="/dashboard/challenges" className="btn-primary text-center">
                LAUNCH CAMPAIGN DECK →
              </Link>
            ) : (
              <Link href="/auth/register" className="btn-primary text-center">
                ENROLL TO COMPETE →
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
