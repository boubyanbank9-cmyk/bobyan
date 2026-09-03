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
