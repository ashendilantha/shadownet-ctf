'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface FlagSubmitFormProps {
  challengeId: number;
  stageNumber?: number;
  solved?: boolean;
  nextChallengeId?: number | null;
  nextChallengeName?: string | null;
  onSuccess?: () => void;
  onTriggerFinalVictory?: () => void;
}

export default function FlagSubmitForm({
  challengeId,
  stageNumber = 1,
  solved = false,
  nextChallengeId,
  nextChallengeName,
  onSuccess,
  onTriggerFinalVictory,
}: FlagSubmitFormProps) {
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already'>(
    solved ? 'already' : 'idle'
  );
  const [resolvedNextId, setResolvedNextId] = useState<number | null>(nextChallengeId ?? null);
  const [resolvedNextName, setResolvedNextName] = useState<string | null>(nextChallengeName ?? null);

  const isFinalStage = stageNumber === 8;
  const nextTargetId = resolvedNextId ?? (stageNumber < 8 ? stageNumber + 1 : null);
  const nextTargetTitle = resolvedNextName ?? (stageNumber < 8 ? `Stage 0${stageNumber + 1}` : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/submissions', {
        challenge_id: challengeId,
        flag: flag.trim(),
      });

      if (response.data.correct) {
        setStatus('success');
        setMessage(response.data.message || 'Target defense breached! Flag accepted and XP awarded.');
        setFlag('');

        if (response.data.next_challenge_id) {
          setResolvedNextId(response.data.next_challenge_id);
        }
        if (response.data.next_challenge_name) {
          setResolvedNextName(response.data.next_challenge_name);
        }

        onSuccess?.();

        // Trigger Final Victory Modal if stage 8 or marked as final stage
        if (isFinalStage || response.data.is_final_stage) {
          onTriggerFinalVictory?.();
        }
      } else if (response.data.alreadySolved) {
        setStatus('already');
        setMessage(response.data.message || 'You have already breached this NexaCorp target.');
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Invalid flag hash. Defense countermeasure rejected submission.');
      }
    } catch (error: unknown) {
      setStatus('error');
      const err = error as { response?: { data?: { error?: string } } };
      setMessage(
        err.response?.data?.error || 'Submission failed. Check network or operative authentication status.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isTargetCompromised = status === 'success' || status === 'already' || solved;

  return (
    <div className="cyber-panel p-5 sm:p-6 bg-[#0E1217] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#232B36] pb-3">
        <h4 className="font-sans text-base font-bold text-[#F5F5F5] flex items-center gap-2">
          <span className="text-[#FF6B00]">⚡</span> Submit Exfiltrated Flag
        </h4>
        <span className="font-mono text-[11px] text-[#8B949E]">
          Format: <code className="text-[#FF8533] font-bold">SHADOWNET{'{...}'}</code>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            aria-label="Flag"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="SHADOWNET{...}"
            disabled={loading}
            required
            className="cyber-input py-2.5 px-3.5 text-xs font-mono placeholder:text-[#555E6B]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !flag.trim()}
          className="btn-primary py-2.5 px-6 text-xs font-bold whitespace-nowrap flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin">⚙️</span>
              <span>Verifying Hash...</span>
            </>
          ) : (
            <span>Submit Hash</span>
          )}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <div
          className={`p-3.5 rounded-xl font-mono text-xs border flex items-center gap-2.5 animate-fade-in ${
            status === 'success'
              ? 'bg-[#10B981]/15 border-[#10B981]/40 text-[#10B981]'
              : status === 'already'
              ? 'bg-[#FF9F43]/15 border-[#FF9F43]/40 text-[#FF9F43]'
              : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
          }`}
        >
          <span className="text-base">{status === 'success' ? '🎯' : status === 'already' ? 'ℹ️' : '⚠️'}</span>
          <span className="font-medium leading-relaxed">{message}</span>
        </div>
      )}

      {/* Target Breached Action Hub (Next Challenge & Victory) */}
      {isTargetCompromised && (
        <div className="pt-2 animate-fade-in">
          {isFinalStage ? (
            /* Stage 8 Victory Action Card */
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#10B981]/15 via-[#0D151D] to-[#FF6B00]/15 border-2 border-[#10B981]/50 shadow-[0_0_24px_rgba(16,185,129,0.2)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/20 px-2.5 py-0.5 rounded-full border border-[#10B981]/40 uppercase tracking-wider inline-block">
                  👑 NexaCorp Complete Compromise
                </span>
                <h5 className="font-sans text-sm sm:text-base font-black text-[#F5F5F5]">
                  Full Access to NexaCorp Company Achieved!
                </h5>
                <p className="font-mono text-xs text-[#8B949E]">
                  All 8 progressive defense perimeters have been successfully breached.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onTriggerFinalVictory}
                  className="btn-primary py-2.5 px-4 text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-[0_0_16px_rgba(16,185,129,0.35)] w-full sm:w-auto"
                >
                  <span>🎉</span>
                  <span>VIEW VICTORY CELEBRATION</span>
                </button>
                <Link
                  href="/dashboard/leaderboard"
                  className="btn-secondary py-2.5 px-4 text-xs font-mono font-bold flex items-center justify-center gap-1.5 w-full sm:w-auto"
                >
                  <span>🏆</span>
                  <span>LEADERBOARD</span>
                </Link>
              </div>
            </div>
          ) : (
            /* Stages 1-7 Next Challenge Banner & Button */
            <div className="p-4 rounded-xl bg-[#090D14] border border-[#10B981]/40 shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span className="text-xs font-mono font-bold text-[#10B981]">
                    Stage 0{stageNumber} Cleared // Perimeter Broken
                  </span>
                </div>
                <p className="text-xs text-[#8B949E] font-sans">
                  The defense layer has collapsed. Advance to the next infiltration vector.
                </p>
              </div>

              {nextTargetId && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/dashboard/challenges/${nextTargetId}`}
                    className="btn-primary w-full sm:w-auto py-2.5 px-5 text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(255,107,0,0.3)] hover:scale-[1.02] transition-transform"
                  >
                    <span>➔</span>
                    <span>PROCEED TO NEXT CHALLENGE</span>
                    {nextTargetTitle && <span className="opacity-80 font-normal">({nextTargetTitle})</span>}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
