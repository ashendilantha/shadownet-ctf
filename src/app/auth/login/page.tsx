'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { username, password });
      if (res.status === 200) {
        if (res.data.user?.is_admin) {
          router.push('/admin');
        } else {
          router.push('/dashboard/challenges');
        }
        router.refresh();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="max-w-md w-full bg-[#111417]/95 backdrop-blur-2xl border border-[#252A30] rounded-2xl p-8 sm:p-12 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Subtle Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent"></div>

        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#171B20] border border-[#FF6B00]/40 items-center justify-center font-mono font-bold text-[#FF6B00] text-2xl mb-4 shadow-[0_0_25px_rgba(255,107,0,0.3)]">
            ⚡
          </div>
          <div className="inline-block px-3 py-1 bg-[#090B0D] border border-[#252A30] rounded-full text-[11px] font-mono text-[#22D3EE] mb-2">
            OPERATIVE GATEWAY
          </div>
          <h2 className="font-mono text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight">
            AUTHENTICATE
          </h2>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-1.5 font-sans">
            Enter credentials to access the ShadowNet Command Deck
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 font-mono text-xs text-[#EF4444] flex items-center gap-3">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block font-mono text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2">
              CALLSIGN / USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="e.g. cipher_zero"
              className="cyber-input"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2">
              ACCESS CIPHER / PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="cyber-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-primary py-4 text-xs font-bold tracking-wider"
          >
            {loading ? 'AUTHENTICATING...' : 'INITIALIZE SESSION →'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#252A30] text-center font-mono text-xs text-[#8B949E]">
          Need security clearance?{' '}
          <Link href="/auth/register" className="text-[#22D3EE] font-bold hover:text-[#FF9F43]">
            Enroll Operative Handle
          </Link>
        </div>
      </div>
    </div>
  );
}
