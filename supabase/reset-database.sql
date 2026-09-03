-- ============================================================
-- Oasis Oman — RESET DATABASE (run before fresh schema.sql)
-- Copy all → SQL Editor → Run
-- ============================================================

-- Storage policies (depend on is_admin)
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Public read site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins update site assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete site assets" ON storage.objects;

-- Table policies
DROP POLICY IF EXISTS "Public read visible products" ON products;
DROP POLICY IF EXISTS "Admins read all products" ON products;
DROP POLICY IF EXISTS "Admins manage products" ON products;
DROP POLICY IF EXISTS "Public read site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins manage site settings" ON site_settings;
DROP POLICY IF EXISTS "Public read published pages" ON site_pages;
DROP POLICY IF EXISTS "Admins read all site pages" ON site_pages;
DROP POLICY IF EXISTS "Admins manage site pages" ON site_pages;
DROP POLICY IF EXISTS "Admins manage orders" ON orders;
DROP POLICY IF EXISTS "Admins manage order items" ON order_items;
DROP POLICY IF EXISTS "Public read approved reviews" ON reviews;
DROP POLICY IF EXISTS "Public insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admins manage reviews" ON reviews;
DROP POLICY IF EXISTS "Public insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins manage contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admins read admin_users" ON admin_users;

-- Tables
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS site_pages CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- Functions & sequence
DROP FUNCTION IF EXISTS place_guest_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, NUMERIC
) CASCADE;
DROP FUNCTION IF EXISTS confirm_guest_payment(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;

DROP SEQUENCE IF EXISTS order_number_seq;

-- Done — now run schema.sql
