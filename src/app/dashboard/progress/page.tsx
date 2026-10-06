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
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number } };
      if (errorObj.response?.status === 401) {
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
      <div className="auth-container">
        <div className="max-w-md w-full cyber-panel rounded-xl p-6 sm:p-8 text-center space-y-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-xl bg-[#171B20] border border-[#FF6B00]/40 flex items-center justify-center text-2xl mx-auto text-[#FF6B00] shadow-[0_0_12px_rgba(255,107,0,0.2)]">
            🔒
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#FF6B00] bg-[#FF6B00]/15 px-2.5 py-0.5 rounded-full border border-[#FF6B00]/30 inline-block font-mono">
              Sign in required
            </span>
            <h2 className="text-2xl font-bold font-sans text-[#F5F5F5] tracking-tight">
              View your progress
            </h2>
            <p className="text-xs text-[#8B949E] leading-relaxed font-sans max-w-xs mx-auto">
              Sign in to see completed stages and points.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <Link href="/auth/login" className="btn-primary w-full sm:w-auto h-10 px-6 text-xs font-bold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stagesList = Object.values(STAGE_CONFIGS);
  const solvedSet = new Set(progress?.solved_challenge_ids || []);

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-[#111417] border border-[#232830] rounded-xl p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] font-sans flex items-center gap-2.5">
            Progress
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#8B949E] mt-1">
            Track completed stages and points.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 font-mono flex-shrink-0">
          <div className="bg-[#171B20] border border-[#232830] px-4 py-2.5 rounded-lg text-right">
            <span className="text-[10px] text-[#8B949E] block">Points</span>
            <span className="text-lg sm:text-xl font-black text-[#FF6B00]">
              {progress?.total_points || 0} <span className="text-xs text-[#FF9F43]">XP</span>
            </span>
          </div>
          <div className="bg-[#171B20] border border-[#232830] px-4 py-2.5 rounded-lg text-right">
            <span className="text-[10px] text-[#8B949E] block">Stages</span>
            <span className="text-lg sm:text-xl font-black text-[#22D3EE]">
              {solvedSet.size}/8
            </span>
          </div>
        </div>
      </div>

      {/* Sequential Timeline / Progression Path */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-20 font-mono text-xs text-[#8B949E]">
            <span className="inline-block animate-spin mr-2">⚙️</span>
            Loading progress...
          </div>
        ) : (
          stagesList.map((stage) => {
            const isSolved = solvedSet.has(stage.stage);
            const isUnlocked = stage.stage === 1 || solvedSet.has(stage.stage - 1);
            const isLocked = !isUnlocked;

            return (
              <div
                key={stage.stage}
                className={`cyber-card p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                  isSolved
                    ? 'border-[#22C55E]/40 bg-[#111614]'
                    : isLocked
                    ? 'opacity-65 bg-[#0C0F12]'
                    : 'border-[#FF6B00]/30 bg-[#15191E]'
                }`}
              >
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {/* Node */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-black text-sm border flex-shrink-0 ${
                      isSolved
                        ? 'bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                        : isLocked
                        ? 'bg-[#111417] text-[#8B949E] border-[#232830]'
                        : 'bg-[#FF6B00]/15 text-[#FF6B00] border-[#FF6B00]/50 shadow-[0_0_10px_rgba(255,107,0,0.2)]'
                    }`}
                  >
                    {`0${stage.stage}`}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-[#22D3EE] font-bold">
                        {stage.domain}
                      </span>
                      <span className="text-[#232830]">•</span>
                      <span className="font-mono text-[11px] text-[#8B949E]">
                        {stage.type}
                      </span>
                      <span className="text-[#232830]">•</span>
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                          isSolved
                            ? 'text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/30'
                            : isLocked
                            ? 'text-[#8B949E] bg-[#111417] border border-[#232830]'
                            : 'text-[#FF6B00] bg-[#FF6B00]/10 border border-[#FF6B00]/30'
                        }`}
                      >
                        {isSolved ? 'Solved' : isLocked ? 'Locked' : 'Available'}
                      </span>
                    </div>

                    <h3 className="font-sans text-sm sm:text-base font-bold text-[#F5F5F5]">
                      {stage.name}
                    </h3>

                    <p className="font-sans text-xs text-[#8B949E] mt-0.5 leading-relaxed">
                      {stage.accessGuide}
                    </p>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#232830] flex-shrink-0">
                  <div className="font-mono text-right">
                    <span className="text-[10px] text-[#8B949E] block">Points</span>
                    <span className="text-sm sm:text-base font-bold text-[#FF6B00]">+{stage.points} XP</span>
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
                      href={`/dashboard/challenges/${stage.stage}`}
                      className={`text-sm font-medium whitespace-nowrap ${
                        isSolved
                          ? 'btn-secondary text-[#22C55E] border-[#22C55E]/40 hover:text-[#22C55E]'
                          : 'btn-primary'
                      }`}
                    >
                      {isSolved ? 'Review' : 'Open stage'}
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
