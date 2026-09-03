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
