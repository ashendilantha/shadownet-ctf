'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
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
    } catch (err: any) {
      console.error('Fetch overview error:', err);
    }
  };

  const fetchChallenges = async () => {
    try {
      const res = await axios.get('/api/admin/challenges');
      setChallenges(res.data.challenges || []);
    } catch (err: any) {
      console.error('Fetch challenges error:', err);
    }
  };

  const fetchOperatives = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setOperatives(res.data.users || []);
    } catch (err: any) {
      console.error('Fetch operatives error:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get('/api/admin/submissions');
      setSubmissions(res.data.submissions || []);
    } catch (err: any) {
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
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to update challenge status', true);
    } finally {
      setLoadingAction(false);
    }
  };

  // Save Challenge Points / Flag
  const handleSaveChallengeConfig = async (challengeId: number) => {
    try {
      setLoadingAction(true);
      const payload: any = { id: challengeId, points: editPoints };
      if (newFlagInput.trim()) {
        payload.new_raw_flag = newFlagInput.trim();
      }
      await axios.patch('/api/admin/challenges', payload);
      showNotification('Challenge configuration updated successfully');
      setEditingChallenge(null);
      setNewFlagInput('');
      fetchChallenges();
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to update challenge', true);
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
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to update operative role', true);
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
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to execute score reset', true);
    } finally {
      setLoadingAction(false);
    }
  };

  // 3. Render Locked Screen if Not Admin
  if (authChecking) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 font-mono text-center">
          <div className="w-12 h-12 rounded-xl bg-[#171B20] border border-[#FF6B00] animate-spin flex items-center justify-center text-[#FF6B00] text-xl">
            ⚡
          </div>
          <span className="text-[#8B949E] text-xs tracking-widest uppercase">
            VERIFYING COMMAND CLEARANCE...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser?.is_admin) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111417] border border-[#EF4444]/40 rounded-2xl p-8 sm:p-10 shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#EF4444]"></div>
          <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444] text-[#EF4444] text-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            🚫
          </div>
          <div className="inline-block px-3 py-1 bg-[#090B0D] border border-[#EF4444]/40 rounded-full text-[10px] font-mono text-[#EF4444] uppercase tracking-widest mb-3">
            CLEARANCE REFUSED // ERROR 403
          </div>
          <h2 className="font-mono text-2xl font-black text-[#F5F5F5] mb-3">
            RESTRICTED ACCESS
          </h2>
          <p className="text-xs text-[#8B949E] leading-relaxed mb-6 font-sans">
            Administrative privileges required to access the ShadowNet Control Matrix. Your callsign does not possess Tier-5 command authorization.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/auth/login"
              className="btn-primary w-full py-3 text-xs font-mono font-bold"
            >
              AUTHENTICATE AS ADMIN →
            </Link>
            <Link
              href="/dashboard/challenges"
              className="btn-secondary w-full py-3 text-xs font-mono"
            >
              RETURN TO OPERATIVE DASHBOARD
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Admin Dashboard
  return (
    <div className="w-full app-container py-8 sm:py-12">
      {/* Notifications */}
      {actionMessage && (
        <div className="mb-6 p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/40 font-mono text-xs text-[#22C55E] flex items-center justify-between shadow-[0_0_20px_rgba(34,197,94,0.15)] animate-fade-in">
          <div className="flex items-center gap-3">
            <span>✅</span>
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-[#8B949E] hover:text-[#F5F5F5]">✕</button>
        </div>
      )}
      {actionError && (
        <div className="mb-6 p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 font-mono text-xs text-[#EF4444] flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.15)] animate-fade-in">
          <div className="flex items-center gap-3">
            <span>⚠️</span>
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-[#8B949E] hover:text-[#F5F5F5]">✕</button>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#111417] border border-[#252A30] mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B00] via-[#EF4444] to-[#22D3EE]"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-full text-[10px] font-mono font-bold text-[#EF4444] tracking-widest uppercase">
                COMMAND PRIVILEGES ACTIVE
              </span>
              <span className="text-[#8B949E] text-xs font-mono">
                CALLSIGN: <span className="text-[#F5F5F5] font-bold">{currentUser.username}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-mono text-[#F5F5F5] tracking-tight">
              SHADOW<span className="text-[#FF6B00]">COMMAND</span> // CONTROL MATRIX
            </h1>
            <p className="text-xs sm:text-sm text-[#8B949E] mt-1 max-w-2xl font-sans">
              Centralized orchestration terminal for stages 1–8, operative telemetry, and live scoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#171B20] border border-[#252A30] rounded-xl text-xs font-mono text-[#22D3EE]">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping"></span>
              CORE_ENGINE: READY
            </div>
            <button
              onClick={() => {
                if (activeTab === 'overview') fetchOverview();
                if (activeTab === 'challenges') fetchChallenges();
                if (activeTab === 'operatives') fetchOperatives();
                if (activeTab === 'submissions') fetchSubmissions();
              }}
              disabled={loadingAction}
              className="btn-secondary text-xs font-mono px-4 py-2 flex items-center gap-2"
            >
              🔄 REFRESH DATA
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#252A30] pb-4 mb-8 font-mono text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold tracking-wider transition-all ${
            activeTab === 'overview'
              ? 'bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/50 shadow-[0_0_12px_rgba(255,107,0,0.2)]'
              : 'text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#171B20]'
          }`}
        >
          📊 TELEMETRY OVERVIEW
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2.5 rounded-xl font-bold tracking-wider transition-all ${
            activeTab === 'challenges'
              ? 'bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/50 shadow-[0_0_12px_rgba(255,107,0,0.2)]'
              : 'text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#171B20]'
          }`}
        >
          🎯 CHALLENGE MATRIX
        </button>
        <button
          onClick={() => setActiveTab('operatives')}
          className={`px-4 py-2.5 rounded-xl font-bold tracking-wider transition-all ${
            activeTab === 'operatives'
              ? 'bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/50 shadow-[0_0_12px_rgba(255,107,0,0.2)]'
              : 'text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#171B20]'
          }`}
        >
          👥 OPERATIVE ROSTER
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-2.5 rounded-xl font-bold tracking-wider transition-all ${
            activeTab === 'submissions'
              ? 'bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/50 shadow-[0_0_12px_rgba(255,107,0,0.2)]'
              : 'text-[#8B949E] hover:text-[#F5F5F5] hover:bg-[#171B20]'
          }`}
        >
          📋 SUBMISSIONS AUDIT
        </button>
        <button
          onClick={() => setActiveTab('danger')}
          className={`px-4 py-2.5 rounded-xl font-bold tracking-wider transition-all ${
            activeTab === 'danger'
              ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
              : 'text-[#EF4444]/70 hover:text-[#EF4444] hover:bg-[#EF4444]/10'
          }`}
        >
          ⚠️ DANGER ZONE
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-[#111417] border border-[#252A30] relative overflow-hidden">
              <div className="text-xs font-mono text-[#8B949E] uppercase tracking-wider mb-2">
                TOTAL OPERATIVES
              </div>
              <div className="text-3xl font-black font-mono text-[#F5F5F5]">
                {stats?.totalUsers ?? '...'}
              </div>
              <div className="mt-2 text-[11px] font-mono text-[#22D3EE]">
                REGISTERED ENTRANTS
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111417] border border-[#252A30] relative overflow-hidden">
              <div className="text-xs font-mono text-[#8B949E] uppercase tracking-wider mb-2">
                CHALLENGE STAGES
              </div>
              <div className="text-3xl font-black font-mono text-[#FF6B00]">
                {stats?.activeChallenges ?? '...'}{' '}
                <span className="text-base text-[#8B949E] font-normal">/ {stats?.totalChallenges ?? '...'}</span>
              </div>
              <div className="mt-2 text-[11px] font-mono text-[#22C55E]">
                STAGES ARMED & ACTIVE
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111417] border border-[#252A30] relative overflow-hidden">
              <div className="text-xs font-mono text-[#8B949E] uppercase tracking-wider mb-2">
                SUCCESSFUL SOLVES
              </div>
              <div className="text-3xl font-black font-mono text-[#22C55E]">
                {stats?.totalSolves ?? '...'}
              </div>
              <div className="mt-2 text-[11px] font-mono text-[#8B949E]">
                CONFIRMED FLAGS BREACHED
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111417] border border-[#252A30] relative overflow-hidden">
              <div className="text-xs font-mono text-[#8B949E] uppercase tracking-wider mb-2">
                SOLVE ACCURACY RATE
              </div>
              <div className="text-3xl font-black font-mono text-[#FF9F43]">
                {stats?.solveRate ?? '0'}%
              </div>
              <div className="mt-2 text-[11px] font-mono text-[#8B949E]">
                OF {stats?.totalSubmissions ?? '0'} TOTAL ATTEMPTS
              </div>
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="p-6 rounded-2xl bg-[#111417] border border-[#252A30]">
            <h3 className="text-base font-mono font-bold text-[#F5F5F5] mb-4 flex items-center gap-2">
              <span className="text-[#22D3EE]">⚡</span> INFRASTRUCTURE CONNECTIVITY
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-[#171B20] border border-[#252A30]">
                <div className="text-[#8B949E] mb-1">SUPABASE POSTGRESQL</div>
                <div className="text-[#22C55E] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                  ONLINE (bsvvvibseqlapprvhuwz)
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#171B20] border border-[#252A30]">
                <div className="text-[#8B949E] mb-1">AUTH POLICY</div>
                <div className="text-[#22D3EE] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#22D3EE]"></span>
                  ROLE-BASED JWT HS256
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#171B20] border border-[#252A30]">
                <div className="text-[#8B949E] mb-1">CAPSTONE STAGE 8</div>
                <div className="text-[#FF6B00] font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>
                  ISOLATED BRIDGE 10.88.0.0/24
                </div>
              </div>
            </div>
          </div>

          {/* Recent Submissions Feed */}
          <div className="p-6 rounded-2xl bg-[#111417] border border-[#252A30]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-mono font-bold text-[#F5F5F5] flex items-center gap-2">
                <span className="text-[#FF6B00]">●</span> RECENT SUBMISSION ACTIVITY
              </h3>
              <button
                onClick={() => setActiveTab('submissions')}
                className="text-xs font-mono text-[#22D3EE] hover:underline"
              >
                VIEW FULL AUDIT LOG →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#252A30] text-[#8B949E]">
                    <th className="pb-3 font-semibold">TIME</th>
                    <th className="pb-3 font-semibold">OPERATIVE</th>
                    <th className="pb-3 font-semibold">CHALLENGE</th>
                    <th className="pb-3 font-semibold">SUBMITTED FLAG</th>
                    <th className="pb-3 font-semibold text-right">RESULT</th>
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
                      <tr key={log.id} className="hover:bg-[#171B20]/40 transition-colors">
                        <td className="py-3 text-[#8B949E]">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </td>
                        <td className="py-3 text-[#F5F5F5] font-bold">
                          {log.username}
                        </td>
                        <td className="py-3 text-[#22D3EE]">
                          {log.challenge_name}
                        </td>
                        <td className="py-3 text-[#8B949E] max-w-[200px] truncate font-mono">
                          {log.submitted_flag}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-mono font-bold text-[#F5F5F5]">
                CHALLENGE STAGE MANAGEMENT (1–8)
              </h2>
              <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                Toggle stage availability, reconfigure point weights, and review secret flag hashes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {challenges.map((c) => {
              const isEditing = editingChallenge === c.id;

              return (
                <div
                  key={c.id}
                  className="p-6 rounded-2xl bg-[#111417] border border-[#252A30] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#FF6B00]/15 border border-[#FF6B00]/40 text-xs font-mono font-bold text-[#FF6B00]">
                        STAGE {c.stage_number}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#171B20] border border-[#252A30] text-[11px] font-mono text-[#8B949E]">
                        {c.domain}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#171B20] border border-[#252A30] text-[11px] font-mono text-[#22D3EE]">
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

                    <h3 className="text-lg font-mono font-bold text-[#F5F5F5]">
                      {c.name}
                    </h3>
                    <p className="text-xs text-[#8B949E] mt-1 max-w-3xl font-sans">
                      {c.description}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-mono text-[#8B949E]">
                      <div>
                        REWARD:{' '}
                        <span className="text-[#FF6B00] font-bold">{c.points} XP</span>
                      </div>
                      <div>
                        DIFFICULTY:{' '}
                        <span className="text-[#F5F5F5] uppercase">{c.difficulty}</span>
                      </div>
                      {c.flag_hash && (
                        <div className="text-[11px] text-[#8B949E] truncate max-w-sm">
                          HASH: <span className="text-[#22D3EE]">{c.flag_hash.substring(0, 16)}...</span>
                        </div>
                      )}
                    </div>

                    {/* Inline edit view */}
                    {isEditing && (
                      <div className="mt-4 p-4 rounded-xl bg-[#171B20] border border-[#252A30] space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-mono text-[#8B949E] mb-1">
                              UPDATE POINTS (XP)
                            </label>
                            <input
                              type="number"
                              value={editPoints}
                              onChange={(e) => setEditPoints(parseInt(e.target.value) || 0)}
                              className="cyber-input text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-mono text-[#8B949E] mb-1">
                              SET NEW RAW FLAG (AUTOMATICALLY SHA-256 HASHED)
                            </label>
                            <input
                              type="text"
                              value={newFlagInput}
                              onChange={(e) => setNewFlagInput(e.target.value)}
                              placeholder="e.g. SN{new_secret_flag_2026}"
                              className="cyber-input text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveChallengeConfig(c.id)}
                            disabled={loadingAction}
                            className="btn-primary text-xs px-4 py-2"
                          >
                            SAVE CHANGES
                          </button>
                          <button
                            onClick={() => setEditingChallenge(null)}
                            className="btn-secondary text-xs px-4 py-2"
                          >
                            CANCEL
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col items-center gap-2">
                    <button
                      onClick={() => handleToggleChallenge(c)}
                      disabled={loadingAction}
                      className={`w-full text-xs font-mono font-bold px-4 py-2 rounded-xl transition-all ${
                        c.is_active
                          ? 'bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/40'
                          : 'bg-[#22C55E]/15 hover:bg-[#22C55E]/25 text-[#22C55E] border border-[#22C55E]/40'
                      }`}
                    >
                      {c.is_active ? 'DEACTIVATE' : 'ACTIVATE'}
                    </button>

                    <button
                      onClick={() => {
                        setEditingChallenge(isEditing ? null : c.id);
                        setEditPoints(c.points);
                        setNewFlagInput('');
                      }}
                      className="w-full btn-secondary text-xs font-mono px-4 py-2"
                    >
                      {isEditing ? 'CLOSE' : 'EDIT CONFIG'}
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
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-mono font-bold text-[#F5F5F5]">
                REGISTERED OPERATIVES ROSTER
              </h2>
              <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                View participant clearance levels, teams, scores, and toggle administrator roles.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by callsign or team..."
                value={searchOperative}
                onChange={(e) => setSearchOperative(e.target.value)}
                className="cyber-input text-xs"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111417] border border-[#252A30] overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#252A30] text-[#8B949E]">
                  <th className="pb-3 font-semibold">CALLSIGN</th>
                  <th className="pb-3 font-semibold">EMAIL</th>
                  <th className="pb-3 font-semibold">TEAM</th>
                  <th className="pb-3 font-semibold">SCORE / SOLVES</th>
                  <th className="pb-3 font-semibold">ROLE</th>
                  <th className="pb-3 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252A30]/50">
                {operatives
                  .filter((op) =>
                    op.username.toLowerCase().includes(searchOperative.toLowerCase()) ||
                    op.team_name?.toLowerCase().includes(searchOperative.toLowerCase())
                  )
                  .map((op) => (
                    <tr key={op.id} className="hover:bg-[#171B20]/40 transition-colors">
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
                        <span className="text-[#8B949E] ml-2">({op.challenges_solved}/8)</span>
                      </td>
                      <td className="py-3">
                        {op.is_admin ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40">
                            ADMINISTRATOR
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#171B20] text-[#8B949E] border border-[#252A30]">
                            OPERATIVE
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleToggleAdminRole(op)}
                          disabled={loadingAction || op.id === currentUser?.id}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                            op.is_admin
                              ? 'text-[#8B949E] hover:text-[#EF4444] hover:bg-[#171B20]'
                              : 'text-[#FF6B00] hover:bg-[#FF6B00]/10 border border-[#FF6B00]/30'
                          }`}
                        >
                          {op.is_admin ? 'DEMOTE' : 'PROMOTE TO ADMIN'}
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
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-mono font-bold text-[#F5F5F5]">
                SUBMISSION AUDIT LOG (LAST 100 ATTEMPTS)
              </h2>
              <p className="text-xs text-[#8B949E] font-sans mt-0.5">
                Full chronological ledger of flag submission attempts across the competition.
              </p>
            </div>
            <button
              onClick={fetchSubmissions}
              className="btn-secondary text-xs font-mono px-3 py-1.5"
            >
              REFRESH LOGS
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-[#111417] border border-[#252A30] overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#252A30] text-[#8B949E]">
                  <th className="pb-3 font-semibold">TIMESTAMP</th>
                  <th className="pb-3 font-semibold">CALLSIGN</th>
                  <th className="pb-3 font-semibold">STAGE</th>
                  <th className="pb-3 font-semibold">SUBMITTED STRING</th>
                  <th className="pb-3 font-semibold text-right">VERIFICATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252A30]/50">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#8B949E]">
                      No submissions logged in the system.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#171B20]/40 transition-colors">
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
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            sub.is_correct
                              ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40'
                              : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40'
                          }`}
                        >
                          {sub.is_correct ? 'CORRECT FLAG' : 'INVALID FLAG'}
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
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-xl font-mono font-bold text-[#EF4444]">
              ⚠️ DANGER ZONE // IRREVERSIBLE COMMANDS
            </h2>
            <p className="text-xs text-[#8B949E] font-sans mt-0.5">
              High-consequence operations affecting global competitive state and database integrity.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#111417] border border-[#EF4444]/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#252A30]">
              <div>
                <h3 className="font-mono text-sm font-bold text-[#F5F5F5]">
                  RESET LEADERBOARD & SUBMISSION HISTORY
                </h3>
                <p className="text-xs text-[#8B949E] mt-1 font-sans">
                  Resets total points and solved counts for all operatives back to 0, and purges all recorded submission logs.
                  Existing user accounts and stage configurations will remain intact.
                </p>
              </div>
              <button
                onClick={handleResetScores}
                disabled={loadingAction}
                className="px-5 py-3 rounded-xl bg-[#EF4444]/20 hover:bg-[#EF4444]/30 text-[#EF4444] border border-[#EF4444] font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] whitespace-nowrap"
              >
                EXECUTE SCORE RESET
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#171B20] border border-[#252A30] text-xs font-mono text-[#8B949E]">
              <span className="text-[#FF6B00] font-bold">NOTE:</span> Database backups are handled automatically by Supabase. If you need a complete drop or rebuild of stages, execute via the database manager.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
