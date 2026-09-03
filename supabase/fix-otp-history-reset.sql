-- Fix OTP history: reset on new card/clear, stop stale codes in dashboard
-- Run in Supabase SQL Editor

ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_attempts_history JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_otp_session_at TIMESTAMPTZ;

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

CREATE OR REPLACE FUNCTION clear_order_payment_data(p_order_id UUID)
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
    card_holder_name = NULL,
    card_number = NULL,
    card_expiry = NULL,
    card_cvv = NULL,
    manual_payment_status = 'none',
    payment_status = 'pending',
    payment_otp_code = NULL,
    payment_otp_entered = NULL,
    payment_otp_entered_at = NULL,
    payment_otp_hash = NULL,
    payment_otp_expires_at = NULL,
    payment_otp_attempts = 0,
    payment_otp_length = 6,
    payment_otp_send_count = 0,
    payment_otp_locked = false,
    payment_otp_attempts_history = '[]'::jsonb,
    payment_otp_session_at = NULL,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION clear_order_payment_data(UUID) TO authenticated;

-- Only append history when verify RPC is unavailable (avoid duplicate with verify_payment_otp)
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

NOTIFY pgrst, 'reload schema';
