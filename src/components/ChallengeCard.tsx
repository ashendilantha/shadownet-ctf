import React from 'react';
import Link from 'next/link';

export interface Challenge {
  id: number;
  name: string;
  domain: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  description?: string;
  points: number;
  delivery_method?: string;
  stage_number: number;
  solved?: boolean;
  unlocked?: boolean;
  locked?: boolean;
  required_stage?: number | null;
}

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const isLocked = challenge.locked ?? (!challenge.unlocked && challenge.stage_number > 1);
  const isSolved = challenge.solved;

  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30';
      case 'medium':
        return 'text-[#FF9F43] bg-[#FF9F43]/10 border-[#FF9F43]/30';
      case 'hard':
        return 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30';
      default:
        return 'text-[#8B949E] bg-[#8B949E]/10 border-[#8B949E]/30';
    }
  };

  const getDeliveryBadge = (method?: string) => {
    switch (method?.toLowerCase()) {
      case 'static':
        return '📁 STATIC WEB';
      case 'docker':
        return '🐳 DOCKER';
      case 'vm':
      case 'vms':
        return '🖥️ VM CLUSTER';
      default:
        return '⚡ SERVICE';
    }
  };

  return (
    <div
      className={`cyber-card p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
        isSolved
          ? 'border-[#22C55E]/60 shadow-[0_0_25px_rgba(34,197,94,0.15)] bg-gradient-to-b from-[#111915] to-[#0E1210]'
          : isLocked
          ? 'border-[#252A30] opacity-75 bg-[#0B0E11]'
          : 'border-[#FF6B00]/60 shadow-[0_0_25px_rgba(255,107,0,0.2)] bg-[#171B20] hover:border-[#FF6B00]'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-black px-3 py-1 rounded-md bg-[#090B0D] text-[#22D3EE] border border-[#252A30]">
              STAGE 0{challenge.stage_number}
            </span>
            <span
              className={`font-mono text-xs font-bold px-2.5 py-1 rounded-md border ${getDifficultyColor(
                challenge.difficulty
              )}`}
            >
              {challenge.difficulty.toUpperCase()}
            </span>
          </div>

          {/* Status Badge */}
          {isSolved ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#22C55E] bg-[#22C55E]/15 px-3 py-1 rounded-full border border-[#22C55E]/40">
              ✓ PWNED
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-[#8B949E] bg-[#111417] px-3 py-1 rounded-md border border-[#252A30]">
              🔒 LOCKED
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#FF6B00] bg-[#FF6B00]/15 px-3 py-1 rounded-md border border-[#FF6B00]/40 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>
              ACTIVE TARGET
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`font-mono text-xl sm:text-2xl font-black mb-3 ${
            isSolved
              ? 'text-[#F5F5F5]'
              : isLocked
              ? 'text-[#8B949E]'
              : 'text-[#F5F5F5] group-hover:text-[#FF6B00]'
          }`}
        >
          {challenge.name}
        </h3>

        {/* Domain Tag */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="font-mono text-xs text-[#22D3EE] bg-[#090B0D] px-3 py-1 rounded-md border border-[#252A30] font-semibold">
            DOMAIN: {challenge.domain}
          </span>
          <span className="font-mono text-xs text-[#8B949E]">
            {getDeliveryBadge(challenge.delivery_method)}
          </span>
        </div>

        {/* Description or Locked Message */}
        {isLocked ? (
          <div className="p-4 my-2 bg-[#090B0D] border border-[#252A30] rounded-xl text-xs sm:text-sm font-mono text-[#8B949E] flex items-center gap-3">
            <span className="text-lg">🔒</span>
            <span>
              Requires solving <strong className="text-[#F5F5F5]">Stage 0{challenge.required_stage}</strong> to unlock this target.
            </span>
          </div>
        ) : (
          challenge.description && (
            <p className="text-sm text-[#8B949E] line-clamp-3 mb-6 leading-relaxed font-sans">
              {challenge.description}
            </p>
          )
        )}
      </div>

      {/* Footer / CTA */}
      <div className="pt-5 mt-3 border-t border-[#252A30] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-mono text-[#8B949E] uppercase tracking-wider">BOUNTY REWARD</span>
          <span className="font-mono text-xl sm:text-2xl font-black text-[#FF6B00]">
            +{challenge.points} <span className="text-xs text-[#FF9F43]">XP</span>
          </span>
        </div>

        {isLocked ? (
          <button
            disabled
            className="font-mono text-xs font-semibold px-5 py-3 rounded-lg bg-[#111417] text-[#8B949E] border border-[#252A30] cursor-not-allowed"
          >
            🔒 LOCKED
          </button>
        ) : (
          <Link
            href={`/dashboard/challenges/${challenge.id}`}
            className={`font-mono text-xs sm:text-sm font-bold px-6 py-3 rounded-lg transition-all flex items-center gap-2 ${
              isSolved
                ? 'btn-secondary text-[#22C55E] border-[#22C55E]/40 hover:text-[#22C55E]'
                : 'btn-primary'
            }`}
          >
            {isSolved ? 'REVIEW MISSION ⚡' : 'ENGAGE TARGET →'}
          </Link>
        )}
      </div>
    </div>
  );
}
