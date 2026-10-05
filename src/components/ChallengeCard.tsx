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
}

export default function ChallengeCard({ challenge }: { challenge: Challenge }) {
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
      className={`relative group bg-[#171B20] border rounded-lg p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 ${
        challenge.solved
          ? 'border-[#22C55E]/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]'
          : 'border-[#252A30] hover:border-[#FF6B00]/50 hover:shadow-[0_0_20px_rgba(255,107,0,0.15)]'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#111417] text-[#22D3EE] border border-[#252A30]">
              STAGE 0{challenge.stage_number}
            </span>
            <span
              className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded border ${getDifficultyColor(
                challenge.difficulty
              )}`}
            >
              {challenge.difficulty.toUpperCase()}
            </span>
          </div>

          {challenge.solved ? (
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#22C55E] bg-[#22C55E]/15 px-2.5 py-0.5 rounded-full border border-[#22C55E]/30">
              ✓ PWNED
            </span>
          ) : (
            <span className="font-mono text-xs font-semibold text-[#8B949E]">
              {getDeliveryBadge(challenge.delivery_method)}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-mono text-lg font-bold text-[#F5F5F5] group-hover:text-[#FF6B00] transition-colors mb-2">
          {challenge.name}
        </h3>

        {/* Domain Tag */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-xs text-[#22D3EE] bg-[#111417] px-2 py-0.5 rounded border border-[#252A30]">
            DOMAIN: {challenge.domain}
          </span>
        </div>

        {/* Description snippet */}
        {challenge.description && (
          <p className="text-sm text-[#8B949E] line-clamp-2 mb-4 leading-relaxed">
            {challenge.description}
          </p>
        )}
      </div>

      {/* Footer / CTA */}
      <div className="pt-4 border-t border-[#252A30] flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-[#8B949E]">BOUNTY</span>
          <span className="font-mono text-base font-bold text-[#FF6B00]">
            +{challenge.points} <span className="text-xs text-[#FF9F43]">XP</span>
          </span>
        </div>

        <Link
          href={`/dashboard/challenges/${challenge.id}`}
          className={`font-mono text-xs font-bold px-4 py-2 rounded transition-all flex items-center gap-1.5 ${
            challenge.solved
              ? 'bg-[#111417] text-[#22C55E] border border-[#22C55E]/40 hover:bg-[#22C55E]/10'
              : 'bg-[#FF6B00] text-black hover:bg-[#FF9F43] shadow-[0_0_10px_rgba(255,107,0,0.25)]'
          }`}
        >
          {challenge.solved ? 'REVIEW ⚡' : 'ENGAGE →'}
        </Link>
      </div>
    </div>
  );
}
