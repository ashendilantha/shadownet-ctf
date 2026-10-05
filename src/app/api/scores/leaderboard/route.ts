import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });

    const { data: leaderboard, error } = await supabase
      .from('scores')
      .select(`
        total_points,
        challenges_solved,
        last_submission_at,
        users:user_id (username, team_name)
      `)
      .order('total_points', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
