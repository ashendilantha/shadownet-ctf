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

  const fetchProgress = async () => {
    try {
      const res = await axios.get('/api/scores/progress');
      setProgress(res.data);
    } catch {
      setProgress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const stagesList = Object.values(STAGE_CONFIGS);
  const solvedSet = new Set(progress?.solved_challenge_ids || []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#111417] border border-[#252A30] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#F5F5F5] flex items-center gap-2">
            <span className="text-[#FF6B00]">🗺️</span> CAMPAIGN PROGRESSION MAP
          </h1>
          <p className="font-mono text-xs text-[#8B949E] mt-1">
            Visual roadmap of your penetration journey through NexaCorp subnets
          </p>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <div className="bg-[#171B20] border border-[#252A30] px-4 py-2 rounded text-right">
            <span className="text-[10px] text-[#8B949E] block">TOTAL SCORE</span>
            <span className="text-lg font-bold text-[#FF6B00]">
              {progress?.total_points || 0} XP
            </span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] px-4 py-2 rounded text-right">
            <span className="text-[10px] text-[#8B949E] block">STAGES CLEARED</span>
            <span className="text-lg font-bold text-[#22D3EE]">
              {solvedSet.size}/8
            </span>
          </div>
        </div>
      </div>

      {/* Timeline / Progression Path */}
      <div className="space-y-4">
        {stagesList.map((stage) => {
          const isSolved = solvedSet.has(stage.stage);
          return (
            <div
              key={stage.stage}
              className={`bg-[#111417] border rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                isSolved
                  ? 'border-[#22C55E]/50 shadow-[0_0_15px_rgba(34,197,94,0.08)]'
                  : 'border-[#252A30]'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Stage Number Node */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm border flex-shrink-0 ${
                    isSolved
                      ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/50'
                      : 'bg-[#171B20] text-[#8B949E] border-[#252A30]'
                  }`}
                >
                  {isSolved ? '✓' : `0${stage.stage}`}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-[#22D3EE] font-bold">
                      {stage.domain}
                    </span>
                    <span className="text-[#8B949E] text-xs">•</span>
                    <span className="font-mono text-xs text-[#8B949E]">
                      {stage.type}
                    </span>
                  </div>

                  <h3 className="font-mono text-base font-bold text-[#F5F5F5]">
                    {stage.name}
                  </h3>

                  <p className="font-mono text-xs text-[#8B949E] mt-1">
                    {stage.accessGuide}
                  </p>
                </div>
              </div>

              {/* Action / Status */}
              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[#252A30]">
                <div className="font-mono text-right">
                  <span className="text-[10px] text-[#8B949E] block">REWARD</span>
                  <span className="text-sm font-bold text-[#FF6B00]">+{stage.points} XP</span>
                </div>

                <Link
                  href={`/dashboard/challenges/${stage.stage}`}
                  className={`px-4 py-2 rounded font-mono text-xs font-bold transition-all ${
                    isSolved
                      ? 'bg-[#171B20] text-[#22C55E] border border-[#22C55E]/30'
                      : 'bg-[#FF6B00] text-black hover:bg-[#FF9F43]'
                  }`}
                >
                  {isSolved ? 'REVIEW' : 'ATTACK →'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
