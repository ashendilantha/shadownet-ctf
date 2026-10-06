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
        return 'Static web';
      case 'docker':
        return 'Docker';
      case 'vm':
      case 'vms':
        return 'VM cluster';
      default:
        return 'Service';
    }
  };

  return (
    <div
      className={`cyber-card p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-200 group ${
        isSolved
          ? 'border-[#22C55E]/40 bg-[#111614]'
          : isLocked
          ? 'border-[#252A30] opacity-65 bg-[#0C0F12]'
          : 'border-[#252A30] hover:border-[#FF6B00]/60 bg-[#171B20]'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#090B0D] text-[#22D3EE] border border-[#252A30]">
              Stage 0{challenge.stage_number}
            </span>
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyColor(
                challenge.difficulty
              )}`}
            >
              {challenge.difficulty}
            </span>
          </div>

          {/* Status Badge */}
          {isSolved ? (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#22C55E] bg-[#22C55E]/15 px-2.5 py-0.5 rounded-full border border-[#22C55E]/30">
              Solved
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-[#8B949E] bg-[#111417] px-2 py-0.5 rounded border border-[#252A30]">
              Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#FF6B00] bg-[#FF6B00]/10 px-2.5 py-0.5 rounded-full border border-[#FF6B00]/30">
              Available
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className={`font-sans text-base font-semibold mb-2 leading-snug transition-colors ${
            isSolved
              ? 'text-[#F5F5F5]'
              : isLocked
              ? 'text-[#8B949E]'
              : 'text-[#F5F5F5] group-hover:text-[#FF6B00]'
          }`}
        >
          {challenge.name}
        </h3>

        {/* Domain & Delivery Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5">
          <span className="font-mono text-[11px] text-[#22D3EE] bg-[#090B0D] px-2 py-0.5 rounded border border-[#252A30] font-medium">
            {challenge.domain}
          </span>
          <span className="font-mono text-[11px] text-[#8B949E] bg-[#090B0D] px-2 py-0.5 rounded border border-[#252A30]">
            {getDeliveryBadge(challenge.delivery_method)}
          </span>
        </div>

        {/* Description or Locked Message */}
        {isLocked ? (
          <div className="p-3 my-2 bg-[#090B0D] border border-[#252A30] rounded-lg text-xs font-mono text-[#8B949E] flex items-center gap-2.5">
            <span className="text-sm">🔒</span>
            <span>
              Clear stage <strong className="text-[#F5F5F5">0{challenge.required_stage}</strong> to unlock.
            </span>
          </div>
        ) : (
          challenge.description && (
            <p className="text-xs text-[#8B949E] line-clamp-2 mb-4 leading-relaxed font-sans">
              {challenge.description}
            </p>
          )
        )}
      </div>

      {/* Footer / CTA */}
      <div className="pt-3.5 mt-2 border-t border-[#252A30] flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-[#8B949E]">Points</span>
          <span className="font-mono text-base font-black text-[#FF6B00] leading-tight">
            +{challenge.points} <span className="text-[11px] font-bold text-[#FF9F43]">XP</span>
          </span>
        </div>

        {isLocked ? (
          <button
            disabled
            className="btn-secondary"
          >
            Locked
          </button>
        ) : (
          <Link
            href={`/dashboard/challenges/${challenge.id}`}
            className={`text-sm font-medium ${
              isSolved
                ? 'btn-secondary text-[#22C55E] border-[#22C55E]/40 hover:text-[#22C55E]'
                : 'btn-primary'
            }`}
          >
            {isSolved ? 'Review' : 'Open challenge'}
          </Link>
        )}
      </div>
    </div>
  );
}
