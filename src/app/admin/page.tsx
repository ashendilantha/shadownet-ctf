'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

interface OverviewStats {
  totalUsers: number;
  totalChallenges: number;
  activeChallenges: number;
  totalSubmissions: number;
  totalSolves: number;
  solveRate: number;
}

interface Challenge {
  id: number;
  name: string;
  domain: string;
  difficulty: string;
  description: string;
  points: number;
  delivery_method: string;
  stage_number: number;
  is_active: boolean;
  flag_hash?: string;
  hints?: Array<{ id: number; hint_level: number; hint_text: string }>;
}

interface Operative {
  id: string;
  username: string;
  email: string;
  team_name: string;
  is_admin: boolean;
  created_at: string;
  total_points: number;
  challenges_solved: number;
  last_submission_at: string | null;
}

interface SubmissionLog {
  id: string | number;
  username: string;
  challenge_name: string;
  stage_number: number;
  submitted_flag: string;
  is_correct: boolean;
  created_at: string;
}

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; is_admin: boolean } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'operatives' | 'submissions' | 'danger'>('overview');

  // Overview Data
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  // Challenges Data
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [editingChallenge, setEditingChallenge] = useState<number | null>(null);
  const [editPoints, setEditPoints] = useState<number>(100);
  const [newFlagInput, setNewFlagInput] = useState<string>('');

  // Operatives Data
  const [operatives, setOperatives] = useState<Operative[]>([]);
  const [searchOperative, setSearchOperative] = useState('');

  // Submissions Data
  const [submissions, setSubmissions] = useState<SubmissionLog[]>([]);

  // State feedback
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // 1. Check Authentication & Clearance
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/api/auth/me');
        if (res.data?.user?.is_admin) {
          setCurrentUser(res.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  // 2. Fetch Tab Specific Data
  const fetchOverview = async () => {
    try {
      const res = await axios.get('/api/admin/overview');
      setStats(res.data.stats);
      setRecentLogs(res.data.recentSubmissions || []);
    } catch (err: unknown) {
      console.error('Fetch overview error:', err);
    }
  };

  const fetchChallenges = async () => {
    try {
      const res = await axios.get('/api/admin/challenges');
      setChallenges(res.data.challenges || []);
    } catch (err: unknown) {
      console.error('Fetch challenges error:', err);
    }
  };

  const fetchOperatives = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setOperatives(res.data.users || []);
    } catch (err: unknown) {
      console.error('Fetch operatives error:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get('/api/admin/submissions');
      setSubmissions(res.data.submissions || []);
    } catch (err: unknown) {
      console.error('Fetch submissions error:', err);
    }
  };

  useEffect(() => {
    if (!currentUser?.is_admin) return;

    if (activeTab === 'overview') fetchOverview();
    if (activeTab === 'challenges') fetchChallenges();
    if (activeTab === 'operatives') fetchOperatives();
    if (activeTab === 'submissions') fetchSubmissions();
  }, [activeTab, currentUser]);

  const showNotification = (msg: string, isErr = false) => {
    if (isErr) {
      setActionError(msg);
      setActionMessage(null);
    } else {
      setActionMessage(msg);
      setActionError(null);
    }
    setTimeout(() => {
      setActionMessage(null);
      setActionError(null);
    }, 4500);
  };

  // Toggle Challenge Active State
  const handleToggleChallenge = async (challenge: Challenge) => {
    try {
      setLoadingAction(true);
      await axios.patch('/api/admin/challenges', {
        id: challenge.id,
        is_active: !challenge.is_active,
      });
      showNotification(`Stage ${challenge.stage_number} is now ${!challenge.is_active ? 'ACTIVE' : 'DEACTIVATED'}`);
      fetchChallenges();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      showNotification(errorObj.response?.data?.error || 'Failed to update challenge status', true);
    } finally {
      setLoadingAction(false);
    }
  };

  // Save Challenge Points / Flag
  const handleSaveChallengeConfig = async (challengeId: number) => {
    try {
      setLoadingAction(true);
      const payload: { id: number; points: number; new_raw_flag?: string } = { id: challengeId, points: editPoints };
      if (newFlagInput.trim()) {
        payload.new_raw_flag = newFlagInput.trim();
      }
      await axios.patch('/api/admin/challenges', payload);
      showNotification('Challenge configuration updated successfully');
      setEditingChallenge(null);
      setNewFlagInput('');
      fetchChallenges();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      showNotification(errorObj.response?.data?.error || 'Failed to update challenge', true);
    } finally {
      setLoadingAction(false);
    }
  };

  // Toggle Operative Admin Role
  const handleToggleAdminRole = async (op: Operative) => {
    if (op.id === currentUser?.id) {
      showNotification('Cannot revoke your own administrative status!', true);
      return;
    }
    try {
      setLoadingAction(true);
      await axios.patch('/api/admin/users', {
        id: op.id,
        is_admin: !op.is_admin,
      });
      showNotification(`Privileges updated for operative: ${op.username}`);
      fetchOperatives();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      showNotification(errorObj.response?.data?.error || 'Failed to update operative role', true);
    } finally {
      setLoadingAction(false);
    }
  };

  // Reset Leaderboard Scores
  const handleResetScores = async () => {
    const confirmed = window.confirm(
      'WARNING: Are you sure you want to reset all operative scores and wipe submission history? This action cannot be undone!'
    );
    if (!confirmed) return;

    try {
      setLoadingAction(true);
      const res = await axios.post('/api/admin/reset', { action: 'reset_scores' });
      showNotification(res.data.message || 'Scores reset successfully');
      fetchOverview();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } };
      showNotification(errorObj.response?.data?.error || 'Failed to execute score reset', true);
    } finally {
      setLoadingAction(false);
    }
  };

  // 3. Render Locked Screen if Not Admin
  if (authChecking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 font-mono text-center">
          <div className="w-10 h-10 rounded-lg bg-[#171B20] border border-[#FF6B00] animate-spin flex items-center justify-center text-[#FF6B00] text-lg">
            ⚡
          </div>
          <span className="text-[#8B949E] text-xs tracking-widest uppercase">
            Checking access...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser?.is_admin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111417] border border-[#EF4444]/40 rounded-2xl p-7 sm:p-9 shadow-[0_8px_30px_rgba(239,68,68,0.2)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#EF4444]"></div>
          <div className="w-14 h-14 rounded-xl bg-[#EF4444]/10 border border-[#EF4444] text-[#EF4444] text-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            🚫
          </div>
          <div className="inline-block px-2.5 py-0.5 bg-[#090B0D] border border-[#EF4444]/40 rounded-full text-[10px] font-mono text-[#EF4444] uppercase tracking-widest mb-2 font-semibold">
            Access denied · 403
          </div>
          <h2 className="font-sans text-2xl font-bold text-[#F5F5F5] mb-2">
            Restricted Access
          </h2>
          <p className="text-xs text-[#8B949E] leading-relaxed mb-5 font-sans">
            Admin access is required to view this page.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/auth/login"
              className="btn-primary w-full h-10 text-xs font-mono font-bold"
            >
              Sign in as admin
            </Link>
            <Link
              href="/dashboard/challenges"
              className="btn-secondary w-full h-10 text-xs font-mono"
            >
              Challenges
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Admin Dashboard
  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {/* Notifications */}
      {actionMessage && (
        <div className="p-3.5 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/40 font-mono text-xs text-[#22C55E] flex items-center justify-between shadow-[0_0_15px_rgba(34,197,94,0.1)] animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span>✅</span>
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-[#8B949E] hover:text-[#F5F5F5] cursor-pointer">✕</button>
        </div>
      )}
      {actionError && (
        <div className="p-3.5 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/40 font-mono text-xs text-[#EF4444] flex items-center justify-between shadow-[0_0_15px_rgba(239,68,68,0.1)] animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span>⚠️</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-[#8B949E] hover:text-[#F5F5F5] cursor-pointer">✕</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-5 sm:p-7 rounded-xl bg-[#111417] border border-[#232830] relative overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B00] via-[#EF4444] to-[#22D3EE]"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="px-2.5 py-0.5 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-full text-[10px] font-mono font-bold text-[#EF4444] tracking-wider uppercase">
                Admin access
              </span>
              <span className="text-[#8B949E] text-xs font-mono">
                {currentUser.username}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans text-[#F5F5F5]">
              Admin console
            </h1>
            <p className="text-xs sm:text-sm text-[#8B949E] mt-1 max-w-2xl font-sans">
              Manage challenges, users, and submissions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#171B20] border border-[#232830] rounded-lg text-xs font-mono text-[#22D3EE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
              Online
            </div>
            <button
              onClick={() => {
                if (activeTab === 'overview') fetchOverview();
                if (activeTab === 'challenges') fetchChallenges();
                if (activeTab === 'operatives') fetchOperatives();
                if (activeTab === 'submissions') fetchSubmissions();
              }}
              disabled={loadingAction}
              className="btn-secondary text-xs font-mono px-3.5 h-9 flex items-center gap-1.5"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#232830] pb-3 overflow-x-auto font-mono text-xs scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          aria-pressed={activeTab === 'overview'}
          className="admin-tab"
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          aria-pressed={activeTab === 'challenges'}
          className="admin-tab"
        >
          Challenges
        </button>
        <button
          onClick={() => setActiveTab('operatives')}
          aria-pressed={activeTab === 'operatives'}
          className="admin-tab"
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          aria-pressed={activeTab === 'submissions'}
          className="admin-tab"
        >
          Submissions
        </button>
        <button
          onClick={() => setActiveTab('danger')}
          aria-pressed={activeTab === 'danger'}
          className="admin-tab admin-tab--danger"
        >
          Danger zone
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-xl bg-[#111417] border border-[#232830] relative overflow-hidden">
              <div className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider mb-1">
                Users
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#F5F5F5]">
                {stats?.totalUsers ?? '...'}
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#111417] border border-[#232830] relative overflow-hidden">
              <div className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider mb-1">
                Active stages
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#FF6B00]">
                {stats?.activeChallenges ?? '...'}{' '}
                <span className="text-sm text-[#8B949E] font-normal">/ {stats?.totalChallenges ?? '...'}</span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#111417] border border-[#232830] relative overflow-hidden">
              <div className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider mb-1">
                Solves
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#22C55E]">
                {stats?.totalSolves ?? '...'}
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#111417] border border-[#232830] relative overflow-hidden">
              <div className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider mb-1">
                Solve rate
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-[#FF9F43]">
                {stats?.solveRate ?? '0'}%
              </div>
              <div className="mt-1 text-[11px] font-mono text-[#8B949E]">
                From {stats?.totalSubmissions ?? '0'} attempts
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="p-5 rounded-xl bg-[#111417] border border-[#232830]">
            <h3 className="text-base font-sans font-semibold text-[#F5F5F5] mb-3">
              Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-lg bg-[#171B20] border border-[#232830]">
                <div className="text-xs text-[#8B949E] mb-0.5">Database</div>
                <div className="text-[#22C55E] font-bold text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                  ONLINE (bsvvvibseqlapprvhuwz)
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#171B20] border border-[#232830]">
                <div className="text-xs text-[#8B949E] mb-0.5">Authentication</div>
                <div className="text-[#22D3EE] font-bold text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                  Role-based JWT
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#171B20] border border-[#232830]">
                <div className="text-xs text-[#8B949E] mb-0.5">Stage 8 network</div>
                <div className="text-[#FF6B00] font-bold text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]"></span>
                  Isolated bridge · 10.88.0.0/24
                </div>
              </div>
            </div>
          </div>

          {/* Recent Submissions Feed */}
          <div className="p-5 rounded-xl bg-[#111417] border border-[#252A30]">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-base font-sans font-semibold text-[#F5F5F5]">
                Recent submissions
              </h3>
              <button
                onClick={() => setActiveTab('submissions')}
                className="text-xs font-mono text-[#22D3EE] hover:text-[#FF9F43] cursor-pointer"
              >
                View all
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#252A30] text-[#8B949E] text-[11px]">
                    <th className="pb-2.5 font-semibold">Time</th>
                    <th className="pb-2.5 font-semibold">User</th>
                    <th className="pb-2.5 font-semibold">Challenge</th>
                    <th className="pb-2.5 font-semibold">Flag</th>
                    <th className="pb-2.5 font-semibold text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#252A30]/50">
                  {recentLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#8B949E]">
                        No submissions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#171B20]/50 transition-colors">
                        <td className="py-2.5 text-[#8B949E]">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 text-[#F5F5F5] font-bold">
                          {log.username}
                        </td>
                        <td className="py-2.5 text-[#22D3EE]">
                          {log.challenge_name}
                        </td>
                        <td className="py-2.5 text-[#8B949E] max-w-[200px] truncate font-mono">
                          {log.submitted_flag}
                        </td>
                        <td className="py-2.5 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.is_correct
                                ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40'
                                : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40'
                            }`}
                          >
                            {log.is_correct ? 'CORRECT' : 'FAILED'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-lg font-bold font-sans text-[#F5F5F5]">
              Challenges
            </h2>
            <p className="text-xs text-[#8B949E] font-sans mt-0.5">
              Change availability, points, and flags.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {challenges.map((c) => {
              const isEditing = editingChallenge === c.id;

              return (
                <div
                  key={c.id}
                  className="p-5 rounded-xl bg-[#111417] border border-[#232830] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded bg-[#FF6B00]/15 border border-[#FF6B00]/40 text-xs font-mono font-bold text-[#FF6B00]">
                        STAGE {c.stage_number}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#171B20] border border-[#232830] text-[11px] font-mono text-[#8B949E]">
                        {c.domain}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#171B20] border border-[#232830] text-[11px] font-mono text-[#22D3EE]">
                        {c.delivery_method}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                          c.is_active
                            ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40'
                            : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40'
                        }`}
                      >
                        {c.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-sans text-[#F5F5F5]">
                      {c.name}
                    </h3>
                    <p className="text-xs text-[#8B949E] mt-0.5 max-w-3xl font-sans">
                      {c.description}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-3.5 text-xs font-mono text-[#8B949E]">
                      <div>
                        REWARD:{' '}
                        <span className="text-[#FF6B00] font-bold">{c.points} XP</span>
                      </div>
                      <div>
                        DIFFICULTY:{' '}
                        <span className="text-[#F5F5F5] uppercase font-semibold">{c.difficulty}</span>
                      </div>
                      {c.flag_hash && (
                        <div className="text-[11px] text-[#8B949E] truncate max-w-sm">
                          HASH: <span className="text-[#22D3EE]">{c.flag_hash.substring(0, 16)}...</span>
                        </div>
                      )}
                    </div>

                    {/* Inline edit view */}
                    {isEditing && (
                      <div className="mt-3.5 p-4 rounded-lg bg-[#171B20] border border-[#232830] space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-mono text-[#8B949E] mb-1 uppercase">
                              Points
                            </label>
                            <input
                              type="number"
                              value={editPoints}
                              onChange={(e) => setEditPoints(parseInt(e.target.value) || 0)}
                              className="cyber-input text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-mono text-[#8B949E] mb-1 uppercase">
                              New flag
                            </label>
                            <input
                              type="text"
                              value={newFlagInput}
                              onChange={(e) => setNewFlagInput(e.target.value)}
                              placeholder="e.g. SHADOWNET{new_secret_flag_2026}"
                              className="cyber-input text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleSaveChallengeConfig(c.id)}
                            disabled={loadingAction}
                            className="btn-primary text-xs px-4 h-9"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingChallenge(null)}
                            className="btn-secondary text-xs px-4 h-9"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleChallenge(c)}
                      disabled={loadingAction}
                      className={`w-full text-xs font-mono font-bold px-3.5 h-9 rounded-lg transition-all cursor-pointer ${
                        c.is_active
                          ? 'bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/40'
                          : 'bg-[#22C55E]/15 hover:bg-[#22C55E]/25 text-[#22C55E] border border-[#22C55E]/40'
                      }`}
                    >
                      {c.is_active ? 'Disable' : 'Enable'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingChallenge(isEditing ? null : c.id);
                        setEditPoints(c.points);
                        setNewFlagInput('');
                      }}
                      className="w-full btn-secondary text-xs font-mono px-3.5 h-9"
                    >
                      {isEditing ? 'Close' : 'Edit'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: OPERATIVES */}
      {activeTab === 'operatives' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-sans text-[#F5F5F5]">
                Users
              </h2>
              <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                Manage accounts, teams, scores, and roles.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search users or teams"
                value={searchOperative}
                onChange={(e) => setSearchOperative(e.target.value)}
                className="cyber-input text-xs"
              />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#111417] border border-[#232830] overflow-x-auto shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
            <table className="w-full text-left font-mono text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-[#232830] text-[#8B949E] text-[11px]">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Team</th>
                  <th className="pb-3 font-semibold">Points / solves</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232830]/50">
                {operatives
                  .filter((op) =>
                    op.username.toLowerCase().includes(searchOperative.toLowerCase()) ||
                    op.team_name?.toLowerCase().includes(searchOperative.toLowerCase())
                  )
                  .map((op) => (
                    <tr key={op.id} className="hover:bg-[#171B20]/50 transition-colors">
                      <td className="py-3 text-[#F5F5F5] font-bold">
                        {op.username}
                      </td>
                      <td className="py-3 text-[#8B949E]">
                        {op.email}
                      </td>
                      <td className="py-3 text-[#22D3EE]">
                        {op.team_name || 'Solo'}
                      </td>
                      <td className="py-3">
                        <span className="text-[#FF6B00] font-bold">{op.total_points} XP</span>
                        <span className="text-[#8B949E] ml-1.5">({op.challenges_solved}/8)</span>
                      </td>
                      <td className="py-3">
                        {op.is_admin ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#171B20] text-[#8B949E] border border-[#232830]">
                            User
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleAdminRole(op)}
                          disabled={loadingAction || op.id === currentUser?.id}
                          className={`btn-ghost ${
                            op.is_admin
                              ? 'text-[#8B949E] hover:text-[#EF4444] hover:bg-[#171B20]'
                              : 'text-[#FF6B00] hover:bg-[#FF6B00]/10 border border-[#FF6B00]/30'
                          }`}
                        >
                          {op.is_admin ? 'Demote' : 'Make admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SUBMISSIONS AUDIT */}
      {activeTab === 'submissions' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-sans text-[#F5F5F5]">
                Submissions
              </h2>
              <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                Latest 100 flag attempts.
              </p>
            </div>
            <button
              onClick={fetchSubmissions}
              className="btn-secondary text-xs font-mono px-3 h-8.5"
            >
              Refresh
            </button>
          </div>

          <div className="p-5 rounded-xl bg-[#111417] border border-[#232830] overflow-x-auto shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
            <table className="w-full text-left font-mono text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-[#252A30] text-[#8B949E] text-[11px]">
                  <th className="pb-3 font-semibold">Time</th>
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Challenge</th>
                  <th className="pb-3 font-semibold">Flag</th>
                  <th className="pb-3 font-semibold text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252A30]/50">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#8B949E]">
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#171B20]/50 transition-colors">
                      <td className="py-3 text-[#8B949E] whitespace-nowrap">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 text-[#F5F5F5] font-bold">
                        {sub.username}
                      </td>
                      <td className="py-3 text-[#22D3EE]">
                        Stage {sub.stage_number}: {sub.challenge_name}
                      </td>
                      <td className="py-3 text-[#8B949E] font-mono break-all max-w-xs">
                        {sub.submitted_flag}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            sub.is_correct
                              ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40'
                              : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40'
                          }`}
                        >
                          {sub.is_correct ? 'Valid' : 'Invalid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DANGER ZONE */}
      {activeTab === 'danger' && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h2 className="text-lg font-bold font-mono text-[#EF4444]">
              Danger zone
            </h2>
            <p className="text-xs text-[#8B949E] font-sans mt-0.5">
              These actions cannot be undone.
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-xl bg-[#111417] border border-[#EF4444]/40 space-y-4 shadow-[0_2px_12px_rgba(239,68,68,0.1)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232830]">
              <div>
                <h3 className="font-sans text-sm font-bold text-[#F5F5F5]">
                  Reset Leaderboard & Submission History
                </h3>
                <p className="text-xs text-[#8B949E] mt-0.5 font-sans max-w-2xl">
                  Resets all scores and submission history. Accounts and challenge settings stay unchanged.
                </p>
              </div>
              <button
                onClick={handleResetScores}
                disabled={loadingAction}
                className="btn-danger whitespace-nowrap"
              >
                Reset scores
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-[#171B20] border border-[#232830] text-xs font-mono text-[#8B949E]">
              <span className="text-[#FF6B00] font-bold">Note:</span> Supabase handles backups. Stage rebuilds require the database manager.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
