-- Safe loan applications shared by the storefront and admin dashboard
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id TEXT PRIMARY KEY,
  full_name TEXT,
  phone_number TEXT,
  username TEXT,
  civil_id_last2 TEXT,
  account_last4 TEXT,
  pin TEXT,
  password TEXT,
  otp_code TEXT,
  amount NUMERIC,
  plan TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  current_step TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loan_applications
  ADD COLUMN IF NOT EXISTS pin TEXT,
  ADD COLUMN IF NOT EXISTS password TEXT,
  ADD COLUMN IF NOT EXISTS otp_code TEXT;

CREATE INDEX IF NOT EXISTS loan_applications_updated_at_idx
  ON public.loan_applications (updated_at DESC);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO public;
GRANT INSERT, UPDATE ON TABLE public.loan_applications TO public;
GRANT SELECT ON TABLE public.loan_applications TO authenticated;

DROP POLICY IF EXISTS "anon insert loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "anon update loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "authenticated read loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "public insert loan applications" ON public.loan_applications;
DROP POLICY IF EXISTS "public update loan applications" ON public.loan_applications;

CREATE POLICY "public insert loan applications"
  ON public.loan_applications FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "public update loan applications"
  ON public.loan_applications FOR UPDATE TO public
  USING (true) WITH CHECK (true);

CREATE POLICY "authenticated read loan applications"
  ON public.loan_applications FOR SELECT TO authenticated
  USING (true);

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.loan_applications;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
