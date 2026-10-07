'use client';

import React, { useEffect, useState } from 'react';
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

  const logs = stageConfig?.attackSimSteps || [
    { text: `[INIT] Target host mapped: NexaCorp Stage 0${stageNumber}`, type: 'info' },
    { text: `[PROBE] Establishing tactical collective uplink...`, type: 'exec' },
    { text: `[VECTOR] Executing vulnerability payload against perimeter...`, type: 'warn' },
    { text: `[BREACH] Target response verified. Tactical access point online!`, type: 'success' },
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
          <div className="relative h-32 bg-[#050709] border border-[#242C37] rounded-lg p-3 overflow-hidden flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-b border-[#1F2732] pb-1.5">
              <span className="text-[#FF8533] font-bold">PERIMETER RECON SCANNER</span>
              <span className="text-[#10B981] animate-pulse">● CRAWLING DMZ</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px] my-auto">
              <div className="p-2 bg-[#0E1217] border border-[#232B36] rounded text-center">
                <span className="text-[#8B949E] block">DNS RECORD</span>
                <span className="text-[#F5F5F5] font-bold">nexacorp.com</span>
              </div>
              <div className="p-2 bg-[#0E1217] border border-[#FF6B00]/40 rounded text-center">
                <span className="text-[#FF8533] block">EXPOSED HEADER</span>
                <span className="text-[#FF9F43] font-bold">X-Nexa-Debug: 1</span>
              </div>
              <div className="p-2 bg-[#0E1217] border border-[#10B981]/40 rounded text-center">
                <span className="text-[#10B981] block">METADATA LEAK</span>
                <span className="text-[#10B981] font-bold">Author: SecOps</span>
              </div>
            </div>
            <div className="w-full bg-[#11161D] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF6B00] to-[#10B981] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        );

      case 2:
        // Steganography / Audio Waveform Demodulator
        return (
          <div className="relative h-32 bg-[#050709] border border-[#242C37] rounded-lg p-3 overflow-hidden flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-b border-[#1F2732] pb-1.5">
              <span className="text-[#FF8533] font-bold">AUDIO SPECTROGRAM DEMODULATOR</span>
              <span className="text-[#F59E0B]">26 DECOYS FILTERED</span>
            </div>
            <div className="flex items-end justify-center gap-1.5 h-14 py-1">
              {[40, 65, 30, 85, 95, 45, 70, 100, 55, 80, 35, 90, 60, 75, 40, 95].map((h, i) => (
                <div
                  key={i}
                  className="w-2.5 bg-gradient-to-t from-[#FF6B00] via-[#FF9F43] to-[#10B981] rounded-t transition-all duration-300"
                  style={{
                    height: `${activeVisualStep > 1 ? h : (h * (i % 3 + 1)) / 3}%`,
                    opacity: activeVisualStep > 2 ? 1 : 0.6,
                  }}
                ></div>
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
              <span className="text-[#10B981]">CARRIER: 14.2 MHz LOCKED</span>
              <span className="text-[#FF9F43]">EXHIBIT: whistleblower.jpg</span>
            </div>
          </div>
        );

      case 3:
        // Cryptographic Oracle Differential Prober
        return (
          <div className="relative h-32 bg-[#050709] border border-[#242C37] rounded-lg p-3 overflow-hidden flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-b border-[#1F2732] pb-1.5">
              <span className="text-[#FF8533] font-bold">CRYPTO ORACLE BYTE PROBER</span>
              <span className="text-[#10B981]">TCP :5000 ACTIVE</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 my-auto text-center text-[11px]">
              <div className="p-1.5 bg-[#0E1217] border border-[#232B36] rounded text-[#8B949E]">
                BLCK 01<br/><span className="text-[#F5F5F5] font-bold">A4 E1 F9 0C</span>
              </div>
              <div className="p-1.5 bg-[#0E1217] border border-[#FF6B00]/40 rounded text-[#FF8533]">
                BLCK 02<br/><span className="text-[#FF9F43] font-bold">7D 3B 22 FA</span>
              </div>
              <div className="p-1.5 bg-[#0E1217] border border-[#232B36] rounded text-[#8B949E]">
                BLCK 03<br/><span className="text-[#F5F5F5] font-bold">1C 88 4B 9E</span>
              </div>
              <div className="p-1.5 bg-[#0E1217] border border-[#10B981]/50 rounded text-[#10B981]">
                KEY BYTE<br/><span className="text-[#10B981] font-bold">0x53 (RECOVERED)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B949E] text-center">
              Differential Byte Leakage Matrix: <span className="text-[#FF8533]">AES-ECB Block Aligned</span>
            </div>
          </div>
        );

      case 4:
        // SQL Injection Gateway Bypass
        return (
          <div className="relative h-32 bg-[#050709] border border-[#242C37] rounded-lg p-3 overflow-hidden flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-b border-[#1F2732] pb-1.5">
              <span className="text-[#FF8533] font-bold">NEXAAUTH SQL INJECTION INJECTOR</span>
              <span className="text-[#10B981]">PORT 3000</span>
            </div>
            <div className="my-auto space-y-1 bg-[#0E1217] border border-[#232B36] p-2 rounded text-[11px]">
              <div className="text-[#8B949E]">
                PAYLOAD: <code className="text-[#FF6B00] font-bold">admin&apos; OR &apos;1&apos;=&apos;1&apos; --</code>
              </div>
              <div className="text-[#10B981] flex items-center justify-between">
                <span>QUERY EXECUTION: TAUTOLOGY TRUE</span>
                <span className="bg-[#10B981]/20 px-1.5 py-0.2 rounded font-bold">ROOT AUTH BYPASS</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
              <span>TARGET: NexaCorp SSO Gateway</span>
              <span className="text-[#10B981]">HTTP 200 OK</span>
            </div>
          </div>
        );

      case 5:
        // PRNG LCG State Predictor
        return (
          <div className="relative h-32 bg-[#050709] border border-[#242C37] rounded-lg p-3 overflow-hidden flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-b border-[#1F2732] pb-1.5">
              <span className="text-[#FF8533] font-bold">PRNG / LCG STATE SYNCHRONIZER</span>
              <span className="text-[#10B981]">TCP :5001 STREAM</span>
            </div>
            <div className="grid grid-cols-2 gap-2 my-auto text-[10px]">
              <div className="p-2 bg-[#0E1217] border border-[#232B36] rounded">
                <span className="text-[#8B949E] block">LCG FORMULA</span>
                <span className="text-[#FF8533] font-bold">X[n+1] = (aX[n] + c) % m</span>
              </div>
              <div className="p-2 bg-[#0E1217] border border-[#10B981]/40 rounded">
                <span className="text-[#8B949E] block">NEXT TOKEN STATE</span>
                <span className="text-[#10B981] font-bold">0x7F9B4D28A1 (100% MATCH)</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B949E] flex justify-between">
              <span>SEED SOLVER: 6/6 SAMPLES MATCHED</span>
              <span className="text-[#10B981]">PREDICTION READY</span>
            </div>
          </div>
        );

      case 6:
        // Binary Disassembly & Reverse Engineering
        return (
          <div className="relative h-32 bg-[#050709] border border-[#242C37] rounded-lg p-3 overflow-hidden flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-b border-[#1F2732] pb-1.5">
              <span className="text-[#FF8533] font-bold">ELF x86_64 DISASSEMBLER ENGINE</span>
              <span className="text-[#10B981]">GHIDRA / GDB</span>
            </div>
            <div className="bg-[#0E1217] border border-[#232B36] p-2 rounded text-[10px] space-y-0.5 my-auto">
              <div className="text-[#8B949E]">0x004011e0: <span className="text-[#FF9F43]">mov</span> eax, [rbp-0x4]</div>
              <div className="text-[#8B949E]">0x004011e4: <span className="text-[#FF6B00]">xor</span> eax, 0x5a5a</div>
              <div className="text-[#10B981]">0x004011e9: <span className="text-[#10B981] font-bold">cmp eax, 0x1337 ; KEY MATCH</span></div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#8B949E]">
              <span>TARGET BINARY: target.bin</span>
              <span className="text-[#10B981]">SERIAL GENERATOR READY</span>
            </div>
          </div>
        );

      case 7:
        // Linux SUID Privilege Escalation
        return (
          <div className="relative h-32 bg-[#050709] border border-[#242C37] rounded-lg p-3 overflow-hidden flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-b border-[#1F2732] pb-1.5">
              <span className="text-[#FF8533] font-bold">SUID PRIVILEGE ESCALATION MATRIX</span>
              <span className="text-[#EF4444] font-bold">ROOT COMPROMISE</span>
            </div>
            <div className="grid grid-cols-2 gap-2 my-auto text-[10px]">
              <div className="p-2 bg-[#0E1217] border border-[#232B36] rounded">
                <span className="text-[#8B949E] block">INITIAL SHELL</span>
                <span className="text-[#F5F5F5] font-bold">uid=1000(player)</span>
              </div>
              <div className="p-2 bg-[#0E1217] border border-[#EF4444]/40 rounded">
                <span className="text-[#EF4444] block">ESCALATED SHELL</span>
                <span className="text-[#10B981] font-bold">uid=0(root) # ROOT SHELL</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B949E] flex justify-between">
              <span>EXPLOIT: /usr/local/bin/nexa-sysbackup</span>
              <span className="text-[#10B981]">ROOT ACCESS GRANTED</span>
            </div>
          </div>
        );

      case 8:
        // Network Pivoting & SSRF Exfiltration
        return (
          <div className="relative h-32 bg-[#050709] border border-[#242C37] rounded-lg p-3 overflow-hidden flex flex-col justify-between font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#8B949E] border-b border-[#1F2732] pb-1.5">
              <span className="text-[#FF8533] font-bold">SSRF PIVOT & DB EXFILTRATION</span>
              <span className="text-[#10B981]">INTERNAL DATACENTER</span>
            </div>
            <div className="flex items-center justify-between gap-1 my-auto text-[10px]">
              <div className="p-1.5 bg-[#0E1217] border border-[#FF6B00]/40 rounded text-center flex-1">
                <span className="text-[#FF8533] block font-bold">ENTRY HOST</span>
                <span className="text-[#8B949E]">10.0.0.1:3000</span>
              </div>
              <span className="text-[#FF6B00] font-bold">➔</span>
              <div className="p-1.5 bg-[#0E1217] border border-[#F59E0B]/40 rounded text-center flex-1">
                <span className="text-[#F59E0B] block font-bold">METADATA</span>
                <span className="text-[#8B949E]">169.254.169.254</span>
              </div>
              <span className="text-[#FF6B00] font-bold">➔</span>
              <div className="p-1.5 bg-[#0E1217] border border-[#10B981]/50 rounded text-center flex-1">
                <span className="text-[#10B981] block font-bold">MYSQL CORE</span>
                <span className="text-[#8B949E]">10.0.2.10:3306</span>
              </div>
            </div>
            <div className="text-[10px] text-[#8B949E] flex justify-between">
              <span>PIVOT: SSRF HTTP TUNNEL</span>
              <span className="text-[#10B981]">CROWN JEWELS DUMPED</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-[#0C1015] border border-[#FF6B00]/50 rounded-xl shadow-[0_0_50px_rgba(255,107,0,0.25)] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Scanline & Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-[#FF9F43] to-[#10B981]"></div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#0E131A] border-b border-[#232B36] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FF6B00]/15 border border-[#FF6B00]/50 flex items-center justify-center font-mono font-black text-[#FF6B00] text-sm">
              0{stageNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-[#FF8533] uppercase tracking-wider">
                  COLLECTIVE ATTACK VECTOR
                </span>
                <span className="text-[#232B36]">|</span>
                <span className="font-mono text-[10px] text-[#8B949E]">
                  {stageConfig?.subsystemCode || `TARGET-0${stageNumber}`}
                </span>
              </div>
              <h2 className="font-sans text-base sm:text-lg font-bold text-[#F5F5F5] tracking-tight">
                {challengeTitle || stageConfig?.name || `Stage 0${stageNumber}`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-black text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-1 rounded border border-[#FF6B00]/30 hidden sm:inline-block">
              +{points || stageConfig?.points || 100} XP
            </span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#171D25] border border-[#232B36] text-[#8B949E] hover:text-[#F5F5F5] hover:border-[#FF6B00]/40 flex items-center justify-center font-mono text-sm transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target System & Vector Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
            <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
              <span className="text-[10px] text-[#8B949E] block mb-0.5">TARGET SUBSYSTEM</span>
              <span className="text-[#F5F5F5] font-bold text-xs">
                {stageConfig?.targetSystem || 'NexaCorp Internal Target Host'}
              </span>
            </div>
            <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
              <span className="text-[10px] text-[#8B949E] block mb-0.5">ATTACK VECTOR CLASSIFICATION</span>
              <span className="text-[#FF8533] font-bold text-xs">
                {stageConfig?.attackVector || domain || 'Tactical Breach Payload'}
              </span>
            </div>
          </div>

          {/* Graphical Attack Simulation Area */}
          <div>
            <div className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>ATTACK SCHEMATIC SIMULATION</span>
              <span className="text-[#10B981] font-mono">
                {progressPercent === 100 ? 'VECTOR PRIMED' : 'INITIALIZING...'}
              </span>
            </div>
            {renderVisualizer()}
          </div>

          {/* Telemetry Stream Log Window */}
          <div className="terminal-window border-[#232B36]">
            <div className="terminal-header justify-between py-1.5 px-3 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="terminal-dot bg-[#EF4444]"></span>
                <span className="terminal-dot bg-[#F59E0B]"></span>
                <span className="terminal-dot bg-[#10B981]"></span>
                <span className="text-[#8B949E] ml-1.5">BREACH TELEMETRY LOG</span>
              </div>
              <span className="text-[#FF8533] font-bold">
                {progressPercent}% COMPLETE
              </span>
            </div>

            <div className="p-3 font-mono text-[11px] space-y-1 h-28 overflow-y-auto bg-[#050709]">
              {logs.slice(0, logIndex).map((step, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 leading-relaxed ${
                    step.type === 'success'
                      ? 'text-[#10B981]'
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
              {logIndex < logs.length && (
                <div className="text-[#8B949E] flex items-center gap-1 animate-pulse">
                  <span className="text-[#FF6B00] font-bold">❯</span>
                  <span className="w-1.5 h-3 bg-[#FF6B00] inline-block"></span>
                </div>
              )}
            </div>
          </div>

          {/* Narrative Mission Objective */}
          {stageConfig?.storyBrief && (
            <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg">
              <div className="text-[10px] font-mono text-[#FF8533] uppercase font-bold mb-1">
                COLLECTIVE OPERATION DIRECTIVE
              </div>
              <p className="text-xs text-[#E2E8F0] font-sans leading-relaxed">
                {stageConfig.storyBrief}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="p-4 sm:p-5 bg-[#0E131A] border-t border-[#232B36] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              setLogIndex(0);
              setProgressPercent(10);
              setActiveVisualStep(0);
            }}
            className="btn-ghost text-xs w-full sm:w-auto text-[#8B949E] hover:text-[#F5F5F5]"
          >
            🔄 Replay Infiltration
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="btn-secondary text-xs w-full sm:w-auto px-4"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onProceed();
              }}
              className="btn-primary text-xs font-bold px-6 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <span>INFILTRATE TARGET</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
