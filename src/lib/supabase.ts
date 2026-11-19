import { createClient } from '@supabase/supabase-js';

// Prefer dedicated SHADOWNET_SUPABASE_* vars so stale legacy Vercel env vars
// (pointing to the old paused/empty project) don't override the active database.
export const supabaseUrl =
  process.env.SHADOWNET_SUPABASE_URL ||
  'https://uzjiaebbcvpglstjludm.supabase.co';

const supabaseKey =
  process.env.SHADOWNET_SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6amlhZWJiY3ZwZ2xzdGpsdWRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5NTA1OTc3OCwiZXhwIjoyMTEwNjM1Nzc4fQ.kMtOZJ_IVbglGhBlMCSz1vLBYeqZ4eJzzPjOoWTBpWA';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
