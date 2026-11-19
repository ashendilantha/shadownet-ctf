import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseUrl } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Optional CRON_SECRET check if configured in environment variables
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const startTime = Date.now();

  try {
    // Perform a lightweight query on challenges & users to register active database usage in Supabase
    const { data, error } = await supabase
      .from('challenges')
      .select('id')
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      console.error('Supabase keep-alive error:', error);
      return NextResponse.json(
        {
          status: 'error',
          active: false,
          message: error.message,
          hint: 'If your Supabase project is currently paused, click "Restore project" once in the Supabase Dashboard. This cron will prevent future pauses.',
          latency_ms: latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      active: true,
      supabase_host: new URL(supabaseUrl).host,
      records_checked: data?.length ?? 0,
      latency_ms: latencyMs,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Supabase keep-alive exception:', err);

    return NextResponse.json(
      {
        status: 'error',
        active: false,
        message: errorMessage,
        hint: 'If your Supabase project is currently paused, restore it once in the Supabase Dashboard (https://supabase.com/dashboard/project/uzjiaebbcvpglstjludm).',
        latency_ms: latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
