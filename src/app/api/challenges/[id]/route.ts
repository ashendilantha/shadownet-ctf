import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { STAGE_CONFIGS } from '@/lib/constants';

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
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in first.' },
        { status: 401 }
      );
    }

    // Get current challenge (by id or stage_number)
    let { data: challenge, error } = await supabase
      .from('challenges')
      .select('id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active')
      .eq('id', challengeId)
      .maybeSingle();

    if (!challenge) {
      const stageLookup = await supabase
        .from('challenges')
        .select('id, name, domain, difficulty, description, points, delivery_method, stage_number, is_active')
        .eq('stage_number', challengeId)
        .maybeSingle();
      if (stageLookup.data) {
        challenge = stageLookup.data;
      }
    }

    // Fallback to static STAGE_CONFIGS if not found in database
    if (!challenge && STAGE_CONFIGS[challengeId]) {
      const config = STAGE_CONFIGS[challengeId];
      challenge = {
        id: challengeId,
        name: config.name,
        domain: config.domain,
        difficulty: config.difficulty,
        description: config.storyBrief,
        points: config.points,
        delivery_method: config.type.toLowerCase(),
        stage_number: config.stage,
        is_active: true,
      };
    }

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // admin skips lock
    const isAdmin = Boolean(authUser.is_admin);

    if (!isAdmin && challenge.stage_number > 1) {
      const { data: prevChallenge } = await supabase
        .from('challenges')
        .select('id')
        .eq('stage_number', challenge.stage_number - 1)
        .maybeSingle();

      const prevChallengeId = prevChallenge?.id ?? (challenge.stage_number - 1);

      const { data: prevSolved } = await supabase
        .from('submissions')
        .select('id')
        .eq('user_id', authUser.sub)
        .or(`challenge_id.eq.${prevChallengeId},challenge_id.eq.${challenge.stage_number - 1}`)
        .eq('is_correct', true)
        .limit(1);

      if (!prevSolved || prevSolved.length === 0) {
        return NextResponse.json(
          {
            error: `Stage ${challenge.stage_number} is locked. You must complete Stage ${challenge.stage_number - 1} first.`,
            locked: true,
            required_stage: challenge.stage_number - 1,
            challenge: {
              id: challenge.id,
              name: challenge.name,
              domain: challenge.domain,
              difficulty: challenge.difficulty,
              stage_number: challenge.stage_number,
              points: challenge.points,
              locked: true,
            },
          },
          { status: 403 }
        );
      }
    }

    // Check if current user already solved this challenge
    const { data: solvedSubmissions } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', authUser.sub)
      .or(`challenge_id.eq.${challenge.id},challenge_id.eq.${challenge.stage_number}`)
      .eq('is_correct', true)
      .limit(1);

    const isSolved = Boolean(solvedSubmissions && solvedSubmissions.length > 0);

    // Get hints
    const { data: hints } = await supabase
      .from('hints')
      .select('id, hint_level, hint_text, point_penalty')
      .or(`challenge_id.eq.${challenge.id},challenge_id.eq.${challenge.stage_number}`)
      .order('hint_level', { ascending: true });

    // Tactical hints: prefer custom database hints if present, fallback to static defaults
    const configuredHints = STAGE_CONFIGS[challenge.stage_number]?.hints;
    const finalHints = (hints && hints.length > 0) ? hints : (configuredHints || []);

    return NextResponse.json({
      challenge: {
        ...challenge,
        solved: isSolved,
        locked: false,
        unlocked: true,
      },
      hints: finalHints,
    });
  } catch (error) {
    console.error('Challenge detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}
