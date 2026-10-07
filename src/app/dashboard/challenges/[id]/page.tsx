'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import axios from 'axios';
import FlagSubmitForm from '@/components/FlagSubmitForm';
import AttackVectorModal from '@/components/AttackVectorModal';
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
  const [siteOrigin, setSiteOrigin] = useState('');
  const [showAttackModal, setShowAttackModal] = useState(false);

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
        setLockedMsg(errorObj.response?.data?.error || 'Target perimeter is locked.');
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
    if (typeof window !== 'undefined') {
      setSiteOrigin(window.location.origin);
    }
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
        <span className="inline-block animate-spin mr-2 text-[#FF6B00]">⚙️</span>
        Synchronizing with NexaCorp target host...
      </div>
    );
  }

  // Locked Screen State
  if (isLocked) {
    return (
      <div className="max-w-xl mx-auto my-8 cyber-panel rounded-xl p-6 sm:p-8 text-center space-y-5 bg-[#0E1217]">
        <div className="w-14 h-14 rounded-xl bg-[#141920] border border-[#EF4444]/40 flex items-center justify-center text-2xl mx-auto text-[#EF4444] shadow-[0_0_16px_rgba(239,68,68,0.2)]">
          🔒
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/15 px-2.5 py-0.5 rounded-full border border-[#EF4444]/35 inline-block font-mono">
            DEFENSE PERIMETER LOCKED
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-sans text-[#F5F5F5]">
            Stage 0{challenge?.stage_number || id} Access Restricted
          </h2>
          <p className="text-xs text-[#8B949E] max-w-sm mx-auto leading-relaxed font-sans">
            {lockedMsg || 'Breach the preceding NexaCorp defense layer to unlock this target system.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link href="/dashboard/challenges" className="btn-primary w-full sm:w-auto h-10 px-5 text-xs font-bold">
            Target Deck
          </Link>
          <Link href="/dashboard/progress" className="btn-secondary w-full sm:w-auto h-10 px-5 text-xs font-bold">
            Killchain Map
          </Link>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-md mx-auto my-12 bg-[#0E1217] border border-[#232B36] rounded-xl p-6 text-center font-mono space-y-4">
        <h2 className="text-lg font-bold text-[#EF4444] font-sans">404 - Target Host Not Found</h2>
        <p className="text-xs text-[#8B949E]">The requested NexaCorp subsystem does not exist or has been decommissioned.</p>
        <Link href="/dashboard/challenges" className="btn-primary text-xs py-2 px-4">
          RETURN TO TARGET DECK
        </Link>
      </div>
    );
  }

  const stageConfig = STAGE_CONFIGS[challenge.stage_number];

  return (
    <div className="w-full space-y-6">
      {/* Attack Vector Schematic Modal */}
      {showAttackModal && (
        <AttackVectorModal
          stageNumber={challenge.stage_number}
          isOpen={showAttackModal}
          onClose={() => setShowAttackModal(false)}
          onProceed={() => setShowAttackModal(false)}
          challengeTitle={challenge.name}
          domain={challenge.domain}
          points={challenge.points}
        />
      )}

      {/* Top Nav Breadcrumbs */}
      <div className="flex items-center gap-2 font-mono text-xs text-[#8B949E]">
        <Link href="/dashboard/challenges" className="text-[#FF9F43] hover:text-[#FF8533] transition-colors">
          Target Deck
        </Link>
        <span className="text-[#232B36]">/</span>
        <span className="text-[#F5F5F5] font-semibold">STAGE 0{challenge.stage_number} {'//'} {stageConfig?.subsystemCode || `TARGET-0${challenge.stage_number}`}</span>
      </div>

      {/* Challenge Hero Header */}
      <div className="bg-[#0E1217] border border-[#232B36] rounded-xl p-5 sm:p-7 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-[#FF9F43] to-[#10B981]"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-[#141920] text-[#FF8533] border border-[#232B36]">
                Stage 0{challenge.stage_number}
              </span>
              <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FF9F43]/15 text-[#FF9F43] border border-[#FF9F43]/30">
                {challenge.difficulty}
              </span>
              <span className="font-mono text-[11px] text-[#8B949E]">
                VECTOR: <strong className="text-[#F5F5F5]">{challenge.domain}</strong>
              </span>
              {stageConfig?.subsystemCode && (
                <span className="font-mono text-[11px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                  {stageConfig.subsystemCode}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] font-sans tracking-tight">
              {challenge.name}
            </h1>

            <div className="pt-1">
              <button
                onClick={() => setShowAttackModal(true)}
                className="btn-amber text-xs font-bold px-3.5 h-8 flex items-center gap-2"
              >
                <span>⚡ Launch Attack Schematic Animation</span>
              </button>
            </div>
          </div>

          <div className="flex md:flex-col items-end justify-between md:justify-center gap-1.5 bg-[#141920] border border-[#232B36] rounded-lg p-3.5 sm:p-4 min-w-[150px] flex-shrink-0">
            <span className="text-xs font-mono text-[#8B949E]">Bounty</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#FF6B00]">
              +{challenge.points} <span className="text-xs font-bold text-[#FF9F43]">XP</span>
            </span>
            {challenge.solved && (
              <span className="font-mono text-xs font-bold text-[#10B981] flex items-center gap-1">
                <span>●</span> Breached
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Briefing, Environment, & Flag Submission */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mission Briefing */}
          <div className="cyber-panel p-5 sm:p-6 bg-[#0E1217]">
            <div className="flex items-center justify-between mb-3 border-b border-[#232B36] pb-2.5">
              <h3 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                <span className="text-[#FF6B00]">◈</span> Operative Mission Brief
              </h3>
              <span className="font-mono text-[10px] text-[#8B949E]">
                TARGET: {stageConfig?.targetSystem || 'NexaCorp Subsystem'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed font-sans mb-3">
              {challenge.description}
            </p>
            {stageConfig?.storyBrief && stageConfig.storyBrief !== challenge.description && (
              <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg text-xs text-[#8B949E] font-sans leading-relaxed">
                <strong className="text-[#FF8533] block mb-0.5 font-mono text-[11px]">NARRATIVE INTEL:</strong>
                {stageConfig.storyBrief}
              </div>
            )}
          </div>

          {/* Connection / Environment Information */}
          <div className="cyber-panel p-5 sm:p-6 bg-[#0E1217]">
            <h3 className="font-sans text-base font-bold text-[#F5F5F5] mb-3.5 flex items-center gap-2">
              <span className="text-[#FF9F43]">⚡</span> Target Infiltration Access
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg">
                <span className="text-[10px] text-[#8B949E] block mb-0.5 uppercase">Environment Delivery</span>
                <span className="text-[#FF8533] font-bold text-xs">
                  {challenge.delivery_method}
                </span>
              </div>

              {stageConfig && (
                <>
                  <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg">
                    <span className="text-[10px] text-[#8B949E] block mb-0.5 uppercase">Access Protocol</span>
                    <span className="text-[#F5F5F5] text-xs leading-relaxed font-sans">{stageConfig.accessGuide}</span>
                  </div>

                  <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg">
                    <span className="text-[10px] text-[#8B949E] block mb-1 uppercase">Tactical Verification Command</span>
                    <code className="text-[#10B981] font-bold text-xs bg-[#141920] px-2.5 py-1 rounded border border-[#232B36] inline-block font-mono">
                      {stageConfig.statusCheck}
                    </code>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Downloadable Assets Deck for Stage 2 */}
          {challenge.stage_number === 2 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-4 bg-[#0E1217]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-3">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">📦</span> Intercepted Transmission Package
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    Package includes 27 intercepted audio frequencies (1 authentic + 26 decoy channels) and image exhibits.
                  </p>
                </div>
                <a
                  href="/downloads/stage2-covert-transmissions.zip"
                  download="stage2-covert-transmissions.zip"
                  className="btn-primary text-xs font-mono font-bold px-4 py-2.5 flex items-center gap-2 text-center justify-center flex-shrink-0"
                >
                  ⚡ DOWNLOAD PACKAGE (.ZIP)
                </a>
              </div>

              {/* Package Details Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <div className="text-[#F5F5F5] font-bold">📷 whistleblower.jpg</div>
                  <div className="text-[10px] text-[#8B949E] mt-1">Classified Drone Photo Exhibit (Contains embedded intel)</div>
                </div>

                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <div className="text-[#FF9F43] font-bold">🔊 27 Audio Transmissions</div>
                  <div className="text-[10px] text-[#8B949E] mt-1">1 Authentic Carrier + 26 Jamming Decoy Channels (.wav)</div>
                </div>
              </div>

              {/* CLI Command Helper */}
              <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg text-xs font-mono space-y-1.5">
                <span className="text-[#8B949E] block text-[11px] font-semibold">Direct Download via Terminal:</span>
                <code className="text-[#FF8533] block break-all">
                  wget {siteOrigin ? `${siteOrigin}/downloads/stage2-covert-transmissions.zip` : '/downloads/stage2-covert-transmissions.zip'}
                </code>
                <code className="text-[#8B949E] block">
                  unzip stage2-covert-transmissions.zip
                </code>
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
          <div className="cyber-panel p-5 bg-[#0E1217]">
            <h3 className="font-sans text-base font-bold text-[#F5F5F5] mb-3 flex items-center gap-2">
              <span className="text-[#F59E0B]">💡</span> Tactical Intelligence Hints
            </h3>

            {hints.length === 0 ? (
              <p className="font-mono text-xs text-[#8B949E]">
                No tactical hints logged for this target.
              </p>
            ) : (
              <div className="space-y-2.5 font-mono text-xs">
                {hints.map((hint) => {
                  const isOpen = unlockedHints.has(hint.id);
                  return (
                    <div
                      key={hint.id}
                      className="bg-[#141920] border border-[#232B36] rounded-lg overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => toggleHint(hint.id)}
                        className="w-full text-left p-3 flex items-center justify-between hover:bg-[#1A212B] transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-[#F5F5F5] text-xs">
                          Hint {hint.hint_level}
                        </span>
                        <span className="text-[#FF9F43] text-[10px] font-bold">
                          {isOpen ? '▲ Hide' : '▼ Decrypt'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-3 pt-0 text-[#8B949E] border-t border-[#232B36]/50 bg-[#080A0D] animate-fade-in">
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
          <div className="cyber-panel p-5 font-mono text-xs text-[#8B949E] space-y-2.5 bg-[#0E1217]">
            <h4 className="text-[#F5F5F5] text-base font-bold">
              Rules of Engagement
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] leading-relaxed font-sans">
              <li>Execute attacks within assigned sandbox targets only.</li>
              <li>Flag format is case-sensitive: <code className="text-[#FF6B00] font-mono font-bold">SHADOWNET{'{...}'}</code>.</li>
              <li>Submitting the authentic flag unlocks the next NexaCorp defense layer.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
