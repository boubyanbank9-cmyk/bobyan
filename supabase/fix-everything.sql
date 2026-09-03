-- ============================================================
-- FIX EVERYTHING — Oasis Oman admin login
-- Run this ONCE in SQL Editor (OASIS OMAN project)
-- ============================================================

-- 1) Restore Oasis is_admin() (NOT profiles.role)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- 2) Ensure admin_users table exists
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read admin_users" ON public.admin_users;
CREATE POLICY "Admins read admin_users"
  ON public.admin_users FOR SELECT TO authenticated
  USING (is_admin());

-- 3) Link YOUR users as admin (from Authentication screenshot)
INSERT INTO public.admin_users (user_id, email)
SELECT id, email FROM auth.users
WHERE id IN (
  '5f5ac799-5f5f-4c4e-a1c4-ba46a1a2efec',  -- admin@oasis.om
  '0bd18d41-0552-4cde-8a97-d9435312d969'   -- saidagha1310@gmail.com
)
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

-- 4) Also link any other auth user (safe fallback)
INSERT INTO public.admin_users (user_id, email)
SELECT id, email FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

-- 5) Verify — must show OK ✅ for both users
SELECT
  u.id,
  u.email,
  a.user_id AS admin_linked,
  CASE WHEN a.user_id IS NOT NULL THEN 'OK ✅' ELSE '❌ NOT ADMIN' END AS status
FROM auth.users u
LEFT JOIN public.admin_users a ON a.user_id = u.id
ORDER BY u.created_at DESC;

-- 6) Test is_admin logic (optional — run while logged in won't work here)
-- After login from app, dashboard should work.
