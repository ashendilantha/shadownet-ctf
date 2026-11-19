import { createClient } from '@supabase/supabase-js';

// Prefer dedicated SHADOWNET_SUPABASE_* vars so stale legacy Vercel env vars
// (pointing to the old paused/empty project) don't override the active database.
export const supabaseUrl =
  process.env.SHADOWNET_SUPABASE_URL ||
  'https://uzjiaebbcvpglstjludm.supabase.co';

export const supabaseAnonKey =
  process.env.SHADOWNET_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6amlhZWJiY3ZwZ2xzdGpsdWRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwNTk3NzgsImV4cCI6MjExMDYzNTc3OH0.iB2ebKqvKQ3PTO_-T2itMfa-hhv5QK-2MlfVugI6hig';

const supabaseKey =
  process.env.SHADOWNET_SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6amlhZWJiY3ZwZ2xzdGpsdWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTA1OTc3OCwiZXhwIjoyMTEwNjM1Nzc4fQ.kMtOZJ_IVbglGhBlMCSz1vLBYeqZ4eJzzPjOoWTBpWA';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export function createSupabaseAuthClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
