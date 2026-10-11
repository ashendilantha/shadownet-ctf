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
            <div className="cyber-panel p-5 sm:p-6 space-y-4 bg-[#0E1217]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-3">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">🌐</span> NexaCorp Public Reconnaissance Portal
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    Public-facing perimeter website. Inspect source comments, image metadata, and employee dossiers to extract intelligence leaks.
                  </p>
                </div>
                <a
                  href="/stages/stage1-osint/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs font-mono font-bold px-4 py-2.5 flex items-center gap-2 text-center justify-center flex-shrink-0"
                >
                  🌐 OPEN NEXACORP PORTAL
                </a>
              </div>

              {/* Section Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <a
                  href="/stages/stage1-osint/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#080A0D] hover:bg-[#141920] border border-[#232B36] hover:border-[#FF9F43]/40 rounded-lg transition-colors block"
                >
                  <div className="text-[#F5F5F5] font-bold">🏢 Company Overview</div>
                  <div className="text-[10px] text-[#8B949E] mt-1">Landing page &amp; mission statement</div>
                </a>
                <a
                  href="/stages/stage1-osint/staff-directory.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#080A0D] hover:bg-[#141920] border border-[#232B36] hover:border-[#FF9F43]/40 rounded-lg transition-colors block"
                >
                  <div className="text-[#FF9F43] font-bold">👥 Staff Directory</div>
                  <div className="text-[10px] text-[#8B949E] mt-1">16 Employee profiles &amp; roles</div>
                </a>
                <a
                  href="/stages/stage1-osint/updates.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-[#080A0D] hover:bg-[#141920] border border-[#232B36] hover:border-[#FF9F43]/40 rounded-lg transition-colors block"
                >
                  <div className="text-[#10B981] font-bold">📰 Press Updates</div>
                  <div className="text-[10px] text-[#8B949E] mt-1">Operations &amp; Research news</div>
                </a>
              </div>

              <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg text-xs font-mono space-y-1">
                <span className="text-[#FF8533] block text-[11px] font-semibold">RECONNAISSANCE TACTICS:</span>
                <p className="text-[#8B949E] text-[11px] font-sans leading-relaxed">
                  Right-click to inspect HTML source code and developer comments across all profile pages. Analyze photography assets and metadata in the staff directory to extract operative coordinates.
                </p>
              </div>
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
            <div className="cyber-panel p-5 sm:p-6 space-y-4 bg-[#0E1217]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-3">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">🛡️</span> NexaAuth SSO Portal Gateway
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    Central Employee Single Sign-On and internal admin dashboard running on port 8084.
                  </p>
                </div>
                <a
                  href="http://localhost:8084"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-xs font-mono font-bold px-4 py-2.5 flex items-center gap-2 text-center justify-center flex-shrink-0"
                >
                  🌐 LAUNCH NEXAAUTH PORTAL
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <div className="text-[#F5F5F5] font-bold">🌐 Gateway Target URL</div>
                  <div className="text-[10px] text-[#8B949E] mt-1">http://localhost:8084/login (Endpoint: /login)</div>
                </div>
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <div className="text-[#FF9F43] font-bold">🔑 Known Staff Account</div>
                  <div className="text-[10px] text-[#8B949E] mt-1">jordan.lee : WelcomeToNexa2026!</div>
                </div>
              </div>

              <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg text-xs font-mono space-y-1">
                <span className="text-[#FF8533] block text-[11px] font-semibold">ATTACK VECTOR BRIEF:</span>
                <p className="text-[#8B949E] text-[11px] font-sans leading-relaxed">
                  The authentication backend constructs SQL queries via string concatenation. Inject tautological SQL payload expressions (e.g. <code className="text-[#FF9F43]">admin&apos; OR &apos;1&apos;=&apos;1&apos; --</code>) to bypass the login check, authenticate as portal administrator, and exfiltrate the internal records.
                </p>
              </div>
            </div>
          )}

          {/* Stage 5: PRNG Token Predictor (Scripting) */}
          {challenge.stage_number === 5 && (
            <div className="cyber-panel p-5 sm:p-6 space-y-4 bg-[#0E1217]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-3">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">⚡</span> PRNG Token Engine Stream
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    NexaCorp Dynamic Token Engine running on TCP port 5005 using a Linear Congruential Generator.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="/downloads/stage5-starter.py"
                    download
                    className="btn-primary text-xs font-mono font-bold px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <span>📥</span> STARTER SCRIPT
                  </a>
                  <div className="px-3 py-1.5 bg-[#141920] border border-[#10B981]/40 rounded text-xs font-mono text-[#10B981] font-bold">
                    PORT 5005 ACTIVE
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <span className="text-[10px] text-[#8B949E] block mb-1">INTERACTIVE TCP CONNECTION</span>
                  <code className="text-[#10B981] font-bold select-all block">nc localhost 5005</code>
                </div>
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <span className="text-[10px] text-[#8B949E] block mb-1">ALGORITHM</span>
                  <code className="text-[#FF9F43] font-bold block">LCG: next = (a * x + c) % m</code>
                </div>
              </div>

              <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg text-xs font-mono space-y-1">
                <span className="text-[#FF8533] block text-[11px] font-semibold">ATTACK VECTOR BRIEF:</span>
                <p className="text-[#8B949E] text-[11px] font-sans leading-relaxed">
                  Connect to the token dispenser daemon, capture sequential pseudo-random tokens, deduce the internal recurrence state parameters, and submit the correctly predicted next token in sequence to unlock the flag.
                </p>
              </div>
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
            <div className="cyber-panel p-5 sm:p-6 space-y-4 bg-[#0E1217]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B36] pb-3">
                <div>
                  <h3 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                    <span className="text-[#FF6B00]">👑</span> Production Host Privilege Escalation
                  </h3>
                  <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                    NexaCorp Production Linux Bastion Host. Enumerate misconfigured SUID permissions and exploit relative binary execution to gain root.
                  </p>
                </div>
                <div className="px-3 py-1.5 bg-[#141920] border border-[#FF9F43]/40 rounded text-xs font-mono text-[#FF9F43] font-bold">
                  HOST BASTION
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <span className="text-[10px] text-[#8B949E] block mb-1">SUID RECONNAISSANCE COMMAND</span>
                  <code className="text-[#10B981] font-bold block select-all">find / -perm -4000 -type f 2&gt;/dev/null</code>
                </div>
                <div className="p-3 bg-[#080A0D] border border-[#232B36] rounded-lg">
                  <span className="text-[10px] text-[#8B949E] block mb-1">TARGET SUBSYSTEM CODE</span>
                  <code className="text-[#FF9F43] font-bold block">NEXA-ROOT-07 (Production Bastion)</code>
                </div>
              </div>

              <div className="p-3.5 bg-[#080A0D] border border-[#232B36] rounded-lg text-xs font-mono space-y-1">
                <span className="text-[#FF8533] block text-[11px] font-semibold">PRIVILEGE ESCALATION VECTORS:</span>
                <p className="text-[#8B949E] text-[11px] font-sans leading-relaxed">
                  Look for proprietary maintenance executables owned by root with the SUID bit set. Check if the binary calls standard utilities without an absolute path, enabling PATH environment hijacking to spawn a root shell and read <code className="text-[#FF9F43]">/root/flag.txt</code>.
                </p>
              </div>
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

