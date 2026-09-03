-- UAE phone validation for place_guest_order
-- Run once in Supabase SQL Editor (Alain project)

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

  v_order_number := 'AA-' || nextval('order_number_seq')::TEXT;

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
