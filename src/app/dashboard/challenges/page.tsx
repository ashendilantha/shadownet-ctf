'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChallengeCard, { Challenge } from '@/components/ChallengeCard';
import ProgressBar from '@/components/ProgressBar';

export default function ChallengesListPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDomain, setFilterDomain] = useState('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChallenges = async () => {
    try {
      const res = await axios.get('/api/challenges');
      setChallenges(res.data.challenges || []);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const domains = ['ALL', ...Array.from(new Set(challenges.map((c) => c.domain)))];
  const solvedCount = challenges.filter((c) => c.solved).length;
  const totalXP = challenges.reduce((acc, c) => acc + (c.solved ? c.points : 0), 0);

  const filteredChallenges = challenges.filter((c) => {
    const matchesDomain = filterDomain === 'ALL' || c.domain === filterDomain;
    const matchesDiff = filterDifficulty === 'ALL' || c.difficulty.toUpperCase() === filterDifficulty;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDomain && matchesDiff && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111417] border border-[#252A30] rounded-xl p-6">
        <div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#F5F5F5] flex items-center gap-2">
            <span className="text-[#FF6B00]">⚡</span> ACTIVE CAMPAIGNS
          </h1>
          <p className="font-mono text-xs text-[#8B949E] mt-1">
            NexaCorp target infrastructure attack surface
          </p>
        </div>

        {/* Stats Pill */}
        <div className="flex items-center gap-4">
          <div className="bg-[#171B20] border border-[#252A30] rounded px-4 py-2 text-right">
            <span className="text-[10px] font-mono text-[#8B949E] block">CAPTURED XP</span>
            <span className="font-mono text-lg font-bold text-[#FF6B00]">{totalXP} XP</span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] rounded px-4 py-2 text-right">
            <span className="text-[10px] font-mono text-[#8B949E] block">PWNED</span>
            <span className="font-mono text-lg font-bold text-[#22D3EE]">
              {solvedCount}/{challenges.length}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        current={solvedCount}
        total={challenges.length}
        label="OVERALL EXPLOITATION PROGRESS"
      />

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#111417] border border-[#252A30] rounded-lg p-4 font-mono text-xs">
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Filter by challenge name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#090B0D] border border-[#252A30] rounded px-3 py-2 text-[#F5F5F5] placeholder-[#8B949E]/50 focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        {/* Domain Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[#8B949E] whitespace-nowrap">DOMAIN:</span>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setFilterDomain(dom)}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
                filterDomain === dom
                  ? 'bg-[#FF6B00] text-black font-bold shadow-[0_0_8px_rgba(255,107,0,0.3)]'
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
        <div className="text-center py-16 font-mono text-sm text-[#8B949E]">
          <span className="inline-block animate-spin mr-2">⚙️</span>
          LOADING EXPLOITATION TARGETS...
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="text-center py-16 bg-[#111417] border border-[#252A30] rounded-xl font-mono text-sm text-[#8B949E]">
          No matching challenges found for current criteria.
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
