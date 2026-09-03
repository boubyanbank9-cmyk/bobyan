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
