'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [teamName, setTeamName] = useState('');

  const [linkSent, setLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [infoNotice, setInfoNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const submitRegistration = async () => {
    setError('');
    setInfoNotice('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await axios.post('/api/auth/register', {
        username,
        password,
        email: cleanEmail,
        team_name: teamName,
      });

      if (res.status === 202 || res.data?.pending) {
        setSentEmail(cleanEmail);
        setLinkSent(true);
        setResendCooldown(60);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number; data?: { error?: string } } };
      const status = errorObj.response?.status;
      const msg = errorObj.response?.data?.error;

      if (status === 429) {
        setInfoNotice(
          msg || 'Verification email recently sent. Please wait 60 seconds or check your inbox/spam folder.'
        );
      } else {
        setError(msg || 'Registration failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitRegistration();
  };

  return (
    <div className="auth-container">
      <div className="max-w-md w-full cyber-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#9FEF00] via-[#38BDF8] to-[#9FEF00]"
          aria-hidden="true"
        />

        <div className="text-center mb-6">
          <div className="glass-pill inline-flex w-12 h-12 rounded-xl items-center justify-center font-mono font-bold text-[#9FEF00] text-xl mb-3 shadow-[0_0_16px_rgba(159,239,0,0.2)]">
            {linkSent ? '✉️' : '🛡️'}
          </div>
          <div className="glass-pill inline-block px-3 py-0.5 rounded-full text-[10px] font-mono text-[#9FEF00] mb-2 font-bold uppercase tracking-wider">
            {linkSent ? 'Awaiting Confirmation' : 'Recruitment Matrix'}
          </div>
          <h2 className="text-2xl font-bold font-sans text-[#F8FAFC] tracking-tight">
            {linkSent ? 'Check Your Inbox' : 'Join The Collective'}
          </h2>
          <p className="text-xs text-[#A4B1CD] mt-1 font-sans">
            {linkSent
              ? 'Click the confirmation link we sent to finish creating your account.'
              : 'Enter a real email address — we will send a 1-click confirmation link to activate your account.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#F87171]/15 border border-[#F87171]/40 font-mono text-xs text-[#F87171] flex items-center gap-2.5 animate-fade-in">
            <span className="text-sm">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {infoNotice && !error && (
          <div className="mb-4 p-3 rounded-xl bg-[#38BDF8]/12 border border-[#38BDF8]/40 font-mono text-xs text-[#7DD3FC] flex items-center gap-2.5 animate-fade-in">
            <span className="text-sm">✉️</span>
            <span>{infoNotice}</span>
          </div>
        )}

        {linkSent ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-xl bg-[#9FEF00]/10 border border-[#9FEF00]/35 space-y-2 text-center font-mono">
              <span className="text-[11px] text-[#9FEF00] font-bold uppercase block">
                Confirmation Link Dispatched
              </span>
              <p className="text-xs text-[#F8FAFC] font-bold break-all">{sentEmail}</p>
              <p className="text-[11px] text-[#A4B1CD] leading-relaxed">
                Open the email from <strong>Supabase Auth</strong> (check Spam/Junk if not visible) and click{' '}
                <strong className="text-[#9FEF00]">Confirm email address</strong>. Your account will be created and signed in automatically.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={submitRegistration}
                disabled={loading || resendCooldown > 0}
                className="btn-secondary flex-1 text-xs font-mono"
              >
                {loading
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend Link (${resendCooldown}s)`
                  : 'Resend Confirmation Link'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLinkSent(false);
                  setError('');
                }}
                className="btn-ghost text-xs font-mono"
              >
                Edit Details
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label
                htmlFor="username"
                className="block font-mono text-xs font-semibold text-[#A4B1CD] mb-1.5 uppercase"
              >
                Operative Callsign <span className="text-[#9FEF00]">*</span>
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                autoComplete="username"
                placeholder="e.g. cipher_operative"
                className="cyber-input"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-mono text-xs font-semibold text-[#A4B1CD] mb-1.5 uppercase"
              >
                Passphrase <span className="text-[#9FEF00]">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                className="cyber-input"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block font-mono text-xs font-semibold text-[#A4B1CD] mb-1.5 uppercase"
              >
                Verified Email <span className="text-[#9FEF00]">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="cyber-input"
              />
            </div>

            <div>
              <label
                htmlFor="team-name"
                className="block font-mono text-xs font-semibold text-[#A4B1CD] mb-1.5 uppercase"
              >
                Collective Cell / Squad (optional)
              </label>
              <input
                type="text"
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. RedCell-Zero"
                className="cyber-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 btn-primary"
            >
              {loading ? 'Sending Verification Link...' : 'Send Verification Link & Enroll'}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-white/[0.08] text-center font-mono text-xs text-[#A4B1CD]">
          Already an enrolled operative?{' '}
          <Link href="/auth/login" className="text-[#9FEF00] font-bold hover:text-[#B5FF35]">
            Sign in to Uplink
          </Link>
        </div>
      </div>
    </div>
  );
}
