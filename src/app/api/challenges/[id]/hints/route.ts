import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { STAGE_CONFIGS } from '@/lib/constants';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in first.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const challengeParam = parseInt(id, 10);
    if (isNaN(challengeParam)) {
      return NextResponse.json({ error: 'Invalid challenge ID.' }, { status: 400 });
    }

    const body = await request.json();
    const hintId = Number(body?.hintId);
    if (!hintId || isNaN(hintId)) {
      return NextResponse.json({ error: 'Valid hintId is required.' }, { status: 400 });
    }

    // Resolve challenge by id or stage_number
    let { data: challenge } = await supabase
      .from('challenges')
      .select('id, stage_number')
      .eq('id', challengeParam)
      .maybeSingle();

    if (!challenge) {
      const byStage = await supabase
        .from('challenges')
        .select('id, stage_number')
        .eq('stage_number', challengeParam)
        .maybeSingle();
      challenge = byStage.data;
    }

    const resolvedChallengeId = challenge?.id ?? challengeParam;
    const resolvedStageNumber = challenge?.stage_number ?? challengeParam;

    // Look up hint in database first
    let { data: dbHint } = await supabase
      .from('hints')
      .select('id, challenge_id, hint_level, hint_text, point_penalty')
      .eq('id', hintId)
      .maybeSingle();

    // Fallback to static STAGE_CONFIGS hints if not in DB
    let hintText = dbHint?.hint_text || '';
    let cost = typeof dbHint?.point_penalty === 'number' ? Math.max(0, dbHint.point_penalty) : 40;

    if (!dbHint) {
      const staticHints = STAGE_CONFIGS[resolvedStageNumber]?.hints || [];
      const staticMatch = staticHints.find((h) => h.id === hintId);
      if (!staticMatch) {
        return NextResponse.json({ error: 'Hint not found for this stage.' }, { status: 404 });
      }
      hintText = staticMatch.hint_text;
      cost = typeof staticMatch.point_penalty === 'number' ? Math.max(0, staticMatch.point_penalty) : 40;
    }

    // Check if user already unlocked this hint
    const { data: existingUnlock } = await supabase
      .from('hint_unlocks')
      .select('id')
      .eq('user_id', authUser.sub)
      .eq('hint_id', hintId)
      .maybeSingle();

    if (existingUnlock) {
      return NextResponse.json({
        hint_id: hintId,
        hint_text: hintText,
        alreadyUnlocked: true,
        cost: 0,
      });
    }

    // Record unlock in hint_unlocks
    const { error: unlockError } = await supabase.from('hint_unlocks').insert({
      user_id: authUser.sub,
      challenge_id: resolvedChallengeId,
      hint_id: hintId,
      cost,
    });

    if (unlockError) {
      console.error('Hint unlock insert error:', unlockError);
      return NextResponse.json(
        { error: 'Failed to record hint unlock. Please try again.' },
        { status: 500 }
      );
    }

    // Deduct XP from scores (floor at 0 so Stage 1 operatives with 0 XP aren't blocked)
    const { data: currentScore } = await supabase
      .from('scores')
      .select('total_points')
      .eq('user_id', authUser.sub)
      .maybeSingle();

    const currentPoints = currentScore?.total_points ?? 0;
    const deducted = Math.min(currentPoints, cost);
    const newPoints = Math.max(0, currentPoints - cost);

    if (currentScore) {
      await supabase
        .from('scores')
        .update({ total_points: newPoints })
        .eq('user_id', authUser.sub);
    }

    return NextResponse.json({
      hint_id: hintId,
      hint_text: hintText,
      alreadyUnlocked: false,
      cost: deducted,
      configured_cost: cost,
      remaining_points: newPoints,
    });
  } catch (error) {
    console.error('Unlock hint error:', error);
    return NextResponse.json(
      { error: 'Unable to decrypt this hint. Please try again.' },
      { status: 500 }
    );
  }
}
