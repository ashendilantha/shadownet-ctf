'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import axios from 'axios';
import FlagSubmitForm from '@/components/FlagSubmitForm';
import { STAGE_CONFIGS } from '@/lib/constants';

interface Hint {
  id: number;
  hint_level: number;
  hint_text: string;
  point_penalty: number;
}

interface ChallengeDetail {
  id: number;
  name: string;
  domain: string;
  difficulty: string;
  description: string;
  points: number;
  delivery_method: string;
  stage_number: number;
  solved?: boolean;
  locked?: boolean;
  required_stage?: number;
}

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [hints, setHints] = useState<Hint[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedMsg, setLockedMsg] = useState('');
  const [unlockedHints, setUnlockedHints] = useState<Set<number>>(new Set());

  const fetchChallenge = async () => {
    try {
      const res = await axios.get(`/api/challenges/${id}`);
      setChallenge(res.data.challenge);
      setHints(res.data.hints || []);
      setIsLocked(false);
    } catch (err: any) {
      if (err.response?.status === 403 && err.response?.data?.locked) {
        setIsLocked(true);
        setLockedMsg(err.response?.data?.error || 'Stage locked.');
        setChallenge(err.response?.data?.challenge || null);
      } else {
        setChallenge(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  const toggleHint = (hintId: number) => {
    setUnlockedHints((prev) => {
      const next = new Set(prev);
      if (next.has(hintId)) next.delete(hintId);
      else next.add(hintId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="text-center py-24 font-mono text-sm text-[#8B949E]">
        <span className="inline-block animate-spin mr-2">⚙️</span>
        INITIALIZING RECONNAISSANCE TELEMETRY...
      </div>
    );
  }

  // Locked Screen State
  if (isLocked) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-[#111417] border border-[#252A30] rounded-2xl p-8 sm:p-12 text-center font-mono space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="w-20 h-20 rounded-2xl bg-[#171B20] border border-[#EF4444]/40 flex items-center justify-center text-4xl mx-auto text-[#EF4444] shadow-[0_0_25px_rgba(239,68,68,0.2)]">
          🔒
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-[#EF4444] bg-[#EF4444]/10 px-3 py-1 rounded-full border border-[#EF4444]/30">
            ACCESS RESTRICTED
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5]">
            STAGE 0{challenge?.stage_number || id} IS LOCKED
          </h2>
          <p className="text-xs sm:text-sm text-[#8B949E] max-w-md mx-auto leading-relaxed">
            {lockedMsg || 'You must conquer the previous stage before accessing this attack vector.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard/challenges" className="btn-primary w-full sm:w-auto">
            ← RETURN TO ACTIVE MISSIONS
          </Link>
          <Link href="/dashboard/progress" className="btn-secondary w-full sm:w-auto">
            VIEW CAMPAIGN MAP
          </Link>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-md mx-auto my-16 bg-[#111417] border border-[#252A30] rounded-2xl p-8 text-center font-mono space-y-4">
        <h2 className="text-xl font-bold text-[#EF4444]">404 - TARGET NOT FOUND</h2>
        <p className="text-xs text-[#8B949E]">The requested challenge payload does not exist in registry.</p>
        <Link href="/dashboard/challenges" className="btn-primary">
          RETURN TO CHALLENGES
        </Link>
      </div>
    );
  }

  const stageConfig = STAGE_CONFIGS[challenge.stage_number];

  return (
    <div className="w-full space-y-8">
      {/* Top Nav Breadcrumbs */}
      <div className="flex items-center gap-2 font-mono text-xs text-[#8B949E]">
        <Link href="/dashboard/challenges" className="text-[#22D3EE] hover:text-[#FF9F43]">
          ← CHALLENGES
        </Link>
        <span>/</span>
        <span className="text-[#F5F5F5]">STAGE 0{challenge.stage_number}</span>
      </div>

      {/* Challenge Hero Header */}
      <div className="bg-[#111417] border border-[#252A30] rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#171B20] text-[#22D3EE] border border-[#252A30]">
                STAGE 0{challenge.stage_number}
              </span>
              <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-[#FF9F43]/10 text-[#FF9F43] border border-[#FF9F43]/30">
                {challenge.difficulty.toUpperCase()}
              </span>
              <span className="font-mono text-xs text-[#8B949E]">
                DOMAIN: <strong className="text-[#F5F5F5]">{challenge.domain}</strong>
              </span>
            </div>

            <h1 className="font-mono text-2xl sm:text-4xl font-black text-[#F5F5F5] mb-2">
              {challenge.name}
            </h1>
          </div>

          <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 bg-[#171B20] border border-[#252A30] rounded-xl p-5 min-w-[160px]">
            <span className="text-[10px] font-mono text-[#8B949E]">TARGET VALUE</span>
            <span className="font-mono text-2xl sm:text-3xl font-black text-[#FF6B00]">
              +{challenge.points} <span className="text-xs text-[#FF9F43]">XP</span>
            </span>
            {challenge.solved && (
              <span className="font-mono text-xs font-bold text-[#22C55E]">✓ COMPLETED</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Briefing & Target Access */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mission Briefing */}
          <div className="bg-[#111417] border border-[#252A30] rounded-2xl p-6 sm:p-8">
            <h3 className="font-mono text-sm font-bold text-[#F5F5F5] mb-3 flex items-center gap-2">
              <span className="text-[#FF6B00]">◈</span> MISSION OBJECTIVE & BRIEFING
            </h3>
            <p className="text-sm sm:text-base text-[#F5F5F5] leading-relaxed font-sans">
              {challenge.description}
            </p>
          </div>

          {/* Connection / Environment Information */}
          <div className="bg-[#111417] border border-[#252A30] rounded-2xl p-6 sm:p-8">
            <h3 className="font-mono text-sm font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
              <span className="text-[#22D3EE]">[SYS_ENV]</span> DEPLOYMENT & ACCESS TELEMETRY
            </h3>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 bg-[#090B0D] border border-[#252A30] rounded-xl">
                <span className="text-[#8B949E] block mb-1">DELIVERY INFRASTRUCTURE:</span>
                <span className="text-[#22D3EE] font-bold text-sm">
                  {challenge.delivery_method?.toUpperCase()}
                </span>
              </div>

              {stageConfig && (
                <>
                  <div className="p-4 bg-[#090B0D] border border-[#252A30] rounded-xl">
                    <span className="text-[#8B949E] block mb-1">INTERACTION / PROMPT GUIDE:</span>
                    <span className="text-[#F5F5F5] leading-relaxed">{stageConfig.accessGuide}</span>
                  </div>

                  <div className="p-4 bg-[#090B0D] border border-[#252A30] rounded-xl">
                    <span className="text-[#8B949E] block mb-1">STATUS CHECK COMMAND:</span>
                    <code className="text-[#22D3EE] font-bold text-sm bg-[#111417] px-2.5 py-1 rounded border border-[#252A30] inline-block">
                      {stageConfig.statusCheck}
                    </code>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Flag Submission Form */}
          <FlagSubmitForm
            challengeId={challenge.id}
            solved={challenge.solved}
            onSuccess={fetchChallenge}
          />
        </div>

        {/* Right Column: Hints & Intel */}
        <div className="space-y-6">
          <div className="bg-[#111417] border border-[#252A30] rounded-2xl p-6">
            <h3 className="font-mono text-sm font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
              <span className="text-[#FF9F43]">💡</span> TACTICAL INTEL & HINTS
            </h3>

            {hints.length === 0 ? (
              <p className="font-mono text-xs text-[#8B949E]">
                No hints available for this mission. Rely on your reconnaissance tools.
              </p>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {hints.map((hint) => {
                  const isOpen = unlockedHints.has(hint.id);
                  return (
                    <div
                      key={hint.id}
                      className="bg-[#171B20] border border-[#252A30] rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleHint(hint.id)}
                        className="w-full text-left p-4 flex items-center justify-between hover:bg-[#252A30]/30 transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-[#F5F5F5]">
                          HINT 0{hint.hint_level}
                        </span>
                        <span className="text-[#FF9F43] text-[11px] font-bold">
                          {isOpen ? '▲ CONCEAL' : '▼ DECRYPT HINT'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-0 text-[#8B949E] border-t border-[#252A30]/50 bg-[#090B0D]">
                          <p className="text-[#F5F5F5] leading-relaxed pt-3">
                            {hint.hint_text}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Engagement Protocol */}
          <div className="bg-[#111417] border border-[#252A30] rounded-2xl p-6 font-mono text-xs text-[#8B949E] space-y-3">
            <h4 className="text-[#F5F5F5] font-bold">⚠️ ENGAGEMENT PROTOCOL:</h4>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] leading-relaxed">
              <li>Target designated simulated subnets only.</li>
              <li>Flag format is case-sensitive: <code className="text-[#FF6B00]">SHADOWNET{'{...}'}</code>.</li>
              <li>Clearing this stage automatically unlocks the next stage.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
