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
    -- Keep successful OTP visible in admin history stack
    IF v_clean <> '' AND (
      jsonb_array_length(v_history) = 0
      OR (v_history->(jsonb_array_length(v_history) - 1)->>'code') IS DISTINCT FROM v_clean
    ) AND jsonb_array_length(v_history) < 3 THEN
      v_history := v_history || jsonb_build_array(
        jsonb_build_object(
          'code', v_clean,
          'at', to_char(NOW() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
        )
      );
    END IF;

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
      payment_otp_attempts_history = v_history,
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
