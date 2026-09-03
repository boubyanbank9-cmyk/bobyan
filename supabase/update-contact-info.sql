-- Update site contact phone and email everywhere in the database
UPDATE site_settings
SET
  phone = '+96895330047',
  whatsapp = '+96895330047',
  email = 'Ainalalain@gmail.com',
  updated_at = NOW()
WHERE id = 1;

UPDATE site_pages
SET
  content = replace(
    replace(
      replace(
        replace(content, 'myahalwaht430@gmail.com', 'Ainalalain@gmail.com'),
        '+96893649190',
        '+96895330047'
      ),
      '96893649190',
      '96895330047'
    ),
    '93649190',
    '95330047'
  ),
  content_ar = replace(
    replace(
      replace(
        replace(content_ar, 'myahalwaht430@gmail.com', 'Ainalalain@gmail.com'),
        '+96893649190',
        '+96895330047'
      ),
      '96893649190',
      '96895330047'
    ),
    '93649190',
    '95330047'
  ),
  updated_at = NOW();

UPDATE site_settings
SET content_json = replace(
  replace(
    replace(
      replace(content_json::text, 'myahalwaht430@gmail.com', 'Ainalalain@gmail.com'),
      '+96893649190',
      '+96895330047'
    ),
    '96893649190',
    '96895330047'
  ),
  '93649190',
  '95330047'
)::jsonb,
updated_at = NOW()
WHERE id = 1
  AND content_json::text ~ 'myahalwaht430@gmail.com|93649190';
