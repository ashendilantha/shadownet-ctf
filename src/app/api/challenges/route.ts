import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);

    // Get active challenges (without exposing flag_hash to client)
    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active')
      .eq('is_active', true)
      .order('stage_number', { ascending: true });

    if (error) {
      console.error('Challenges query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch challenges' },
        { status: 500 }
      );
    }

    // If user is authenticated, check which challenges they solved
    let solvedIds = new Set<number>();
    if (authUser) {
      const { data: solvedSubmissions } = await supabase
        .from('submissions')
        .select('challenge_id')
        .eq('user_id', authUser.sub)
        .eq('is_correct', true);

      if (solvedSubmissions) {
        solvedSubmissions.forEach((s) => solvedIds.add(s.challenge_id));
      }
    }

    const challengesWithSolved = challenges.map((c) => ({
      ...c,
      solved: solvedIds.has(c.id),
    }));

    return NextResponse.json({ challenges: challengesWithSolved });
  } catch (error) {
    console.error('Challenges route error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}
