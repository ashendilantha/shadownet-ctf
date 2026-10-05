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
  const [unlockedHints, setUnlockedHints] = useState<Set<number>>(new Set());

  const fetchChallenge = async () => {
    try {
      const res = await axios.get(`/api/challenges/${id}`);
      setChallenge(res.data.challenge);
      setHints(res.data.hints || []);
    } catch (err) {
      console.error('Failed to load challenge:', err);
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
        INITIALIZING RECONNAISSANCE SUITE...
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="bg-[#111417] border border-[#252A30] rounded-xl p-8 text-center font-mono space-y-4">
        <h2 className="text-xl font-bold text-[#EF4444]">404 - TARGET NOT LOCATED</h2>
        <p className="text-xs text-[#8B949E]">The requested challenge payload does not exist in registry.</p>
        <Link
          href="/dashboard/challenges"
          className="inline-block px-4 py-2 bg-[#FF6B00] text-black font-bold text-xs rounded"
        >
          RETURN TO CHALLENGES
        </Link>
      </div>
    );
  }

  const stageConfig = STAGE_CONFIGS[challenge.stage_number];

  return (
    <div className="space-y-8">
      {/* Top Nav Breadcrumbs */}
      <div className="flex items-center gap-2 font-mono text-xs text-[#8B949E]">
        <Link href="/dashboard/challenges" className="text-[#22D3EE] hover:text-[#FF9F43]">
          ← CHALLENGES
        </Link>
        <span>/</span>
        <span className="text-[#F5F5F5]">STAGE 0{challenge.stage_number}</span>
      </div>

      {/* Challenge Hero Header */}
      <div className="bg-[#111417] border border-[#252A30] rounded-xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-[#171B20] text-[#22D3EE] border border-[#252A30]">
                STAGE 0{challenge.stage_number}
              </span>
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-[#FF9F43]/10 text-[#FF9F43] border border-[#FF9F43]/30">
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

          <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 bg-[#171B20] border border-[#252A30] rounded-lg p-4 min-w-[140px]">
            <span className="text-[10px] font-mono text-[#8B949E]">TARGET VALUE</span>
            <span className="font-mono text-2xl font-black text-[#FF6B00]">
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
          <div className="bg-[#111417] border border-[#252A30] rounded-xl p-6">
            <h3 className="font-mono text-sm font-bold text-[#F5F5F5] mb-3 flex items-center gap-2">
              <span className="text-[#FF6B00]">◈</span> MISSION OBJECTIVE & BRIEFING
            </h3>
            <p className="text-sm text-[#F5F5F5] leading-relaxed font-sans">
              {challenge.description}
            </p>
          </div>

          {/* Connection / Environment Information */}
          <div className="bg-[#111417] border border-[#252A30] rounded-xl p-6">
            <h3 className="font-mono text-sm font-bold text-[#F5F5F5] mb-3 flex items-center gap-2">
              <span className="text-[#22D3EE]">[SYS_ENV]</span> DEPLOYMENT & ACCESS TELEMETRY
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#090B0D] border border-[#252A30] rounded">
                <span className="text-[#8B949E] block mb-1">DELIVERY METHOD:</span>
                <span className="text-[#22D3EE] font-bold">
                  {challenge.delivery_method?.toUpperCase()}
                </span>
              </div>

              {stageConfig && (
                <>
                  <div className="p-3 bg-[#090B0D] border border-[#252A30] rounded">
                    <span className="text-[#8B949E] block mb-1">INTERACTION / PROMPT GUIDE:</span>
                    <span className="text-[#F5F5F5]">{stageConfig.accessGuide}</span>
                  </div>

                  <div className="p-3 bg-[#090B0D] border border-[#252A30] rounded">
                    <span className="text-[#8B949E] block mb-1">PORT / STATUS CHECK:</span>
                    <code className="text-[#22D3EE] font-bold">{stageConfig.statusCheck}</code>
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
          <div className="bg-[#111417] border border-[#252A30] rounded-xl p-6">
            <h3 className="font-mono text-sm font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
              <span className="text-[#FF9F43]">💡</span> TACTICAL INTEL & HINTS
            </h3>

            {hints.length === 0 ? (
              <p className="font-mono text-xs text-[#8B949E]">
                No hints available for this mission. Trust your tools and analysis.
              </p>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {hints.map((hint) => {
                  const isOpen = unlockedHints.has(hint.id);
                  return (
                    <div
                      key={hint.id}
                      className="bg-[#171B20] border border-[#252A30] rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleHint(hint.id)}
                        className="w-full text-left p-3 flex items-center justify-between hover:bg-[#252A30]/30 transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-[#F5F5F5]">
                          HINT 0{hint.hint_level}
                        </span>
                        <span className="text-[#FF9F43] text-[11px]">
                          {isOpen ? '▲ HIDE' : '▼ DECRYPT'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-3 pt-0 text-[#8B949E] border-t border-[#252A30]/50 bg-[#090B0D]">
                          <p className="text-[#F5F5F5] leading-relaxed pt-2">
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

          {/* Quick Rules Box */}
          <div className="bg-[#111417] border border-[#252A30] rounded-xl p-5 font-mono text-xs text-[#8B949E] space-y-2">
            <h4 className="text-[#F5F5F5] font-bold">⚠️ ENGAGEMENT RULES:</h4>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Attack only designated NexaCorp simulated subnets.</li>
              <li>Flag format is case-sensitive.</li>
              <li>Do not perform denial-of-service on challenge endpoints.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
