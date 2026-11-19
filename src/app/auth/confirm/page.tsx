'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your email link and activating your operative node...');

  useEffect(() => {
    const confirmAccount = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
        const queryParams = new URLSearchParams(window.location.search);

        const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
        const tokenHash = queryParams.get('token_hash') || hashParams.get('token_hash');
        const verifyToken = queryParams.get('verify_token');
        const type = queryParams.get('type') || hashParams.get('type') || 'signup';
        const errorDesc = hashParams.get('error_description') || queryParams.get('error_description');

        if (errorDesc) {
          setStatus('error');
          setMessage(decodeURIComponent(errorDesc.replace(/\+/g, ' ')));
          return;
        }

        if (!accessToken && !tokenHash && !verifyToken) {
          setStatus('error');
          setMessage('No confirmation token found in this link. Please open the link directly from your email.');
          return;
        }

        const res = await axios.post('/api/auth/confirm-email', {
          access_token: accessToken || undefined,
          token_hash: tokenHash || undefined,
          verify_token: verifyToken || undefined,
          type,
        });

        setStatus('success');
        setMessage(res.data.message || 'Email verified and account created! Redirecting to Target Deck...');

        setTimeout(() => {
          router.push('/dashboard/challenges');
          router.refresh();
        }, 1200);
      } catch (err: unknown) {
        const errorObj = err as { response?: { data?: { error?: string } } };
        setStatus('error');
        setMessage(
          errorObj.response?.data?.error ||
            'Verification failed or link expired. Please register again.'
        );
      }
    };

    confirmAccount();
  }, [router]);

  return (
    <div className="auth-container">
      <div className="max-w-md w-full cyber-panel rounded-2xl p-7 sm:p-8 relative overflow-hidden text-center space-y-5">
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#9FEF00] via-[#38BDF8] to-[#9FEF00]"
          aria-hidden="true"
        />

        <div className="glass-pill inline-flex w-14 h-14 rounded-2xl items-center justify-center text-2xl mx-auto">
          {status === 'verifying' ? '📡' : status === 'success' ? '✅' : '⚠️'}
        </div>

        <div className="space-y-2">
          <div className="glass-pill inline-block px-3 py-0.5 rounded-full text-[10px] font-mono text-[#9FEF00] font-bold uppercase tracking-wider">
            Email Uplink Verification
          </div>
          <h1 className="text-2xl font-bold text-[#F8FAFC] tracking-tight">
            {status === 'verifying'
              ? 'Activating Operative Account...'
              : status === 'success'
              ? 'Operative Enrolled!'
              : 'Verification Failed'}
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[#A4B1CD] leading-relaxed">
            {message}
          </p>
        </div>

        {status === 'success' && (
          <Link href="/dashboard/challenges" className="btn-primary w-full">
            Enter Target Deck →
          </Link>
        )}

        {status === 'error' && (
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link href="/auth/register" className="btn-primary flex-1">
              Back to Register
            </Link>
            <Link href="/auth/login" className="btn-secondary flex-1">
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
