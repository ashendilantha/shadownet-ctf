'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import OperativeArtwork from '@/components/OperativeArtwork';
import CyberThreatMap from '@/components/CyberThreatMap';
import { STAGE_CONFIGS } from '@/lib/constants';

interface LeaderboardEntry {
  rank: number;
  username: string;
  team_name: string;
  total_points: number;
  challenges_solved: number;
}

export default function HomePage() {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [terminalStep, setTerminalStep] = useState(0);
  const [topOperatives, setTopOperatives] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    axios
      .get('/api/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));

    axios
      .get('/api/scores/leaderboard')
      .then((res) => setTopOperatives((res.data.leaderboard || []).slice(0, 5)))
      .catch(() => setTopOperatives([]));
  }, []);

  const terminalLogs = [
    { text: '[UPLINK] ShadowNet clandestine tunnel established.', color: 'text-[#A4B1CD]' },
    { text: '[TARGET] NexaCorp global infrastructure perimeter mapped.', color: 'text-[#38BDF8]' },
    { text: '[AUTH] Operative cryptographic key verified.', color: 'text-[#9FEF00]' },
    { text: '[STAGE 01] NexaCorp DMZ web headers & metadata harvested.', color: 'text-[#F59E0B]' },
    { text: '[STAGE 02] Intercepted satellite transmission demodulated.', color: 'text-[#D9A441]' },
    { text: '[STAGE 03] Oracle ECB block cipher byte boundary aligned.', color: 'text-[#9FEF00]' },
    { text: '[STAGE 04] NexaAuth SSO gateway bypassed via SQL injection.', color: 'text-[#38BDF8]' },
    { text: '[STAGE 05] Session generator LCG state mathematical seed solved.', color: 'text-[#9FEF00]' },
    { text: '[STAGE 06] Internal ELF daemon reversed & license patched.', color: 'text-[#D9A441]' },
    { text: '[STAGE 07] Linux bastion SUID utility exploited — UID 0 (root).', color: 'text-[#9FEF00]' },
    { text: '[STAGE 08] SSRF pivot to internal cloud metadata & MySQL exfil.', color: 'text-[#9FEF00]' },
    { text: '[STATUS] Collective command active. Awaiting operative deployment.', color: 'text-[#9FEF00]' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalStep((prev) => (prev < terminalLogs.length ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(timer);
  }, [terminalLogs.length]);

  const stagesList = Object.values(STAGE_CONFIGS).sort((a, b) => a.stage - b.stage);

  const arsenalTools = [
    { name: 'OSINT & EXIF Recon', tag: 'DMZ-01', tools: 'curl · exiftool · source inspection', accent: 'text-[#9FEF00]' },
    { name: 'SIGINT & Audio Stego', tag: 'SIGINT-02', tools: 'steghide · Sonic Visualiser · FFT', accent: 'text-[#38BDF8]' },
    { name: 'Cipher & PRNG Math', tag: 'CRYPTO-03/05', tools: 'ECB oracle · LCG modular inversion', accent: 'text-[#D9A441]' },
    { name: 'Web, RE & Root Pivot', tag: 'CORE-04/06/07/08', tools: 'SQLi · Ghidra · SUID PATH · SSRF', accent: 'text-[#F87171]' },
  ];

  return (
    <div className="w-full space-y-8 sm:space-y-10 pb-8">
      {/* Hero Section: Frosted Glass Command Deck */}
      <section className="glass-hero overflow-hidden p-5 sm:p-7 lg:p-9">
        {/* Top Luminous Plasma Accent Line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#9FEF00] via-[#38BDF8] to-[#9FEF00] opacity-90"
          aria-hidden="true"
        />
        {/* Subtle Inner Corner Ambient Glow */}
        <div
          className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#9FEF00]/10 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#38BDF8]/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Story Directive & Mission Brief */}
          <div className="lg:col-span-7 relative isolate">
            <OperativeArtwork
              alt=""
              loading="eager"
              sizes="(max-width: 640px) 160px, (max-width: 1024px) 220px, 280px"
              className="home-operative-watermark absolute bottom-0 right-0 w-28 sm:w-40 lg:w-48 h-auto"
            />
            <div className="relative z-10 space-y-4">
              {/* Status Pill */}
              <div className="glass-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-[#9FEF00] shadow-[0_0_8px_#9FEF00] animate-pulse"></span>
                <span className="text-[#F8FAFC] font-bold">NexaCorp Infiltration</span>
                <span className="text-white/25">·</span>
                <span className="text-[#38BDF8] font-semibold">Campaign v2.4</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#F8FAFC] font-sans leading-[1.12] tracking-tight">
                Infiltrate{' '}
                <span className="text-[#9FEF00] drop-shadow-[0_0_24px_rgba(159,239,0,0.45)]">
                  NexaCorp
                </span>{' '}
                Infrastructure
              </h1>

              {/* Story Description */}
              <p className="text-xs sm:text-sm text-[#A4B1CD] font-sans leading-relaxed max-w-xl">
                Take the mantle of an elite operative inside the{' '}
                <strong className="text-[#F8FAFC]">ShadowNet Underground Collective</strong>. Breaching NexaCorp requires chaining eight sequential exploits—from public OSINT recon and steganography to binary disassembly, privilege escalation, and internal subnet network pivoting.
              </p>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {user ? (
                  <Link
                    href="/dashboard/challenges"
                    className="btn-primary text-xs sm:text-sm px-5 py-2.5 font-bold"
                  >
                    <span>⚡ ACCESS TARGET DECK</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/auth/register"
                      className="btn-primary text-xs sm:text-sm px-5 py-2.5 font-bold"
                    >
                      <span>Join the Collective</span>
                    </Link>
                    <Link
                      href="/auth/login"
                      className="btn-secondary text-xs sm:text-sm px-4.5 py-2.5 font-bold"
                    >
                      <span>Operative Sign In</span>
                    </Link>
                  </>
                )}

                <Link
                  href="/dashboard/leaderboard"
                  className="btn-secondary text-xs sm:text-sm px-4.5 py-2.5 font-bold"
                >
                  <span>Operative Roster</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Frosted Glass Infiltration Telemetry Terminal */}
          <div className="lg:col-span-5 w-full">
            <div className="relative z-10">
              <div className="terminal-window">
                <div className="terminal-header justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="terminal-dot bg-[#F87171] text-[#F87171]"></span>
                    <span className="terminal-dot bg-[#F59E0B] text-[#F59E0B]"></span>
                    <span className="terminal-dot bg-[#9FEF00] text-[#9FEF00]"></span>
                    <span className="text-[11px] text-[#A4B1CD] ml-1.5 font-mono font-medium">
                      Breach Telemetry
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9FEF00] font-mono font-bold bg-[#9FEF00]/10 px-2.5 py-0.5 rounded-full border border-[#9FEF00]/30 shadow-[0_0_12px_rgba(159,239,0,0.16)]">
                    UPLINK ACTIVE
                  </span>
                </div>

                <div className="p-4 font-mono text-xs space-y-1.5 h-[240px] sm:h-[260px] overflow-y-auto bg-[#050811]/65">
                  {terminalLogs.slice(0, terminalStep).map((log, idx) => (
                    <div key={idx} className={`${log.color} flex items-start gap-2 leading-relaxed`}>
                      <span className="text-[#9FEF00] font-bold select-none">❯</span>
                      <span>{log.text}</span>
                    </div>
                  ))}
                  {terminalStep < terminalLogs.length && (
                    <div className="text-[#A4B1CD] flex items-center gap-1 animate-pulse">
                      <span className="text-[#9FEF00] font-bold">❯</span>
                      <span className="w-1.5 h-3.5 bg-[#9FEF00] inline-block shadow-[0_0_8px_#9FEF00]"></span>
                    </div>
                  )}
                </div>

                <div className="px-3.5 py-2.5 bg-white/[0.03] border-t border-white/[0.08] flex items-center justify-between text-[11px] font-mono text-[#A4B1CD]">
                  <span>TARGET: NEXACORP-GLOBAL-SYSTEMS</span>
                  <span className="text-[#9FEF00] font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#9FEF00] shadow-[0_0_6px_#9FEF00]"></span>
                    INFILTRATION READY
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Frosted Glass Telemetry Metric Cards */}
        <div className="relative z-10 mt-7 pt-6 border-t border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="glass-metric p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A4B1CD] block mb-1">
              Total Bounty
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#9FEF00] drop-shadow-[0_0_12px_rgba(159,239,0,0.3)]">
              2,250 XP
            </span>
          </div>
          <div className="glass-metric p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A4B1CD] block mb-1">
              Target Defenses
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#F8FAFC]">
              8 Stages
            </span>
          </div>
          <div className="glass-metric p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A4B1CD] block mb-1">
              Infiltration Path
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#38BDF8] drop-shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              Sequential
            </span>
          </div>
          <div className="glass-metric p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#A4B1CD] block mb-1">
              Flag Validation
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#D9A441] drop-shadow-[0_0_12px_rgba(217,164,65,0.28)]">
              Realtime
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Global Cyber Threat & Attack Vector Map */}
      <CyberThreatMap />

      {/* Killchain Phase Roadmap */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="glass-pill inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-mono text-[#9FEF00] font-bold">
            <span>◈</span>
            <span>NexaCorp Killchain Phases</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] font-sans tracking-tight">
            The Infiltration Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-[#A4B1CD] font-sans">
            Breach each defense ring sequentially to penetrate deeper into NexaCorp&apos;s internal network.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phase 1 */}
          <div className="cyber-card overflow-hidden p-5 flex flex-col justify-between space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#9FEF00]/80 via-[#9FEF00]/20 to-transparent" />
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#9FEF00] bg-[#9FEF00]/10 px-2.5 py-0.5 rounded-full border border-[#9FEF00]/25">
                  Phase 01
                </span>
                <span className="text-[11px] font-mono text-[#9FEF00] font-bold">Stages 1–2</span>
              </div>
              <h3 className="font-sans text-base font-bold text-[#F8FAFC]">
                Perimeter Recon &amp; SIGINT
              </h3>
              <p className="text-xs text-[#A4B1CD] leading-relaxed font-sans">
                Harvest leaked employee metadata and demodulate intercepted whistleblower transmissions.
              </p>
            </div>
            <div className="pt-3 border-t border-white/[0.08] font-mono text-[10px] text-[#A4B1CD] font-semibold">
              OSINT · Audio Stego
            </div>
          </div>

          {/* Phase 2 */}
          <div className="cyber-card overflow-hidden p-5 flex flex-col justify-between space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#38BDF8]/80 via-[#38BDF8]/20 to-transparent" />
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-full border border-[#38BDF8]/25">
                  Phase 02
                </span>
                <span className="text-[11px] font-mono text-[#38BDF8] font-bold">Stages 3–4</span>
              </div>
              <h3 className="font-sans text-base font-bold text-[#F8FAFC]">
                Crypto Oracle &amp; SSO Bypass
              </h3>
              <p className="text-xs text-[#A4B1CD] leading-relaxed font-sans">
                Recover cryptographic keys via oracle probing and inject SQL payloads into the employee SSO gateway.
              </p>
            </div>
            <div className="pt-3 border-t border-white/[0.08] font-mono text-[10px] text-[#38BDF8] font-semibold">
              AES Oracle · SQL Injection
            </div>
          </div>

          {/* Phase 3 */}
          <div className="cyber-card overflow-hidden p-5 flex flex-col justify-between space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D9A441]/80 via-[#D9A441]/20 to-transparent" />
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#D9A441] bg-[#D9A441]/10 px-2.5 py-0.5 rounded-full border border-[#D9A441]/25">
                  Phase 03
                </span>
                <span className="text-[11px] font-mono text-[#D9A441] font-bold">Stages 5–6</span>
              </div>
              <h3 className="font-sans text-base font-bold text-[#F8FAFC]">
                PRNG Forecast &amp; Binary RE
              </h3>
              <p className="text-xs text-[#A4B1CD] leading-relaxed font-sans">
                Solve pseudo-random generator state algorithms and decompile proprietary ELF binaries in Ghidra.
              </p>
            </div>
            <div className="pt-3 border-t border-white/[0.08] font-mono text-[10px] text-[#D9A441] font-semibold">
              PRNG Math · Reverse Engineering
            </div>
          </div>

          {/* Phase 4 */}
          <div className="cyber-card overflow-hidden p-5 flex flex-col justify-between space-y-4">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F87171]/80 via-[#F87171]/20 to-transparent" />
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#F87171] bg-[#F87171]/10 px-2.5 py-0.5 rounded-full border border-[#F87171]/25">
                  Phase 04
                </span>
                <span className="text-[11px] font-mono text-[#F87171] font-bold">Stages 7–8</span>
              </div>
              <h3 className="font-sans text-base font-bold text-[#F8FAFC]">
                Root PrivEsc &amp; Subnet Pivoting
              </h3>
              <p className="text-xs text-[#A4B1CD] leading-relaxed font-sans">
                Escalate Linux execution to root and trigger SSRF pivots to exfiltrate NexaCorp&apos;s master database.
              </p>
            </div>
            <div className="pt-3 border-t border-white/[0.08] font-mono text-[10px] text-[#F87171] font-semibold">
              Linux Root · SSRF Exfiltration
            </div>
          </div>
        </div>
      </section>

      {/* NexaCorp Defense Matrix: Live 8-Stage Subsystem Grid */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="glass-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono text-[#D9A441] font-bold">
              <span>⬡</span>
              <span>NEXACORP DEFENSE MATRIX</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC] tracking-tight">
              Target Subsystems &amp; Active Endpoints
            </h2>
          </div>
          <Link
            href={user ? '/dashboard/challenges' : '/auth/login'}
            className="btn-secondary text-xs h-9 px-4 self-start sm:self-auto"
          >
            Open Target Deck →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {stagesList.map((st) => {
            const diffStyle =
              st.difficulty === 'Easy'
                ? 'text-[#9FEF00] bg-[#9FEF00]/10 border-[#9FEF00]/30'
                : st.difficulty === 'Medium'
                ? 'text-[#D9A441] bg-[#D9A441]/10 border-[#D9A441]/30'
                : 'text-[#F87171] bg-[#F87171]/10 border-[#F87171]/30';
            return (
              <Link
                key={st.stage}
                href={user ? `/dashboard/challenges/${st.stage}` : '/auth/login'}
                className="cyber-card p-4 flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                    <span className="text-[#38BDF8] font-bold">{st.subsystemCode}</span>
                    <span className={`px-2 py-0.5 rounded-full border font-bold ${diffStyle}`}>
                      {st.difficulty}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#9FEF00] transition-colors">
                    0{st.stage}. {st.name}
                  </h3>
                  <p className="text-[11px] text-[#A4B1CD] line-clamp-2 leading-relaxed">
                    {st.vectorSummary}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-white/[0.07] flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#A4B1CD] uppercase">{st.type} · {st.domain}</span>
                  <span className="text-[#9FEF00] font-black">+{st.points} XP</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Live Collective Standings + Operative Arsenal */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Top Operatives Live Preview */}
        <div className="lg:col-span-7 cyber-panel p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#9FEF00]">
                LIVE COLLECTIVE STANDINGS
              </span>
              <h3 className="text-lg font-bold text-[#F8FAFC]">Top Active Operatives</h3>
            </div>
            <Link href="/dashboard/leaderboard" className="btn-ghost text-xs font-mono">
              Full Roster →
            </Link>
          </div>

          {topOperatives.length > 0 ? (
            <div className="space-y-2">
              {topOperatives.map((op) => (
                <div
                  key={op.rank}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.07] hover:border-[#9FEF00]/30 transition-colors font-mono text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black ${
                        op.rank === 1
                          ? 'bg-[#9FEF00]/20 text-[#9FEF00] border border-[#9FEF00]/40'
                          : 'bg-white/[0.06] text-[#A4B1CD] border border-white/[0.08]'
                      }`}
                    >
                      #{op.rank}
                    </span>
                    <div className="truncate">
                      <span className="text-[#F8FAFC] font-bold block truncate">{op.username}</span>
                      <span className="text-[10px] text-[#6B7894]">{op.team_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[11px] text-[#38BDF8] font-semibold">
                      {op.challenges_solved}/8
                    </span>
                    <span className="text-xs text-[#9FEF00] font-black">
                      {op.total_points} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-white/[0.02] border border-dashed border-white/[0.1] text-center space-y-2">
              <p className="font-mono text-xs text-[#A4B1CD]">
                No operatives have claimed the #1 spot yet — be the first to breach NexaCorp.
              </p>
              <Link href="/auth/register" className="btn-primary text-xs h-9 px-4 inline-flex">
                Enlist &amp; Claim First Blood
              </Link>
            </div>
          )}
        </div>

        {/* Operative Toolkit & Attack Surface */}
        <div className="lg:col-span-5 cyber-panel p-5 sm:p-6 space-y-4">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
              RECOMMENDED FIELD ARSENAL
            </span>
            <h3 className="text-lg font-bold text-[#F8FAFC]">Attack Surface Coverage</h3>
          </div>

          <div className="space-y-2.5">
            {arsenalTools.map((item) => (
              <div
                key={item.name}
                className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.07] space-y-1"
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className={`font-bold ${item.accent}`}>{item.name}</span>
                  <span className="text-[10px] text-[#A4B1CD] px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08]">
                    {item.tag}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-[#A4B1CD]">{item.tools}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules of Engagement & Readiness */}
      <section className="cyber-panel overflow-hidden p-6 sm:p-7">
        <div
          className="pointer-events-none absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-[#9FEF00]/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#9FEF00] font-bold uppercase tracking-wider">
              <span>◈ Collective Rules of Engagement</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#F8FAFC] font-sans">
              Directive Before Infiltration
            </h3>
            <p className="text-xs sm:text-sm text-[#A4B1CD] leading-relaxed font-sans">
              All target hosts run in isolated sandboxes. Defense rings unlock in strict chronological order upon submitting the authentic flag hash:{' '}
              <code className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/[0.1] text-[#9FEF00] font-mono font-bold">
                SHADOWNET{'{...}'}
              </code>
              .
            </p>
          </div>

          <div className="w-full lg:w-auto flex-shrink-0">
            {user ? (
              <Link href="/dashboard/challenges" className="btn-primary text-xs sm:text-sm px-6 py-2.5 font-bold w-full text-center">
                Launch Target Deck
              </Link>
            ) : (
              <Link href="/auth/register" className="btn-primary text-xs sm:text-sm px-6 py-2.5 font-bold w-full text-center">
                Join Collective
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
