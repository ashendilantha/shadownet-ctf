'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import ProgressBar from '@/components/ProgressBar';

export default function ChallengesListPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [filterDomain, setFilterDomain] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChallenges = async () => {
    try {
      const res = await axios.get('/api/challenges');
      setChallenges(res.data.challenges || []);
    } catch (err: unknown) {
      const errorObj = err as { response?: { status?: number } };
      if (errorObj.response?.status === 401) {
        setAuthError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  if (authError) {
    return (
      <div className="auth-container">
        <div className="max-w-md w-full cyber-panel rounded-xl p-6 sm:p-8 text-center space-y-5 relative overflow-hidden">
          <div className="w-14 h-14 rounded-xl bg-[#171B20] border border-[#FF6B00]/40 flex items-center justify-center text-2xl mx-auto text-[#FF6B00] shadow-[0_0_12px_rgba(255,107,0,0.2)]">
            🔒
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-[#FF6B00] bg-[#FF6B00]/15 px-2.5 py-0.5 rounded-full border border-[#FF6B00]/30 inline-block font-mono">
              Sign in required
            </span>
            <h2 className="text-2xl font-bold font-sans text-[#F5F5F5] tracking-tight">
              Sign in to continue
            </h2>
            <p className="text-xs text-[#8B949E] leading-relaxed font-sans max-w-xs mx-auto">
              Sign in or create an account to view challenges.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <Link href="/auth/login" className="btn-primary w-full sm:w-auto h-10 px-5 text-xs font-bold">
              Sign in
            </Link>
            <Link href="/auth/register" className="btn-secondary w-full sm:w-auto h-10 px-5 text-xs font-bold">
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const domains = ['ALL', ...Array.from(new Set(challenges.map((c) => c.domain)))];
  const solvedCount = challenges.filter((c) => c.solved).length;
  const totalXP = challenges.reduce((acc, c) => acc + (c.solved ? c.points : 0), 0);
  const nextTarget = challenges.find((c) => !c.solved && c.unlocked);

  const filteredChallenges = challenges.filter((c) => {
    const matchesDomain = filterDomain === 'ALL' || c.domain === filterDomain;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-[#111417] border border-[#232830] rounded-xl p-5 sm:p-7">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="font-mono text-[11px] font-bold text-[#22D3EE]">
              Range online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] font-sans flex items-center gap-2.5 tracking-tight">
            Challenges
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#8B949E] mt-1">
            Eight stages. Clear each one to unlock the next.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="bg-[#171B20] border border-[#232830] rounded-lg px-4 py-2.5 text-right">
            <span className="text-[10px] font-mono text-[#8B949E] block">Points</span>
            <span className="font-mono text-lg sm:text-xl font-black text-[#FF6B00]">
              {totalXP} <span className="text-xs text-[#FF9F43]">XP</span>
            </span>
          </div>
          <div className="bg-[#171B20] border border-[#232830] rounded-lg px-4 py-2.5 text-right">
            <span className="text-[10px] font-mono text-[#8B949E] block">Solved</span>
            <span className="font-mono text-lg sm:text-xl font-black text-[#22D3EE]">
              {solvedCount}/{challenges.length}
            </span>
          </div>
        </div>
      </div>

      {/* Next Target Highlight Banner */}
      {nextTarget && (
        <div className="bg-[#15191E] border border-[#FF6B00]/30 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#FF6B00]/15 border border-[#FF6B00]/50 flex items-center justify-center font-mono font-bold text-[#FF6B00] text-sm flex-shrink-0">
              0{nextTarget.stage_number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#FF6B00] font-bold uppercase tracking-wider">
                  Next up
                </span>
                <span className="text-[#232830]">|</span>
                <span className="font-mono text-[11px] text-[#22D3EE] font-medium">
                  {nextTarget.domain}
                </span>
              </div>
              <h3 className="font-sans text-base font-bold text-[#F5F5F5] leading-snug">
                {nextTarget.name}
              </h3>
            </div>
          </div>

          <Link
            href={`/dashboard/challenges/${nextTarget.id}`}
            className="btn-primary text-xs font-bold px-5 h-9.5 whitespace-nowrap w-full sm:w-auto text-center"
          >
            Open challenge · +{nextTarget.points} XP
          </Link>
        </div>
      )}

      {/* Progress Bar */}
      <ProgressBar
        current={solvedCount}
        total={challenges.length}
        label="Campaign progress"
      />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#111417] border border-[#232830] rounded-xl p-3.5 font-mono text-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by name or domain"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090B0D] border border-[#232830] rounded-lg px-3.5 h-9 text-[#F5F5F5] placeholder-[#5C6370] focus:outline-none focus:border-[#FF6B00] text-xs font-mono transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[#8B949E] text-sm whitespace-nowrap pl-1">Domain</span>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setFilterDomain(dom)}
              aria-pressed={filterDomain === dom}
              className="filter-chip"
            >
              {dom === 'ALL' ? 'All' : dom}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="text-center py-20 font-mono text-xs text-[#8B949E]">
          <span className="inline-block animate-spin mr-2">⚙️</span>
          Loading challenges...
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="text-center py-16 bg-[#111417] border border-[#232830] rounded-xl font-mono text-xs text-[#8B949E]">
          No matching challenges.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}
