-- ============================================================
-- LINK ADMIN — Run AFTER schema.sql + creating Auth user
-- ============================================================

-- A) Create admin table if schema was not run fully
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read admin_users" ON admin_users;
CREATE POLICY "Admins read admin_users"
  ON admin_users FOR SELECT TO authenticated
  USING (is_admin());

-- B) Show all auth users (copy the email you see here)
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC;

-- C) Link ALL auth users as admin (works even if email is not admin@oasis.om)
INSERT INTO admin_users (user_id, email)
SELECT id, email
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;

-- D) Verify — every user should show OK ✅
SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  a.user_id AS admin_linked,
  CASE WHEN a.user_id IS NOT NULL THEN 'OK ✅ admin ready' ELSE '❌ not linked' END AS status
FROM auth.users u
LEFT JOIN admin_users a ON a.user_id = u.id
ORDER BY u.created_at DESC;
