'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', {
        username,
        password,
        email,
        team_name: teamName,
      });

      if (res.status === 201) {
        router.push('/dashboard/challenges');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Try another handle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="max-w-md w-full bg-[#111417]/95 backdrop-blur-2xl border border-[#252A30] rounded-2xl p-8 sm:p-12 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Subtle Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent"></div>

        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-[#171B20] border border-[#22D3EE]/40 items-center justify-center font-mono font-bold text-[#22D3EE] text-2xl mb-4 shadow-[0_0_25px_rgba(34,211,238,0.3)]">
            🛡️
          </div>
          <div className="inline-block px-3 py-1 bg-[#090B0D] border border-[#252A30] rounded-full text-[11px] font-mono text-[#22D3EE] mb-2">
            NEW OPERATIVE RECRUITMENT
          </div>
          <h2 className="font-mono text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight">
            ENROLL HANDLE
          </h2>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-1.5 font-sans">
            Register your hacker profile for the ShadowNet Cyber Range
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 font-mono text-xs text-[#EF4444] flex items-center gap-3">
            <span className="text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2">
              CALLSIGN / USERNAME <span className="text-[#FF6B00]">*</span>
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
              ACCESS CIPHER / PASSWORD <span className="text-[#FF6B00]">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="cyber-input"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2">
              EMAIL ADDRESS (OPTIONAL)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@shadow.ops"
              className="cyber-input"
            />
          </div>

          <div>
            <label className="block font-mono text-xs font-semibold text-[#8B949E] uppercase tracking-wider mb-2">
              TEAM AFFILIATION (OPTIONAL)
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. RedTeam-Elite"
              className="cyber-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-primary py-4 text-xs font-bold tracking-wider"
          >
            {loading ? 'ENROLLING...' : 'ENROLL OPERATIVE →'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#252A30] text-center font-mono text-xs text-[#8B949E]">
          Already have security clearance?{' '}
          <Link href="/auth/login" className="text-[#22D3EE] font-bold hover:text-[#FF9F43]">
            Session Login
          </Link>
        </div>
      </div>
    </div>
  );
}
