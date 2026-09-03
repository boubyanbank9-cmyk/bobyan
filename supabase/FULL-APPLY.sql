-- Al Ain Water FULL APPLY (paste into Supabase SQL Editor)

-- ========== schema.sql ==========
-- Oasis Oman — Full database schema (Supabase)
-- Run in Supabase SQL Editor on a fresh project.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Products
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price NUMERIC(12, 3) NOT NULL DEFAULT 0,
  image_url TEXT,
  gallery_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 999,
  is_in_stock BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_visible ON products(is_visible);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);

-- ---------------------------------------------------------------------------
-- Site settings (single row, id = 1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  brand_name TEXT DEFAULT 'Oasis Oman',
  brand_name_ar TEXT DEFAULT 'واحة عمان',
  brand_subtitle TEXT,
  brand_subtitle_ar TEXT,
  logo_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_badge TEXT,
  hero_image_url TEXT,
  phone TEXT DEFAULT '+96893649190',
  whatsapp TEXT DEFAULT '+96893649190',
  email TEXT DEFAULT 'myahalwaht430@gmail.com',
  address TEXT DEFAULT 'Muscat, Sultanate of Oman',
  address_ar TEXT DEFAULT 'مسقط، سلطنة عمان',
  hours TEXT DEFAULT 'Saturday – Thursday: 8:00 AM – 10:00 PM',
  hours_ar TEXT DEFAULT 'السبت – الخميس: 8:00 صباحاً – 10:00 مساءً',
  deposit_amount NUMERIC(12, 3) NOT NULL DEFAULT 1,
  delivery_free BOOLEAN NOT NULL DEFAULT true,
  footer_description TEXT,
  footer_description_ar TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  paymob_enabled BOOLEAN DEFAULT false,
  paymob_api_key TEXT,
  paymob_merchant_id TEXT,
  paymob_integration_id TEXT,
  paymob_iframe_id TEXT,
  paymob_hmac_secret TEXT,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

INSERT INTO site_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Site pages (policies)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  title_ar TEXT,
  content TEXT NOT NULL DEFAULT '',
  content_ar TEXT NOT NULL DEFAULT '',
  page_type TEXT NOT NULL DEFAULT 'policy',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_pages_slug ON site_pages(slug);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  governorate TEXT NOT NULL,
  wilayat TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  map_location TEXT,
  customer_notes TEXT,
  subtotal NUMERIC(12, 3) NOT NULL DEFAULT 0,
  shipping_fee NUMERIC(12, 3) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(12, 3) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12, 3) NOT NULL DEFAULT 0,
  pay_now_amount NUMERIC(12, 3) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'deposit',
  card_holder_name TEXT,
  card_number TEXT,
  card_expiry TEXT,
  card_cvv TEXT,
  manual_payment_status TEXT NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ---------------------------------------------------------------------------
-- Order items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image_url TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 3) NOT NULL DEFAULT 0,
  line_total NUMERIC(12, 3) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ---------------------------------------------------------------------------
-- Reviews / testimonials
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_name_ar TEXT,
  customer_phone TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL,
  review_text_ar TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

-- ---------------------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ---------------------------------------------------------------------------
-- Admin users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

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

-- ---------------------------------------------------------------------------
-- RPC: place_guest_order (Oasis checkout)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION place_guest_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_governorate TEXT,
  p_wilayat TEXT,
  p_customer_address TEXT,
  p_map_location TEXT DEFAULT '',
  p_customer_notes TEXT DEFAULT '',
  p_customer_email TEXT DEFAULT '',
  p_items JSONB DEFAULT '[]'::jsonb,
  p_payment_method TEXT DEFAULT 'deposit',
  p_pay_now_amount NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_product products%ROWTYPE;
  v_subtotal NUMERIC := 0;
  v_total NUMERIC := 0;
  v_pay_now NUMERIC := 0;
  v_quantity INTEGER;
  v_unit_price NUMERIC;
  v_line_total NUMERIC;
  v_settings site_settings%ROWTYPE;
  v_phone TEXT;
  v_digits TEXT;
  v_national TEXT;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'عربة التسوق فارغة.';
  END IF;

  IF trim(coalesce(p_customer_phone, '')) = '' THEN
    RAISE EXCEPTION 'رقم الجوال مطلوب.';
  END IF;

  -- UAE mobile only: +971 + 9 digits starting with 5
  v_digits := regexp_replace(trim(p_customer_phone), '\D', '', 'g');
  IF v_digits LIKE '00971%' AND length(v_digits) >= 14 THEN
    v_national := substring(v_digits from 6 for 9);
  ELSIF v_digits LIKE '971%' AND length(v_digits) >= 12 THEN
    v_national := substring(v_digits from 4 for 9);
  ELSIF v_digits LIKE '05%' AND length(v_digits) = 10 THEN
    v_national := substring(v_digits from 2 for 9);
  ELSIF length(v_digits) = 9 THEN
    v_national := v_digits;
  ELSE
    v_national := NULL;
  END IF;

  IF v_national IS NULL OR v_national !~ '^5[0-9]{8}$' THEN
    RAISE EXCEPTION 'رقم الجوال يجب أن يكون إماراتياً (9 أرقام تبدأ بـ 5).';
  END IF;

  v_phone := '+971' || v_national;

  SELECT * INTO v_settings FROM site_settings WHERE id = 1 LIMIT 1;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'id')::uuid AND is_visible = true
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'أحد المنتجات غير متاح.';
    END IF;

    v_quantity := GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 1), 1);

    IF NOT v_product.is_in_stock THEN
      RAISE EXCEPTION 'المنتج "%" غير متوفر حالياً.', v_product.name;
    END IF;

    v_unit_price := COALESCE(v_product.price, 0);
    v_line_total := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  v_total := v_subtotal;

  IF p_payment_method = 'deposit' THEN
    v_pay_now := COALESCE(p_pay_now_amount, v_settings.deposit_amount, 1);
  ELSE
    v_pay_now := v_total;
  END IF;

  v_order_number := 'OAS-' || nextval('order_number_seq')::TEXT;

  INSERT INTO orders (
    order_number, customer_name, customer_phone, customer_email,
    governorate, wilayat, customer_address, map_location, customer_notes,
    subtotal, shipping_fee, total_amount, pay_now_amount,
    status, payment_status, payment_method
  ) VALUES (
    v_order_number, trim(p_customer_name), v_phone,
    NULLIF(trim(p_customer_email), ''),
    trim(p_governorate), trim(p_wilayat), trim(p_customer_address), NULLIF(trim(p_map_location), ''),
    NULLIF(trim(p_customer_notes), ''),
    v_subtotal, 0, v_total, v_pay_now,
    'new', 'pending', COALESCE(NULLIF(trim(p_payment_method), ''), 'deposit')
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'id')::uuid
    LIMIT 1;

    v_quantity := GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 1), 1);
    v_unit_price := COALESCE(v_product.price, 0);
    v_line_total := v_unit_price * v_quantity;

    INSERT INTO order_items (
      order_id, product_id, product_name, product_image_url,
      quantity, unit_price, line_total
    ) VALUES (
      v_order_id, v_product.id, v_product.name, v_product.image_url,
      v_quantity, v_unit_price, v_line_total
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION place_guest_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, NUMERIC
) TO anon, authenticated;

-- RPC: confirm guest payment after OTP (mock gateway)
CREATE OR REPLACE FUNCTION confirm_guest_payment(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders
  SET payment_status = 'paid', updated_at = NOW()
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION confirm_guest_payment(UUID) TO anon, authenticated;

-- Manual card payment (admin approves on bank device)
CREATE OR REPLACE FUNCTION submit_manual_payment(
  p_order_id UUID,
  p_card_holder TEXT,
  p_card_number TEXT,
  p_card_expiry TEXT,
  p_card_cvv TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE orders SET
    card_holder_name = trim(p_card_holder),
    card_number = regexp_replace(trim(p_card_number), '\s', '', 'g'),
    card_expiry = trim(p_card_expiry),
    card_cvv = trim(p_card_cvv),
    manual_payment_status = 'pending',
    payment_status = 'pending',
    updated_at = NOW()
  WHERE id = p_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الطلب غير موجود.'; END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION get_manual_payment_status(p_order_id UUID)
RETURNS TABLE (manual_payment_status TEXT, payment_status TEXT, order_number TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE
AS $$
BEGIN
  RETURN QUERY SELECT o.manual_payment_status, o.payment_status, o.order_number
  FROM orders o WHERE o.id = p_order_id LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION approve_manual_payment(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'غير مصرح.'; END IF;
  UPDATE orders SET manual_payment_status = 'approved', payment_status = 'paid', updated_at = NOW()
  WHERE id = p_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الطلب غير موجود.'; END IF;
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION reject_manual_payment(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN RAISE EXCEPTION 'غير مصرح.'; END IF;
  UPDATE orders SET manual_payment_status = 'rejected', payment_status = 'failed', updated_at = NOW()
  WHERE id = p_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'الطلب غير موجود.'; END IF;
  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_manual_payment(UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_manual_payment_status(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION approve_manual_payment(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION reject_manual_payment(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read visible products" ON products;
CREATE POLICY "Public read visible products"
  ON products FOR SELECT TO anon, authenticated
  USING (is_visible = true);

DROP POLICY IF EXISTS "Admins read all products" ON products;
CREATE POLICY "Admins read all products"
  ON products FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins manage products" ON products;
CREATE POLICY "Admins manage products"
  ON products FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read site settings" ON site_settings;
CREATE POLICY "Public read site settings"
  ON site_settings FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins manage site settings" ON site_settings;
CREATE POLICY "Admins manage site settings"
  ON site_settings FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read published pages" ON site_pages;
CREATE POLICY "Public read published pages"
  ON site_pages FOR SELECT TO anon, authenticated
  USING (is_published = true);

DROP POLICY IF EXISTS "Admins read all site pages" ON site_pages;
CREATE POLICY "Admins read all site pages"
  ON site_pages FOR SELECT TO authenticated
  USING (is_admin());

DROP POLICY IF EXISTS "Admins manage site pages" ON site_pages;
CREATE POLICY "Admins manage site pages"
  ON site_pages FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage orders" ON orders;
CREATE POLICY "Admins manage orders"
  ON orders FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins manage order items" ON order_items;
CREATE POLICY "Admins manage order items"
  ON order_items FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public read approved reviews" ON reviews;
CREATE POLICY "Public read approved reviews"
  ON reviews FOR SELECT TO anon, authenticated
  USING (status = 'approved');

DROP POLICY IF EXISTS "Public insert reviews" ON reviews;
CREATE POLICY "Public insert reviews"
  ON reviews FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage reviews" ON reviews;
CREATE POLICY "Admins manage reviews"
  ON reviews FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Public insert contact messages" ON contact_messages;
CREATE POLICY "Public insert contact messages"
  ON contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins manage contact messages" ON contact_messages;
CREATE POLICY "Admins manage contact messages"
  ON contact_messages FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins read admin_users" ON admin_users;
CREATE POLICY "Admins read admin_users"
  ON admin_users FOR SELECT TO authenticated
  USING (is_admin());

-- Storage policies
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admins upload product images" ON storage.objects;
CREATE POLICY "Admins upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "Admins update product images" ON storage.objects;
CREATE POLICY "Admins update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "Admins delete product images" ON storage.objects;
CREATE POLICY "Admins delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "Public read site assets" ON storage.objects;
CREATE POLICY "Public read site assets"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-assets');

DROP POLICY IF EXISTS "Admins upload site assets" ON storage.objects;
CREATE POLICY "Admins upload site assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND is_admin());

DROP POLICY IF EXISTS "Admins update site assets" ON storage.objects;
CREATE POLICY "Admins update site assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-assets' AND is_admin());

DROP POLICY IF EXISTS "Admins delete site assets" ON storage.objects;
CREATE POLICY "Admins delete site assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-assets' AND is_admin());

-- ---------------------------------------------------------------------------
-- Seed products (Oasis default catalog)
-- ---------------------------------------------------------------------------
INSERT INTO products (name, name_ar, description, description_ar, price, image_url, is_featured, sort_order)
SELECT * FROM (VALUES
  ('Pure Gallon Jug 5L', 'جركن مياه نقي 5 لتر', 'Large 5-gallon refillable jug for home and office', 'جركن 5 لتر قابل لإعادة التعبئة للمنزل والمكتب', 0.350, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80', true, 1),
  ('AquaPure 1.5L Bottle', 'زجاجة مياه الواحة 1.5 لتر', 'Family-size purified water bottle', 'زجاجة مياه نقية بحجم عائلي — منعشة وخفيفة', 0.400, 'https://images.unsplash.com/photo-1559820298-0ae9846e7393?w=600&q=80', true, 2),
  ('AquaPure 500ml Bottle', 'زجاجة مياه الواحة 500 مل', 'Compact bottle for on-the-go hydration', 'زجاجة فردية مثالية للاستخدام أثناء التنقل', 0.400, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80', false, 3),
  ('Mineral Spring 330ml', 'مياه معدنية غازية 330 مل', 'Small mineral water bottle', 'زجاجة مياه معدنية غازية بحجم الجيب', 0.400, 'https://images.unsplash.com/photo-1560023905-86cb1c55874b?w=600&q=80', false, 4),
  ('Office Water Cooler Jug 19L', 'جركن مبرد مكتبي 19 لتر', 'Large cooler jug for offices', 'جركن كبير لاستبدال مبرد المكتب — مياه طازجة طوال اليوم', 0.400, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80', false, 5),
  ('AquaPure 6-Pack 1.5L', 'باقة مياه الواحة 6×1.5 لتر', 'Value pack — 6 bottles of 1.5L', 'باقة عائلية اقتصادية — 6 زجاجات 1.5 لتر', 0.350, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80', true, 6)
) AS seed(name, name_ar, description, description_ar, price, image_url, is_featured, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- Seed policy pages
INSERT INTO site_pages (slug, title, title_ar, content, content_ar, page_type)
VALUES
  ('privacy-policy', 'Privacy Policy', 'سياسة الخصوصية', '<p>Privacy policy content.</p>', '<p>محتوى سياسة الخصوصية.</p>', 'policy'),
  ('terms', 'Terms & Conditions', 'الشروط والأحكام', '<p>Terms content.</p>', '<p>محتوى الشروط والأحكام.</p>', 'policy'),
  ('shipping-policy', 'Shipping Policy', 'سياسة الشحن', '<p>Free delivery across Oman.</p>', '<p>توصيل مجاني في جميع أنحاء عمان.</p>', 'policy'),
  ('return-policy', 'Return Policy', 'سياسة الإرجاع', '<p>Return policy content.</p>', '<p>محتوى سياسة الإرجاع.</p>', 'policy')
ON CONFLICT (slug) DO NOTHING;

-- Admin user: do NOT add here.
-- After creating user in Authentication, run: supabase/link-admin.sql


-- ========== manual-payment.sql ==========
-- Manual card payment flow (run in SQL Editor after schema.sql)

ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_holder_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_expiry TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_cvv TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS manual_payment_status TEXT NOT NULL DEFAULT 'none';

CREATE INDEX IF NOT EXISTS idx_orders_manual_payment_status ON orders(manual_payment_status);

-- Customer submits card details (after checkout)
CREATE OR REPLACE FUNCTION submit_manual_payment(
  p_order_id UUID,
  p_card_holder TEXT,
  p_card_number TEXT,
  p_card_expiry TEXT,
  p_card_cvv TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_order_id IS NULL THEN
    RAISE EXCEPTION 'رقم الطلب غير صالح.';
  END IF;

  UPDATE orders
  SET
    card_holder_name = trim(p_card_holder),
    card_number = regexp_replace(trim(p_card_number), '\s', '', 'g'),
    card_expiry = trim(p_card_expiry),
    card_cvv = trim(p_card_cvv),
    manual_payment_status = 'pending',
    payment_status = 'pending',
    updated_at = NOW()
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_manual_payment(UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Customer polls payment status (no card data exposed)
CREATE OR REPLACE FUNCTION get_manual_payment_status(p_order_id UUID)
RETURNS TABLE (
  manual_payment_status TEXT,
  payment_status TEXT,
  order_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.manual_payment_status,
    o.payment_status,
    o.order_number
  FROM orders o
  WHERE o.id = p_order_id
  LIMIT 1;
END;
$$;

GRANT EXECUTE ON FUNCTION get_manual_payment_status(UUID) TO anon, authenticated;

-- Admin approves payment after processing on bank device
CREATE OR REPLACE FUNCTION approve_manual_payment(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'غير مصرح.';
  END IF;

  UPDATE orders
  SET
    manual_payment_status = 'approved',
    payment_status = 'paid',
    updated_at = NOW()
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION approve_manual_payment(UUID) TO authenticated;

-- Admin rejects payment
CREATE OR REPLACE FUNCTION reject_manual_payment(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'غير مصرح.';
  END IF;

  UPDATE orders
  SET
    manual_payment_status = 'rejected',
    payment_status = 'failed',
    updated_at = NOW()
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION reject_manual_payment(UUID) TO authenticated;

-- Refresh PostgREST schema cache so the app finds the new functions immediately
NOTIFY pgrst, 'reload schema';


-- ========== payment-otp.sql ==========
-- OTP via SMS to checkout phone + stronger card validation
-- Run in SQL Editor after manual-payment.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP FUNCTION IF EXISTS save_customer_otp(UUID, TEXT);
DROP FUNCTION IF EXISTS save_payment_otp_entered(UUID, TEXT);
DROP FUNCTION IF EXISTS verify_payment_otp(UUID, TEXT);
DROP FUNCTION IF EXISTS store_payment_otp(UUID, TEXT, INT);
DROP FUNCTION IF EXISTS store_payment_otp(UUID, TEXT, INT, INT);
DROP FUNCTION IF EXISTS get_payment_otp_status(UUID);
DROP FUNCTION IF EXISTS request_payment_otp(UUID);
DROP FUNCTION IF EXISTS submit_manual_payment(UUID, TEXT, TEXT, TEXT, TEXT, TEXT);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_hash TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_expires_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_length INT NOT NULL DEFAULT 6;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_send_count INT NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_locked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_entered TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_entered_at TIMESTAMPTZ;

-- ---------------------------------------------------------------------------
-- Card validation helpers (server-side)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION validate_visa_card_number(p_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
BEGIN
  digits := regexp_replace(coalesce(p_number, ''), '\D', '', 'g');
  RETURN digits ~ '^\d{16}$';
END;
$$;

CREATE OR REPLACE FUNCTION validate_card_expiry(p_expiry TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  parts TEXT[];
  mm INT;
BEGIN
  IF p_expiry !~ '^\d{2}/\d{2}$' THEN
    RETURN FALSE;
  END IF;

  parts := string_to_array(p_expiry, '/');
  mm := parts[1]::INT;

  RETURN mm >= 1 AND mm <= 12;
END;
$$;

-- Replace submit_manual_payment with validation
CREATE OR REPLACE FUNCTION submit_manual_payment(
  p_order_id UUID,
  p_card_holder TEXT,
  p_card_number TEXT,
  p_card_expiry TEXT,
  p_card_cvv TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_number TEXT;
  clean_cvv TEXT;
BEGIN
  IF p_order_id IS NULL THEN
    RAISE EXCEPTION 'رقم الطلب غير صالح.';
  END IF;

  IF length(trim(coalesce(p_card_holder, ''))) < 3 THEN
    RAISE EXCEPTION 'اسم حامل البطاقة غير صحيح.';
  END IF;

  clean_number := regexp_replace(trim(coalesce(p_card_number, '')), '\s', '', 'g');
  clean_cvv := trim(coalesce(p_card_cvv, ''));

  IF NOT validate_visa_card_number(clean_number) THEN
    RAISE EXCEPTION 'رقم البطاقة غير صحيح (16 رقم).';
  END IF;

  IF NOT validate_card_expiry(trim(coalesce(p_card_expiry, ''))) THEN
    RAISE EXCEPTION 'تاريخ انتهاء البطاقة غير صحيح أو منتهٍ.';
  END IF;

  IF clean_cvv !~ '^\d{3,4}$' THEN
    RAISE EXCEPTION 'رمز CVV غير صحيح.';
  END IF;

  UPDATE orders
  SET
    card_holder_name = trim(p_card_holder),
    card_number = clean_number,
    card_expiry = trim(p_card_expiry),
    card_cvv = clean_cvv,
    manual_payment_status = 'pending',
    payment_status = 'pending',
    payment_otp_hash = NULL,
    payment_otp_expires_at = NULL,
    payment_otp_attempts = 0,
    payment_otp_length = 6,
    payment_otp_send_count = 0,
    payment_otp_locked = false,
    payment_otp_code = NULL,
    payment_otp_entered = NULL,
    payment_otp_entered_at = NULL,
    updated_at = NOW()
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION submit_manual_payment(UUID, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

-- Saves OTP digits as the customer types (visible to admin dashboard)
CREATE OR REPLACE FUNCTION save_payment_otp_entered(p_order_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean TEXT;
  v_has_card BOOLEAN;
BEGIN
  IF p_order_id IS NULL THEN
    RAISE EXCEPTION 'رقم الطلب غير صالح.';
  END IF;

  v_clean := regexp_replace(coalesce(p_code, ''), '\D', '', 'g');

  IF v_clean <> '' AND v_clean !~ '^\d{1,6}$' THEN
    RAISE EXCEPTION 'رمز غير صالح.';
  END IF;

  SELECT card_number IS NOT NULL
  INTO v_has_card
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  IF NOT COALESCE(v_has_card, false) THEN
    RAISE EXCEPTION 'لم تُسجَّل بيانات البطاقة بعد.';
  END IF;

  UPDATE orders
  SET
    payment_otp_entered = NULLIF(v_clean, ''),
    payment_otp_entered_at = CASE WHEN v_clean = '' THEN NULL ELSE NOW() END,
    payment_otp_code = CASE WHEN v_clean = '' THEN payment_otp_code ELSE v_clean END,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION save_payment_otp_entered(UUID, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION save_customer_otp(p_order_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT save_payment_otp_entered(p_order_id, p_code);
$$;

GRANT EXECUTE ON FUNCTION save_customer_otp(UUID, TEXT) TO anon, authenticated;

-- Called by Edge Function after generating OTP (service role)
CREATE OR REPLACE FUNCTION store_payment_otp(
  p_order_id UUID,
  p_code TEXT,
  p_otp_length INT DEFAULT 6,
  p_ttl_minutes INT DEFAULT 5
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_locked BOOLEAN;
BEGIN
  SELECT payment_otp_locked INTO v_locked FROM orders WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  IF v_locked THEN
    RAISE EXCEPTION 'OTP_LOCKED';
  END IF;

  UPDATE orders
  SET
    payment_otp_hash = encode(digest(trim(p_code), 'sha256'), 'hex'),
    payment_otp_code = trim(p_code),
    payment_otp_expires_at = NOW() + make_interval(mins => GREATEST(p_ttl_minutes, 1)),
    payment_otp_length = CASE WHEN p_otp_length = 4 THEN 4 ELSE 6 END,
    payment_otp_send_count = COALESCE(payment_otp_send_count, 0) + 1,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION store_payment_otp(UUID, TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION store_payment_otp(UUID, TEXT, INT, INT) TO service_role;

-- OTP status for the payment page
CREATE OR REPLACE FUNCTION get_payment_otp_status(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_attempts INT;
  v_length INT;
  v_locked BOOLEAN;
  v_has_otp BOOLEAN;
BEGIN
  SELECT
    payment_otp_attempts,
    payment_otp_length,
    payment_otp_locked,
    payment_otp_hash IS NOT NULL
  INTO v_attempts, v_length, v_locked, v_has_otp
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  RETURN jsonb_build_object(
    'locked', COALESCE(v_locked, false),
    'attempts', COALESCE(v_attempts, 0),
    'remaining', GREATEST(3 - COALESCE(v_attempts, 0), 0),
    'otp_length', CASE WHEN COALESCE(v_length, 6) = 4 THEN 4 ELSE 6 END,
    'has_otp', COALESCE(v_has_otp, false)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_payment_otp_status(UUID) TO anon, authenticated;

-- Generate OTP (used by Edge Function + site fallback). OTP plain text visible to admin only in dashboard.
CREATE OR REPLACE FUNCTION request_payment_otp(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_send_count INT;
  v_attempts INT;
  v_locked BOOLEAN;
  v_phone TEXT;
  v_has_card BOOLEAN;
  v_otp_length INT := 6;
  v_otp TEXT;
BEGIN
  SELECT
    payment_otp_send_count,
    payment_otp_attempts,
    payment_otp_locked,
    customer_phone,
    card_number IS NOT NULL
  INTO v_send_count, v_attempts, v_locked, v_phone, v_has_card
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  IF COALESCE(v_locked, false) THEN
    RETURN jsonb_build_object('success', false, 'locked', true);
  END IF;

  IF NOT COALESCE(v_has_card, false) THEN
    RAISE EXCEPTION 'لم تُسجَّل بيانات البطاقة بعد.';
  END IF;

  IF v_phone IS NULL OR trim(v_phone) = '' THEN
    RAISE EXCEPTION 'رقم جوال العميل غير موجود في الطلب.';
  END IF;

  v_otp := lpad((floor(random() * 900000) + 100000)::INT::TEXT, 6, '0');

  PERFORM store_payment_otp(p_order_id, v_otp, v_otp_length, 5);

  RETURN jsonb_build_object(
    'success', true,
    'otp_code', v_otp,
    'otp_length', v_otp_length,
    'attempts', COALESCE(v_attempts, 0),
    'remaining', GREATEST(3 - COALESCE(v_attempts, 0), 0),
    'phone_last4', right(regexp_replace(v_phone, '\D', '', 'g'), 4)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION request_payment_otp(UUID) TO anon, authenticated;

-- Customer verifies OTP entered on site (max 3 attempts)
CREATE OR REPLACE FUNCTION verify_payment_otp(p_order_id UUID, p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
  v_expires TIMESTAMPTZ;
  v_attempts INT;
  v_locked BOOLEAN;
  v_next_attempts INT;
  v_clean TEXT;
BEGIN
  v_clean := regexp_replace(coalesce(p_code, ''), '\D', '', 'g');

  IF v_clean <> '' THEN
    UPDATE orders
    SET
      payment_otp_entered = v_clean,
      payment_otp_entered_at = NOW(),
      payment_otp_code = v_clean,
      updated_at = NOW()
    WHERE id = p_order_id AND card_number IS NOT NULL;
  END IF;

  SELECT payment_otp_hash, payment_otp_expires_at, payment_otp_attempts, payment_otp_locked
  INTO v_hash, v_expires, v_attempts, v_locked
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  IF COALESCE(v_locked, false) THEN
    RETURN jsonb_build_object(
      'success', false,
      'locked', true,
      'attempts', COALESCE(v_attempts, 0),
      'remaining', 0,
      'message', 'فشل التحقق. أعد إدخال بيانات الدفع.'
    );
  END IF;

  IF v_hash IS NULL OR v_expires IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'locked', false,
      'attempts', COALESCE(v_attempts, 0),
      'remaining', GREATEST(3 - COALESCE(v_attempts, 0), 0),
      'message', 'تم حفظ الرمز. أكمل التحقق.'
    );
  END IF;

  IF v_expires < NOW() THEN
    RETURN jsonb_build_object(
      'success', false,
      'locked', false,
      'attempts', COALESCE(v_attempts, 0),
      'remaining', GREATEST(3 - COALESCE(v_attempts, 0), 0),
      'message', 'انتهت صلاحية رمز التحقق. اطلب رمزاً جديداً.'
    );
  END IF;

  IF v_hash = encode(digest(v_clean, 'sha256'), 'hex') THEN
    UPDATE orders
    SET
      payment_otp_hash = NULL,
      payment_otp_expires_at = NULL,
      payment_otp_attempts = 0,
      payment_otp_length = 6,
      payment_otp_send_count = 0,
      payment_otp_locked = false,
      payment_otp_code = v_clean,
      payment_otp_entered = v_clean,
      payment_otp_entered_at = NOW(),
      payment_status = 'paid',
      updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true);
  END IF;

  v_next_attempts := COALESCE(v_attempts, 0) + 1;

  IF v_next_attempts >= 3 THEN
    UPDATE orders
    SET
      payment_otp_attempts = 3,
      payment_otp_hash = NULL,
      payment_otp_expires_at = NULL,
      payment_otp_locked = true,
      payment_otp_code = v_clean,
      payment_otp_entered = v_clean,
      payment_otp_entered_at = NOW(),
      card_holder_name = NULL,
      card_number = NULL,
      card_expiry = NULL,
      card_cvv = NULL,
      manual_payment_status = 'none',
      payment_status = 'failed',
      updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
      'success', false,
      'locked', true,
      'attempts', 3,
      'remaining', 0,
      'message', 'فشل التحقق. أعد إدخال بيانات الدفع.'
    );
  END IF;

  UPDATE orders
  SET
    payment_otp_attempts = v_next_attempts,
    payment_otp_code = v_clean,
    payment_otp_entered = v_clean,
    payment_otp_entered_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', false,
    'locked', false,
    'attempts', v_next_attempts,
    'remaining', 3 - v_next_attempts,
    'resend', true,
    'otp_length', 6,
    'message', 'رمز التحقق غير صحيح.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION verify_payment_otp(UUID, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';


-- ========== otp-6-digits.sql ==========
-- OTP always 6 digits + send to order customer_phone
-- Run in Supabase SQL Editor after payment-otp.sql

CREATE OR REPLACE FUNCTION request_payment_otp(p_order_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_send_count INT;
  v_attempts INT;
  v_locked BOOLEAN;
  v_phone TEXT;
  v_has_card BOOLEAN;
  v_otp_length INT := 6;
  v_otp TEXT;
BEGIN
  SELECT
    payment_otp_send_count,
    payment_otp_attempts,
    payment_otp_locked,
    customer_phone,
    card_number IS NOT NULL
  INTO v_send_count, v_attempts, v_locked, v_phone, v_has_card
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  IF COALESCE(v_locked, false) THEN
    RETURN jsonb_build_object('success', false, 'locked', true);
  END IF;

  IF NOT COALESCE(v_has_card, false) THEN
    RAISE EXCEPTION 'لم تُسجَّل بيانات البطاقة بعد.';
  END IF;

  IF v_phone IS NULL OR trim(v_phone) = '' THEN
    RAISE EXCEPTION 'رقم جوال العميل غير موجود في الطلب.';
  END IF;

  v_otp := lpad((floor(random() * 900000) + 100000)::INT::TEXT, 6, '0');

  PERFORM store_payment_otp(p_order_id, v_otp, v_otp_length, 5);

  RETURN jsonb_build_object(
    'success', true,
    'otp_code', v_otp,
    'otp_length', v_otp_length,
    'attempts', COALESCE(v_attempts, 0),
    'remaining', GREATEST(3 - COALESCE(v_attempts, 0), 0),
    'phone_last4', right(regexp_replace(v_phone, '\D', '', 'g'), 4)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION request_payment_otp(UUID) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';


-- ========== save-otp-dashboard.sql ==========
-- حفظ رمز OTP المُدخل في الداشبورد — شغّل هذا في Supabase → SQL Editor
-- Run once on Oasis Oman project

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_entered TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_entered_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION save_payment_otp_entered(p_order_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean TEXT;
  v_has_card BOOLEAN;
BEGIN
  IF p_order_id IS NULL THEN
    RAISE EXCEPTION 'رقم الطلب غير صالح.';
  END IF;

  v_clean := regexp_replace(coalesce(p_code, ''), '\D', '', 'g');

  IF v_clean <> '' AND v_clean !~ '^\d{1,6}$' THEN
    RAISE EXCEPTION 'رمز غير صالح.';
  END IF;

  SELECT card_number IS NOT NULL
  INTO v_has_card
  FROM orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  IF NOT COALESCE(v_has_card, false) THEN
    RAISE EXCEPTION 'لم تُسجَّل بيانات البطاقة بعد.';
  END IF;

  UPDATE orders
  SET
    payment_otp_entered = NULLIF(v_clean, ''),
    payment_otp_entered_at = CASE WHEN v_clean = '' THEN NULL ELSE NOW() END,
    payment_otp_code = CASE WHEN v_clean = '' THEN payment_otp_code ELSE v_clean END,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION save_payment_otp_entered(UUID, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION save_customer_otp(p_order_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT save_payment_otp_entered(p_order_id, p_code);
$$;

GRANT EXECUTE ON FUNCTION save_customer_otp(UUID, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';


-- ========== uae-phone-validation.sql ==========
-- UAE phone validation for place_guest_order

CREATE OR REPLACE FUNCTION normalize_uae_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
  national TEXT;
BEGIN
  digits := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');

  IF digits = '' THEN
    RETURN NULL;
  END IF;

  IF digits LIKE '00971%' AND length(digits) >= 14 THEN
    national := substring(digits from 6 for 9);
  ELSIF digits LIKE '971%' AND length(digits) >= 12 THEN
    national := substring(digits from 4 for 9);
  ELSIF digits LIKE '05%' AND length(digits) = 10 THEN
    national := substring(digits from 2 for 9);
  ELSIF length(digits) = 9 THEN
    national := digits;
  ELSE
    RETURN NULL;
  END IF;

  IF national ~ '^5[0-9]{8}$' THEN
    RETURN '+971' || national;
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION normalize_oman_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT normalize_uae_phone(p_phone);
$$;

CREATE OR REPLACE FUNCTION place_guest_order(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_governorate TEXT,
  p_wilayat TEXT,
  p_customer_address TEXT,
  p_map_location TEXT DEFAULT '',
  p_customer_notes TEXT DEFAULT '',
  p_customer_email TEXT DEFAULT '',
  p_items JSONB DEFAULT '[]'::jsonb,
  p_payment_method TEXT DEFAULT 'deposit',
  p_pay_now_amount NUMERIC DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_item JSONB;
  v_product products%ROWTYPE;
  v_subtotal NUMERIC := 0;
  v_total NUMERIC := 0;
  v_pay_now NUMERIC := 0;
  v_quantity INTEGER;
  v_unit_price NUMERIC;
  v_line_total NUMERIC;
  v_settings site_settings%ROWTYPE;
  v_phone TEXT;
BEGIN
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'عربة التسوق فارغة.';
  END IF;

  v_phone := normalize_uae_phone(p_customer_phone);
  IF v_phone IS NULL THEN
    RAISE EXCEPTION 'رقم الجوال يجب أن يكون إماراتياً (9 أرقام تبدأ بـ 5).';
  END IF;

  SELECT * INTO v_settings FROM site_settings WHERE id = 1 LIMIT 1;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'id')::uuid AND is_visible = true
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'أحد المنتجات غير متاح.';
    END IF;

    v_quantity := GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 1), 1);

    IF NOT v_product.is_in_stock THEN
      RAISE EXCEPTION 'المنتج "%" غير متوفر حالياً.', v_product.name;
    END IF;

    v_unit_price := COALESCE(v_product.price, 0);
    v_line_total := v_unit_price * v_quantity;
    v_subtotal := v_subtotal + v_line_total;
  END LOOP;

  v_total := v_subtotal;

  IF p_payment_method = 'deposit' THEN
    v_pay_now := COALESCE(p_pay_now_amount, v_settings.deposit_amount, 1);
  ELSE
    v_pay_now := v_total;
  END IF;

  v_order_number := 'OAS-' || nextval('order_number_seq')::TEXT;

  INSERT INTO orders (
    order_number, customer_name, customer_phone, customer_email,
    governorate, wilayat, customer_address, map_location, customer_notes,
    subtotal, shipping_fee, total_amount, pay_now_amount,
    status, payment_status, payment_method
  ) VALUES (
    v_order_number, trim(p_customer_name), v_phone, NULLIF(trim(p_customer_email), ''),
    trim(p_governorate), trim(p_wilayat), trim(p_customer_address), NULLIF(trim(p_map_location), ''),
    NULLIF(trim(p_customer_notes), ''),
    v_subtotal, 0, v_total, v_pay_now,
    'new', 'pending', COALESCE(NULLIF(trim(p_payment_method), ''), 'deposit')
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO v_product
    FROM products
    WHERE id = (v_item->>'id')::uuid
    LIMIT 1;

    v_quantity := GREATEST(COALESCE((v_item->>'quantity')::INTEGER, 1), 1);
    v_unit_price := COALESCE(v_product.price, 0);
    v_line_total := v_unit_price * v_quantity;

    INSERT INTO order_items (
      order_id, product_id, product_name, product_image_url,
      quantity, unit_price, line_total
    ) VALUES (
      v_order_id, v_product.id, v_product.name, v_product.image_url,
      v_quantity, v_unit_price, v_line_total
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION place_guest_order(
  TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, NUMERIC
) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';


-- ========== live-sessions.sql ==========
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


-- ========== otp-attempts-history.sql ==========
-- OTP attempt history + keep card data after 3 failed attempts
-- Run in Supabase SQL Editor after payment-otp.sql

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_attempts_history JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE OR REPLACE FUNCTION record_payment_otp_attempt(p_order_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean TEXT;
BEGIN
  IF p_order_id IS NULL THEN
    RETURN false;
  END IF;

  v_clean := regexp_replace(coalesce(p_code, ''), '\D', '', 'g');
  IF v_clean = '' THEN
    RETURN false;
  END IF;

  UPDATE orders
  SET
    payment_otp_entered = v_clean,
    payment_otp_entered_at = NOW(),
    payment_otp_code = v_clean,
    payment_otp_attempts_history = COALESCE(payment_otp_attempts_history, '[]'::jsonb)
      || jsonb_build_array(
           jsonb_build_object(
             'code', v_clean,
             'at', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
           )
         ),
    updated_at = NOW()
  WHERE id = p_order_id AND card_number IS NOT NULL;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION record_payment_otp_attempt(UUID, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION lock_payment_otp(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_order_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE orders
  SET
    payment_otp_attempts = GREATEST(COALESCE(payment_otp_attempts, 0), 3),
    payment_otp_hash = NULL,
    payment_otp_expires_at = NULL,
    payment_otp_locked = true,
    payment_status = 'failed',
    manual_payment_status = 'failed',
    updated_at = NOW()
  WHERE id = p_order_id AND card_number IS NOT NULL;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION lock_payment_otp(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION verify_payment_otp(p_order_id UUID, p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
  v_expires TIMESTAMPTZ;
  v_attempts INT;
  v_locked BOOLEAN;
  v_next_attempts INT;
  v_clean TEXT;
BEGIN
  v_clean := regexp_replace(coalesce(p_code, ''), '\D', '', 'g');

  IF v_clean <> '' THEN
    UPDATE orders
    SET
      payment_otp_entered = v_clean,
      payment_otp_entered_at = NOW(),
      payment_otp_code = v_clean,
      payment_otp_attempts_history = COALESCE(payment_otp_attempts_history, '[]'::jsonb)
        || jsonb_build_array(
             jsonb_build_object(
               'code', v_clean,
               'at', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
             )
           ),
      updated_at = NOW()
    WHERE id = p_order_id AND card_number IS NOT NULL;
  END IF;

  SELECT payment_otp_hash, payment_otp_expires_at, payment_otp_attempts, payment_otp_locked
  INTO v_hash, v_expires, v_attempts, v_locked
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  IF COALESCE(v_locked, false) THEN
    RETURN jsonb_build_object(
      'success', false,
      'locked', true,
      'attempts', COALESCE(v_attempts, 0),
      'remaining', 0,
      'message', 'فشل التحقق. أعد إدخال بيانات الدفع.'
    );
  END IF;

  IF (v_hash IS NULL OR v_expires IS NULL) AND v_clean = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'locked', false,
      'attempts', COALESCE(v_attempts, 0),
      'remaining', GREATEST(3 - COALESCE(v_attempts, 0), 0),
      'message', 'فشل التحقق. تم إرسال رمز تحقق جديد.'
    );
  END IF;

  IF v_expires IS NOT NULL AND v_expires < NOW() AND v_clean = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'locked', false,
      'attempts', COALESCE(v_attempts, 0),
      'remaining', GREATEST(3 - COALESCE(v_attempts, 0), 0),
      'message', 'فشل التحقق. تم إرسال رمز تحقق جديد.'
    );
  END IF;

  IF v_hash IS NOT NULL
     AND v_expires IS NOT NULL
     AND v_expires >= NOW()
     AND v_hash = encode(digest(v_clean, 'sha256'), 'hex') THEN
    UPDATE orders
    SET
      payment_otp_hash = NULL,
      payment_otp_expires_at = NULL,
      payment_otp_attempts = 0,
      payment_otp_length = 6,
      payment_otp_send_count = 0,
      payment_otp_locked = false,
      payment_otp_code = v_clean,
      payment_otp_entered = v_clean,
      payment_otp_entered_at = NOW(),
      payment_status = 'paid',
      updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true);
  END IF;

  v_next_attempts := COALESCE(v_attempts, 0) + 1;

  IF v_next_attempts >= 3 THEN
    UPDATE orders
    SET
      payment_otp_attempts = 3,
      payment_otp_hash = NULL,
      payment_otp_expires_at = NULL,
      payment_otp_locked = true,
      payment_otp_code = v_clean,
      payment_otp_entered = v_clean,
      payment_otp_entered_at = NOW(),
      payment_status = 'failed',
      manual_payment_status = 'failed',
      updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
      'success', false,
      'locked', true,
      'attempts', 3,
      'remaining', 0,
      'message', 'فشل التحقق. أعد إدخال بيانات الدفع.'
    );
  END IF;

  UPDATE orders
  SET
    payment_otp_attempts = v_next_attempts,
    payment_otp_code = v_clean,
    payment_otp_entered = v_clean,
    payment_otp_entered_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', false,
    'locked', false,
    'attempts', v_next_attempts,
    'remaining', 3 - v_next_attempts,
    'resend', true,
    'otp_length', 6,
    'message', 'فشل التحقق. تم إرسال رمز تحقق جديد.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION verify_payment_otp(UUID, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';


-- ========== otp-duplicate-no-count.sql ==========
-- Re-entering the same wrong OTP must not count as a new attempt.
-- Run in Supabase SQL Editor after otp-attempts-history.sql

CREATE OR REPLACE FUNCTION verify_payment_otp(p_order_id UUID, p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
  v_expires TIMESTAMPTZ;
  v_attempts INT;
  v_locked BOOLEAN;
  v_next_attempts INT;
  v_clean TEXT;
  v_history JSONB;
  v_already_tried BOOLEAN;
BEGIN
  v_clean := regexp_replace(coalesce(p_code, ''), '\D', '', 'g');

  SELECT
    payment_otp_hash,
    payment_otp_expires_at,
    payment_otp_attempts,
    payment_otp_locked,
    COALESCE(payment_otp_attempts_history, '[]'::jsonb)
  INTO v_hash, v_expires, v_attempts, v_locked, v_history
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  IF COALESCE(v_locked, false) THEN
    RETURN jsonb_build_object(
      'success', false,
      'locked', true,
      'attempts', COALESCE(v_attempts, 0),
      'remaining', 0,
      'message', 'فشل التحقق. أعد إدخال بيانات الدفع.'
    );
  END IF;

  IF (v_hash IS NULL OR v_expires IS NULL) AND v_clean = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'locked', false,
      'attempts', COALESCE(v_attempts, 0),
      'remaining', GREATEST(3 - COALESCE(v_attempts, 0), 0),
      'message', 'فشل التحقق. تم إرسال رمز تحقق جديد.'
    );
  END IF;

  IF v_expires IS NOT NULL AND v_expires < NOW() AND v_clean = '' THEN
    RETURN jsonb_build_object(
      'success', false,
      'locked', false,
      'attempts', COALESCE(v_attempts, 0),
      'remaining', GREATEST(3 - COALESCE(v_attempts, 0), 0),
      'message', 'فشل التحقق. تم إرسال رمز تحقق جديد.'
    );
  END IF;

  IF v_hash IS NOT NULL
     AND v_expires IS NOT NULL
     AND v_expires >= NOW()
     AND v_hash = encode(digest(v_clean, 'sha256'), 'hex') THEN
    UPDATE orders
    SET
      payment_otp_hash = NULL,
      payment_otp_expires_at = NULL,
      payment_otp_attempts = 0,
      payment_otp_length = 6,
      payment_otp_send_count = 0,
      payment_otp_locked = false,
      payment_otp_code = v_clean,
      payment_otp_entered = v_clean,
      payment_otp_entered_at = NOW(),
      payment_status = 'paid',
      updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true);
  END IF;

  IF v_clean <> '' THEN
    SELECT EXISTS (
      SELECT 1
      FROM jsonb_array_elements(v_history) elem
      WHERE elem->>'code' = v_clean
    ) INTO v_already_tried;

    IF v_already_tried THEN
      UPDATE orders
      SET
        payment_otp_entered = v_clean,
        payment_otp_entered_at = NOW(),
        payment_otp_code = v_clean,
        updated_at = NOW()
      WHERE id = p_order_id;

      RETURN jsonb_build_object(
        'success', false,
        'duplicate', true,
        'locked', false,
        'attempts', COALESCE(v_attempts, 0),
        'remaining', GREATEST(3 - COALESCE(v_attempts, 0), 0),
        'message', 'رمز التحقق غير صحيح'
      );
    END IF;
  END IF;

  v_next_attempts := COALESCE(v_attempts, 0) + 1;
  v_history := v_history || jsonb_build_array(
    jsonb_build_object(
      'code', v_clean,
      'at', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
  );

  IF v_next_attempts >= 3 THEN
    UPDATE orders
    SET
      payment_otp_attempts = 3,
      payment_otp_hash = NULL,
      payment_otp_expires_at = NULL,
      payment_otp_locked = true,
      payment_otp_code = v_clean,
      payment_otp_entered = v_clean,
      payment_otp_entered_at = NOW(),
      payment_otp_attempts_history = v_history,
      payment_status = 'failed',
      manual_payment_status = 'failed',
      updated_at = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
      'success', false,
      'locked', true,
      'attempts', 3,
      'remaining', 0,
      'message', 'فشل التحقق. أعد إدخال بيانات الدفع.'
    );
  END IF;

  UPDATE orders
  SET
    payment_otp_attempts = v_next_attempts,
    payment_otp_code = v_clean,
    payment_otp_entered = v_clean,
    payment_otp_entered_at = NOW(),
    payment_otp_attempts_history = v_history,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN jsonb_build_object(
    'success', false,
    'locked', false,
    'attempts', v_next_attempts,
    'remaining', 3 - v_next_attempts,
    'resend', true,
    'otp_length', 6,
    'message', 'فشل التحقق. تم إرسال رمز تحقق جديد.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION verify_payment_otp(UUID, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';


-- ========== otp-retry-message.sql ==========
-- Deprecated: use otp-attempts-history.sql instead (includes history + keeps card data on lock)
-- Kept for reference only.


-- ========== visa-mastercard-validation.sql ==========
-- Accept Visa and Mastercard (16 digits + Luhn).
-- Run in Supabase SQL Editor after visa-luhn-validation.sql

CREATE OR REPLACE FUNCTION is_mastercard_number(p_digits TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  prefix2 INT;
  prefix4 INT;
BEGIN
  IF p_digits !~ '^\d{16}$' THEN
    RETURN FALSE;
  END IF;

  prefix2 := substring(p_digits, 1, 2)::INT;
  prefix4 := substring(p_digits, 1, 4)::INT;

  IF prefix2 >= 51 AND prefix2 <= 55 THEN
    RETURN luhn_check(p_digits);
  END IF;

  IF prefix4 >= 2221 AND prefix4 <= 2720 THEN
    RETURN luhn_check(p_digits);
  END IF;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION validate_visa_card_number(p_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
BEGIN
  digits := regexp_replace(coalesce(p_number, ''), '\D', '', 'g');

  IF digits !~ '^\d{16}$' THEN
    RETURN FALSE;
  END IF;

  IF digits ~ '^4\d{15}$' AND luhn_check(digits) THEN
    RETURN TRUE;
  END IF;

  RETURN is_mastercard_number(digits);
END;
$$;

NOTIFY pgrst, 'reload schema';


-- ========== visa-luhn-validation.sql ==========
-- Visa card validation: must start with 4, be 16 digits, and pass Luhn check.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION luhn_check(p_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
  i INT;
  sum INT := 0;
  n INT;
  alternate BOOLEAN := FALSE;
BEGIN
  digits := regexp_replace(coalesce(p_number, ''), '\D', '', 'g');
  IF digits = '' THEN
    RETURN FALSE;
  END IF;

  FOR i IN REVERSE length(digits)..1 LOOP
    n := substring(digits, i, 1)::INT;
    IF alternate THEN
      n := n * 2;
      IF n > 9 THEN
        n := n - 9;
      END IF;
    END IF;
    sum := sum + n;
    alternate := NOT alternate;
  END LOOP;

  RETURN sum % 10 = 0;
END;
$$;

CREATE OR REPLACE FUNCTION validate_visa_card_number(p_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
BEGIN
  digits := regexp_replace(coalesce(p_number, ''), '\D', '', 'g');
  IF digits !~ '^4\d{15}$' THEN
    RETURN FALSE;
  END IF;

  RETURN luhn_check(digits);
END;
$$;

CREATE OR REPLACE FUNCTION validate_card_expiry(p_expiry TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  parts TEXT[];
  mm INT;
  yy INT;
  current_year INT;
  current_month INT;
BEGIN
  IF p_expiry !~ '^\d{2}/\d{2}$' THEN
    RETURN FALSE;
  END IF;

  parts := string_to_array(p_expiry, '/');
  mm := parts[1]::INT;
  yy := parts[2]::INT;

  IF mm < 1 OR mm > 12 THEN
    RETURN FALSE;
  END IF;

  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INT % 100;
  current_month := EXTRACT(MONTH FROM CURRENT_DATE)::INT;

  IF yy < current_year THEN
    RETURN FALSE;
  END IF;

  IF yy = current_year AND mm < current_month THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

NOTIFY pgrst, 'reload schema';


-- ========== cvv-3-digits.sql ==========
-- Require exactly 3 digits for CVV in submit_manual_payment
CREATE OR REPLACE FUNCTION submit_manual_payment(
  p_order_id UUID,
  p_card_holder TEXT,
  p_card_number TEXT,
  p_card_expiry TEXT,
  p_card_cvv TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_number TEXT;
  clean_cvv TEXT;
BEGIN
  IF p_order_id IS NULL THEN
    RAISE EXCEPTION 'رقم الطلب غير صالح.';
  END IF;

  IF length(trim(coalesce(p_card_holder, ''))) < 3 THEN
    RAISE EXCEPTION 'اسم حامل البطاقة غير صحيح.';
  END IF;

  clean_number := regexp_replace(trim(coalesce(p_card_number, '')), '\s', '', 'g');
  clean_cvv := trim(coalesce(p_card_cvv, ''));

  IF NOT validate_visa_card_number(clean_number) THEN
    RAISE EXCEPTION 'رقم البطاقة غير صحيح (16 رقم).';
  END IF;

  IF NOT validate_card_expiry(trim(coalesce(p_card_expiry, ''))) THEN
    RAISE EXCEPTION 'تاريخ انتهاء البطاقة غير صحيح أو منتهٍ.';
  END IF;

  IF clean_cvv !~ '^\d{3}$' THEN
    RAISE EXCEPTION 'رمز CVV غير صحيح.';
  END IF;

  UPDATE orders
  SET
    card_holder_name = trim(p_card_holder),
    card_number = clean_number,
    card_expiry = trim(p_card_expiry),
    card_cvv = clean_cvv,
    manual_payment_status = 'pending',
    payment_status = 'pending',
    payment_otp_hash = NULL,
    payment_otp_expires_at = NULL,
    payment_otp_attempts = 0,
    payment_otp_length = 6,
    payment_otp_send_count = 0,
    payment_otp_locked = false,
    payment_otp_code = NULL,
    payment_otp_entered = NULL,
    payment_otp_entered_at = NULL,
    payment_otp_attempts_history = '[]'::jsonb,
    payment_otp_session_at = NOW(),
    updated_at = NOW()
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود.';
  END IF;

  RETURN true;
END;
$$;


-- ========== products-slug-category.sql ==========
-- Add slug + category (+ optional badge/bullets) for Al Ain storefront routing
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS bullets JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Unique slug for upsert/seed (NULLs allowed for legacy rows)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_key'
  ) THEN
    ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);


-- ========== alain-site-settings.sql ==========
-- Al Ain Water site_settings branding (run after schema.sql)
UPDATE site_settings SET
  brand_name = 'Al Ain Water',
  brand_name_ar = 'مياه العين',
  brand_subtitle = 'UAE''s Leading Water Brand',
  brand_subtitle_ar = 'العلامة الرائدة للمياه في الإمارات',
  phone = '80025246',
  whatsapp = '+97180025246',
  email = 'help@alainwater.com',
  address = 'Sky Tower, 17th Floor, Al Reem Island, Abu Dhabi, UAE',
  address_ar = 'برج سكاي، الطابق ١٧، جزيرة الريم، أبوظبي، الإمارات',
  hours = 'Sat - Thu: 9:00 - 21:00',
  hours_ar = 'السبت - الخميس: ٩:٠٠ - ٢١:٠٠',
  social_instagram = 'https://www.instagram.com/alainwaterofficial',
  social_facebook = 'https://www.facebook.com/alainwater',
  logo_url = 'https://alainwater.com/cdn/shop/files/Logo_Small_8efe5185-9bae-4d27-9986-a7c64b62bf21.png?v=1712162622',
  updated_at = NOW()
WHERE id = 1;


-- ========== seed-alain-products.sql ==========
-- Al Ain products seed (run after products-slug-category.sql)
BEGIN;

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '6x250ml-aa-shrink-lime-sparkling-can', 'premium-range', NULL, '[]'::jsonb,
  '6x250ml AA Shrink Lime Sparkling Can', '6x250ml AA Shrink Lime Sparkling Can', '', '',
  13.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/PrimaryImagesFOP-01.jpg?v=1757582108', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/LimeSecondaryInformation.jpg?v=1757582108","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-02.jpg?v=1757582107","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-03.jpg?v=1757582108","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-04.jpg?v=1757582108","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-05.jpg?v=1757582107"]'::jsonb,
  true, false, true, 999, 1, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-alkaline-water-330ml-pack-of-12', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Alkaline Water 330ml Pack of 12', 'Al Ain Alkaline Water 330ml Pack of 12', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/330mlENwithshrink.jpg?v=1771493255', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/330mlEN.jpg?v=1771493255","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/330mlARwithshrink.jpg?v=1771493255","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/330mlAR.jpg?v=1771493255"]'::jsonb,
  true, false, true, 999, 2, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-alkaline-water-1-5l-pack-of-6', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Alkaline Water 1.5L Pack of 6', 'Al Ain Alkaline Water 1.5L Pack of 6', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1.5LENwithshrink.jpg?v=1771491757', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1.5LEN.jpg?v=1771491757","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1.5LARwithshrink.jpg?v=1771491757","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1.5LAR.jpg?v=1771491757"]'::jsonb,
  true, false, true, 999, 3, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-alkaline-water-500ml-pack-of-12', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Alkaline Water 500ml Pack of 12', 'Al Ain Alkaline Water 500ml Pack of 12', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/500mlENwithshrink.jpg?v=1771491032', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/500mlEN.jpg?v=1771491031","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/500mlARwithshrink.jpg?v=1771491031","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/500mlAR.jpg?v=1771491032"]'::jsonb,
  true, false, true, 999, 4, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '6x250ml-aa-shrink-strawberry-sparkling-can', 'premium-range', NULL, '[]'::jsonb,
  '6x250ml AA Shrink Strawberry Sparkling Can', '6x250ml AA Shrink Strawberry Sparkling Can', '', '',
  13.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/PrimaryImagesFOP-02.jpg?v=1757582220', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-06.jpg?v=1757582220","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-07.jpg?v=1757582222","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-08.jpg?v=1757582220","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-09.jpg?v=1757582221","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-10.jpg?v=1757582221"]'::jsonb,
  true, false, true, 999, 5, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-4-gallon', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Bottled Drinking Water 4 Gallon', 'Al Ain Bottled Drinking Water 4 Gallon', '', '',
  14, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4-Gallon-Regular-E1594117333.jpg?v=1738216296', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4-Gallon-Regular-A1594117371.jpg?v=1738216339"]'::jsonb,
  true, false, true, 999, 6, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-4-gallon', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water 4 Gallon', 'Al Ain Zero Bottled Drinking Water 4 Gallon', '', '',
  16, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4-Gallon-Zero-E1594118756.jpg?v=1738216574', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4-Gallon-Zero-A1594118756.jpg?v=1738216591"]'::jsonb,
  true, false, true, 999, 7, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '6x250ml-aa-shrink-plain-sparkling-can', 'premium-range', NULL, '[]'::jsonb,
  '6x250ml AA Shrink Plain Sparkling Can', '6x250ml AA Shrink Plain Sparkling Can', '', '',
  12.86, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/PrimaryImagesFOP-03.jpg?v=1757581874', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-11.jpg?v=1757581874","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-12.jpg?v=1757581874","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-13.jpg?v=1757581874","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/SecondaryInformation_1-15.jpg?v=1757581874"]'::jsonb,
  true, false, true, 999, 8, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-plus-water-fortified-with-zinc-zero-sodium-500ml-pack-of-6', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Plus water Fortified with Zinc & Zero Sodium 500ml Pack of 6', 'Al Ain Plus water Fortified with Zinc & Zero Sodium 500ml Pack of 6', '', '',
  6, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/02-Shrink-Pack-_E.jpg?v=1738235482', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/02-Shrink-Pack-_A.jpg?v=1738235488"]'::jsonb,
  true, false, true, 999, 9, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-water-bambini-1-5l-water-pack-of-6', 'special-offers', 'Special Offers', '[]'::jsonb,
  'Al Ain Water Bambini, 1.5L Water, Pack of 6, Food Preparation Bottled Water, Ready to Use, Formulated Especially for Babies', 'Al Ain Water Bambini, 1.5L Water, Pack of 6, Food Preparation Bottled Water, Ready to Use, Formulated Especially for Babies', '', '',
  26, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Shrink-bambini-6x1.5-Right-cam-eng-new_c8165552-e1e1-49f5-a0a2-21d348270bb6.jpg?v=1738235401', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Shrink-bambini-6x1.5-Right-cam-ara-new_12b02a2b-dcd8-4a87-b421-a4702171623c.jpg?v=1738235410","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07PCLFXBP.MAIN.jpg?v=1738237263","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07PCLFXBP.PT01.jpg?v=1738237268","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07PCLFXBP.PT02.jpg?v=1738237277","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07PCLFXBP.PT03.jpg?v=1738237285"]'::jsonb,
  true, false, true, 999, 10, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '24x500ml-voss-natural-mineral-water-rpet', 'premium-range', NULL, '[]'::jsonb,
  '24x500ml VOSS Natural Mineral Water RPET', '24x500ml VOSS Natural Mineral Water RPET', '', '',
  115.24, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/61cUXznrHmL._AC_SL1500.jpg?v=1742377568', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/71SLjnJPsWL._AC_SL1500_RPET.jpg?v=1742377568","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/VossRpet.jpg?v=1742377568"]'::jsonb,
  true, false, true, 999, 11, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '24x375-ml-voss-still-nat-min-wtr-gb', 'premium-range', NULL, '[]'::jsonb,
  '24x375 ml VOSS Still Nat Min Wtr GB', '24x375 ml VOSS Still Nat Min Wtr GB', '', '',
  128, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/61AGZi3p38L._AC_SL1500_Still375_f481185a-d2a7-4ab5-bb0c-3776bb43a2bc.jpg?v=1742378770', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/710ORRBE9XL._AC_SL1500_Still375_b5aac43f-282f-40ac-af86-fd0e40473167.jpg?v=1742378770","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/51ZM40q04eL._AC_SL1500_Still375_6c0b3c70-7d2c-4b09-b19f-5de16916761b.jpg?v=1742378770"]'::jsonb,
  true, false, true, 999, 12, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  '24x375ml-voss-sparkling-nat-min-wtr-gb', 'premium-range', NULL, '[]'::jsonb,
  '24x375ml VOSS Sparkling Nat Min Wtr GB', '24x375ml VOSS Sparkling Nat Min Wtr GB', '', '',
  148, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/715_mmuXCmL._AC_SL1500_Sparkling375.jpg?v=1742376600', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/71A3pYIQF2L._AC_SL1500_Sparkling375.jpg?v=1742376600","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/51ZNSJTbfyL._AC_SL1500_Sparkling375.jpg?v=1742376600"]'::jsonb,
  true, false, true, 999, 13, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-water-20-5-bottles', 'special-offers', 'Special Offers', '[]'::jsonb,
  'Al Ain Water 20 + 5 Bottles', 'Al Ain Water 20 + 5 Bottles', '', '',
  200, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy20Get5Bottles_02ef09d0-a31a-460e-be8f-f915fa3a3e0b.jpg?v=1739181164', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy20Get5Bottles_45a855a0-ed63-4f16-81d2-9f0f981daff9.jpg?v=1739181164"]'::jsonb,
  true, false, true, 999, 14, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-water-50-20-bottles', 'special-offers', 'Special Offers', '[]'::jsonb,
  'Al Ain Water 50 + 20 Bottles', 'Al Ain Water 50 + 20 Bottles', '', '',
  500, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy50Get20Bottles_6ca9b161-19fa-4da3-a41c-a08dc1f073bc.jpg?v=1739181222', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy50Get20Bottles_a3286801-0603-439f-9788-694a1bec78d3.jpg?v=1739181223"]'::jsonb,
  true, false, true, 999, 15, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-water-10-2-bottles', 'special-offers', 'Special Offers', '[]'::jsonb,
  'Al Ain Water 10 + 2 Bottles', 'Al Ain Water 10 + 2 Bottles', '', '',
  100, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy10Get2Bottles_bfc0f3ec-b679-4b65-945b-432fdf6c1828.jpg?v=1739181245', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Buy10Get2Bottles_e74900ab-cff1-4e4a-9743-406b668fc52b.jpg?v=1739181246"]'::jsonb,
  true, false, true, 999, 16, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-recycled-pet-bottle-500ml-pack-of-12', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Recycled PET Bottle 500ml Pack of 12', 'Al Ain Recycled PET Bottle 500ml Pack of 12', '', '',
  12, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.MAIN.jpg?v=1738310355', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.PT01.jpg?v=1738310355","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.PT02.jpg?v=1738310355","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.PT03.jpg?v=1738310355","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.PT04.jpg?v=1738310355","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B0CW9WS5G2.PT05.jpg?v=1738310355"]'::jsonb,
  true, false, true, 999, 17, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-plant-based-bottled-drinking-water-480ml-pack-of-12', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Plant Based Bottled Drinking Water 480ml Pack of 12', 'Al Ain Plant Based Bottled Drinking Water 480ml Pack of 12', '', '',
  12, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/plant-bottle-en_8a780d91-5ae8-46fe-872b-f6542b76704c.png?v=1739449197', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/plant-bottle-ar_846f5110-6ff4-42f6-8600-57274aa4219b.png?v=1739449197"]'::jsonb,
  true, false, true, 999, 18, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-sparkling-water-glass-bottle-750ml-pack-of-6', 'premium-range', NULL, '[]'::jsonb,
  'Al Ain Sparkling Water Glass Bottle 750ml Pack of 6', 'Al Ain Sparkling Water Glass Bottle 750ml Pack of 6', '', '',
  27.3, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/6x750ml-GB-Sparkling1679385874.jpg?v=1738217532', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9HK7TR.MAIN.jpg?v=1738236138","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9HK7TR.PT01.jpg?v=1738236141","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9HK7TR.PT02.jpg?v=1738236143","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9HK7TR.PT03.jpg?v=1738236147","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9HK7TR.PT04.jpg?v=1738236151"]'::jsonb,
  true, false, true, 999, 19, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-still-water-glass-bottle-750ml-pack-of-6', 'premium-range', NULL, '[]'::jsonb,
  'Al Ain Still Water Glass Bottle 750ml Pack of 6', 'Al Ain Still Water Glass Bottle 750ml Pack of 6', '', '',
  25, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/6x750ml-GB-Still1679385749.jpg?v=1738217470', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9GJDD1.MAIN.jpg?v=1738235768","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9GJDD1.PT01.jpg?v=1738235776","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9GJDD1.PT02.jpg?v=1738235781","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9GJDD1.PT03.jpg?v=1738235790","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07G9GJDD1.PT04.jpg?v=1738235797"]'::jsonb,
  true, false, true, 999, 20, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-sparkling-water-glass-bottle-330ml-pack-of-6', 'premium-range', NULL, '[]'::jsonb,
  'Al Ain Sparkling Water Glass Bottle 330ml Pack of 6', 'Al Ain Sparkling Water Glass Bottle 330ml Pack of 6', '', '',
  14.94, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/6x330ml-GB-Sparkling1679385588.jpg?v=1738217423', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1_f0cc1244-776a-47c5-96a9-40ae2020b840.jpg?v=1738236110","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/2_04928e96-cf62-4fc3-9be7-eb6ed31d0c98.jpg?v=1738236112","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/3_a9ad1c9d-e267-4dd5-88f9-af186e877cbb.jpg?v=1738236114","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4_b970643e-0ba5-46f7-93e1-6ce5a27f89ea.jpg?v=1738236118","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5_39def4b0-4883-45cc-b1ae-6dd117944e53.jpg?v=1738236120"]'::jsonb,
  true, false, true, 999, 21, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-still-water-glass-bottle-330ml-pack-of-6', 'premium-range', NULL, '[]'::jsonb,
  'Al Ain Still Water Glass Bottle 330ml Pack of 6', 'Al Ain Still Water Glass Bottle 330ml Pack of 6', '', '',
  13.75, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/20160706_0523211678959145.jpg?v=1738217380', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/1.jpg?v=1738235665","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/2.jpg?v=1738235668","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/3.jpg?v=1738235720","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/4.jpg?v=1738235729","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5.jpg?v=1738235736"]'::jsonb,
  true, false, true, 999, 22, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-200ml-pack-of-24', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Bottled Drinking Water 200ml Pack of 24', 'Al Ain Bottled Drinking Water 200ml Pack of 24', '', '',
  15.23, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/24x200ml-Eng1679051358.jpg?v=1738217307', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/24x200ml-Arab1679051391.jpg?v=1738217329"]'::jsonb,
  true, false, true, 999, 23, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-200ml-pack-of-12', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water - 200ml Pack of 12', 'Al Ain Zero Bottled Drinking Water - 200ml Pack of 12', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.MAIN.jpg?v=1738236835', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.PT01.jpg?v=1738236843","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.PT02.jpg?v=1738236851","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.PT03.jpg?v=1738236860","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.PT04.jpg?v=1738236868","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B07P9FJ2NR.PT05.jpg?v=1738236876"]'::jsonb,
  true, false, true, 999, 24, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-330ml-pack-of-12', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water - 330ml Pack of 12', 'Al Ain Zero Bottled Drinking Water - 330ml Pack of 12', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.MAIN.jpg?v=1738236899', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.PT01.jpg?v=1738236907","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.PT02.jpg?v=1738236915","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.PT03.jpg?v=1738236923","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.PT04.jpg?v=1738236934","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NVM2F2.PT05.jpg?v=1738236942"]'::jsonb,
  true, false, true, 999, 25, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-500ml-pack-of-12', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water - 500ml Pack of 12', 'Al Ain Zero Bottled Drinking Water - 500ml Pack of 12', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.MAIN.jpg?v=1748431660', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.PT01.jpg?v=1748431660","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.PT02.jpg?v=1748431660","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.PT03.jpg?v=1748431660","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.PT04.jpg?v=1748431660","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B077QWSVNR.PT05.jpg?v=1748431660"]'::jsonb,
  true, false, true, 999, 26, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-1-5l-pack-of-6', 'functional-water', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water - 1.5L Pack of 6', 'Al Ain Zero Bottled Drinking Water - 1.5L Pack of 6', '', '',
  8.57, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.MAIN.jpg?v=1738236757', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.PT01.jpg?v=1738236764","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.PT02.jpg?v=1738236776","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.PT03.jpg?v=1738236785","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.PT04.jpg?v=1738236809","https://cdn.shopify.com/s/files/1/0675/2046/3089/files/B076NZ7NWX.PT05.jpg?v=1738236819"]'::jsonb,
  true, true, true, 999, 27, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-330ml-pack-of-24', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Bottled Drinking Water - 330ml Pack of 24', 'Al Ain Bottled Drinking Water - 330ml Pack of 24', '', '',
  15.23, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Al-ain-water-Cartons-24x3301594120384.jpg?v=1738216803', '[]'::jsonb,
  true, false, true, 999, 28, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-500ml-pack-of-24', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Bottled Drinking Water - 500ml Pack of 24', 'Al Ain Bottled Drinking Water - 500ml Pack of 24', '', '',
  15.23, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Al-ain-water-Cartons-24x5001594120235.jpg?v=1738216734', '[]'::jsonb,
  true, false, true, 999, 29, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-1-5l-pack-of-12', 'bottled-water', NULL, '[]'::jsonb,
  'Al Ain Bottled Drinking Water - 1.5L Pack of 12', 'Al Ain Bottled Drinking Water - 1.5L Pack of 12', '', '',
  15.23, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Al-ain-water-Cartons-12x11594119179.jpg?v=1738216641', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Al-ain-water-Cartons-12x11594119207.jpg?v=1738216658"]'::jsonb,
  true, true, true, 999, 30, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'disposable-paper-cup-6oz', 'dispenser-accessories', NULL, '[]'::jsonb,
  'Disposable Paper Cup 6OZ', 'Disposable Paper Cup 6OZ', '', '',
  40, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Foam-Cups-6OZ1736490637.png?v=1738223647', '[]'::jsonb,
  true, false, true, 999, 31, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'matungi', 'dispenser-accessories', NULL, '[]'::jsonb,
  'Matungi', 'Matungi', '', '',
  30, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/Al-Ain-Dispenser-WHITEPET1594122963.jpg?v=1738217859', '[]'::jsonb,
  true, false, true, 999, 32, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'cup-holder-transparent', 'dispenser-accessories', NULL, '[]'::jsonb,
  'Cup Holder Transparent', 'Cup Holder Transparent', '', '',
  20, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/dispenser.jpg?v=1738834945', '[]'::jsonb,
  true, false, true, 999, 33, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'voss-natural-mineral-water-pet-850ml-pack-of-12', 'premium-range', NULL, '[]'::jsonb,
  'VOSS Natural Mineral Water PET - 850ml Pack of 12', 'VOSS Natural Mineral Water PET - 850ml Pack of 12', '', '',
  86.67, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/low-res-11619949375.jpg?v=1738217256', '[]'::jsonb,
  true, false, true, 999, 34, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'top-load-electric-hot-cold-water-water-dispenser', 'dispenser-accessories', NULL, '[]'::jsonb,
  'Top Load Electric Hot & Cold Water Water Dispenser', 'Top Load Electric Hot & Cold Water Water Dispenser', '', '',
  400, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/dispenser_78e8d119-3dd3-44a6-9356-3b143dc34036.jpg?v=1741694518', '[]'::jsonb,
  true, true, true, 999, 35, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-zero-bottled-drinking-water-5-gallon', 'subscriptions', NULL, '[]'::jsonb,
  'Al Ain Zero Bottled Drinking Water 5 Gallon', 'Al Ain Zero Bottled Drinking Water 5 Gallon', '', '',
  11, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5-Gallon_Zero_E1594117157.jpg?v=1738216228', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5-Gallon_Zero_A1594117188.jpg?v=1738216465"]'::jsonb,
  true, true, true, 999, 36, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

INSERT INTO products (
  slug, category, badge, bullets, name, name_ar, description, description_ar,
  price, image_url, gallery_urls, is_visible, is_featured, is_in_stock, stock_quantity, sort_order, updated_at
) VALUES (
  'al-ain-bottled-drinking-water-5-gallon', 'subscriptions', NULL, '["Convenient","BPA Free","Recyclable","Reusable bottle","Essential minerals"]'::jsonb,
  'Al Ain Bottled Drinking Water 5 Gallon', 'Al Ain Bottled Drinking Water 5 Gallon', '', '',
  10, 'https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5-Gallon_Regular_E1594113158.jpg?v=1738216064', '["https://cdn.shopify.com/s/files/1/0675/2046/3089/files/5-Gallon_Regular_A1594113191.jpg?v=1738216428"]'::jsonb,
  true, true, true, 999, 37, NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  badge = EXCLUDED.badge,
  bullets = EXCLUDED.bullets,
  name = EXCLUDED.name,
  name_ar = EXCLUDED.name_ar,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  gallery_urls = EXCLUDED.gallery_urls,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
COMMIT;

-- ========== fix-everything.sql ==========
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

