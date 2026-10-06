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
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      setError(errorObj.response?.data?.error || 'Registration failed. Try another handle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="max-w-md w-full cyber-panel rounded-xl p-6 sm:p-8 relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-lg bg-[#171B20] border border-[#22D3EE]/30 items-center justify-center font-mono font-bold text-[#22D3EE] text-xl mb-3">
            🛡️
          </div>
          <div className="inline-block px-2.5 py-0.5 bg-[#090B0D] border border-[#232830] rounded-full text-[10px] font-mono text-[#22D3EE] mb-2 font-semibold">
            Create your account
          </div>
          <h2 className="text-2xl font-bold font-sans text-[#F5F5F5] tracking-tight">
            Create account
          </h2>
          <p className="text-xs text-[#8B949E] mt-1 font-sans">
            Join the ShadowNet challenge range.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/40 font-mono text-xs text-[#EF4444] flex items-center gap-2.5 animate-fade-in">
            <span className="text-sm">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label htmlFor="username" className="block font-mono text-sm font-medium text-[#8B949E] mb-1.5">
              Username <span className="text-[#FF6B00]">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
              className="cyber-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-mono text-sm font-medium text-[#8B949E] mb-1.5">
              Password <span className="text-[#FF6B00]">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Min. 6 characters"
              className="cyber-input"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-mono text-sm font-medium text-[#8B949E] mb-1.5">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="agent@shadow.ops"
              className="cyber-input"
            />
          </div>

          <div>
            <label htmlFor="team-name" className="block font-mono text-sm font-medium text-[#8B949E] mb-1.5">
              Team (optional)
            </label>
            <input
              type="text"
              id="team-name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. RedTeam-Elite"
              className="cyber-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 btn-primary"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#232830] text-center font-mono text-xs text-[#8B949E]">
          Already registered?{' '}
          <Link href="/auth/login" className="text-[#22D3EE] font-bold hover:text-[#FF9F43]">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
