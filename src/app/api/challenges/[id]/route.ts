import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { STAGE_CONFIGS } from '@/lib/constants';
import { STAGE_HINTS } from '@/lib/stage-hints';

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

    // Get current challenge
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

    // admin skips lock
    const isAdmin = Boolean(authUser.is_admin);

    if (!isAdmin && challenge.stage_number > 1) {
      const { data: prevChallenge } = await supabase
        .from('challenges')
        .select('id')
        .eq('stage_number', challenge.stage_number - 1)
        .single();

      if (prevChallenge) {
        const { data: prevSolved } = await supabase
          .from('submissions')
          .select('id')
          .eq('user_id', authUser.sub)
          .eq('challenge_id', prevChallenge.id)
          .eq('is_correct', true)
          .single();

        if (!prevSolved) {
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
    }

    // Check if current user already solved this challenge
    const { data: solvedSubmission } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', authUser.sub)
      .eq('challenge_id', challengeId)
      .eq('is_correct', true)
      .single();

    // Get hints
    const { data: hints } = await supabase
      .from('hints')
      .select('id, hint_level, hint_text, point_penalty')
      .eq('challenge_id', challengeId)
      .order('hint_level', { ascending: true });

    // Tactical hints: prefer custom database hints if present, fallback to static defaults
    const configuredHints = STAGE_HINTS[challenge.stage_number];
    const finalHints = (hints && hints.length > 0) ? hints : (configuredHints || []);
    const stageConfig = STAGE_CONFIGS[challenge.stage_number];
    const { data: hintUnlocks, error: hintUnlocksError } = await supabase
      .from('user_hint_unlocks')
      .select('hint_id')
      .eq('user_id', authUser.sub)
      .eq('challenge_id', challengeId);

    if (hintUnlocksError) {
      console.error('Failed to fetch hint unlocks:', hintUnlocksError);
      return NextResponse.json(
        { error: 'Hint purchase status is temporarily unavailable.' },
        { status: 503 }
      );
    }

    const unlockedHintIds = new Set((hintUnlocks || []).map((unlock) => unlock.hint_id));
    const visibleHints = finalHints.map((hint) => {
      const unlocked = unlockedHintIds.has(hint.id);
      return {
        ...hint,
        hint_text: unlocked ? hint.hint_text : '',
        unlocked,
      };
    });

    return NextResponse.json({
      challenge: {
        ...challenge,
        solved: !!solvedSubmission,
        locked: false,
        unlocked: true,
      },
      stage_config: stageConfig
        ? {
            subsystemCode: stageConfig.subsystemCode,
            targetSystem: stageConfig.targetSystem,
            storyBrief: stageConfig.storyBrief,
            accessGuide: stageConfig.accessGuide,
            statusCheck: stageConfig.statusCheck,
          }
        : null,
      hints: visibleHints,
    });
  } catch (error) {
    console.error('Challenge detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenge' },
      { status: 500 }
    );
  }
}
