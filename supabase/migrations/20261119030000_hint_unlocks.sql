-- Tracks which tactical hints each operative has unlocked (prevents duplicate XP charges)
CREATE TABLE IF NOT EXISTS public.hint_unlocks (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id INTEGER NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  hint_id INTEGER NOT NULL,
  cost INTEGER NOT NULL DEFAULT 40,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, hint_id)
);

CREATE INDEX IF NOT EXISTS idx_hint_unlocks_user_challenge
  ON public.hint_unlocks (user_id, challenge_id);
