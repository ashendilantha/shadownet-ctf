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
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { locked?: boolean; error?: string; challenge?: ChallengeDetail } } };
      if (errorObj.response?.status === 403 && errorObj.response?.data?.locked) {
        setIsLocked(true);
        setLockedMsg(errorObj.response?.data?.error || 'Stage locked.');
        setChallenge(errorObj.response?.data?.challenge || null);
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
      <div className="text-center py-20 font-mono text-xs text-[#8B949E]">
        <span className="inline-block animate-spin mr-2">⚙️</span>
        Loading challenge...
      </div>
    );
  }

  // Locked Screen State
  if (isLocked) {
    return (
      <div className="max-w-xl mx-auto my-8 cyber-panel rounded-xl p-6 sm:p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-lg bg-[#171B20] border border-[#EF4444]/30 flex items-center justify-center text-2xl mx-auto text-[#EF4444]">
          🔒
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/10 px-2.5 py-0.5 rounded-full border border-[#EF4444]/30 inline-block">
            Locked
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-sans text-[#F5F5F5]">
            Stage 0{challenge?.stage_number || id} is Locked
          </h2>
          <p className="text-xs text-[#8B949E] max-w-sm mx-auto leading-relaxed font-sans">
            {lockedMsg || 'Complete the previous stage to unlock this challenge.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link href="/dashboard/challenges" className="btn-primary w-full sm:w-auto h-10 px-5 text-xs font-bold">
            Challenges
          </Link>
          <Link href="/dashboard/progress" className="btn-secondary w-full sm:w-auto h-10 px-5 text-xs font-bold">
            Progress
          </Link>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-md mx-auto my-12 bg-[#111417] border border-[#232830] rounded-xl p-6 text-center font-mono space-y-4">
        <h2 className="text-lg font-bold text-[#EF4444] font-sans">404 - Target Not Found</h2>
        <p className="text-xs text-[#8B949E]">The requested challenge payload does not exist in the registry.</p>
        <Link href="/dashboard/challenges" className="btn-primary text-xs py-2 px-4">
          RETURN TO CHALLENGES
        </Link>
      </div>
    );
  }

  const stageConfig = STAGE_CONFIGS[challenge.stage_number];

  return (
    <div className="w-full space-y-6">
      {/* Top Nav Breadcrumbs */}
      <div className="flex items-center gap-2 font-mono text-xs text-[#8B949E]">
        <Link href="/dashboard/challenges" className="text-[#22D3EE] hover:text-[#FF9F43] transition-colors">
          Challenges
        </Link>
        <span className="text-[#232830]">/</span>
        <span className="text-[#F5F5F5] font-semibold">STAGE 0{challenge.stage_number}</span>
      </div>

      {/* Challenge Hero Header */}
          <div className="bg-[#111417] border border-[#232830] rounded-xl p-5 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#171B20] text-[#22D3EE] border border-[#232830]">
                Stage 0{challenge.stage_number}
              </span>
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FF9F43]/10 text-[#FF9F43] border border-[#FF9F43]/30">
                {challenge.difficulty}
              </span>
              <span className="font-mono text-[11px] text-[#8B949E]">
                <strong className="text-[#F5F5F5]">{challenge.domain}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] font-sans tracking-tight">
              {challenge.name}
            </h1>
          </div>

          <div className="flex md:flex-col items-end justify-between md:justify-center gap-1.5 bg-[#171B20] border border-[#232830] rounded-lg p-3.5 sm:p-4 min-w-[140px] flex-shrink-0">
            <span className="text-sm font-mono text-[#8B949E]">Points</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#FF6B00]">
              +{challenge.points} <span className="text-xs font-bold text-[#FF9F43]">XP</span>
            </span>
            {challenge.solved && (
              <span className="font-mono text-sm font-medium text-[#22C55E]">Solved</span>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Briefing, Environment, & Flag Submission */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mission Briefing */}
          <div className="cyber-panel p-5 sm:p-6">
            <h3 className="font-sans text-base font-semibold text-[#F5F5F5] mb-2.5">
              Briefing
            </h3>
            <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed font-sans">
              {challenge.description}
            </p>
          </div>

          {/* Connection / Environment Information */}
          <div className="cyber-panel p-5 sm:p-6">
            <h3 className="font-sans text-base font-semibold text-[#F5F5F5] mb-3.5">
              Access details
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 bg-[#090B0D] border border-[#232830] rounded-lg">
                <span className="text-xs text-[#8B949E] block mb-0.5">Delivery</span>
                <span className="text-[#22D3EE] font-semibold text-sm">
                  {challenge.delivery_method}
                </span>
              </div>

              {stageConfig && (
                <>
                  <div className="p-3.5 bg-[#090B0D] border border-[#232830] rounded-lg">
                    <span className="text-xs text-[#8B949E] block mb-0.5">How to connect</span>
                    <span className="text-[#F5F5F5] text-xs leading-relaxed font-sans">{stageConfig.accessGuide}</span>
                  </div>

                  <div className="p-3.5 bg-[#090B0D] border border-[#232830] rounded-lg">
                    <span className="text-xs text-[#8B949E] block mb-1">Status command</span>
                    <code className="text-[#22D3EE] font-bold text-xs bg-[#111417] px-2.5 py-1 rounded border border-[#232830] inline-block font-mono">
                      {stageConfig.statusCheck}
                    </code>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Downloadable Assets Deck for Stage 2 */}
          {challenge.stage_number === 2 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232830] pb-3">
                <div>
                  <h3 className="font-sans text-base font-semibold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">📦</span> Intercepted Evidence Downloads
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    Download recovered audio feeds and image exhibits for offline forensic analysis.
                  </p>
                </div>
                <a
                  href="/downloads/stage2/stage2-covert-transmissions.zip"
                  download="stage2-covert-transmissions.zip"
                  className="btn-primary text-xs font-mono font-bold px-4 py-2 flex items-center gap-2 text-center justify-center flex-shrink-0"
                >
                  ⚡ DOWNLOAD ALL (.ZIP)
                </a>
              </div>

              {/* Individual File Download Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#090B0D] border border-[#232830] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[#F5F5F5] font-bold">whistleblower.jpg</div>
                    <div className="text-[10px] text-[#8B949E]">Evidence Photograph (58 KB)</div>
                  </div>
                  <a
                    href="/downloads/stage2/whistleblower.jpg"
                    download
                    className="px-2.5 py-1 rounded bg-[#171B20] hover:bg-[#232830] text-[#22D3EE] border border-[#232830] text-[11px]"
                  >
                    GET FILE
                  </a>
                </div>

                <div className="p-3 bg-[#090B0D] border border-[#232830] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[#F5F5F5] font-bold">intercept_alpha_09.wav</div>
                    <div className="text-[10px] text-[#22C55E]">Primary Intercept (573 KB)</div>
                  </div>
                  <a
                    href="/downloads/stage2/intercept_alpha_09.wav"
                    download
                    className="px-2.5 py-1 rounded bg-[#171B20] hover:bg-[#232830] text-[#22D3EE] border border-[#232830] text-[11px]"
                  >
                    GET FILE
                  </a>
                </div>

                <div className="p-3 bg-[#090B0D] border border-[#232830] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[#F5F5F5] font-bold">intercept_beta_02.wav</div>
                    <div className="text-[10px] text-[#8B949E]">Decoy Channel (441 KB)</div>
                  </div>
                  <a
                    href="/downloads/stage2/intercept_beta_02.wav"
                    download
                    className="px-2.5 py-1 rounded bg-[#171B20] hover:bg-[#232830] text-[#22D3EE] border border-[#232830] text-[11px]"
                  >
                    GET FILE
                  </a>
                </div>

                <div className="p-3 bg-[#090B0D] border border-[#232830] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="text-[#F5F5F5] font-bold">intercept_gamma_07.wav</div>
                    <div className="text-[10px] text-[#8B949E]">Decoy Channel (441 KB)</div>
                  </div>
                  <a
                    href="/downloads/stage2/intercept_gamma_07.wav"
                    download
                    className="px-2.5 py-1 rounded bg-[#171B20] hover:bg-[#232830] text-[#22D3EE] border border-[#232830] text-[11px]"
                  >
                    GET FILE
                  </a>
                </div>
              </div>

              {/* CLI Command Helper */}
              <div className="p-3 bg-[#090B0D] border border-[#232830] rounded-lg text-xs font-mono space-y-1">
                <span className="text-[#8B949E] block text-[11px]">Direct Terminal Download (Port 5000):</span>
                <code className="text-[#22D3EE] block">wget http://localhost:5000/whistleblower.jpg</code>
                <code className="text-[#22D3EE] block">wget http://localhost:5000/intercept_alpha_09.wav</code>
              </div>
            </div>
          )}

          {/* Flag Submission Form */}
          <FlagSubmitForm
            challengeId={challenge.id}
            solved={challenge.solved}
            onSuccess={fetchChallenge}
          />
        </div>

        {/* Right Column: Tactical Hints & Engagement Protocol */}
        <div className="space-y-6">
          {/* Tactical Hints */}
          <div className="cyber-panel p-5">
            <h3 className="font-sans text-base font-semibold text-[#F5F5F5] mb-3">
              Hints
            </h3>

            {hints.length === 0 ? (
              <p className="font-mono text-xs text-[#8B949E]">
                No hints available.
              </p>
            ) : (
              <div className="space-y-2.5 font-mono text-xs">
                {hints.map((hint) => {
                  const isOpen = unlockedHints.has(hint.id);
                  return (
                    <div
                      key={hint.id}
                      className="bg-[#171B20] border border-[#232830] rounded-lg overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => toggleHint(hint.id)}
                        className="w-full text-left p-3 flex items-center justify-between hover:bg-[#1D2228] transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-[#F5F5F5] text-xs">
                          Hint {hint.hint_level}
                        </span>
                        <span className="text-[#FF9F43] text-[10px] font-bold">
                          {isOpen ? 'Hide' : 'Show'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-3 pt-0 text-[#8B949E] border-t border-[#232830]/50 bg-[#090B0D] animate-fade-in">
                          <p className="text-[#F5F5F5] text-xs leading-relaxed pt-2.5 font-sans">
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
          <div className="cyber-panel p-5 font-mono text-xs text-[#8B949E] space-y-2.5">
            <h4 className="text-[#F5F5F5] text-base font-semibold">
              Rules
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] leading-relaxed font-sans">
              <li>Use the assigned sandbox only.</li>
              <li>Flag format is case-sensitive: <code className="text-[#FF6B00] font-mono">SHADOWNET{'{...}'}</code>.</li>
              <li>Solving unlocks the next stage.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
