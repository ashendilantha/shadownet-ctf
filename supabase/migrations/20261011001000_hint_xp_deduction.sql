CREATE TABLE IF NOT EXISTS public.user_hint_unlocks (
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id integer NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  hint_id integer NOT NULL,
  cost integer NOT NULL CHECK (cost >= 0),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, challenge_id, hint_id)
);

ALTER TABLE public.user_hint_unlocks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.user_hint_unlocks FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.purchase_hint(
  p_user_id uuid,
  p_challenge_id integer,
  p_hint_id integer,
  p_cost integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_points integer;
  v_unlocked boolean;
BEGIN
  IF p_cost < 0 THEN
    RAISE EXCEPTION 'Hint cost cannot be negative';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  SELECT EXISTS (
    SELECT 1
    FROM public.user_hint_unlocks
    WHERE user_id = p_user_id
      AND challenge_id = p_challenge_id
      AND hint_id = p_hint_id
  )
  INTO v_unlocked;

  IF v_unlocked THEN
    SELECT total_points INTO v_current_points
    FROM public.scores
    WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
      'status', 'already_unlocked',
      'total_points', COALESCE(v_current_points, 0)
    );
  END IF;

  SELECT total_points INTO v_current_points
  FROM public.scores
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF v_current_points IS NULL THEN
    RETURN jsonb_build_object('status', 'score_missing');
  END IF;

  IF v_current_points < p_cost THEN
    RETURN jsonb_build_object(
      'status', 'insufficient_points',
      'total_points', v_current_points
    );
  END IF;

  UPDATE public.scores
  SET total_points = v_current_points - p_cost
  WHERE user_id = p_user_id
  RETURNING total_points INTO v_current_points;

  INSERT INTO public.user_hint_unlocks (user_id, challenge_id, hint_id, cost)
  VALUES (p_user_id, p_challenge_id, p_hint_id, p_cost);

  RETURN jsonb_build_object(
    'status', 'purchased',
    'total_points', v_current_points
  );
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_hint(uuid, integer, integer, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purchase_hint(uuid, integer, integer, integer)
  TO service_role;