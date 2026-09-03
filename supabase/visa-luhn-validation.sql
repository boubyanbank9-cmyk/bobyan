-- Visa card validation: must start with 4, be 16 digits, and pass Luhn check.
-- Run in Supabase SQL Editor.

CREATE OR REPLACE FUNCTION luhn_check(p_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  digits TEXT;
  i INT;
  sum INT := 0;
  n INT;
  alternate BOOLEAN := FALSE;
BEGIN
  digits := regexp_replace(coalesce(p_number, ''), '\D', '', 'g');
  IF digits = '' THEN
    RETURN FALSE;
  END IF;

  FOR i IN REVERSE length(digits)..1 LOOP
    n := substring(digits, i, 1)::INT;
    IF alternate THEN
      n := n * 2;
      IF n > 9 THEN
        n := n - 9;
      END IF;
    END IF;
    sum := sum + n;
    alternate := NOT alternate;
  END LOOP;

  RETURN sum % 10 = 0;
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
  IF digits !~ '^4\d{15}$' THEN
    RETURN FALSE;
  END IF;

  RETURN luhn_check(digits);
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
  yy INT;
  current_year INT;
  current_month INT;
BEGIN
  IF p_expiry !~ '^\d{2}/\d{2}$' THEN
    RETURN FALSE;
  END IF;

  parts := string_to_array(p_expiry, '/');
  mm := parts[1]::INT;
  yy := parts[2]::INT;

  IF mm < 1 OR mm > 12 THEN
    RETURN FALSE;
  END IF;

  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::INT % 100;
  current_month := EXTRACT(MONTH FROM CURRENT_DATE)::INT;

  IF yy < current_year THEN
    RETURN FALSE;
  END IF;

  IF yy = current_year AND mm < current_month THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$;

NOTIFY pgrst, 'reload schema';
