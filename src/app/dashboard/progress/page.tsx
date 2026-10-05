'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { STAGE_CONFIGS } from '@/lib/constants';

interface ProgressData {
  total_points: number;
  challenges_solved: number;
  solved_challenge_ids: number[];
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const fetchProgress = async () => {
    try {
      const res = await axios.get('/api/scores/progress');
      setProgress(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setAuthError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (authError) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-[#111417] border border-[#252A30] rounded-2xl p-8 text-center font-mono space-y-6">
        <div className="text-4xl text-[#FF6B00]">🔒</div>
        <h2 className="text-2xl font-bold text-[#F5F5F5]">AUTHENTICATION REQUIRED</h2>
        <p className="text-xs text-[#8B949E]">
          Log in to view your campaign progression roadmap and solved targets.
        </p>
        <Link href="/auth/login" className="btn-primary">
          LOGIN TO OPERATIVE ACCOUNT
        </Link>
      </div>
    );
  }

  const stagesList = Object.values(STAGE_CONFIGS);
  const solvedSet = new Set(progress?.solved_challenge_ids || []);

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="bg-[#111417] border border-[#252A30] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-mono text-2xl sm:text-4xl font-black text-[#F5F5F5] flex items-center gap-3">
            <span className="text-[#FF6B00]">🗺️</span> CAMPAIGN PROGRESSION MAP
          </h1>
          <p className="font-mono text-xs sm:text-sm text-[#8B949E] mt-1.5">
            Sequential attack roadmap across all 8 segmented NexaCorp security perimeters
          </p>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <div className="bg-[#171B20] border border-[#252A30] px-5 py-3 rounded-xl text-right">
            <span className="text-[10px] text-[#8B949E] block">TOTAL BOUNTY</span>
            <span className="text-xl sm:text-2xl font-black text-[#FF6B00]">
              {progress?.total_points || 0} <span className="text-xs text-[#FF9F43]">XP</span>
            </span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] px-5 py-3 rounded-xl text-right">
            <span className="text-[10px] text-[#8B949E] block">STAGES CLEARED</span>
            <span className="text-xl sm:text-2xl font-black text-[#22D3EE]">
              {solvedSet.size}/8
            </span>
          </div>
        </div>
      </div>

      {/* Sequential Timeline / Progression Path */}
      <div className="space-y-4">
        {stagesList.map((stage) => {
          const isSolved = solvedSet.has(stage.stage);
          // Stage 1 is unlocked, or stage N is unlocked if stage N-1 is solved
          const isUnlocked = stage.stage === 1 || solvedSet.has(stage.stage - 1);
          const isLocked = !isUnlocked;

          return (
            <div
              key={stage.stage}
              className={`cyber-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
                isSolved
                  ? 'border-[#22C55E]/50 shadow-[0_0_20px_rgba(34,197,94,0.1)] bg-[#111614]'
                  : isLocked
                  ? 'opacity-65 bg-[#0D1013]'
                  : 'border-[#FF6B00]/40 shadow-[0_0_20px_rgba(255,107,0,0.15)] bg-[#171B20]'
              }`}
            >
              <div className="flex items-start gap-4 sm:gap-6">
                {/* Node */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-base border flex-shrink-0 ${
                    isSolved
                      ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/60 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                      : isLocked
                      ? 'bg-[#111417] text-[#8B949E] border-[#252A30]'
                      : 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/60 shadow-[0_0_15px_rgba(255,107,0,0.3)]'
                  }`}
                >
                  {isSolved ? '✓' : isLocked ? '🔒' : `0${stage.stage}`}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs text-[#22D3EE] font-bold">
                      {stage.domain}
                    </span>
                    <span className="text-[#8B949E] text-xs">•</span>
                    <span className="font-mono text-xs text-[#8B949E]">
                      {stage.type}
                    </span>
                    <span className="text-[#8B949E] text-xs">•</span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                        isSolved
                          ? 'text-[#22C55E] bg-[#22C55E]/10'
                          : isLocked
                          ? 'text-[#8B949E] bg-[#111417]'
                          : 'text-[#FF6B00] bg-[#FF6B00]/10 font-bold'
                      }`}
                    >
                      {isSolved ? 'PWNED' : isLocked ? 'LOCKED' : 'AVAILABLE TARGET'}
                    </span>
                  </div>

                  <h3 className="font-mono text-base sm:text-lg font-bold text-[#F5F5F5]">
                    {stage.name}
                  </h3>

                  <p className="font-mono text-xs text-[#8B949E] mt-1 leading-relaxed">
                    {stage.accessGuide}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end pt-4 md:pt-0 border-t md:border-t-0 border-[#252A30]">
                <div className="font-mono text-right">
                  <span className="text-[10px] text-[#8B949E] block">BOUNTY</span>
                  <span className="text-base font-bold text-[#FF6B00]">+{stage.points} XP</span>
                </div>

                {isLocked ? (
                  <button
                    disabled
                    className="font-mono text-xs px-5 py-2.5 rounded-lg bg-[#111417] text-[#8B949E] border border-[#252A30] cursor-not-allowed whitespace-nowrap"
                  >
                    🔒 LOCKED
                  </button>
                ) : (
                  <Link
                    href={`/dashboard/challenges/${stage.stage}`}
                    className={`font-mono text-xs font-bold px-6 py-2.5 rounded-lg transition-all whitespace-nowrap ${
                      isSolved
                        ? 'btn-secondary text-[#22C55E] border-[#22C55E]/40 hover:text-[#22C55E]'
                        : 'btn-primary'
                    }`}
                  >
                    {isSolved ? 'REVIEW MISSION ⚡' : 'ATTACK STAGE →'}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
