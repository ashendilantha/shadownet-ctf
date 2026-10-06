import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser || !authUser.is_admin) {
      return NextResponse.json(
        { error: 'Admin clearance required. Access denied.' },
        { status: 403 }
      );
    }

    // 1. Total Operatives (users)
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 2. Total Challenges & Active Challenges
    const { data: challenges, error: chalError } = await supabase
      .from('challenges')
      .select('id, name, stage_number, points, difficulty, is_active')
      .order('stage_number', { ascending: true });

    const totalChallenges = challenges?.length || 0;
    const activeChallenges = challenges?.filter((c) => c.is_active).length || 0;

    // 3. Submissions stats
    const { count: totalSubmissions } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true });

    const { count: totalSolves } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('is_correct', true);

    // 4. Recent submissions with user and challenge details
    const { data: recentSubmissionsRaw } = await supabase
      .from('submissions')
      .select('id, user_id, challenge_id, submitted_flag, is_correct, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch user map and challenge map for formatting
    const userIds = Array.from(new Set((recentSubmissionsRaw || []).map((s) => s.user_id)));
    const { data: usersList } = await supabase
      .from('users')
      .select('id, username')
      .in('id', userIds.length ? userIds : ['00000000-0000-0000-0000-000000000000']);

    const userMap = new Map<string, string>();
    (usersList || []).forEach((u) => userMap.set(u.id, u.username));

    const challengeMap = new Map<number, string>();
    (challenges || []).forEach((c) => challengeMap.set(c.id, c.name));

    const recentSubmissions = (recentSubmissionsRaw || []).map((s) => ({
      id: s.id,
      user_id: s.user_id,
      username: userMap.get(s.user_id) || 'Unknown Operative',
      challenge_id: s.challenge_id,
      challenge_name: challengeMap.get(s.challenge_id) || `Stage #${s.challenge_id}`,
      submitted_flag: s.submitted_flag,
      is_correct: s.is_correct,
      created_at: s.created_at,
    }));

    // 5. System Health / Overview summary
    return NextResponse.json({
      status: 'SYSTEM_OPERATIONAL',
      timestamp: new Date().toISOString(),
      stats: {
        totalUsers: totalUsers || 0,
        totalChallenges,
        activeChallenges,
        totalSubmissions: totalSubmissions || 0,
        totalSolves: totalSolves || 0,
        solveRate: totalSubmissions ? Math.round(((totalSolves || 0) / totalSubmissions) * 100) : 0,
      },
      challenges: challenges || [],
      recentSubmissions,
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching admin overview' },
      { status: 500 }
    );
  }
}
