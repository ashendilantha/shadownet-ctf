'use client';

import React, { useState } from 'react';
import axios from 'axios';

interface FlagSubmitFormProps {
  challengeId: number;
  solved?: boolean;
  onSuccess?: () => void;
}

export default function FlagSubmitForm({
  challengeId,
  solved = false,
  onSuccess,
}: FlagSubmitFormProps) {
  const [flag, setFlag] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already'>(
    solved ? 'already' : 'idle'
  );

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
        setMessage(response.data.message || 'Flag accepted! XP awarded.');
        setFlag('');
        onSuccess?.();
      } else if (response.data.alreadySolved) {
        setStatus('already');
        setMessage(response.data.message || 'You already solved this challenge.');
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Incorrect flag. Try again!');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(
        error.response?.data?.error || 'Submission failed. Check network or login status.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111417] border border-[#252A30] rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-mono text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
          <span>🚩 SUBMIT PROOF OF EXPLOITATION</span>
        </h4>
        <span className="font-mono text-xs text-[#8B949E]">
          FORMAT: <code className="text-[#22D3EE]">SHADOWNET{'{...}'}</code>
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={flag}
            onChange={(e) => setFlag(e.target.value)}
            placeholder="SHADOWNET{your_captured_flag_here}"
            disabled={loading}
            required
            className="w-full bg-[#090B0D] border border-[#252A30] rounded px-4 py-2.5 font-mono text-sm text-[#F5F5F5] placeholder-[#8B949E]/50 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !flag.trim()}
          className="font-mono text-xs font-bold px-6 py-2.5 rounded bg-[#FF6B00] hover:bg-[#FF9F43] text-black shadow-[0_0_12px_rgba(255,107,0,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          {loading ? 'VALIDATING...' : 'SUBMIT FLAG →'}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded font-mono text-xs border flex items-center gap-2 ${
            status === 'success'
              ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
              : status === 'already'
              ? 'bg-[#22D3EE]/15 border-[#22D3EE]/40 text-[#22D3EE]'
              : 'bg-[#EF4444]/15 border-[#EF4444]/40 text-[#EF4444]'
          }`}
        >
          <span>{status === 'success' ? '🎯' : status === 'already' ? 'ℹ️' : '⚠️'}</span>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
