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
