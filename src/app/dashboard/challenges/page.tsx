'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import ProgressBar from '@/components/ProgressBar';

export default function ChallengesListPage() {
  const router = useRouter();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [filterDomain, setFilterDomain] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChallenges = async () => {
    try {
      const res = await axios.get('/api/challenges');
      setChallenges(res.data.challenges || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
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
        <div className="max-w-lg w-full bg-[#111417]/95 backdrop-blur-2xl border border-[#252A30] rounded-2xl p-8 sm:p-12 text-center font-mono space-y-6 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent"></div>
          <div className="w-20 h-20 rounded-2xl bg-[#171B20] border border-[#FF6B00]/40 flex items-center justify-center text-4xl mx-auto text-[#FF6B00] shadow-[0_0_30px_rgba(255,107,0,0.3)]">
            🔒
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#FF6B00] bg-[#FF6B00]/15 px-3 py-1 rounded-full border border-[#FF6B00]/30">
              SECURITY PROTOCOL ACTIVE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#F5F5F5] tracking-tight">
              RESTRICTED CLEARANCE
            </h2>
            <p className="text-xs sm:text-sm text-[#8B949E] leading-relaxed font-sans max-w-sm mx-auto">
              The ShadowNet Challenge Deck is accessible only to authenticated operatives. Please log in or enroll to engage targets.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/auth/login" className="btn-primary w-full sm:w-auto py-3.5 text-xs font-bold">
              OPERATIVE LOGIN →
            </Link>
            <Link href="/auth/register" className="btn-secondary w-full sm:w-auto py-3.5 text-xs font-bold">
              ENROLL HANDLE
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
    <div className="w-full space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111417] border border-[#252A30] rounded-2xl p-6 sm:p-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="font-mono text-xs font-bold text-[#22D3EE]">
              ATTACK SURFACE ONLINE
            </span>
          </div>
          <h1 className="font-mono text-2xl sm:text-4xl font-black text-[#F5F5F5] flex items-center gap-3">
            <span className="text-[#FF6B00]">⚡</span> OPERATION COMMAND DECK
          </h1>
          <p className="font-mono text-xs sm:text-sm text-[#8B949E] mt-1.5">
            Sequential penetration testing challenges. Clear each stage to unlock the next attack vector.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="bg-[#171B20] border border-[#252A30] rounded-xl px-4 sm:px-6 py-3 text-right">
            <span className="text-[10px] font-mono text-[#8B949E] block">TOTAL BOUNTY</span>
            <span className="font-mono text-lg sm:text-2xl font-black text-[#FF6B00]">
              {totalXP} <span className="text-xs text-[#FF9F43]">XP</span>
            </span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] rounded-xl px-4 sm:px-6 py-3 text-right">
            <span className="text-[10px] font-mono text-[#8B949E] block">STAGES PWNED</span>
            <span className="font-mono text-lg sm:text-2xl font-black text-[#22D3EE]">
              {solvedCount}/{challenges.length}
            </span>
          </div>
        </div>
      </div>

      {/* Next Target Highlight Banner */}
      {nextTarget && (
        <div className="bg-gradient-to-r from-[#171B20] via-[#111417] to-[#171B20] border border-[#FF6B00]/40 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_20px_rgba(255,107,0,0.15)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF6B00]/15 border border-[#FF6B00]/50 flex items-center justify-center font-mono font-bold text-[#FF6B00] text-lg flex-shrink-0">
              0{nextTarget.stage_number}
            </div>
            <div>
              <span className="font-mono text-xs text-[#FF6B00] font-bold block">
                CURRENT OBJECTIVE
              </span>
              <h3 className="font-mono text-lg font-bold text-[#F5F5F5]">
                {nextTarget.name}
              </h3>
              <p className="font-mono text-xs text-[#8B949E]">
                Domain: <span className="text-[#22D3EE]">{nextTarget.domain}</span> • Bounty: <span className="text-[#FF6B00]">+{nextTarget.points} XP</span>
              </p>
            </div>
          </div>

          <Link
            href={`/dashboard/challenges/${nextTarget.id}`}
            className="btn-primary text-xs font-bold px-6 py-3 whitespace-nowrap"
          >
            ENGAGE MISSION →
          </Link>
        </div>
      )}

      {/* Progress Bar */}
      <ProgressBar
        current={solvedCount}
        total={challenges.length}
        label="SEQUENTIAL KILLCHAIN PROGRESS"
      />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#111417] border border-[#252A30] rounded-xl p-4 font-mono text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search challenges by keyword or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090B0D] border border-[#252A30] rounded px-4 py-2.5 text-[#F5F5F5] placeholder-[#8B949E]/50 focus:outline-none focus:border-[#FF6B00] transition-colors"
          />
        </div>

        {/* Domain Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[#8B949E] whitespace-nowrap">DOMAIN:</span>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setFilterDomain(dom)}
              className={`px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer ${
                filterDomain === dom
                  ? 'bg-[#FF6B00] text-black font-bold shadow-[0_0_10px_rgba(255,107,0,0.3)]'
                  : 'bg-[#171B20] text-[#8B949E] hover:text-[#F5F5F5] border border-[#252A30]'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="text-center py-24 font-mono text-sm text-[#8B949E]">
          <span className="inline-block animate-spin mr-2">⚙️</span>
          LOADING EXPLOITATION TARGETS...
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="text-center py-20 bg-[#111417] border border-[#252A30] rounded-2xl font-mono text-sm text-[#8B949E]">
          No matching challenges found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      )}
    </div>
  );
}
