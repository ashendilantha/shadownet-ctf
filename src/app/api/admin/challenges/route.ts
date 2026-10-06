import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAuth } from '@/lib/auth';
import { hashFlag } from '@/lib/crypto';

// GET: Fetch all challenges with full administrative details
export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyAuth(request);
    if (!authUser || !authUser.is_admin) {
      return NextResponse.json(
        { error: 'Admin clearance required. Access denied.' },
        { status: 403 }
      );
    }

    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .order('stage_number', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also fetch hints for each challenge
    const { data: hints } = await supabase
      .from('hints')
      .select('*')
      .order('hint_level', { ascending: true });

    const challengesWithHints = (challenges || []).map((ch) => ({
      ...ch,
      hints: (hints || []).filter((h) => h.challenge_id === ch.id),
    }));

    return NextResponse.json({ challenges: challengesWithHints });
  } catch (error) {
    console.error('Admin get challenges error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching challenges' },
      { status: 500 }
    );
  }
}

// PATCH: Update challenge configuration (status, points, flag, etc.)
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
    const { id, is_active, points, name, description, difficulty, delivery_method, new_raw_flag } = body;

    if (!id) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (typeof points === 'number') updates.points = points;
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof description === 'string') updates.description = description;
    if (typeof difficulty === 'string') updates.difficulty = difficulty;
    if (typeof delivery_method === 'string') updates.delivery_method = delivery_method;
    if (new_raw_flag && typeof new_raw_flag === 'string' && new_raw_flag.trim()) {
      updates.flag_hash = hashFlag(new_raw_flag.trim());
    }

    const { data: updated, error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Challenge updated successfully',
      challenge: updated,
    });
  } catch (error) {
    console.error('Admin update challenge error:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating challenge' },
      { status: 500 }
    );
  }
}
