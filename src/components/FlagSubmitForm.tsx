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
    <div className="cyber-panel p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3.5">
        <h4 className="font-sans text-base font-semibold text-[#F5F5F5]">
          Submit flag
        </h4>
        <span className="font-mono text-[11px] text-[#8B949E]">
          Format: <code className="text-[#22D3EE] font-bold">SHADOWNET{'{...}'}</code>
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
            className="cyber-input py-2.5 px-3.5 text-xs font-mono placeholder:text-[#8B949E]/40"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !flag.trim()}
          className="btn-primary py-2.5 px-6 text-xs font-bold whitespace-nowrap"
        >
          {loading ? 'Checking...' : 'Submit'}
        </button>
      </form>

      {message && (
        <div
          className={`mt-3 p-3 rounded-lg font-mono text-xs border flex items-center gap-2.5 animate-fade-in ${
            status === 'success'
              ? 'bg-[#22C55E]/10 border-[#22C55E]/40 text-[#22C55E]'
              : status === 'already'
              ? 'bg-[#22D3EE]/10 border-[#22D3EE]/40 text-[#22D3EE]'
              : 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
          }`}
        >
          <span className="text-sm">{status === 'success' ? '🎯' : status === 'already' ? 'ℹ️' : '⚠️'}</span>
          <span className="font-medium">{message}</span>
        </div>
      )}
    </div>
  );
}
