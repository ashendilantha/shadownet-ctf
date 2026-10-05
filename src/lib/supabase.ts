import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPERBASE_URL ||
  'https://bsvvvibseqlapprvhuwz.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPERBASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzdnZ2aWJzZXFsYXBwcnZodXd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDEyMTQsImV4cCI6MjEwNjE3NzIxNH0.J4Y7ppYnasWLC5Bhafnpj-N9mZ7SSPhbIoE0hCG7T_8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});