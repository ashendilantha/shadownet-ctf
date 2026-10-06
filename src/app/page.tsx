'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function HomePage() {
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [terminalStep, setTerminalStep] = useState(0);

  useEffect(() => {
    axios
      .get('/api/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const terminalLogs = [
    { text: '[INIT] Perimeter gateway online.', color: 'text-[#8B949E]' },
    { text: '[NET] 8 target vectors mapped.', color: 'text-[#22D3EE]' },
    { text: '[AUTH] Session validation active.', color: 'text-[#22C55E]' },
    { text: '[STAGE 01] Public metadata exposed.', color: 'text-[#F59E0B]' },
    { text: '[STAGE 02] Audio signal decrypted.', color: 'text-[#FF9F43]' },
    { text: '[STAGE 03] Oracle key recovered.', color: 'text-[#FF6B00]' },
    { text: '[STAGE 04] Legacy portal bypassed.', color: 'text-[#22D3EE]' },
    { text: '[STAGE 05] Token sequence predicted.', color: 'text-[#22C55E]' },
    { text: '[STAGE 06] Binary access granted.', color: 'text-[#FF6B00]' },
    { text: '[STAGE 07] Root access obtained.', color: 'text-[#22C55E]' },
    { text: '[STAGE 08] Database pivot complete.', color: 'text-[#22C55E]' },
    { text: '[STATUS] Range online. Awaiting operators.', color: 'text-[#FF6B00]' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalStep((prev) => (prev < terminalLogs.length ? prev + 1 : prev));
    }, 400);
    return () => clearInterval(timer);
  }, [terminalLogs.length]);

  return (
    <div className="w-full space-y-8 sm:space-y-10 pb-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#111417] border border-[#232830] rounded-xl p-5 sm:p-7 lg:p-8">

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Mission Brief & Headlines */}
          <div className="lg:col-span-7 space-y-4">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171B20] border border-[#232830] rounded-full text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              <span className="text-[#22D3EE] font-semibold">NexaCorp range</span>
              <span className="text-[#232830]">·</span>
              <span className="text-[#8B949E]">CTF v2.4</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F5F5F5] font-sans leading-tight">
              Offensive{' '}
              <span className="text-[#FF6B00]">
                Cyber Warfare
              </span>{' '}
              Simulation
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#8B949E] font-sans leading-relaxed max-w-xl">
              Take on eight linked security challenges, from public reconnaissance to an internal network pivot.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {user ? (
                <Link
                  href="/dashboard/challenges"
                  className="btn-primary text-xs sm:text-sm px-5 py-2.5 font-bold"
                >
                  <span>⚡ ACCESS COMMAND DECK</span>
                  <span>→</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/register"
                    className="btn-primary text-xs sm:text-sm px-5 py-2.5 font-bold"
                  >
                    <span>Create account</span>
                  </Link>
                  <Link
                    href="/auth/login"
                    className="btn-secondary text-xs sm:text-sm px-4.5 py-2.5 font-bold"
                  >
                    <span>Sign in</span>
                  </Link>
                </>
              )}

              <Link
                href="/dashboard/leaderboard"
                className="btn-secondary text-xs sm:text-sm px-4.5 py-2.5 font-bold text-[#22D3EE] hover:text-[#22D3EE]"
              >
                <span>Leaderboard</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Live Terminal Telemetry */}
          <div className="lg:col-span-5 w-full">
            <div className="terminal-window border-[#232830]">
              <div className="terminal-header justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="terminal-dot bg-[#EF4444]"></span>
                  <span className="terminal-dot bg-[#F59E0B]"></span>
                  <span className="terminal-dot bg-[#22C55E]"></span>
                  <span className="text-[11px] text-[#8B949E] ml-1.5 font-mono">
                    Range telemetry
                  </span>
                </div>
                <span className="text-[10px] text-[#22D3EE] font-mono font-bold bg-[#171B20] px-2 py-0.5 rounded border border-[#232830]">
                  ONLINE
                </span>
              </div>

              <div className="p-4 font-mono text-xs space-y-1.5 h-[240px] sm:h-[260px] overflow-y-auto bg-[#06080A]">
                {terminalLogs.slice(0, terminalStep).map((log, idx) => (
                  <div key={idx} className={`${log.color} flex items-start gap-2 leading-relaxed`}>
                    <span className="text-[#FF6B00] font-bold select-none">❯</span>
                    <span>{log.text}</span>
                  </div>
                ))}
                {terminalStep < terminalLogs.length && (
                  <div className="text-[#8B949E] flex items-center gap-1 animate-pulse">
                    <span className="text-[#FF6B00] font-bold">❯</span>
                    <span className="w-1.5 h-3.5 bg-[#FF6B00] inline-block"></span>
                  </div>
                )}
              </div>

              <div className="p-2.5 bg-[#0E1216] border-t border-[#232830] flex items-center justify-between text-[11px] font-mono text-[#8B949E]">
                <span>TARGET: NEXACORP-RANGE-01</span>
                <span className="text-[#22C55E] font-semibold">● RANGE ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Telemetry Metric Cards */}
        <div className="mt-6 pt-5 border-t border-[#232830] grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#171B20] border border-[#232830] p-3.5 rounded-xl">
            <span className="font-mono text-[10px] font-semibold text-[#22D3EE] block mb-0.5">Total points</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#FF6B00]">2,250 XP</span>
          </div>
          <div className="bg-[#171B20] border border-[#232830] p-3.5 rounded-xl">
            <span className="font-mono text-[10px] font-semibold text-[#22D3EE] block mb-0.5">Challenges</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#F5F5F5]">8 stages</span>
          </div>
          <div className="bg-[#171B20] border border-[#232830] p-3.5 rounded-xl">
            <span className="font-mono text-[10px] font-semibold text-[#22D3EE] block mb-0.5">Unlock order</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#22C55E]">In order</span>
          </div>
          <div className="bg-[#171B20] border border-[#232830] p-3.5 rounded-xl">
            <span className="font-mono text-[10px] font-semibold text-[#22D3EE] block mb-0.5">Flag checks</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#FF9F43]">Live</span>
          </div>
        </div>
      </section>

      {/* Killchain Phase Overview */}
      <section className="space-y-5">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-[#171B20] border border-[#232830] rounded-full text-[11px] font-mono text-[#FF6B00] font-bold">
            <span>◈</span>
            <span>Campaign</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] font-sans tracking-tight">
            Eight-stage challenge path
          </h2>
          <p className="text-xs sm:text-sm text-[#8B949E] font-sans">
            Solve each stage to unlock the next.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Phase 1 */}
          <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#22D3EE] bg-[#090B0D] px-2 py-0.5 rounded border border-[#232830]">
                  Phase 01
                </span>
                <span className="text-[11px] font-mono text-[#22C55E] font-bold">Stages 1–2</span>
              </div>
              <h3 className="font-sans text-base font-bold text-[#F5F5F5]">
                Perimeter Recon & Stego
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed font-sans">
                Find exposed metadata and recover the hidden audio signal.
              </p>
            </div>
            <div className="pt-2.5 border-t border-[#232830] font-mono text-[10px] text-[#22D3EE] font-semibold">
              OSINT · Audio
            </div>
          </div>

          {/* Phase 2 */}
          <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#FF9F43] bg-[#090B0D] px-2 py-0.5 rounded border border-[#232830]">
                  Phase 02
                </span>
                <span className="text-[11px] font-mono text-[#FF9F43] font-bold">Stages 3–4</span>
              </div>
              <h3 className="font-sans text-base font-bold text-[#F5F5F5]">
                Crypto Oracle & SQLi
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed font-sans">
                Recover a cipher key and test a legacy login for SQL injection.
              </p>
            </div>
            <div className="pt-2.5 border-t border-[#232830] font-mono text-[10px] text-[#FF9F43] font-semibold">
              Crypto · Web
            </div>
          </div>

          {/* Phase 3 */}
          <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#FF6B00] bg-[#090B0D] px-2 py-0.5 rounded border border-[#232830]">
                  Phase 03
                </span>
                <span className="text-[11px] font-mono text-[#FF6B00] font-bold">Stages 5–6</span>
              </div>
              <h3 className="font-sans text-base font-bold text-[#F5F5F5]">
                PRNG & Reverse Eng
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed font-sans">
                Predict a token stream and inspect a compiled Linux binary.
              </p>
            </div>
            <div className="pt-2.5 border-t border-[#232830] font-mono text-[10px] text-[#FF6B00] font-semibold">
              PRNG · Reverse engineering
            </div>
          </div>

          {/* Phase 4 */}
          <div className="cyber-card p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#EF4444] bg-[#090B0D] px-2 py-0.5 rounded border border-[#232830]">
                  Phase 04
                </span>
                <span className="text-[11px] font-mono text-[#EF4444] font-bold">Stages 7–8</span>
              </div>
              <h3 className="font-sans text-base font-bold text-[#F5F5F5]">
                PrivEsc & Subnet Pivoting
              </h3>
              <p className="text-xs text-[#8B949E] leading-relaxed font-sans">
                Escalate Linux privileges and pivot to an isolated database.
              </p>
            </div>
            <div className="pt-2.5 border-t border-[#232830] font-mono text-[10px] text-[#EF4444] font-semibold">
              Linux · Network
            </div>
          </div>
        </div>
      </section>

      {/* Rules of Engagement & Readiness */}
      <section className="cyber-panel p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-1.5 font-mono text-xs text-[#22D3EE] font-bold">
              <span>Rules</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] font-sans">
              Before you begin
            </h3>
            <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed font-sans">
              Sandboxed targets. Stages unlock in order. Flags are case-sensitive: <code className="text-[#FF6B00] font-mono font-semibold">SHADOWNET{'{...}'}</code>.
            </p>
          </div>

          <div className="w-full lg:w-auto flex-shrink-0">
            {user ? (
              <Link href="/dashboard/challenges" className="btn-primary text-xs sm:text-sm px-5 py-2.5 font-bold w-full text-center">
                View challenges
              </Link>
            ) : (
              <Link href="/auth/register" className="btn-primary text-xs sm:text-sm px-5 py-2.5 font-bold w-full text-center">
                Create account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
