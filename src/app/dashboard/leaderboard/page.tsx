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

  const getRankBadge = (rank: number) => `#${rank}`;

  const topThree = leaderboard.slice(0, 3);
  const totalBountyAwarded = leaderboard.reduce((acc, curr) => acc + curr.total_points, 0);

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 bg-[#111417] border border-[#232830] rounded-xl p-5 sm:p-7">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#171B20] border border-[#232830] rounded-full text-[11px] font-mono text-[#22D3EE] mb-2 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span>Live</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F5F5] font-sans">
            Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-1 font-sans max-w-xl">
            Current challenge rankings.
          </p>
        </div>

        {/* Global Standings Metrics */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <div className="bg-[#171B20] border border-[#232830] rounded-lg px-4 py-2.5 text-right min-w-[120px]">
            <span className="text-[10px] font-mono text-[#8B949E] block">Players</span>
            <span className="font-mono text-lg sm:text-xl font-black text-[#22D3EE]">
              {leaderboard.length}
            </span>
          </div>
          <div className="bg-[#171B20] border border-[#232830] rounded-lg px-4 py-2.5 text-right min-w-[130px]">
            <span className="text-[10px] font-mono text-[#8B949E] block">Points</span>
            <span className="font-mono text-lg sm:text-xl font-black text-[#FF6B00]">
              {totalBountyAwarded} <span className="text-xs font-bold text-[#FF9F43]">XP</span>
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topThree.map((podium, index) => (
            <div
              key={podium.rank}
              className={`cyber-card p-5 flex flex-col justify-between relative overflow-hidden ${
                index === 0
                  ? 'border-[#FF6B00]/40 bg-[#15191E]'
                  : index === 1
                  ? 'border-[#FF9F43]/40 bg-[#14171A]'
                  : 'border-[#22D3EE]/40 bg-[#12161A]'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-sm font-medium px-2 py-1 rounded border ${
                      index === 0
                        ? 'bg-[#FF6B00]/10 text-[#FF9F43] border-[#FF6B00]/30'
                        : index === 1
                        ? 'bg-[#FF9F43]/10 text-[#FF9F43] border-[#FF9F43]/30'
                        : 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/30'
                    }`}
                  >
                    Rank #{podium.rank}
                  </span>
                  <span className="font-mono text-xs text-[#8B949E]">
                    {podium.challenges_solved}/8 solved
                  </span>
                </div>

                <div>
                  <h3 className="font-sans text-base font-bold text-[#F5F5F5] truncate">
                    {podium.username}
                  </h3>
                  <p className="font-mono text-xs text-[#8B949E]">
                    {podium.team_name || 'Independent Operative'}
                  </p>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#232830] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[#8B949E]">Points</span>
                <span className="font-mono text-lg font-black text-[#FF6B00]">
                  {podium.total_points} <span className="text-xs text-[#FF9F43]">XP</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leaderboard Table Container */}
      <div className="w-full bg-[#111417] border border-[#232830] rounded-xl overflow-hidden font-mono text-xs shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        {loading ? (
          <div className="text-center py-24 text-[#8B949E] space-y-2">
            <span className="inline-block animate-spin text-lg">⚙️</span>
              <p className="text-sm font-sans">Loading scores...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-24 text-[#8B949E] space-y-3">
            <p className="text-base font-semibold text-[#F5F5F5] font-sans">No scores yet</p>
            <p className="text-sm text-[#8B949E] font-sans max-w-sm mx-auto">
              Solve a challenge to appear here.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[650px]">
              <thead className="bg-[#171B20] text-[#8B949E] border-b border-[#232830] text-sm">
                <tr>
                  <th className="py-3 px-5 text-center w-20">Rank</th>
                  <th className="py-3 px-5">Player</th>
                  <th className="py-3 px-5">Team</th>
                  <th className="py-3 px-5 text-center">Solved</th>
                  <th className="py-3 px-5 text-right">Points</th>
                  <th className="py-3 px-5 text-right">Last solve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232830]">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`hover:bg-[#171B20]/80 transition-colors ${
                      entry.rank === 1
                        ? 'bg-[#FF6B00]/5'
                        : entry.rank === 2
                        ? 'bg-[#FF9F43]/5'
                        : entry.rank === 3
                        ? 'bg-[#22D3EE]/5'
                        : ''
                    }`}
                  >
                    <td className="py-3.5 px-5 text-center font-bold">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded ${
                          entry.rank === 1
                            ? 'text-[#FF6B00] bg-[#FF6B00]/15 border border-[#FF6B00]/40 font-black text-xs'
                            : entry.rank === 2
                            ? 'text-[#FF9F43] bg-[#FF9F43]/15 border border-[#FF9F43]/40 font-bold text-xs'
                            : entry.rank === 3
                            ? 'text-[#22D3EE] bg-[#22D3EE]/15 border border-[#22D3EE]/40 font-bold text-xs'
                            : 'text-[#8B949E] text-xs'
                        }`}
                      >
                        {getRankBadge(entry.rank)}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 font-bold text-[#F5F5F5] text-xs sm:text-sm">
                      {entry.username}
                    </td>

                    <td className="py-3.5 px-5 text-[#8B949E] text-xs">
                      {entry.team_name || '—'}
                    </td>

                    <td className="py-3.5 px-5 text-center text-[#22D3EE] font-bold text-xs">
                      {entry.challenges_solved}/8
                    </td>

                    <td className="py-3.5 px-5 text-right font-black text-[#FF6B00] text-sm sm:text-base">
                      {entry.total_points} <span className="text-xs text-[#FF9F43]">XP</span>
                    </td>

                    <td className="py-3.5 px-5 text-right text-[#8B949E] text-xs">
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
