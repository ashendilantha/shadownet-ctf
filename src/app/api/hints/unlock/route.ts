import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { STAGE_HINTS } from '@/lib/stage-hints';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await request.json();
    const challengeId = Number(body.challenge_id);
    const hintId = Number(body.hint_id);

    if (!Number.isInteger(challengeId) || !Number.isInteger(hintId)) {
      return NextResponse.json({ error: 'Valid challenge and hint IDs are required.' }, { status: 400 });
    }

    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, stage_number')
      .eq('id', challengeId)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found.' }, { status: 404 });
    }

    if (!user.is_admin && challenge.stage_number > 1) {
      const { data: previousChallenge } = await supabase
        .from('challenges')
        .select('id')
        .eq('stage_number', challenge.stage_number - 1)
        .single();

      if (previousChallenge) {
        const { data: previousSolve } = await supabase
          .from('submissions')
          .select('id')
          .eq('user_id', user.sub)
          .eq('challenge_id', previousChallenge.id)
          .eq('is_correct', true)
          .single();

        if (!previousSolve) {
          return NextResponse.json(
            { error: `Stage ${challenge.stage_number} is locked.` },
            { status: 403 }
          );
        }
      }
    }

    const { data: databaseHint, error: hintError } = await supabase
      .from('hints')
      .select('id, hint_text, point_penalty')
      .eq('id', hintId)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (hintError) {
      console.error('Failed to fetch hint for purchase:', hintError);
      return NextResponse.json({ error: 'Unable to verify this hint.' }, { status: 500 });
    }

    const staticHint = databaseHint
      ? null
      : STAGE_HINTS[challenge.stage_number]?.find((hint) => hint.id === hintId);
    const hint = databaseHint || staticHint;

    if (!hint) {
      return NextResponse.json({ error: 'Hint not found for this challenge.' }, { status: 404 });
    }

    const cost = typeof hint.point_penalty === 'number' ? hint.point_penalty : 40;
    const { data: purchaseResult, error: purchaseError } = await supabase.rpc(
      'purchase_hint',
      {
        p_user_id: user.sub,
        p_challenge_id: challengeId,
        p_hint_id: hintId,
        p_cost: cost,
      }
    );

    if (purchaseError || !purchaseResult) {
      console.error('Hint purchase failed:', purchaseError);
      return NextResponse.json(
        { error: 'Hint purchase service is temporarily unavailable.' },
        { status: 503 }
      );
    }

    if (purchaseResult.status === 'insufficient_points') {
      return NextResponse.json(
        {
          error: 'Not enough XP to unlock this hint.',
          total_points: purchaseResult.total_points,
          required_points: cost,
        },
        { status: 402 }
      );
    }

    if (purchaseResult.status !== 'purchased' && purchaseResult.status !== 'already_unlocked') {
      console.error('Unexpected hint purchase result:', purchaseResult.status);
      return NextResponse.json({ error: 'Unable to purchase this hint.' }, { status: 500 });
    }

    return NextResponse.json({
      unlocked: true,
      alreadyUnlocked: purchaseResult.status === 'already_unlocked',
      hint_text: hint.hint_text,
      cost: purchaseResult.status === 'already_unlocked' ? 0 : cost,
      total_points: purchaseResult.total_points,
    });
  } catch (error) {
    console.error('Hint unlock error:', error);
    return NextResponse.json({ error: 'Failed to unlock hint.' }, { status: 500 });
  }
}