'use client';

import React, { useEffect, useState, useRef } from 'react';
import { STAGE_CONFIGS, StageInfo } from '@/lib/constants';

interface AttackVectorModalProps {
  stageNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  challengeTitle?: string;
  domain?: string;
  points?: number;
}

export default function AttackVectorModal({
  stageNumber,
  isOpen,
  onClose,
  onProceed,
  challengeTitle,
  domain,
  points,
}: AttackVectorModalProps) {
  const stageConfig: StageInfo | undefined = STAGE_CONFIGS[stageNumber];
  const [logIndex, setLogIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeVisualStep, setActiveVisualStep] = useState(0);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  const logs = stageConfig?.attackSimSteps || [
    { text: `[INIT] Target host mapped: NexaCorp Stage 0${stageNumber}`, type: 'info' },
    { text: `[PROBE] Establishing tactical collective uplink to perimeter...`, type: 'exec' },
    { text: `[VECTOR] Executing vulnerability payload against target subsystem...`, type: 'warn' },
    { text: `[BREACH] Perimeter broken! Target session access established.`, type: 'success' },
  ];

  // Extended simulated raw terminal lines for full immersion
  const rawHexDump = [
    '0x0000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............',
    '0x0010: 0300 3e00 0100 0000 e011 4000 0000 0000  ..>.......@.....',
    '0x0020: 4000 0000 0000 0000 081f 0000 0000 0000  @...............',
    '0x0030: 0000 0000 4000 3800 0900 4000 1f00 1c00  ....@.8...@.....',
  ];

  // Reset and trigger progression when opened
  useEffect(() => {
    if (!isOpen) {
      setLogIndex(0);
      setProgressPercent(0);
      return;
    }

    setLogIndex(0);
    setProgressPercent(10);
    setActiveVisualStep(0);

    const timer = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < logs.length) {
          const next = prev + 1;
          setProgressPercent(Math.min(100, Math.round((next / logs.length) * 100)));
          setActiveVisualStep(next);
          return next;
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(timer);
  }, [isOpen, logs.length, stageNumber]);

  // Auto scroll terminal logs
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logIndex]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderVisualizer = () => {
    switch (stageNumber) {
      case 1:
        // OSINT / Reconnaissance Scanner
        return (
          <div className="relative h-48 bg-[#040608] border border-[#232B36] rounded-lg p-4 overflow-hidden flex flex-col justify-between font-mono text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-xs text-[#8B949E] border-b border-[#1A222C] pb-2">
              <span className="text-[#FF8533] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping"></span>
                PERIMETER RECONNAISSANCE SCANNER
              </span>
              <span className="text-[#10B981] font-bold">CRAWLING NEXACORP DMZ</span>
            </div>
            <div className="grid grid-cols-3 gap-3 my-auto text-xs">
              <div className="p-3 bg-[#0B0F14] border border-[#232B36] rounded text-center">
                <span className="text-[10px] text-[#8B949E] block mb-1">TARGET HOST</span>
                <span className="text-[#F5F5F5] font-bold text-xs">nexacorp.com</span>
              </div>
              <div className="p-3 bg-[#0B0F14] border border-[#FF6B00]/40 rounded text-center shadow-[0_0_12px_rgba(255,107,0,0.1)]">
                <span className="text-[10px] text-[#FF8533] block mb-1">LEAKED HEADER</span>
                <span className="text-[#FF9F43] font-bold text-xs">X-Nexa-Debug: 1</span>
              </div>
              <div className="p-3 bg-[#0B0F14] border border-[#10B981]/40 rounded text-center shadow-[0_0_12px_rgba(16,185,129,0.1)]">
                <span className="text-[10px] text-[#10B981] block mb-1">EXIF AUTHOR INTEL</span>
                <span className="text-[#10B981] font-bold text-xs">SecOps Internal</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#8B949E]">
                <span>DMZ PORT MAPPING: 80, 443, 5000, 8080</span>
                <span className="text-[#10B981]">INTELLIGENCE HARVESTED</span>
              </div>
              <div className="w-full bg-[#0E131A] h-2 rounded-full overflow-hidden border border-[#232B36]">
                <div
                  className="h-full bg-gradient-to-r from-[#FF6B00] via-[#FF9F43] to-[#10B981] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        );

      case 2:
        // Steganography / Audio Waveform Demodulator
        return (
          <div className="relative h-48 bg-[#040608] border border-[#232B36] rounded-lg p-4 overflow-hidden flex flex-col justify-between font-mono text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-xs text-[#8B949E] border-b border-[#1A222C] pb-2">
              <span className="text-[#FF8533] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping"></span>
                SIGINT FREQUENCY SPECTROGRAM DEMODULATOR
              </span>
              <span className="text-[#F59E0B] font-bold">26 DECOY STREAMS FILTERED</span>
            </div>
            <div className="flex items-end justify-center gap-2 h-20 py-2">
              {[35, 60, 25, 80, 95, 40, 70, 100, 50, 85, 30, 90, 65, 75, 45, 95, 55, 80, 40, 90].map((h, i) => (
                <div
                  key={i}
                  className="w-2 sm:w-3 bg-gradient-to-t from-[#FF6B00] via-[#FF9F43] to-[#10B981] rounded-t transition-all duration-300 shadow-[0_0_8px_rgba(255,107,0,0.3)]"
                  style={{
                    height: `${activeVisualStep > 1 ? h : (h * (i % 4 + 1)) / 4}%`,
                    opacity: activeVisualStep > 2 ? 1 : 0.6,
                  }}
                ></div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-t border-[#1A222C] pt-2">
              <span className="text-[#10B981] font-bold">CARRIER: 14.2 MHz LOCKED</span>
              <span className="text-[#FF9F43] font-bold">EXHIBIT: whistleblower.jpg</span>
              <span className="text-[#F5F5F5]">AUDIO: 1 Authentic / 26 Jamming</span>
            </div>
          </div>
        );

      case 3:
        // Cryptographic Oracle Differential Prober
        return (
          <div className="relative h-48 bg-[#040608] border border-[#232B36] rounded-lg p-4 overflow-hidden flex flex-col justify-between font-mono text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-xs text-[#8B949E] border-b border-[#1A222C] pb-2">
              <span className="text-[#FF8533] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping"></span>
                CRYPTO ORACLE CHOSEN-PLAINTEXT BYTE PROBER
              </span>
              <span className="text-[#10B981] font-bold">TCP :5000 ACTIVE</span>
            </div>
            <div className="grid grid-cols-4 gap-2.5 my-auto text-center text-xs">
              <div className="p-2.5 bg-[#0B0F14] border border-[#232B36] rounded text-[#8B949E]">
                BLOCK 01<br/><span className="text-[#F5F5F5] font-bold text-xs">A4 E1 F9 0C</span>
              </div>
              <div className="p-2.5 bg-[#0B0F14] border border-[#FF6B00]/40 rounded text-[#FF8533] shadow-[0_0_10px_rgba(255,107,0,0.15)]">
                BLOCK 02<br/><span className="text-[#FF9F43] font-bold text-xs">7D 3B 22 FA</span>
              </div>
              <div className="p-2.5 bg-[#0B0F14] border border-[#232B36] rounded text-[#8B949E]">
                BLOCK 03<br/><span className="text-[#F5F5F5] font-bold text-xs">1C 88 4B 9E</span>
              </div>
              <div className="p-2.5 bg-[#0B0F14] border border-[#10B981]/50 rounded text-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                ORACLE BYTE<br/><span className="text-[#10B981] font-bold text-xs">0x53 (MATCH)</span>
              </div>
            </div>
            <div className="text-[11px] text-[#8B949E] flex justify-between border-t border-[#1A222C] pt-2">
              <span>CIPHER MODE: AES-ECB / Vigenère Hybrid</span>
              <span className="text-[#10B981] font-bold">KEY RECOVERY: 16/16 BYTES SOLVED</span>
            </div>
          </div>
        );

      case 4:
        // SQL Injection Gateway Bypass
        return (
          <div className="relative h-48 bg-[#040608] border border-[#232B36] rounded-lg p-4 overflow-hidden flex flex-col justify-between font-mono text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-xs text-[#8B949E] border-b border-[#1A222C] pb-2">
              <span className="text-[#FF8533] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping"></span>
                NEXAAUTH SQL INJECTION INJECTOR
              </span>
              <span className="text-[#10B981] font-bold">PORT 3000 UPLINK</span>
            </div>
            <div className="my-auto space-y-2 bg-[#0B0F14] border border-[#232B36] p-3 rounded text-xs">
              <div className="text-[#8B949E]">
                INJECTED PAYLOAD: <code className="text-[#FF6B00] font-bold">admin&apos; OR &apos;1&apos;=&apos;1&apos; --</code>
              </div>
              <div className="text-[#10B981] flex items-center justify-between font-bold">
                <span>QUERY LOGIC: SELECT * FROM users WHERE user=&apos;admin&apos;</span>
                <span className="bg-[#10B981]/20 px-2 py-0.5 rounded text-[11px]">ROOT AUTH BYPASS</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-t border-[#1A222C] pt-2">
              <span>TARGET: NexaCorp SSO Gateway</span>
              <span className="text-[#10B981] font-bold">HTTP 200 OK — SESSION TOKEN GENERATED</span>
            </div>
          </div>
        );

      case 5:
        // PRNG LCG State Predictor
        return (
          <div className="relative h-48 bg-[#040608] border border-[#232B36] rounded-lg p-4 overflow-hidden flex flex-col justify-between font-mono text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-xs text-[#8B949E] border-b border-[#1A222C] pb-2">
              <span className="text-[#FF8533] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping"></span>
                PRNG / LCG STATE SYNCHRONIZER
              </span>
              <span className="text-[#10B981] font-bold">TCP :5001 TOKEN STREAM</span>
            </div>
            <div className="grid grid-cols-2 gap-3 my-auto text-xs">
              <div className="p-3 bg-[#0B0F14] border border-[#232B36] rounded">
                <span className="text-[10px] text-[#8B949E] block mb-1">LCG RECURRENCE</span>
                <span className="text-[#FF8533] font-bold text-xs">X[n+1] = (aX[n] + c) % m</span>
              </div>
              <div className="p-3 bg-[#0B0F14] border border-[#10B981]/40 rounded shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                <span className="text-[10px] text-[#8B949E] block mb-1">NEXT TOKEN PREDICTION</span>
                <span className="text-[#10B981] font-bold text-xs">0x7F9B4D28A1 (100% MATCH)</span>
              </div>
            </div>
            <div className="text-[11px] text-[#8B949E] flex justify-between border-t border-[#1A222C] pt-2">
              <span>SEED SOLVER: 6/6 CONSECUTIVE STATES SAMPLED</span>
              <span className="text-[#10B981] font-bold">STATE RECONSTRUCTION COMPLETE</span>
            </div>
          </div>
        );

      case 6:
        // Binary Disassembly & Reverse Engineering
        return (
          <div className="relative h-48 bg-[#040608] border border-[#232B36] rounded-lg p-4 overflow-hidden flex flex-col justify-between font-mono text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-xs text-[#8B949E] border-b border-[#1A222C] pb-2">
              <span className="text-[#FF8533] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping"></span>
                ELF x86_64 DISASSEMBLER & FLOW ENGINE
              </span>
              <span className="text-[#10B981] font-bold">GHIDRA / GDB DECOMPILER</span>
            </div>
            <div className="bg-[#0B0F14] border border-[#232B36] p-3 rounded text-xs space-y-1 my-auto">
              <div className="text-[#8B949E]">0x004011e0: <span className="text-[#FF9F43]">mov</span> eax, [rbp-0x4]</div>
              <div className="text-[#8B949E]">0x004011e4: <span className="text-[#FF6B00]">xor</span> eax, 0x5a5a</div>
              <div className="text-[#10B981] font-bold">0x004011e9: <span className="text-[#10B981]">cmp eax, 0x1337 ; SERIAL KEY MATCHED</span></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-t border-[#1A222C] pt-2">
              <span>TARGET BINARY: target.bin (x86_64)</span>
              <span className="text-[#10B981] font-bold">LICENSE VERIFICATION REVERSED</span>
            </div>
          </div>
        );

      case 7:
        // Linux SUID Privilege Escalation
        return (
          <div className="relative h-48 bg-[#040608] border border-[#232B36] rounded-lg p-4 overflow-hidden flex flex-col justify-between font-mono text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-xs text-[#8B949E] border-b border-[#1A222C] pb-2">
              <span className="text-[#FF8533] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping"></span>
                SUID PRIVILEGE ESCALATION MATRIX
              </span>
              <span className="text-[#EF4444] font-bold">ROOT COMPROMISE</span>
            </div>
            <div className="grid grid-cols-2 gap-3 my-auto text-xs">
              <div className="p-3 bg-[#0B0F14] border border-[#232B36] rounded">
                <span className="text-[10px] text-[#8B949E] block mb-1">INITIAL OPERATIVE SHELL</span>
                <span className="text-[#F5F5F5] font-bold text-xs">uid=1000(player)</span>
              </div>
              <div className="p-3 bg-[#0B0F14] border border-[#EF4444]/40 rounded shadow-[0_0_10px_rgba(239,68,68,0.15)]">
                <span className="text-[10px] text-[#EF4444] block mb-1">ESCALATED SHELL</span>
                <span className="text-[#10B981] font-bold text-xs">uid=0(root) # ROOT SHELL</span>
              </div>
            </div>
            <div className="text-[11px] text-[#8B949E] flex justify-between border-t border-[#1A222C] pt-2">
              <span>EXPLOIT TARGET: /usr/local/bin/nexa-sysbackup</span>
              <span className="text-[#10B981] font-bold">PRIVILEGE ESCALATION EXPLOITED</span>
            </div>
          </div>
        );

      case 8:
        // Network Pivoting & SSRF Exfiltration
        return (
          <div className="relative h-48 bg-[#040608] border border-[#232B36] rounded-lg p-4 overflow-hidden flex flex-col justify-between font-mono text-xs shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between text-xs text-[#8B949E] border-b border-[#1A222C] pb-2">
              <span className="text-[#FF8533] font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping"></span>
                SSRF PIVOT & INTERNAL DB EXFILTRATION
              </span>
              <span className="text-[#10B981] font-bold">INTERNAL DATACENTER</span>
            </div>
            <div className="flex items-center justify-between gap-2 my-auto text-xs">
              <div className="p-2.5 bg-[#0B0F14] border border-[#FF6B00]/40 rounded text-center flex-1">
                <span className="text-[#FF8533] block font-bold text-[11px]">ENTRY HOST</span>
                <span className="text-[#8B949E] text-[10px]">10.0.0.1:3000</span>
              </div>
              <span className="text-[#FF6B00] font-bold text-lg">➔</span>
              <div className="p-2.5 bg-[#0B0F14] border border-[#F59E0B]/40 rounded text-center flex-1">
                <span className="text-[#F59E0B] block font-bold text-[11px]">METADATA</span>
                <span className="text-[#8B949E] text-[10px]">169.254.169.254</span>
              </div>
              <span className="text-[#FF6B00] font-bold text-lg">➔</span>
              <div className="p-2.5 bg-[#0B0F14] border border-[#10B981]/50 rounded text-center flex-1">
                <span className="text-[#10B981] block font-bold text-[11px]">MYSQL CORE</span>
                <span className="text-[#8B949E] text-[10px]">10.0.2.10:3306</span>
              </div>
            </div>
            <div className="text-[11px] text-[#8B949E] flex justify-between border-t border-[#1A222C] pt-2">
              <span>PIVOT: SSRF HTTP TUNNEL</span>
              <span className="text-[#10B981] font-bold">CROWN JEWELS MASTER DATABASE DUMPED</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#05070A] text-[#F5F5F5] overflow-hidden animate-fade-in font-sans">
      {/* Top Scanline Indicator */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF6B00] via-[#FF9F43] to-[#10B981] flex-shrink-0"></div>

      {/* Full-Screen Tactical Top HUD */}
      <header className="px-4 sm:px-6 py-3 bg-[#080B0F] border-b border-[#232B36] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#141920] border border-[#FF6B00]/70 flex items-center justify-center font-mono font-black text-[#FF6B00] text-base shadow-[0_0_16px_rgba(255,107,0,0.3)]">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold text-[#FF8533] uppercase tracking-wider">
                SHADOWNET COLLECTIVE // TACTICAL BREACH ENGINE
              </span>
              <span className="text-[#232B36]">|</span>
              <span className="font-mono text-[10px] text-[#10B981] font-bold">
                {stageConfig?.subsystemCode || `TARGET-0${stageNumber}`}
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black text-[#F5F5F5] font-sans tracking-tight flex items-center gap-2">
              <span>Stage 0{stageNumber}:</span>
              <span>{challengeTitle || stageConfig?.name || `Target Defense Layer`}</span>
            </h1>
          </div>
        </div>

        {/* Right HUD Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#10151C] border border-[#232B36] rounded-lg font-mono text-xs">
            <span className="text-[#8B949E]">BOUNTY:</span>
            <span className="text-[#FF6B00] font-black">+{points || stageConfig?.points || 100} XP</span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-[#141920] border border-[#232B36] hover:border-[#EF4444]/60 text-[#8B949E] hover:text-[#EF4444] font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>✕</span>
            <span className="hidden sm:inline">ABORT [ESC]</span>
          </button>
        </div>
      </header>

      {/* Full-Screen Main Command Deck Grid */}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 Cols): Schematic & Tactical Directives */}
        <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
          {/* Target Classification Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg">
              <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-bold">Target Subsystem</span>
              <span className="text-[#F5F5F5] font-bold text-xs sm:text-sm">
                {stageConfig?.targetSystem || 'NexaCorp Internal Target Host'}
              </span>
            </div>
            <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg">
              <span className="text-[10px] text-[#8B949E] block mb-1 uppercase font-bold">Attack Vector Classification</span>
              <span className="text-[#FF8533] font-bold text-xs sm:text-sm">
                {stageConfig?.attackVector || domain || 'Tactical Breach Payload'}
              </span>
            </div>
          </div>

          {/* Real-time Graphical Attack Simulator Visualizer */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                <span>ATTACK SCHEMATIC SIMULATION</span>
              </span>
              <span className="text-[#10B981] font-mono font-bold">
                {progressPercent === 100 ? '● EXPLOIT VECTOR PRIMED' : '● EXECUTING PAYLOAD...'}
              </span>
            </div>
            {renderVisualizer()}
          </div>

          {/* Narrative Mission Objective */}
          {stageConfig?.storyBrief && (
            <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-lg">
              <div className="text-[10px] font-mono text-[#FF8533] uppercase font-bold mb-1.5 flex items-center gap-2">
                <span>◈</span>
                <span>COLLECTIVE OPERATION DIRECTIVE</span>
              </div>
              <p className="text-xs sm:text-sm text-[#D8E1EC] font-sans leading-relaxed">
                {stageConfig.storyBrief}
              </p>
            </div>
          )}

          {/* Telemetry Architecture Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div className="p-2.5 bg-[#080A0D] border border-[#232B36] rounded text-center">
              <span className="text-[#8B949E] block text-[9px]">DIFFICULTY</span>
              <span className="text-[#FF9F43] font-bold">{stageConfig?.difficulty || 'Medium'}</span>
            </div>
            <div className="p-2.5 bg-[#080A0D] border border-[#232B36] rounded text-center">
              <span className="text-[#8B949E] block text-[9px]">ENVIRONMENT</span>
              <span className="text-[#10B981] font-bold">{stageConfig?.type || 'Docker'}</span>
            </div>
            <div className="p-2.5 bg-[#080A0D] border border-[#232B36] rounded text-center">
              <span className="text-[#8B949E] block text-[9px]">ENCRYPTION</span>
              <span className="text-[#F5F5F5] font-bold">TLS-1.3 / GCM</span>
            </div>
            <div className="p-2.5 bg-[#080A0D] border border-[#232B36] rounded text-center">
              <span className="text-[#8B949E] block text-[9px]">STATUS</span>
              <span className="text-[#10B981] font-bold">PRIMED</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Live Breaching Terminal & Hex Stream */}
        <div className="lg:col-span-5 flex flex-col min-h-[300px] lg:min-h-full">
          <div className="terminal-window border-[#232B36] flex-1 flex flex-col bg-[#030507]">
            {/* Terminal Window Header */}
            <div className="terminal-header justify-between py-2 px-3.5 text-xs bg-[#080B0F] border-b border-[#232B36]">
              <div className="flex items-center gap-2">
                <span className="terminal-dot bg-[#EF4444]"></span>
                <span className="terminal-dot bg-[#F59E0B]"></span>
                <span className="terminal-dot bg-[#10B981]"></span>
                <span className="text-[#8B949E] ml-1.5 font-mono text-xs font-semibold">
                  LIVE BREACH TELEMETRY
                </span>
              </div>
              <span className="text-[#10B981] font-mono text-[11px] font-bold">
                {progressPercent}% COMPLETE
              </span>
            </div>

            {/* Terminal Stream Body */}
            <div className="p-4 font-mono text-xs space-y-2 flex-1 overflow-y-auto bg-[#030507]">
              {/* Simulated Command Launch */}
              <div className="text-[#8B949E] pb-1 border-b border-[#1A222C]">
                <span className="text-[#FF6B00] font-bold">shadow-ops@collective:~$</span> ./infiltrate_vector.sh --stage=0{stageNumber} --target=nexacorp
              </div>

              {/* Dynamic Telemetry Steps */}
              {logs.slice(0, logIndex).map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 leading-relaxed ${
                    step.type === 'success'
                      ? 'text-[#10B981] font-bold'
                      : step.type === 'warn'
                      ? 'text-[#FF9F43]'
                      : step.type === 'exec'
                      ? 'text-[#F59E0B]'
                      : 'text-[#8B949E]'
                  }`}
                >
                  <span className="text-[#FF6B00] font-bold select-none">❯</span>
                  <span>{step.text}</span>
                </div>
              ))}

              {/* Raw Hex Infiltration Trace */}
              {logIndex >= 2 && (
                <div className="pt-2 text-[10px] text-[#556375] space-y-0.5 border-t border-[#141C24] font-mono">
                  <div className="text-[#8B949E] font-bold mb-1">{'//'} INJECTING MEMORY BUFFER:</div>
                  {rawHexDump.map((hex, i) => (
                    <div key={i}>{hex}</div>
                  ))}
                </div>
              )}

              {/* Blinking Cursor */}
              {logIndex < logs.length && (
                <div className="text-[#8B949E] flex items-center gap-1.5 animate-pulse pt-1">
                  <span className="text-[#FF6B00] font-bold">❯</span>
                  <span className="w-2 h-4 bg-[#FF6B00] inline-block"></span>
                </div>
              )}

              {/* Success Signal */}
              {logIndex >= logs.length && (
                <div className="p-2.5 mt-2 bg-[#10B981]/10 border border-[#10B981]/30 rounded text-[#10B981] text-xs font-bold flex items-center gap-2">
                  <span>●</span>
                  <span>TARGET PERIMETER BREACHED — TERMINAL READY</span>
                </div>
              )}

              <div ref={terminalBottomRef} />
            </div>
          </div>
        </div>
      </main>

      {/* Full-Screen Bottom Tactical Action Bar */}
      <footer className="px-4 sm:px-6 py-3.5 bg-[#080B0F] border-t border-[#232B36] flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
        {/* Left: Progression Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto font-mono text-xs">
          <span className="text-[#8B949E]">INFILTRATION PROGRESS:</span>
          <div className="w-36 sm:w-48 h-2 bg-[#141920] rounded-full overflow-hidden border border-[#232B36]">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B00] via-[#FF9F43] to-[#10B981] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span className="text-[#10B981] font-black">{progressPercent}%</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              setLogIndex(0);
              setProgressPercent(10);
              setActiveVisualStep(0);
            }}
            className="btn-ghost text-xs px-4 py-2 text-[#8B949E] hover:text-[#F5F5F5] font-mono cursor-pointer"
          >
            🔄 Replay Vector
          </button>

          <button
            onClick={onClose}
            className="btn-secondary text-xs px-4 py-2 font-mono cursor-pointer"
          >
            Abort
          </button>

          <button
            onClick={() => {
              onClose();
              onProceed();
            }}
            className="btn-primary text-xs font-bold px-6 py-2.5 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,107,0,0.4)] cursor-pointer"
          >
            <span>PROCEED TO TARGET</span>
            <span>→</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
