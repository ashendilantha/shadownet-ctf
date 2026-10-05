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
    const interval = setInterval(fetchLeaderboard, 10000); // 10s auto-refresh
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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111417] border border-[#252A30] rounded-xl p-6">
        <div>
          <h1 className="font-mono text-2xl sm:text-3xl font-bold text-[#F5F5F5] flex items-center gap-2">
            <span className="text-[#FF6B00]">🏆</span> GLOBAL SCOREBOARD
          </h1>
          <p className="font-mono text-xs text-[#8B949E] mt-1">
            Real-time standings across all NexaCorp penetration campaigns
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-[#22D3EE] bg-[#171B20] border border-[#252A30] px-3 py-1.5 rounded">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>LIVE TELEMETRY (SYNC 10S)</span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#111417] border border-[#252A30] rounded-xl overflow-hidden font-mono text-xs">
        {loading ? (
          <div className="text-center py-20 text-[#8B949E]">
            <span className="inline-block animate-spin mr-2">⚙️</span>
            COMPUTING HACKER STANDINGS...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20 text-[#8B949E]">
            No scored submissions recorded yet. Be the first to capture a flag!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#171B20] text-[#8B949E] uppercase tracking-wider border-b border-[#252A30]">
                <tr>
                  <th className="py-3.5 px-4 text-center w-16">RANK</th>
                  <th className="py-3.5 px-4">OPERATIVE / HANDLE</th>
                  <th className="py-3.5 px-4">AFFILIATION</th>
                  <th className="py-3.5 px-4 text-center">SOLVED</th>
                  <th className="py-3.5 px-4 text-right">TOTAL BOUNTY</th>
                  <th className="py-3.5 px-4 text-right">LAST CAPTURE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252A30]">
                {leaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={`hover:bg-[#171B20]/60 transition-colors ${
                      entry.rank === 1
                        ? 'bg-[#FF6B00]/5'
                        : entry.rank === 2
                        ? 'bg-[#FF9F43]/5'
                        : entry.rank === 3
                        ? 'bg-[#22D3EE]/5'
                        : ''
                    }`}
                  >
                    <td className="py-4 px-4 text-center font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded ${
                          entry.rank === 1
                            ? 'text-[#FF6B00] bg-[#FF6B00]/15'
                            : entry.rank === 2
                            ? 'text-[#FF9F43] bg-[#FF9F43]/15'
                            : entry.rank === 3
                            ? 'text-[#22D3EE] bg-[#22D3EE]/15'
                            : 'text-[#8B949E]'
                        }`}
                      >
                        {getRankBadge(entry.rank)}
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-[#F5F5F5]">
                      {entry.username}
                    </td>

                    <td className="py-4 px-4 text-[#8B949E]">
                      {entry.team_name || '—'}
                    </td>

                    <td className="py-4 px-4 text-center text-[#22D3EE] font-bold">
                      {entry.challenges_solved}/8
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-[#FF6B00] text-sm">
                      {entry.total_points} <span className="text-xs text-[#FF9F43]">XP</span>
                    </td>

                    <td className="py-4 px-4 text-right text-[#8B949E]">
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
