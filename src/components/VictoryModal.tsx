'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  totalScore?: number;
}

export default function VictoryModal({
  isOpen,
  onClose,
  username,
  totalScore = 2100,
}: VictoryModalProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalContainer(document.body);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !portalContainer) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="victory-modal-title"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#030508]/85 backdrop-blur-md animate-fade-in select-none"
    >
      {/* Background Cyber Grid Accent */}
      <div className="absolute inset-0 bg-cyber-grid opacity-25 pointer-events-none" />

      {/* Floating Cyber Particle Flares */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#10B981]/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 bg-[#FF6B00]/15 rounded-full blur-[90px]" />
      </div>

      {/* Main Modal Card */}
      <div className="relative w-full max-w-2xl bg-[#090D13] border-2 border-[#10B981]/60 rounded-2xl shadow-[0_0_60px_rgba(16,185,129,0.35)] overflow-hidden text-center z-10 animate-scale-up">
        {/* Top Glowing Header Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-[#FF6B00] via-[#10B981] to-[#FF9F43] shadow-[0_0_16px_rgba(16,185,129,0.5)]" />

        <div className="p-6 sm:p-9 space-y-6">
          {/* Pulsing Status Badge */}
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] font-mono text-[11px] font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              Campaign 100% Breached • Full Access Granted
            </span>
          </div>

          {/* Glowing Animated Trophy / Crown Icon */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#10B981]/25 rounded-2xl blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#14231E] to-[#0D151D] border border-[#10B981]/60 flex items-center justify-center text-4xl shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              👑
            </div>
          </div>

          {/* Headline & Congratulations */}
          <div className="space-y-2">
            <h2
              id="victory-modal-title"
              className="text-2xl sm:text-4xl font-black font-sans tracking-tight text-[#F5F5F5] uppercase"
            >
              Congratulations, {username ? <span className="text-[#FF8533]">{username}</span> : 'Operative'}!
            </h2>
            <p className="text-sm sm:text-lg font-mono text-[#10B981] font-bold tracking-wide">
              YOU HAVE ACHIEVED FULL ACCESS TO NEXACORP COMPANY
            </p>
          </div>

          {/* Lore / Story Text */}
          <p className="text-xs sm:text-sm text-[#8B949E] font-sans leading-relaxed max-w-xl mx-auto">
            All eight defensive perimeters of NexaCorp have completely collapsed under your systematic penetration campaign. The internal isolated network has been pivoted, the central MySQL database exfiltrated, and root credentials established across the entire infrastructure.
          </p>

          {/* Tactical Clearance Dossier Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-left pt-1">
            <div className="p-3 bg-[#0D131C] border border-[#232B36] rounded-xl">
              <span className="text-[10px] text-[#8B949E] block uppercase">Perimeters</span>
              <span className="text-[#10B981] font-bold text-xs sm:text-sm">8 / 8 PWNED</span>
            </div>
            <div className="p-3 bg-[#0D131C] border border-[#232B36] rounded-xl">
              <span className="text-[10px] text-[#8B949E] block uppercase">Clearance</span>
              <span className="text-[#FF9F43] font-bold text-xs sm:text-sm">OMNI-ROOT</span>
            </div>
            <div className="p-3 bg-[#0D131C] border border-[#232B36] rounded-xl">
              <span className="text-[10px] text-[#8B949E] block uppercase">Database</span>
              <span className="text-[#10B981] font-bold text-xs sm:text-sm">EXFILTRATED</span>
            </div>
            <div className="p-3 bg-[#0D131C] border border-[#232B36] rounded-xl">
              <span className="text-[10px] text-[#8B949E] block uppercase">Max XP</span>
              <span className="text-[#FF8533] font-bold text-xs sm:text-sm">+{totalScore} XP</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              href="/dashboard/leaderboard"
              onClick={onClose}
              className="btn-primary w-full sm:w-auto px-6 py-3 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,107,0,0.3)]"
            >
              <span>🏆</span>
              <span>VIEW VICTORY LEADERBOARD</span>
            </Link>

            <Link
              href="/dashboard/challenges"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto px-6 py-3 text-xs font-mono font-bold flex items-center justify-center gap-2"
            >
              <span>🎯</span>
              <span>RETURN TO TARGET DECK</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 rounded-lg bg-[#141920] hover:bg-[#1E2633] text-[#8B949E] hover:text-[#F5F5F5] border border-[#232B36] text-xs font-mono font-bold transition-all cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </div>,
    portalContainer
  );
}

