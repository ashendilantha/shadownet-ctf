import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const challengeId = parseInt(id, 10);

    if (isNaN(challengeId)) {
      return NextResponse.json(
        { error: 'Invalid challenge ID' },
        { status: 400 }
      );
    }

    const authUser = await verifyAuth(request);

    // Get challenge without flag_hash
    const { data: challenge, error } = await supabase
      .from('challenges')
      .select('id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active')
      .eq('id', challengeId)
      .single();

    if (error || !challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Get hints for this challenge
    const { data: hints } = await supabase
      .from('hints')
      .select('id, hint_level, hint_text, point_penalty')
      .eq('challenge_id', challengeId)
      .order('hint_level', { ascending: true });

    // Check if solved by current user
    let isSolved = false;
    if (authUser) {
      const { data: solvedSubmission } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', authUser.sub)
        .eq('challenge_id', challengeId)
        .eq('is_correct', true)
        .single();

      if (solvedSubmission) {
        isSolved = true;
      }
    }

    return NextResponse.json({
      challenge: {
        ...challenge,
        solved: isSolved,
      },
      hints: hints || [],
    });
  } catch (error) {
    console.error('Challenge detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}
