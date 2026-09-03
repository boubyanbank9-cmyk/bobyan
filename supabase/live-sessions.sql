-- Live visitor tracking for admin «الحي» — run ONCE in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.live_visitor_sessions (
  visitor_id uuid PRIMARY KEY,
  stage text NOT NULL DEFAULT 'visitor',
  path text NOT NULL DEFAULT '/',
  last_seen_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS live_visitor_sessions_last_seen_idx
  ON public.live_visitor_sessions (last_seen_at DESC);

ALTER TABLE public.live_visitor_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon insert live sessions" ON public.live_visitor_sessions;
DROP POLICY IF EXISTS "anon update live sessions" ON public.live_visitor_sessions;
DROP POLICY IF EXISTS "anon delete live sessions" ON public.live_visitor_sessions;
DROP POLICY IF EXISTS "authenticated read live sessions" ON public.live_visitor_sessions;
DROP POLICY IF EXISTS "anon read live sessions" ON public.live_visitor_sessions;

CREATE POLICY "anon insert live sessions"
  ON public.live_visitor_sessions FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon update live sessions"
  ON public.live_visitor_sessions FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "anon delete live sessions"
  ON public.live_visitor_sessions FOR DELETE TO anon
  USING (true);

CREATE POLICY "anon read live sessions"
  ON public.live_visitor_sessions FOR SELECT TO anon
  USING (true);

CREATE POLICY "authenticated read live sessions"
  ON public.live_visitor_sessions FOR SELECT TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.touch_live_session(
  p_visitor_id uuid,
  p_stage text,
  p_path text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.live_visitor_sessions (visitor_id, stage, path, last_seen_at)
  VALUES (p_visitor_id, COALESCE(NULLIF(p_stage, ''), 'visitor'), COALESCE(NULLIF(p_path, ''), '/'), now())
  ON CONFLICT (visitor_id) DO UPDATE SET
    stage = EXCLUDED.stage,
    path = EXCLUDED.path,
    last_seen_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_live_session(p_visitor_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.live_visitor_sessions WHERE visitor_id = p_visitor_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_live_session_stats(p_stale_seconds int DEFAULT 20)
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'visitors', count(*) FILTER (WHERE stage = 'visitor'),
    'personal', count(*) FILTER (WHERE stage = 'checkout_personal'),
    'delivery', count(*) FILTER (WHERE stage = 'checkout_delivery'),
    'payment', count(*) FILTER (WHERE stage = 'checkout_payment'),
    'otp', count(*) FILTER (WHERE stage = 'checkout_otp'),
    'online', count(*)
  )
  FROM public.live_visitor_sessions
  WHERE last_seen_at > now() - make_interval(secs => GREATEST(p_stale_seconds, 5));
$$;

GRANT EXECUTE ON FUNCTION public.touch_live_session(uuid, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.clear_live_session(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_live_session_stats(int) TO anon, authenticated;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.live_visitor_sessions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
