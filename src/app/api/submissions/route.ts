import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import crypto from 'crypto';

function hashFlag(flag: string): string {
  return crypto.createHash('sha256').update(flag).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    //verify authentication
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { challenge_id, flag } = await request.json();

    const supabase = createServerComponentClient({ cookies });

    //check if already solved
    const { data: existing } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', user.sub)
      .eq('challenge_id', challenge_id)
      .eq('is_correct', true)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Challenge already solved', correct: false },
        { status: 200 }
      );
    }

    //get challenge
    const { data: challenge } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', challenge_id)
      .single();

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    //verify flag
    const flag_hash = hashFlag(flag);
    const is_correct = flag_hash === challenge.flag_hash;

    //record submission
    const { error: submitError } = await supabase
      .from('submissions')
      .insert({
        user_id: user.sub,
        challenge_id,
        submitted_flag: flag,
        is_correct,
      });

    if (submitError) throw submitError;

    //update score if correct
    if (is_correct) {
      const { data: score } = await supabase
        .from('scores')
        .select('total_points, challenges_solved')
        .eq('user_id', user.sub)
        .single();

      await supabase
        .from('scores')
        .update({
          total_points: (score?.total_points || 0) + challenge.points,
          challenges_solved: (score?.challenges_solved || 0) + 1,
          last_submission_at: new Date().toISOString(),
        })
        .eq('user_id', user.sub);
    }

    return NextResponse.json(
      {
        correct: is_correct,
        message: is_correct ? 'Flag accepted!' : 'Incorrect flag',
        points: is_correct ? challenge.points : 0,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Submission failed' },
      { status: 500 }
    );
  }
}
