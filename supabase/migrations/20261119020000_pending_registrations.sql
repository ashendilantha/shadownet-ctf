-- Stores pending user registrations awaiting email confirmation link click
CREATE TABLE IF NOT EXISTS public.pending_registrations (
  email TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  team_name TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires_at
  ON public.pending_registrations (expires_at);
