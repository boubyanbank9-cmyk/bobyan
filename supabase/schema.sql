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
