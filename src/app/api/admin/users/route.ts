import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';

// GET: Fetch all registered operatives with scores & solves
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser || !authUser.is_admin) {
      return NextResponse.json(
        { error: 'Admin clearance required. Access denied.' },
        { status: 403 }
      );
    }

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, team_name, is_admin, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      return NextResponse.json({ error: usersError.message }, { status: 500 });
    }

    const { data: scores } = await supabase
      .from('scores')
      .select('user_id, total_points, challenges_solved, last_submission_at');

    const scoreMap = new Map<string, { total_points: number; challenges_solved: number; last_submission_at: string | null }>();
    (scores || []).forEach((s) => {
      scoreMap.set(s.user_id, {
        total_points: s.total_points || 0,
        challenges_solved: s.challenges_solved || 0,
        last_submission_at: s.last_submission_at || null,
      });
    });

    const enrichedUsers = (users || []).map((u) => {
      const userScore = scoreMap.get(u.id) || { total_points: 0, challenges_solved: 0, last_submission_at: null };
      return {
        ...u,
        total_points: userScore.total_points,
        challenges_solved: userScore.challenges_solved,
        last_submission_at: userScore.last_submission_at,
      };
    });

    return NextResponse.json({ users: enrichedUsers });
  } catch (error) {
    console.error('Admin get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching operatives' },
      { status: 500 }
    );
  }
}

// PATCH: Toggle admin role or update user details
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser || !authUser.is_admin) {
      return NextResponse.json(
        { error: 'Admin clearance required. Access denied.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, is_admin, team_name } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (typeof is_admin === 'boolean') updates.is_admin = is_admin;
    if (typeof team_name === 'string') updates.team_name = team_name.trim();

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, username, email, team_name, is_admin, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Operative updated successfully',
      user: updated,
    });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating operative' },
      { status: 500 }
    );
  }
}
