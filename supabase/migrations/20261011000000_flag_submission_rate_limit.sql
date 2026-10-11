CREATE TABLE IF NOT EXISTS public.flag_submission_locks (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_until timestamptz NOT NULL
);

ALTER TABLE public.flag_submission_locks ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.flag_submission_locks FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.record_flag_submission(
  p_user_id uuid,
  p_challenge_id integer,
  p_submitted_flag text,
  p_is_correct boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_blocked_until timestamptz;
  v_failed_count bigint;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  SELECT blocked_until
  INTO v_blocked_until
  FROM public.flag_submission_locks
  WHERE user_id = p_user_id;

  IF v_blocked_until > v_now THEN
    RETURN jsonb_build_object(
      'status', 'blocked',
      'blocked_until', v_blocked_until
    );
  END IF;

  IF p_is_correct THEN
    IF EXISTS (
      SELECT 1
      FROM public.submissions
      WHERE user_id = p_user_id
        AND challenge_id = p_challenge_id
        AND is_correct = TRUE
    ) THEN
      RETURN jsonb_build_object('status', 'already_solved');
    END IF;

    INSERT INTO public.submissions (
      user_id,
      challenge_id,
      submitted_flag,
      is_correct,
      submitted_at
    )
    VALUES (
      p_user_id,
      p_challenge_id,
      p_submitted_flag,
      TRUE,
      v_now
    );

    RETURN jsonb_build_object('status', 'correct');
  END IF;

  INSERT INTO public.submissions (
    user_id,
    challenge_id,
    submitted_flag,
    is_correct,
    submitted_at
  )
  VALUES (
    p_user_id,
    p_challenge_id,
    p_submitted_flag,
    FALSE,
    v_now
  );

  SELECT COUNT(*)
  INTO v_failed_count
  FROM public.submissions
  WHERE user_id = p_user_id
    AND is_correct = FALSE
    AND submitted_at >= v_now - INTERVAL '10 seconds';

  IF v_failed_count >= 5 THEN
    v_blocked_until := v_now + INTERVAL '10 minutes';

    INSERT INTO public.flag_submission_locks (user_id, blocked_until)
    VALUES (p_user_id, v_blocked_until)
    ON CONFLICT (user_id)
    DO UPDATE SET blocked_until = EXCLUDED.blocked_until;

    RETURN jsonb_build_object(
      'status', 'blocked',
      'blocked_until', v_blocked_until
    );
  END IF;

  RETURN jsonb_build_object('status', 'incorrect');
END;
$$;

REVOKE ALL ON FUNCTION public.record_flag_submission(uuid, integer, text, boolean)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_flag_submission(uuid, integer, text, boolean)
  TO service_role;