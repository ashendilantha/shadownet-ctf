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
    <div className="bg-[#111417] border border-[#252A30] rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <h4 className="font-mono text-base font-bold text-[#F5F5F5] flex items-center gap-2">
          <span>🚩 SUBMIT PROOF OF EXPLOITATION</span>
        </h4>
        <span className="font-mono text-xs text-[#8B949E]">
          FORMAT: <code className="text-[#22D3EE] font-bold">SHADOWNET{'{...}'}</code>
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
            className="cyber-input py-3.5 px-4 text-sm font-mono placeholder:text-[#8B949E]/40"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !flag.trim()}
          className="btn-primary py-3.5 px-8 text-xs font-bold whitespace-nowrap"
        >
          {loading ? 'VALIDATING...' : 'SUBMIT FLAG →'}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-4 rounded-xl font-mono text-xs sm:text-sm border flex items-center gap-3 ${
            status === 'success'
              ? 'bg-[#22C55E]/15 border-[#22C55E]/50 text-[#22C55E]'
              : status === 'already'
              ? 'bg-[#22D3EE]/15 border-[#22D3EE]/50 text-[#22D3EE]'
              : 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#EF4444]'
          }`}
        >
          <span className="text-base">{status === 'success' ? '🎯' : status === 'already' ? 'ℹ️' : '⚠️'}</span>
          <span className="font-semibold">{message}</span>
        </div>
      )}
    </div>
  );
}
