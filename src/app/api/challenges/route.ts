import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies });

    const { data: challenges, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .order('stage_number', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ challenges });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}
