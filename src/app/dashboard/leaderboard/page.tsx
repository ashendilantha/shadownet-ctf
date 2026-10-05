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

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#111417] border border-[#252A30] rounded-2xl p-6 sm:p-8">
        <div>
          <h1 className="font-mono text-2xl sm:text-4xl font-black text-[#F5F5F5] flex items-center gap-3">
            <span className="text-[#FF6B00]">🏆</span> GLOBAL SCOREBOARD
          </h1>
          <p className="font-mono text-xs sm:text-sm text-[#8B949E] mt-1.5">
            Real-time operative rankings across all 8 NexaCorp penetration campaigns
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-xs text-[#22D3EE] bg-[#171B20] border border-[#252A30] px-4 py-2 rounded-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>LIVE TELEMETRY (SYNC 10S)</span>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="w-full bg-[#111417] border border-[#252A30] rounded-2xl overflow-hidden font-mono text-xs shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {loading ? (
          <div className="text-center py-24 text-[#8B949E]">
            <span className="inline-block animate-spin mr-2">⚙️</span>
            COMPUTING HACKER STANDINGS...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-24 text-[#8B949E]">
            No scored submissions recorded yet. Be the first operative to capture a flag!
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left min-w-[640px]">
              <thead className="bg-[#171B20] text-[#8B949E] uppercase tracking-wider border-b border-[#252A30]">
                <tr>
                  <th className="py-4 px-6 text-center w-20">RANK</th>
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
                    <td className="py-5 px-6 text-center font-bold">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg ${
                          entry.rank === 1
                            ? 'text-[#FF6B00] bg-[#FF6B00]/15 border border-[#FF6B00]/30 font-black'
                            : entry.rank === 2
                            ? 'text-[#FF9F43] bg-[#FF9F43]/15 border border-[#FF9F43]/30 font-bold'
                            : entry.rank === 3
                            ? 'text-[#22D3EE] bg-[#22D3EE]/15 border border-[#22D3EE]/30 font-bold'
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
