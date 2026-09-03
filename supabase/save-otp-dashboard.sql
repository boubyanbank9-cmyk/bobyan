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
