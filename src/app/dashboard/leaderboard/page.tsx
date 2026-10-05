'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LeaderboardEntry {
  rank: number;
  username: string;
  team_name: string;
  total_points: number;
  challenges_solved: number;
  last_submission_at: string | null;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/api/scores/leaderboard');
      setLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 10000);
    return () => clearInterval(interval);
  }, []);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇 #1';
      case 2:
        return '🥈 #2';
      case 3:
        return '🥉 #3';
      default:
        return `#${rank}`;
    }
  };

  const topThree = leaderboard.slice(0, 3);
  const totalBountyAwarded = leaderboard.reduce((acc, curr) => acc + curr.total_points, 0);

  return (
    <div className="w-full space-y-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111417] border border-[#252A30] rounded-2xl p-6 sm:p-10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#171B20] border border-[#252A30] rounded-full text-xs font-mono text-[#22D3EE] mb-3">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span>LIVE TELEMETRY STREAM</span>
          </div>
          <h1 className="font-mono text-3xl sm:text-5xl font-black text-[#F5F5F5] flex items-center gap-3">
            <span className="text-[#FF6B00]">🏆</span> GLOBAL SCOREBOARD
          </h1>
          <p className="font-mono text-xs sm:text-sm text-[#8B949E] mt-2 max-w-xl">
            Real-time operative standings across all 8 segmented NexaCorp security perimeters.
          </p>
        </div>

        {/* Global Standings Metrics */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-[#171B20] border border-[#252A30] rounded-xl px-5 py-3.5 text-right min-w-[130px]">
            <span className="text-[10px] font-mono text-[#8B949E] block">TOTAL OPERATIVES</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#22D3EE]">
              {leaderboard.length}
            </span>
          </div>
          <div className="bg-[#171B20] border border-[#252A30] rounded-xl px-5 py-3.5 text-right min-w-[140px]">
            <span className="text-[10px] font-mono text-[#8B949E] block">CLAIMED BOUNTY</span>
            <span className="font-mono text-xl sm:text-2xl font-black text-[#FF6B00]">
              {totalBountyAwarded} <span className="text-xs text-[#FF9F43]">XP</span>
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Highlights (if operatives exist) */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topThree.map((podium, index) => (
            <div
              key={podium.rank}
              className={`cyber-card p-6 flex flex-col justify-between relative overflow-hidden ${
                index === 0
                  ? 'border-[#FF6B00]/60 bg-gradient-to-b from-[#1c1815] to-[#111417] shadow-[0_0_30px_rgba(255,107,0,0.2)] md:-translate-y-2'
                  : index === 1
                  ? 'border-[#FF9F43]/40 bg-[#14171A]'
                  : 'border-[#22D3EE]/40 bg-[#12161A]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-black px-3 py-1 rounded-full ${
                      index === 0
                        ? 'bg-[#FF6B00] text-black shadow-[0_0_12px_rgba(255,107,0,0.4)]'
                        : index === 1
                        ? 'bg-[#FF9F43] text-black'
                        : 'bg-[#22D3EE] text-black'
                    }`}
                  >
                    RANK #{podium.rank}
                  </span>
                  <span className="font-mono text-xs text-[#8B949E]">
                    {podium.challenges_solved}/8 Solved
                  </span>
                </div>

                <div>
                  <h3 className="font-mono text-xl font-bold text-[#F5F5F5] truncate">
                    {podium.username}
                  </h3>
                  <p className="font-mono text-xs text-[#8B949E]">
                    {podium.team_name || 'Independent Operative'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#252A30] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8B949E]">SCORE</span>
                <span className="font-mono text-xl font-black text-[#FF6B00]">
                  {podium.total_points} <span className="text-xs text-[#FF9F43]">XP</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Table Container */}
      <div className="w-full bg-[#111417] border border-[#252A30] rounded-2xl overflow-hidden font-mono text-xs shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        {loading ? (
          <div className="text-center py-28 text-[#8B949E]">
            <span className="inline-block animate-spin mr-3 text-lg">⚙️</span>
            COMPUTING HACKER STANDINGS...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-28 text-[#8B949E] space-y-3">
            <div className="text-3xl">🎯</div>
            <p className="text-sm text-[#F5F5F5]">No scored submissions recorded yet.</p>
            <p className="text-xs text-[#8B949E]">Be the first operative to infiltrate Stage 01 and claim bounty!</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-[#171B20] text-[#8B949E] uppercase tracking-wider border-b border-[#252A30]">
                <tr>
                  <th className="py-4 px-6 text-center w-24">RANK</th>
                  <th className="py-4 px-6">OPERATIVE / HANDLE</th>
                  <th className="py-4 px-6">AFFILIATION</th>
                  <th className="py-4 px-6 text-center">PWNED</th>
                  <th className="py-4 px-6 text-right">TOTAL BOUNTY</th>
                  <th className="py-4 px-6 text-right">LAST CAPTURE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252A30]">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`hover:bg-[#171B20]/90 transition-colors ${
                      entry.rank === 1
                        ? 'bg-[#FF6B00]/5'
                        : entry.rank === 2
                        ? 'bg-[#FF9F43]/5'
                        : entry.rank === 3
                        ? 'bg-[#22D3EE]/5'
                        : ''
                    }`}
                  >
                    <td className="py-5 px-6 text-center font-bold">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg ${
                          entry.rank === 1
                            ? 'text-[#FF6B00] bg-[#FF6B00]/15 border border-[#FF6B00]/40 font-black'
                            : entry.rank === 2
                            ? 'text-[#FF9F43] bg-[#FF9F43]/15 border border-[#FF9F43]/40 font-bold'
                            : entry.rank === 3
                            ? 'text-[#22D3EE] bg-[#22D3EE]/15 border border-[#22D3EE]/40 font-bold'
                            : 'text-[#8B949E]'
                        }`}
                      >
                        {getRankBadge(entry.rank)}
                      </span>
                    </td>

                    <td className="py-5 px-6 font-bold text-[#F5F5F5] text-sm">
                      {entry.username}
                    </td>

                    <td className="py-5 px-6 text-[#8B949E]">
                      {entry.team_name || '—'}
                    </td>

                    <td className="py-5 px-6 text-center text-[#22D3EE] font-bold">
                      {entry.challenges_solved}/8
                    </td>

                    <td className="py-5 px-6 text-right font-black text-[#FF6B00] text-base">
                      {entry.total_points} <span className="text-xs text-[#FF9F43]">XP</span>
                    </td>

                    <td className="py-5 px-6 text-right text-[#8B949E]">
                      {entry.last_submission_at
                        ? new Date(entry.last_submission_at).toLocaleTimeString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
