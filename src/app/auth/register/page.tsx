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
      setError(err.response?.data?.error || 'Registration failed. Try another username.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-[#111417] border border-[#252A30] rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="text-center mb-8">
        <div className="inline-flex w-12 h-12 rounded-lg bg-[#171B20] border border-[#22D3EE]/40 items-center justify-center font-mono font-bold text-[#22D3EE] text-xl mb-3 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          🛡️
        </div>
        <h2 className="font-mono text-2xl font-bold text-[#F5F5F5]">AGENT RECRUITMENT</h2>
        <p className="font-mono text-xs text-[#8B949E] mt-1">
          Register new hacker handle for ShadowNet CTF
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded bg-[#EF4444]/10 border border-[#EF4444]/30 font-mono text-xs text-[#EF4444] flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block font-mono text-xs text-[#8B949E] mb-1.5">
            CALLSIGN / USERNAME <span className="text-[#FF6B00]">*</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="e.g. cipher_zero"
            className="w-full bg-[#090B0D] border border-[#252A30] rounded px-4 py-2.5 font-mono text-sm text-[#F5F5F5] placeholder-[#8B949E]/40 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-[#8B949E] mb-1.5">
            ACCESS CIPHER / PASSWORD <span className="text-[#FF6B00]">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Min. 6 characters"
            className="w-full bg-[#090B0D] border border-[#252A30] rounded px-4 py-2.5 font-mono text-sm text-[#F5F5F5] placeholder-[#8B949E]/40 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-[#8B949E] mb-1.5">
            EMAIL ADDRESS (OPTIONAL)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="agent@domain.com"
            className="w-full bg-[#090B0D] border border-[#252A30] rounded px-4 py-2.5 font-mono text-sm text-[#F5F5F5] placeholder-[#8B949E]/40 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-[#8B949E] mb-1.5">
            TEAM AFFILIATION (OPTIONAL)
          </label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. RedTeam-Elite"
            className="w-full bg-[#090B0D] border border-[#252A30] rounded px-4 py-2.5 font-mono text-sm text-[#F5F5F5] placeholder-[#8B949E]/40 focus:outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 font-mono text-xs font-bold py-3 rounded bg-[#FF6B00] hover:bg-[#FF9F43] text-black shadow-[0_0_15px_rgba(255,107,0,0.3)] transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'ENROLLING...' : 'ENROLL OPERATIVE →'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[#252A30] text-center font-mono text-xs text-[#8B949E]">
        Already enrolled?{' '}
        <Link href="/auth/login" className="text-[#22D3EE] hover:text-[#FF9F43]">
          Session Login
        </Link>
      </div>
    </div>
  );
}
